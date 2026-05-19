import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: join(__dirname, '.env') });

import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";
import helmet from "helmet";
import crypto from "crypto";
import Razorpay from "razorpay";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
// contentSecurityPolicy disabled — the PDF HTML payload and Google Fonts CDN
// would require an overly permissive CSP that adds more risk than value here.
app.use(helmet({ contentSecurityPolicy: false }));

// CORS: in production the frontend is co-hosted on the same Express process
// (same origin), so CORS is only needed for the local dev servers.
// Never open to all origins in production — restrict to explicit allow-list.
const CORS_ORIGIN = (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173,http://localhost:4173").split(",");
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));

let browser = null;
let launchPromise = null; // prevents multiple simultaneous launches under concurrent requests

// Locate Chrome by scanning Puppeteer's cache directory with plain fs calls.
//
// Why NOT puppeteer.executablePath():
//   That API validates the expected revision against the cache and emits
//   "Could not find Chrome (ver. X)" when the cached revision (e.g. 148)
//   differs from what the package bundled (e.g. 147) — the warning fires
//   inside executablePath() itself, before it returns a fallback path.
//
// This function reads puppeteer.configuration.cacheDirectory (safe — just a
// config object read, no fs ops) and scans for any installed Chrome revision,
// newest first. PUPPETEER_CACHE_DIR takes priority so Render's
// /opt/render/.cache/puppeteer path (set in render.yaml) is always honoured.
function resolveChromeExecutable() {
  try {
    const cacheDir =
      process.env.PUPPETEER_CACHE_DIR ||
      puppeteer.configuration?.cacheDirectory;
    if (!cacheDir) return undefined;

    const chromeCacheDir = join(cacheDir, 'chrome');
    if (!existsSync(chromeCacheDir)) return undefined;

    // Sort revision folder names descending so the newest build is tried first
    const revisions = readdirSync(chromeCacheDir).sort().reverse();
    for (const rev of revisions) {
      for (const exe of [
        join(chromeCacheDir, rev, 'chrome-win64',    'chrome.exe'),
        join(chromeCacheDir, rev, 'chrome-linux64',  'chrome'),
        join(chromeCacheDir, rev, 'chrome-mac-x64',  'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
        join(chromeCacheDir, rev, 'chrome-mac-arm64','Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
      ]) {
        if (existsSync(exe)) return exe;
      }
    }
  } catch (_) {}
  return undefined;
}

async function getBrowser() {
  if (browser?.isConnected()) return browser;
  // If a launch is already in flight, wait for that one rather than starting a second
  if (!launchPromise) {
    const chromeArgs = [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=none",
    ];
    const executablePath = resolveChromeExecutable();
    launchPromise = puppeteer.launch({
      headless: true,
      // Only set executablePath when we have a confirmed path — this bypasses
      // Puppeteer's internal version check that causes the revision-mismatch warning.
      // On Render, executablePath() respects PUPPETEER_CACHE_DIR set in render.yaml.
      ...(executablePath && { executablePath }),
      args: chromeArgs,
    }).then(b => {
      browser = b;
      launchPromise = null;
      console.log("[pdf-server] browser ready");
      return b;
    }).catch(err => {
      launchPromise = null;
      browser = null;
      throw err;
    });
  }
  return launchPromise;
}

app.post("/api/pdf", async (req, res) => {
  // Give the full generation pipeline up to 90 s before returning a timeout error.
  // This covers cold-start browser launch (~15s) + page load + render + pdf() on Render free tier.
  res.setTimeout(90_000, () => {
    if (!res.headersSent) res.status(504).json({ error: "PDF generation timed out. The server is warming up — please try again in a moment." });
  });

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
      timeout: 60_000,
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

// ── AI interview response parser ──────────────────────────────────────────────
// Reads plain-text section blocks (QUESTION: / HINT: / ANSWER:).
// No JSON.parse anywhere in the primary path — Gemini control chars can't crash it.

function parseInterviewResponse(raw) {
  // Normalise line endings once; everything else works on plain strings.
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = text.split('\n');

  // Pass 1 — line-by-line section splitting.
  // Handles both "LABEL:\ncontent" and "LABEL: inline content" variants.
  const sections = {};
  let currentLabel = null;
  let currentLines = [];
  const flush = () => {
    if (currentLabel) sections[currentLabel] = currentLines.join('\n').trim();
  };
  for (const line of lines) {
    const m = line.match(/^(QUESTION|HINT|ANSWER):\s*(.*)/i);
    if (m) {
      flush();
      currentLabel = m[1].toUpperCase();
      currentLines = m[2].trim() ? [m[2].trim()] : [];
    } else if (currentLabel) {
      currentLines.push(line);
    }
  }
  flush();

  if (sections.QUESTION) {
    return {
      question: sections.QUESTION.replace(/\n+/g, ' ').trim(),
      hint:     (sections.HINT   || '').trim(),
      answer:   (sections.ANSWER || '').trim(),
    };
  }

  // Pass 2 — JSON fallback with control-char fixer (handles any old-format output).
  try {
    let s = text.trim()
      .replace(/^```json\s*/im, '').replace(/^```\s*/im, '').replace(/```\s*$/m, '').trim();
    const jStart = s.indexOf('{');
    const jEnd   = s.lastIndexOf('}');
    if (jStart !== -1 && jEnd > jStart) s = s.slice(jStart, jEnd + 1);

    let fixed = ''; let inStr = false; let escaped = false;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i]; const code = s.charCodeAt(i);
      if (escaped)              { fixed += ch; escaped = false; continue; }
      if (ch === '\\' && inStr) { fixed += ch; escaped = true;  continue; }
      if (ch === '"')           { inStr = !inStr; fixed += ch;  continue; }
      if (inStr && code < 32) {
        if      (ch === '\n') fixed += '\\n';
        else if (ch === '\r') fixed += '\\r';
        else if (ch === '\t') fixed += '\\t';
        else fixed += `\\u${code.toString(16).padStart(4, '0')}`;
        continue;
      }
      fixed += ch;
    }
    const parsed = JSON.parse(fixed);
    if (parsed?.question) return parsed;
  } catch (_) {}

  // Pass 3 — regex field extraction (last resort for structurally broken output).
  const pick = (field) => {
    const m = text.match(new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'i'));
    return m ? m[1].replace(/\\n/g, '\n').trim() : '';
  };
  const question = pick('question');
  if (question) return { question, hint: pick('hint'), answer: pick('answer') };

  return null;
}

// Safe per-category fallback questions — returned when all parsing fails.
const FALLBACKS = {
  hr: {
    question: 'What motivated you to apply for this role?',
    hint: '• Start with what drew you to the company\n• Connect your background to the role\n• Mention a specific goal or growth area',
    answer: "I've been following the company's work for a while and the role matches where I'm trying to grow. My background gives me a solid foundation and I'm excited to apply it in a new environment. The scope is a step up from where I am now, which is exactly what I'm looking for.",
  },
  technical: {
    question: 'Walk me through how you debug a problem you\'ve never seen before.',
    hint: '• Reproduce the issue consistently first\n• Isolate the failing component or layer\n• Name a real tool or log you\'d check',
    answer: "First I try to reproduce it reliably — a bug I can't trigger consistently is hard to fix. Then I narrow it down layer by layer, starting from whatever the error output gives me. I usually reach for logs or a debugger before touching code. At my last job I tracked down a race condition that way by adding targeted log lines until I found the exact interleaving.",
  },
  roleSpecific: {
    question: 'How do you prioritize when multiple deadlines overlap?',
    hint: '• Assess impact and effort for each task\n• Communicate early with stakeholders\n• Give an example of re-negotiating scope',
    answer: "I start by listing everything and estimating the real impact if each one slips. Then I go to whoever owns each item and have an honest conversation — most deadlines have some flex if you flag it early. In a past role two launches collided, so I got the teams together, we moved one by a week, and both shipped cleanly.",
  },
  projects: {
    question: 'What was the hardest technical decision you made on a recent project?',
    hint: '• Name the specific tradeoff you faced\n• Explain why other options didn\'t fit\n• Share the outcome and what you\'d change',
    answer: "On a recent project I had to decide whether to use an off-the-shelf library or build a lighter version ourselves. The library would have saved time but had licensing restrictions that would have caused problems later. I built a scoped version — took an extra sprint but gave us full control. Looking back it was the right call.",
  },
  situational: {
    question: 'Tell me about a time you disagreed with your manager\'s decision.',
    hint: '• Describe the context without making anyone a villain\n• Show how you raised your concern professionally\n• Explain what happened and what you learned',
    answer: "My manager wanted to ship a feature without extra testing because of a deadline. I flagged my concern directly — showed the specific edge cases and estimated the risk. We agreed on a scoped smoke test covering the critical paths and it went smoothly. After that my manager started looping me in on testing decisions earlier.",
  },
};

// ── POST /api/ai-interview ────────────────────────────────────────────────────
const CAT_LABELS = {
  hr:           'HR & Personal',
  technical:    'Technical',
  roleSpecific: 'Role-Specific',
  projects:     'Project-Based',
  situational:  'Situational / Behavioural',
};

// Per-category coaching so the AI stays focused and varied
const CAT_INSTRUCTIONS = {
  hr: `Focus: personal fit, motivation, career goals, work style.
Rotate across: self-intro, why this role, career goals, handling feedback, strengths, professional growth.
Sound like a recruiter — warm, brief, conversational. No compound questions.`,

  technical: `Focus: hands-on skills from the candidate's exact tech stack.
Ask something practical — "How would you..." or "Walk me through...". Reference a specific skill they listed.
No textbook definitions. One clear technical question.`,

  roleSpecific: `Focus: what someone in this exact job title handles day-to-day.
Ask something a hiring manager would ask to test real on-the-job knowledge.
Avoid questions that apply to any developer or professional.`,

  projects: `Focus: one project the candidate listed.
Ask about a decision, challenge, or measurable outcome — short and conversational.
Use "Walk me through..." or "What was the hardest part of...".`,

  situational: `Focus: one behavioural scenario.
Use "Tell me about a time..." or "How did you handle..." framing.
One clean scenario — no compound questions. Rotate: conflict, deadlines, mistakes, collaboration.`,
};

app.post('/api/ai-interview', requirePremium, async (req, res) => {
  if (!gemini) return res.status(503).json({ error: 'AI not configured on server.' });

  if (!rateLimit(getIp(req), 20))
    return res.status(429).json({ error: 'Rate limit reached. Try again in a minute.' });

  const { category = 'hr', role = 'Professional', skills = [], context = '', questionNumber = 1 } = req.body;
  if (!CAT_LABELS[category])
    return res.status(400).json({ error: `Invalid category. Use: ${Object.keys(CAT_LABELS).join(', ')}` });

  const skillStr = skills.slice(0, 6).join(', ') || 'general';
  const qNum = Math.max(1, Math.min(questionNumber, 10));

  const prompt = `You are a recruiter or hiring manager running a live ${CAT_LABELS[category]} interview. Ask exactly ONE question — short, direct, conversational. Real interviews sound like a human talking, not an AI generating text.

Candidate:
• Role: ${role}
• Skills: ${skillStr}
${context ? `• Background: ${context}` : ''}

${CAT_INSTRUCTIONS[category]}
Question #${qNum} — pick a fresh angle not covered by earlier questions.

HARD LIMITS:
• QUESTION : ≤ 12 words, one sentence, no openers like "Could you...", "Can you tell me...", "I'd like you to..."
• HINT     : exactly 3 bullet points (•), each ≤ 8 words, each starts with an action verb
• ANSWER   : 3–5 sentences, ≤ 80 words, first person, include one real detail (tool name / number / outcome), no filler openers ("I believe", "Great question", "In my experience")

MATCH THIS TONE EXACTLY — output must feel like a real person talking:

QUESTION:
How do you handle a deadline you know you'll miss?

HINT:
• Flag it early — never at the last minute
• Propose a scope cut with a clear plan
• Show what you can still deliver on time

ANSWER:
I flag it early, at least a day before — not an hour. At my last job a feature estimate was off, so I went to my PM with a clear scope-cut proposal. We shipped the core piece on time and moved the nice-to-haves to the next sprint. Being upfront saved us from a much bigger mess.

OUTPUT FORMAT — output ONLY the three sections below, no JSON, no markdown, no extra commentary:

QUESTION:
<the interview question>

HINT:
• <action verb + detail>
• <action verb + detail>
• <action verb + detail>

ANSWER:
<3–5 sentences, first person>`;

  const sendFallback = (reason) => {
    console.warn('[ai-interview] falling back to static question —', reason);
    const fb = FALLBACKS[category] || FALLBACKS.hr;
    res.json({ question: fb.question, hint: fb.hint, answer: fb.answer, fallback: true });
  };

  try {
    const result = await gemini.generateContent(prompt);
    const raw    = result.response.text();
    const parsed = parseInterviewResponse(raw);
    if (!parsed?.question) {
      console.error('[ai-interview] parse failure — raw:', raw.slice(0, 300));
      return sendFallback('parse failure');
    }
    res.json({
      question: parsed.question.trim(),
      hint:     (parsed.hint   ?? '').trim(),
      answer:   (parsed.answer ?? '').trim(),
    });
  } catch (err) {
    console.error('[ai-interview]', err.message);
    if (isQuotaError(err))
      return res.status(429).json({ error: 'AI is temporarily busy. Please try again in a moment.' });
    sendFallback(err.message);
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
  if (!rateLimit(getIp(req), 10, 60_000 * 60))
    return res.status(429).json({ error: 'Too many order requests. Please try again later.' });

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
  if (!rateLimit(getIp(req), 15, 60_000 * 60))
    return res.status(429).json({ error: 'Too many verification requests. Please try again later.' });

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

// ── Serve Vite frontend in production ─────────────────────────────────────────
// Must be registered AFTER all API routes so /api/* is never caught by the
// static middleware. The wildcard fallback enables React Router client-side routing.
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(join(distPath, 'index.html')));
}

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

const server = app.listen(PORT, () => {
  console.log("──────────────────────────────────────────────────────");
  console.log(`  server ready on http://localhost:${PORT}`);
  console.log(`  POST /api/pdf              — generate PDF`);
  console.log(`  POST /api/ai-summary       — AI resume summary`);
  console.log(`  POST /api/ai-interview     — AI interview question`);
  console.log(`  POST /api/create-order     — Razorpay create order`);
  console.log(`  POST /api/verify-payment   — Razorpay verify signature`);
  console.log(`  GET  /health               — liveness check`);
  console.log("──────────────────────────────────────────────────────");
  // Pre-warm: launch the browser immediately so the first PDF request
  // doesn't pay the full cold-start Chrome launch cost.
  getBrowser().catch(err => console.warn("[pdf-server] browser pre-warm failed:", err.message));
});
// 120 s socket-level timeout — prevents Node/Render from cutting the TCP connection
// before a slow PDF generation (cold-start) can complete and send its response.
server.setTimeout(120_000);
