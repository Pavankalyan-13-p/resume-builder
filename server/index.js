import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: join(__dirname, '.env') });

import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";
import crypto from "crypto";
import Razorpay from "razorpay";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWED = (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173,http://localhost:4173").split(",");

app.use(cors({ origin: ALLOWED }));
app.use(express.json({ limit: "10mb" }));

let browser = null;

async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none",
      ],
    });
    console.log("[pdf-server] browser ready");
  }
  return browser;
}

app.post("/api/pdf", async (req, res) => {
  const { html, filename = "resume" } = req.body;

  // Validate incoming HTML
  console.log("Incoming HTML length:", html?.length);

  if (!html || html.length < 1000) {
    console.error("[pdf-server] rejected: HTML is empty or too small");
    return res.status(400).json({ error: "Invalid HTML received — empty or too small" });
  }

  let page;
  try {
    const b = await getBrowser();
    page = await b.newPage();

    // Match the app preview viewport width; deviceScaleFactor 2 for HiDPI sharpness
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });

    // Switch to print media so @media print rules and @page are active during render
    await page.emulateMediaType("print");

    console.log("[pdf-server] loading HTML content...");
    await page.setContent(html, {
      waitUntil: ["load", "networkidle0"],
      timeout: 30_000,
    });

    // Wait for all fonts to finish loading in the page context
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    // Allow an extra settle period for layout and any deferred paint work
    await new Promise(res => setTimeout(res, 500));

    // Verify the page actually rendered content before generating the PDF
    const bodyLength = await page.evaluate(() => document.body.innerHTML.length);
    console.log("Rendered body length:", bodyLength);

    if (bodyLength < 1000) {
      throw new Error("Rendered page is empty — content did not load into Puppeteer");
    }

    console.log("[pdf-server] generating PDF...");
    // IMPORTANT: page.pdf() returns Uint8Array in Puppeteer v22+.
    // Wrapping in Buffer.from() is required — res.send(Uint8Array) causes Express
    // to call res.json(), serialising the bytes as {"0":37,"1":80,...} JSON garbage
    // instead of sending binary, which produces a corrupted unreadable PDF file.
    const pdf = Buffer.from(
      await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
      })
    );

    console.log("PDF size:", pdf.length);

    if (!pdf || pdf.length < 1000) {
      throw new Error("Generated PDF is empty or corrupted");
    }

    const safe = filename.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_").slice(0, 80);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safe}.pdf"`,
    });
    res.send(pdf);
  } catch (err) {
    console.error("PDF ERROR:", err.stack || err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "PDF generation failed", detail: err.message });
    }
  } finally {
    if (page) {
      await page.close().catch(e => console.warn("[pdf-server] page.close() warning:", e.message));
    }
  }
});

// ── Gemini setup ─────────────────────────────────────────────────────────────
const genAI = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const gemini = genAI?.getGenerativeModel({ model: GEMINI_MODEL });
if (gemini) console.log(`[ai] Gemini model ready: ${GEMINI_MODEL}`);
else        console.warn('[ai] GEMINI_API_KEY not set — AI routes will return 503');

function isQuotaError(err) {
  const m = String(err?.message || err?.status || '').toLowerCase();
  return m.includes('resource_exhausted') || m.includes('quota') ||
         m.includes('rate limit') || m.includes('429') ||
         m.includes('too many requests') || m.includes('billing');
}

// ── In-memory rate limiter (no extra package) ─────────────────────────────────
const rlMap = new Map();
function rateLimit(ip, max, windowMs = 60_000) {
  const now = Date.now();
  const r   = rlMap.get(ip) ?? { n: 0, reset: now + windowMs };
  if (now > r.reset) { r.n = 0; r.reset = now + windowMs; }
  r.n++;
  rlMap.set(ip, r);
  return r.n <= max;
}
// Sweep stale entries every 5 min to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rlMap) if (now > v.reset) rlMap.delete(k);
}, 300_000).unref();

function getIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown')
    .split(',')[0].trim();
}

// ── Premium middleware ────────────────────────────────────────────────────────
async function requirePremium(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) {
    return res.status(403).json({
      error: 'Upgrade to Pro to unlock AI-powered resume generation and interview preparation.',
      code: 'PREMIUM_REQUIRED',
    });
  }
  try {
    // Verify the ID token via Firebase Identity Toolkit REST API
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_WEB_API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) }
    );
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.users?.[0]) {
      return res.status(403).json({ error: 'Invalid authentication token. Please sign in again.' });
    }
    const uid = verifyData.users[0].localId;

    // Fetch the user's Firestore doc to check premium status
    const fsRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${uid}`,
      { headers: { Authorization: `Bearer ${idToken}` } }
    );
    const fsData = await fsRes.json();
    const fields = fsData.fields || {};
    const isAdmin    = fields.role?.stringValue === 'admin';
    const isPremium  = fields.isPremium?.booleanValue === true;
    const expiresAt  = fields.premiumExpiresAt?.timestampValue;
    let isActive = isPremium;
    if (isPremium && expiresAt) isActive = new Date(expiresAt) > new Date();

    if (!isAdmin && !isActive) {
      return res.status(403).json({
        error: 'Upgrade to Pro to unlock AI-powered resume generation and interview preparation.',
        code: 'PREMIUM_REQUIRED',
      });
    }
    req.uid = uid;
    next();
  } catch (err) {
    console.error('[requirePremium]', err.message);
    return res.status(500).json({ error: 'Authentication check failed. Please try again.' });
  }
}

