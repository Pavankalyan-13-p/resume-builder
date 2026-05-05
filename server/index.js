import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWED = (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173,http://localhost:4173").split(",");

app.use(cors({ origin: ALLOWED }));
app.use(express.json({ limit: "10mb" }));

let browser = null;

async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    console.log("[pdf-server] launching Puppeteer browser...");
    browser = await puppeteer.launch({
      headless: true,
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
  console.log("─────────────────────────────────────────");
  console.log(`  pdf-server ready on http://localhost:${PORT}`);
  console.log(`  POST /api/pdf    — generate PDF`);
  console.log(`  GET  /health     — liveness check`);
  console.log("─────────────────────────────────────────");
});