// ── POST /api/ai-summary ──────────────────────────────────────────────────────
app.post('/api/ai-summary', requirePremium, async (req, res) => {
  if (!gemini) return res.status(503).json({ error: 'AI not configured on server.' });

  if (!rateLimit(getIp(req), 6))
    return res.status(429).json({ error: 'Rate limit reached. Try again in a minute.' });

  const { role = '', skills = [], experience = [], education = [] } = req.body;
  if (!role && !skills.length && !experience.length)
    return res.status(400).json({ error: 'Provide at least a role or skills.' });

  const expText = experience.slice(0, 3)
    .map(e => [e.role, e.company].filter(Boolean).join(' at ')).filter(Boolean).join('; ');
  const eduText = education.slice(0, 2)
    .map(e => [e.degree, e.school].filter(Boolean).join(' from ')).filter(Boolean).join('; ');

  const prompt = `You are an expert resume writer. Write a concise professional summary for a resume.

Role: ${role || 'Professional'}
Key Skills: ${skills.slice(0, 8).join(', ') || 'Not specified'}
${expText ? `Experience: ${expText}` : ''}
${eduText ? `Education: ${eduText}` : ''}

Rules:
- 2-3 sentences maximum
- No "I" pronoun (implied first-person)
- Embed relevant keywords naturally for ATS scanners
- Focus on skills and value delivered, not generic duties
- Avoid buzzwords: "passionate", "dynamic", "results-driven", "detail-oriented", "team player"
- Return ONLY the summary paragraph — no labels, no markdown, no quotes`;

  try {
    const result  = await gemini.generateContent(prompt);
    const summary = result.response.text().trim();
    res.json({ summary });
  } catch (err) {
    console.error('[ai-summary]', err.message);
    if (isQuotaError(err))
      return res.status(429).json({ error: 'AI is temporarily busy. Please try again in a moment.' });
    res.status(502).json({ error: 'AI generation failed. Please try again.' });
  }
});

// ── POST /api/ai-interview ────────────────────────────────────────────────────
const CAT_LABELS = {
  hr:           'HR & Behavioural',
  technical:    'Technical',
  roleSpecific: 'Role-Specific',
  projects:     'Project-Based',
  situational:  'Situational (STAR method)',
};

app.post('/api/ai-interview', requirePremium, async (req, res) => {
  if (!gemini) return res.status(503).json({ error: 'AI not configured on server.' });

  if (!rateLimit(getIp(req), 20))
    return res.status(429).json({ error: 'Rate limit reached. Try again in a minute.' });

  const { category = 'hr', role = 'Professional', skills = [], context = '' } = req.body;
  if (!CAT_LABELS[category])
    return res.status(400).json({ error: `Invalid category. Use: ${Object.keys(CAT_LABELS).join(', ')}` });

  const prompt = `You are a senior interviewer running a ${CAT_LABELS[category]} round for a ${role} position.

Candidate:
- Skills: ${skills.slice(0, 6).join(', ') || 'not specified'}
${context ? `- Background: ${context}` : ''}

Generate ONE realistic ${CAT_LABELS[category]} interview question for this candidate.
Respond with pure JSON only — no markdown, no code fences, no extra text:
{"question":"<the interview question>","hint":"<2-3 specific answer strategy points the candidate should cover>","answer":"<a strong 2-3 sentence sample professional answer>"}`;

  try {
    const result = await gemini.generateContent(prompt);
    const raw    = result.response.text().trim()
      .replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(raw);
    if (!parsed.question) throw new Error('Missing question field in AI response');
    res.json({ question: parsed.question, hint: parsed.hint ?? '', answer: parsed.answer ?? '' });
  } catch (err) {
    console.error('[ai-interview]', err.message);
    if (isQuotaError(err))
      return res.status(429).json({ error: 'AI is temporarily busy. Please try again in a moment.' });
    res.status(502).json({ error: 'AI generation failed. Please try again.' });
  }
});

// ── Razorpay setup ────────────────────────────────────────────────────────────
const rzpReady = process.env.RAZORPAY_KEY_ID &&
                 !process.env.RAZORPAY_KEY_ID.includes('YOUR_KEY') &&
                 process.env.RAZORPAY_KEY_SECRET &&
                 !process.env.RAZORPAY_KEY_SECRET.includes('YOUR_KEY');

const razorpay = rzpReady
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

if (razorpay) console.log('[razorpay] TEST MODE ready — key:', process.env.RAZORPAY_KEY_ID);
else          console.warn('[razorpay] Keys not configured — payment routes will return 503');

// Plan definitions (amounts in paise — smallest INR unit)
const PLANS = {
  monthly: { amount: 9900,   label: 'Pro Resume Builder — Monthly (Rs.99)'  },
  yearly:  { amount: 149900, label: 'Pro Resume Builder — Yearly (Rs.1,499)' },
};

// ── POST /api/create-order ────────────────────────────────────────────────────
// Creates a Razorpay order and returns the orderId + public keyId to the frontend.
// Secret key never leaves this file.
app.post('/api/create-order', async (req, res) => {
  if (!razorpay)
    return res.status(503).json({ error: 'Payment not configured. Add Razorpay keys to server/.env' });

  const { plan = 'monthly' } = req.body;
  const planData = PLANS[plan];
  if (!planData) return res.status(400).json({ error: 'Invalid plan. Use: monthly or yearly' });

  try {
    console.log(`[razorpay] creating order — plan: ${plan}, amount: ${planData.amount} paise`);
    const order = await razorpay.orders.create({
      amount:   planData.amount,
      currency: 'INR',
      notes:    { plan, label: planData.label },
    });
    console.log(`[razorpay] order created: ${order.id}`);
    res.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID, // public key — safe to send
      plan,
      label:    planData.label,
    });
  } catch (err) {
    console.error('[razorpay] create-order error:', err.message);
    res.status(500).json({ error: 'Could not create payment order. Try again.' });
  }
});

// ── POST /api/verify-payment ──────────────────────────────────────────────────
// Verifies the HMAC-SHA256 signature Razorpay sends after payment.
// If valid the frontend can safely activate the Pro plan.
//
// TEST cards: https://razorpay.com/docs/payments/payments/test-card-upi-details/
//   Card:   4111 1111 1111 1111  Exp: any future  CVV: any
//   UPI:    success@razorpay
app.post('/api/verify-payment', (req, res) => {
  if (!razorpay)
    return res.status(503).json({ error: 'Payment not configured.' });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
    return res.status(400).json({ error: 'Missing required payment fields.' });

  // Razorpay signature = HMAC-SHA256(order_id + "|" + payment_id, key_secret)
  const payload  = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest('hex');

  if (expected === razorpay_signature) {
    console.log(`[razorpay] payment VERIFIED ✓ — paymentId: ${razorpay_payment_id}, orderId: ${razorpay_order_id}`);
    res.json({ verified: true, paymentId: razorpay_payment_id });
  } else {
    console.warn(`[razorpay] signature MISMATCH — orderId: ${razorpay_order_id}`);
    res.status(400).json({ verified: false, error: 'Payment signature invalid. Contact support if amount was deducted.' });
  }
});

app.get("/health", (_req, res) => {
  console.log("[pdf-server] GET /health — ok");
  res.json({ ok: true, port: PORT });
});

const shutdown = async () => {
  console.log("[pdf-server] shutting down...");
  await browser?.close();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("uncaughtException", err => {
  console.error("[pdf-server] uncaughtException:", err.stack || err.message);
  process.exit(1);
});
process.on("unhandledRejection", reason => {
  console.error("[pdf-server] unhandledRejection:", reason);
});

app.listen(PORT, () => {
  console.log("──────────────────────────────────────────────────────");
  console.log(`  server ready on http://localhost:${PORT}`);
  console.log(`  POST /api/pdf              — generate PDF`);
  console.log(`  POST /api/ai-summary       — AI resume summary`);
  console.log(`  POST /api/ai-interview     — AI interview question`);
  console.log(`  POST /api/create-order     — Razorpay create order`);
  console.log(`  POST /api/verify-payment   — Razorpay verify signature`);
  console.log(`  GET  /health               — liveness check`);
  console.log("──────────────────────────────────────────────────────");
});
