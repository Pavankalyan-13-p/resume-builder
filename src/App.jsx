import React, { useState, useEffect, useMemo, useRef } from "react";
import { FileText } from "lucide-react";
import {
  AlignmentType, BorderStyle, Document, Packer,
  Paragraph, ShadingType, TabStopType, TextRun, convertInchesToTwip,
} from "docx";
import { saveAs } from "file-saver";
import { useAuth } from "./contexts/AuthContext.jsx";
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase/config.js';
import FirebaseAuthModal from "./components/auth/AuthModal.jsx";
import { TEMPLATES } from "./data/resumeData.js";
import HomePage from "./components/HomePage.jsx";
import BuilderPage from "./components/BuilderPage.jsx";
import UpgradeModal from "./components/UpgradeModal.jsx";
import ProfileModal from "./components/ProfileModal.jsx";
import ImportResumeModal from "./components/ImportResumeModal.jsx";
import Toast from "./components/Toast.jsx";
import PdfLoadingModal from "./components/PdfLoadingModal.jsx";
import MyResumesModal from "./components/MyResumesModal.jsx";
import SupportModal from "./components/SupportModal.jsx";
import MyTicketsModal from "./components/MyTicketsModal.jsx";
import FeedbackModal from "./components/FeedbackModal.jsx";

// ========== LOCAL STORAGE HELPERS ==========
// ========== LOCAL STORAGE HELPERS (fallback for anonymous users) ==========
const lsGet = (key) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } };
const lsSet = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };
const lsDel = (key) => { try { localStorage.removeItem(key); } catch {} };


// ========== DEFAULT RESUME DATA ==========
// ========== DEFAULT RESUME DATA ==========
const EMPTY_RESUME = {
  personal: { name: "", title: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "", summary: "" },
  experience: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
  certifications: []
};

const SAMPLE_RESUME = {
  _isSample: true,
  personal: {
    name: "Pawan Kalyan",
    title: "Senior Product Designer",
    email: "pawan@email.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    website: "pawan.design",
    linkedin: "linkedin.com/in/alexchen",
    github: "github.com/alexchen",
    summary: "Senior Product Designer with 8+ years crafting intuitive experiences for fintech and SaaS products. Led design systems adopted across 12 product teams, reducing design debt by 60%. Passionate about accessibility, user research, and mentoring."
  },
  experience: [
    { id: 1, role: "Senior Product Designer", company: "Stripe", location: "San Francisco, CA", start: "2022", end: "Present", bullets: ["Led redesign of merchant dashboard, increasing task completion by 34%", "Built accessibility-first design system used by 200+ engineers across 12 teams", "Mentored 5 junior designers through weekly critique sessions"] },
    { id: 2, role: "Product Designer", company: "Airbnb", location: "San Francisco, CA", start: "2019", end: "2022", bullets: ["Shipped host onboarding flow that improved activation rate by 22%", "Conducted 40+ user interviews informing new trust & safety features", "Collaborated with engineering to establish component library standards"] }
  ],
  education: [
    { id: 1, degree: "B.S. Human-Computer Interaction", school: "Carnegie Mellon University", location: "Pittsburgh, PA", start: "2013", end: "2017", details: "Minor in Cognitive Psychology. GPA: 3.8/4.0" }
  ],
  skills: ["Figma", "Design Systems", "User Research", "Prototyping", "Accessibility (WCAG)", "HTML/CSS", "Design Thinking", "Cross-functional Leadership"],
  languages: [
    { id: 1, name: "English", level: "Native" },
    { id: 2, name: "Mandarin", level: "Intermediate" }
  ],
  projects: [
    { id: 1, name: "OpenCraft Design Kit", description: "Open-source Figma library with 400+ components", link: "github.com/alexchen/opencraft" }
  ],
  certifications: [
    { id: 1, name: "Certified Professional in Accessibility (CPACC)", issuer: "IAAP", date: "2023" }
  ]
};

// ========== STALE DATA HELPERS ==========
const STALE_NAMES = ["Alexandra Chen", "Pavan Kalyan S", "Pavan", "Pavan Kalyan", "Pawan Kalyan S", "Pawan Kalyan"];
const isStaleDefault = (r) => r?._isSample === true || STALE_NAMES.includes(r?.personal?.name);
const isEmptyResume = (r) =>
  !r?.personal?.name && !r?.personal?.email && !r?.personal?.phone && !r?.personal?.title &&
  !(r?.experience?.length) && !(r?.education?.length) && !(r?.skills?.length);

// ========== ATS ANALYSIS ==========
// ========== ATS ANALYSIS ==========
function analyzeATS(resume) {
  const checks = [];
  const { personal, experience, education, skills, projects } = resume;

  // Contact completeness
  const contactFields = [personal.name, personal.email, personal.phone, personal.location];
  const contactScore = contactFields.filter(Boolean).length / contactFields.length;
  checks.push({ label: "Contact information complete", passed: contactScore === 1, weight: 10, detail: contactScore === 1 ? "All essential contact fields filled" : "Missing: " + ["name","email","phone","location"].filter((_,i)=>!contactFields[i]).join(", ") });

  // Summary
  const sumWords = (personal.summary || "").trim().split(/\s+/).filter(Boolean).length;
  checks.push({ label: "Professional summary (40-80 words)", passed: sumWords >= 40 && sumWords <= 80, weight: 10, detail: sumWords === 0 ? "No summary yet" : `${sumWords} words - ${sumWords < 40 ? "too short" : sumWords > 80 ? "too long" : "ideal length"}` });

  // Experience
  checks.push({ label: "At least one work experience", passed: experience.length >= 1, weight: 15, detail: `${experience.length} entries` });

  // Action verbs & quantifiable results in bullets
  const allBullets = experience.flatMap(e => e.bullets || []);
  const actionVerbs = /^(led|built|designed|shipped|launched|improved|increased|decreased|reduced|managed|created|developed|implemented|architected|delivered|mentored|optimized|conducted|collaborated|established)/i;
  const strongBullets = allBullets.filter(b => actionVerbs.test(b.trim())).length;
  checks.push({ label: "Bullets start with strong action verbs", passed: allBullets.length > 0 && strongBullets / allBullets.length >= 0.7, weight: 10, detail: `${strongBullets}/${allBullets.length} bullets use action verbs` });

  const quantified = allBullets.filter(b => /\d+%|\d+x|\$\d|\d{2,}/.test(b)).length;
  checks.push({ label: "Quantified achievements (metrics)", passed: allBullets.length > 0 && quantified >= Math.min(3, allBullets.length), weight: 15, detail: `${quantified} bullets include measurable results` });

  // Bullet length
  const goodLen = allBullets.filter(b => { const w = b.split(/\s+/).length; return w >= 8 && w <= 30; }).length;
  checks.push({ label: "Bullets are concise (8-30 words)", passed: allBullets.length > 0 && goodLen / allBullets.length >= 0.8, weight: 5, detail: `${goodLen}/${allBullets.length} bullets ideal length` });

  // Education
  checks.push({ label: "Education section present", passed: education.length >= 1, weight: 10, detail: `${education.length} entries` });

  // Skills
  checks.push({ label: "Skills section (5-15 items)", passed: skills.length >= 5 && skills.length <= 15, weight: 10, detail: `${skills.length} skills listed` });

  // No photo/graphics (ATS-friendly by design - always pass since we don't use photos)
  checks.push({ label: "ATS-friendly format (no images/tables)", passed: true, weight: 5, detail: "All templates use parseable text layout" });

  // Standard section headings (by design)
  checks.push({ label: "Uses standard section headings", passed: true, weight: 5, detail: "Experience, Education, Skills recognized by ATS" });

  // File format note
  checks.push({ label: "Exports in ATS-readable format", passed: true, weight: 5, detail: "PDF and Word both parseable by major ATS" });

  const totalWeight = checks.reduce((s,c) => s + c.weight, 0);
  const earned = checks.filter(c => c.passed).reduce((s,c) => s + c.weight, 0);
  const score = Math.round((earned / totalWeight) * 100);
  return { score, checks };
}

// ========== EXPORT HELPERS ==========
// ========== EXPORT HELPERS ==========
function buildResumeHTML(resume, templateId) {
  // Server-side-like rendering for print. We rely on the live preview node and use print CSS.
  return null; // actual print handled via window.print of a specific container
}

async function exportPDF(resume) {
  const sourceNode = document.getElementById("resume-preview-inner");
  if (!sourceNode) return;

  const filename = (resume?.personal?.name || "resume").replace(/\s+/g, "_");

  await document.fonts.ready;
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  // Collect all CSS rules from loaded stylesheets
  let css = "";
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) { css += rule.cssText + "\n"; }
    } catch (_) {}
  }

  // Build a self-contained HTML document.
  // App CSS is dumped first so collected rules apply; then a second <style> block
  // with !important overrides strips preview-only styles (transform, box-shadow)
  // and enforces print fidelity settings that must win specificity battles.
  const html = `<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>${css}</style>
  <style>
    /* @page margin: 0 so the resume fills the full A4 page exactly as the preview shows.
       The templates carry their own internal padding — a non-zero @page margin would
       shrink the printable area to 170mm and break the 1:1 layout match. */
    @page { size: A4; margin: 0; }
    *, *::before, *::after { box-sizing: border-box; }
    /* Preserve background colours and images in print */
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; width: 210mm !important; }
    /* Strip preview-only chrome: transform scaling, shadow, overflow clip */
    #resume-preview-inner {
      transform: none !important;
      width: 100% !important;
      max-width: 100% !important;
      box-shadow: none !important;
      margin: 0 !important;
      overflow: visible !important;
    }
    /* Sub-pixel-height divider lines (0.5 px or 1 px inline styles) can vanish
       during print rasterisation — bump them to a solid 1 px floor. */
    [style*="height: 0.5px"], [style*="height:0.5px"] { height: 1px !important; min-height: 1px !important; }
    [style*="height: 1px"],   [style*="height:1px"]   { min-height: 1px !important; }
    hr { min-height: 1px !important; }
  </style>
</head><body>
  <div id="resume-preview-inner">
    ${sourceNode.innerHTML}
  </div>
</body></html>`;

  console.log("[PDF export] HTML document length:", html.length, "chars");

  const serverUrl = import.meta.env.VITE_PDF_SERVER_URL || '';
  let response;
  const controller = new AbortController();
  const abortTimer = setTimeout(() => controller.abort(), 90_000);
  try {
    response = await fetch(`${serverUrl}/api/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html, filename }),
      signal: controller.signal,
    });
  } catch (networkErr) {
    if (networkErr.name === 'AbortError') {
      throw new Error("PDF generation timed out — the server is warming up. Please try again in a moment.");
    }
    console.error("[PDF export] fetch failed:", networkErr);
    throw new Error(
      import.meta.env.DEV
        ? "PDF server is not running. Open a terminal and run: npm run server"
        : "Could not reach the PDF service. Please try again."
    );
  } finally {
    clearTimeout(abortTimer);
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error("[PDF export] Server error detail:", err.detail || err);
    throw new Error(err.detail || err.error || `PDF server error (HTTP ${response.status})`);
  }

  const blob = await response.blob();
  saveAs(blob, `${filename}.pdf`);
}

async function exportWord(resume, templateId = "classic") {
  const r = resume;
  const p = r.personal || {};

  // ── Per-template config ──────────────────────────────────────────────────
  const CONFIGS = {
    classic:       { accent: "1A2E4A", sub: "555555", dark: "111111", darkHeader: false, headerAlign: "center", sectionStyle: "underline",    eduFirst: false },
    modern:        { accent: "0F4C75", sub: "444444", dark: "111111", darkHeader: false, headerAlign: "left",   sectionStyle: "bar",           eduFirst: false },
    minimal:       { accent: "333333", sub: "777777", dark: "222222", darkHeader: false, headerAlign: "left",   sectionStyle: "thin",          eduFirst: false },
    sleek:         { accent: "0F766E", sub: "475569", dark: "0F172A", darkHeader: false, headerAlign: "left",   sectionStyle: "bar",           eduFirst: false },
    canvas:        { accent: "292524", sub: "78716C", dark: "1C1917", darkHeader: false, headerAlign: "left",   sectionStyle: "thin",          eduFirst: false },
    executive:     { accent: "FFFFFF", sub: "DDDDDD", dark: "111111", darkHeader: true,  headerFill: "1A2E4A",  headerAlign: "center", sectionStyle: "boldUpper",   eduFirst: false },
    creative:      { accent: "7C3AED", sub: "555555", dark: "111111", darkHeader: false, headerAlign: "left",   sectionStyle: "boldColored",   eduFirst: false },
    technical:     { accent: "16A34A", sub: "4B5563", dark: "111111", darkHeader: false, headerAlign: "left",   sectionStyle: "code",          eduFirst: false },
    elegant:       { accent: "8B6C42", sub: "7A6035", dark: "1A1A1A", darkHeader: false, headerAlign: "center", sectionStyle: "elegant",      eduFirst: false },
    corporate:     { accent: "FFFFFF", sub: "DDDDDD", dark: "111111", darkHeader: true,  headerFill: "003366",  headerAlign: "left",  sectionStyle: "boldUpper",   eduFirst: false },
    fresher:       { accent: "FFFFFF", sub: "EEEEEE", dark: "111111", darkHeader: true,  headerFill: "065F46",  headerAlign: "center", sectionStyle: "boldColored", eduFirst: true  },
    international: { accent: "C0392B", sub: "555555", dark: "111111", darkHeader: false, headerAlign: "left",   sectionStyle: "international", eduFirst: false },
    twocolumn:     { accent: "FFFFFF", sub: "DDDDDD", dark: "111111", darkHeader: true,  headerFill: "1E293B",  headerAlign: "left",  sectionStyle: "boldUpper",   eduFirst: false },
  };
  const cfg = CONFIGS[templateId] || CONFIGS.classic;

  const ACCENT = cfg.accent;
  const SUB    = cfg.sub;
  const DARK   = cfg.dark;
  const FILL   = cfg.headerFill || "";

  const hp = (pt) => Math.round(pt * 2);   // pt → half-points (font size units)
  const sp = (pt) => Math.round(pt * 20);  // pt → twips (spacing units)

  // A4, 0.75" margins → content width = 8.27 − 1.5 = 6.77"
  const MARGIN     = 0.75;
  const CONTENT_W  = convertInchesToTwip(8.27 - MARGIN * 2);
  const LS         = { line: 240, lineRule: "auto" };  // single spacing

  // ── Section heading factory ──────────────────────────────────────────────
  // No characterSpacing on any heading — causes stretched look in Word
  const sectionHead = (headLabel) => {
    const upper = headLabel.toUpperCase();
    switch (cfg.sectionStyle) {
      case "bar":
        return new Paragraph({
          children: [new TextRun({ text: upper, bold: true, size: hp(11), color: ACCENT })],
          spacing: { before: sp(8), after: sp(2), ...LS },
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 2 } },
        });
      case "thin":
        return new Paragraph({
          children: [new TextRun({ text: headLabel, bold: true, size: hp(11), color: ACCENT })],
          spacing: { before: sp(8), after: sp(2), ...LS },
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC", space: 3 } },
        });
      case "boldUpper":
        return new Paragraph({
          children: [new TextRun({ text: upper, bold: true, size: hp(11), color: DARK })],
          spacing: { before: sp(8), after: sp(2), ...LS },
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 2 } },
        });
      case "boldColored":
        return new Paragraph({
          children: [new TextRun({ text: upper, bold: true, size: hp(11), color: ACCENT })],
          spacing: { before: sp(8), after: sp(2), ...LS },
          border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: ACCENT, space: 2 } },
        });
      case "code":
        return new Paragraph({
          children: [new TextRun({ text: `// ${headLabel}`, bold: true, size: hp(11), color: ACCENT, font: "Courier New" })],
          spacing: { before: sp(8), after: sp(2), ...LS },
        });
      case "elegant":
        // Small letter-spacing only on the elegant template — its identity
        return new Paragraph({
          children: [new TextRun({ text: upper, bold: false, size: hp(10), color: ACCENT, characterSpacing: 60 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: sp(8), after: sp(3), ...LS },
          border: {
            top:    { style: BorderStyle.SINGLE, size: 2, color: ACCENT, space: 3 },
            bottom: { style: BorderStyle.SINGLE, size: 2, color: ACCENT, space: 3 },
          },
        });
      case "international":
        return new Paragraph({
          children: [new TextRun({ text: upper, bold: true, size: hp(11), color: ACCENT })],
          spacing: { before: sp(8), after: sp(2), ...LS },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 2 },
            left:   { style: BorderStyle.SINGLE, size: 16, color: ACCENT, space: 4 },
          },
        });
      default: // "underline" — classic
        return new Paragraph({
          children: [new TextRun({ text: upper, bold: true, size: hp(11), color: ACCENT })],
          spacing: { before: sp(8), after: sp(2), ...LS },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 2 } },
        });
    }
  };

  // ── Section label overrides per template ────────────────────────────────
  const label = (key) => {
    const overrides = {
      executive:  { experience: "Leadership Experience", summary: "Executive Summary" },
      fresher:    { summary: "Objective", skills: "Technical Skills" },
      corporate:  { experience: "Professional Experience" },
      twocolumn:  { experience: "Professional Experience" },
      creative:   { experience: "Work Experience" },
    };
    return overrides[templateId]?.[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  // ── Shared paragraph factories ───────────────────────────────────────────
  // Role/degree title with right-aligned date via tab stop
  const entryRow = (title, dates) => new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_W }],
    children: [
      new TextRun({ text: title, bold: true, size: hp(10.5), color: DARK }),
      ...(dates ? [new TextRun({ text: "\t" + dates, size: hp(9.5), color: SUB, italics: true })] : []),
    ],
    spacing: { before: sp(4), after: sp(1), ...LS },
  });

  const subLine = (text) => new Paragraph({
    children: [new TextRun({ text, size: hp(9.5), color: SUB, italics: true })],
    spacing: { before: 0, after: sp(1), ...LS },
  });

  // Strip leading bullet markers so the numbering definition provides the glyph
  const bulletItem = (text) => new Paragraph({
    children: [new TextRun({ text: text.replace(/^[-·•]\s*/, ""), size: hp(10), color: DARK })],
    numbering: { reference: "resume-bullets", level: 0 },
    spacing: { before: 0, after: sp(2), ...LS },
  });

  const gap = (pt = 3) => new Paragraph({ children: [], spacing: { before: 0, after: sp(pt) } });

  // ── Header block ─────────────────────────────────────────────────────────
  const ch = [];
  const hAlign = cfg.headerAlign === "center" ? AlignmentType.CENTER : AlignmentType.LEFT;

  if (cfg.darkHeader && FILL) {
    // Shaded background header (executive / corporate / fresher / twocolumn)
    const shd = { type: ShadingType.CLEAR, color: "auto", fill: FILL };
    if (p.name) {
      ch.push(new Paragraph({
        children: [new TextRun({ text: p.name, bold: true, size: hp(18), color: ACCENT })],
        alignment: hAlign,
        shading: shd,
        spacing: { before: sp(10), after: sp(2), ...LS },
      }));
    }
    if (p.title) {
      ch.push(new Paragraph({
        children: [new TextRun({ text: p.title, size: hp(10.5), color: SUB })],
        alignment: hAlign,
        shading: shd,
        spacing: { before: 0, after: sp(2), ...LS },
      }));
    }
    const contactStr = [p.email, p.phone, p.location, p.linkedin].filter(Boolean).join("   ·   ");
    if (contactStr) {
      ch.push(new Paragraph({
        children: [new TextRun({ text: contactStr, size: hp(9), color: SUB })],
        alignment: hAlign,
        shading: shd,
        spacing: { before: 0, after: sp(10), ...LS },
      }));
    }

  } else if (templateId === "technical") {
    // Code-style header (Courier New throughout)
    ch.push(new Paragraph({
      children: [new TextRun({ text: "~/resume", size: hp(9), color: SUB, font: "Courier New" })],
      spacing: { before: 0, after: sp(1), ...LS },
    }));
    if (p.name) {
      ch.push(new Paragraph({
        children: [new TextRun({ text: `# ${p.name}`, bold: true, size: hp(18), color: ACCENT, font: "Courier New" })],
        spacing: { before: 0, after: sp(1), ...LS },
      }));
    }
    if (p.title) {
      ch.push(new Paragraph({
        children: [new TextRun({ text: `> ${p.title}`, size: hp(10.5), color: SUB, font: "Courier New" })],
        spacing: { before: 0, after: sp(2), ...LS },
      }));
    }
    const contactStr = [p.email, p.phone, p.location, p.github, p.linkedin].filter(Boolean).join("  |  ");
    if (contactStr) {
      ch.push(new Paragraph({
        children: [new TextRun({ text: contactStr, size: hp(9), color: SUB, font: "Courier New" })],
        spacing: { before: 0, after: sp(3), ...LS },
      }));
    }
    // Thin separator replaces the heavy repeated-char line
    ch.push(new Paragraph({
      children: [new TextRun({ text: " ", size: hp(6) })],
      spacing: { before: 0, after: sp(5), ...LS },
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 2 } },
    }));

  } else if (templateId === "elegant") {
    // Spaced uppercase name, italic title, thin rule below contact
    if (p.name) {
      ch.push(new Paragraph({
        children: [new TextRun({ text: p.name.toUpperCase(), bold: false, size: hp(17), color: DARK, characterSpacing: 100 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: sp(2), ...LS },
      }));
    }
    if (p.title) {
      ch.push(new Paragraph({
        children: [new TextRun({ text: p.title, size: hp(10.5), color: ACCENT, italics: true })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: sp(3), ...LS },
      }));
    }
    const contactStr = [p.email, p.phone, p.location, p.linkedin].filter(Boolean).join("   ·   ");
    if (contactStr) {
      ch.push(new Paragraph({
        children: [new TextRun({ text: contactStr, size: hp(9), color: SUB })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: sp(6), ...LS },
        border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: ACCENT, space: 3 } },
      }));
    }

  } else if (templateId === "international") {
    // Thick top accent line, name, title, two-row contacts
    if (p.name) {
      ch.push(new Paragraph({
        children: [new TextRun({ text: p.name, bold: true, size: hp(18), color: DARK })],
        spacing: { before: sp(2), after: sp(2), ...LS },
        border: { top: { style: BorderStyle.SINGLE, size: 24, color: ACCENT, space: 4 } },
      }));
    }
    if (p.title) {
      ch.push(new Paragraph({
        children: [new TextRun({ text: p.title, size: hp(10.5), color: ACCENT })],
        spacing: { before: 0, after: sp(2), ...LS },
      }));
    }
    const row1 = [p.email, p.phone].filter(Boolean).join("     ");
    const row2 = [p.location, p.linkedin, p.website].filter(Boolean).join("     ");
    if (row1) ch.push(new Paragraph({ children: [new TextRun({ text: row1, size: hp(9), color: SUB })], spacing: { before: 0, after: sp(1), ...LS } }));
    if (row2) ch.push(new Paragraph({ children: [new TextRun({ text: row2, size: hp(9), color: SUB })], spacing: { before: 0, after: sp(6), ...LS } }));

  } else if (templateId === "minimal") {
    // Lightweight: non-bold name, slim contact line
    if (p.name) {
      ch.push(new Paragraph({
        children: [new TextRun({ text: p.name, bold: false, size: hp(17), color: DARK })],
        spacing: { before: 0, after: sp(2), ...LS },
      }));
    }
    if (p.title) {
      ch.push(new Paragraph({
        children: [new TextRun({ text: p.title, size: hp(10.5), color: SUB })],
        spacing: { before: 0, after: sp(2), ...LS },
      }));
    }
    const contactStr = [p.email, p.phone, p.location, p.linkedin].filter(Boolean).join("  /  ");
    if (contactStr) {
      ch.push(new Paragraph({
        children: [new TextRun({ text: contactStr, size: hp(9), color: SUB })],
        spacing: { before: 0, after: sp(6), ...LS },
      }));
    }

  } else {
    // classic / modern / creative — centered or left
    if (p.name) {
      ch.push(new Paragraph({
        children: [new TextRun({ text: p.name, bold: true, size: hp(18), color: ACCENT })],
        alignment: hAlign,
        spacing: { before: 0, after: sp(2), ...LS },
      }));
    }
    if (p.title) {
      ch.push(new Paragraph({
        children: [new TextRun({ text: p.title, size: hp(11), color: SUB, italics: true })],
        alignment: hAlign,
        spacing: { before: 0, after: sp(2), ...LS },
      }));
    }
    // Strip https:// from URLs to avoid Word auto-hyperlink detection
    const contactParts = [p.email, p.phone, p.location, p.linkedin, p.website, p.github]
      .filter(Boolean)
      .map(v => v.replace(/^https?:\/\//, ""));
    if (contactParts.length) {
      ch.push(new Paragraph({
        children: [new TextRun({ text: contactParts.join("   ·   "), size: hp(9), color: SUB })],
        alignment: hAlign,
        spacing: { before: 0, after: sp(6), ...LS },
      }));
    }
  }

  // ── Section content builders ─────────────────────────────────────────────

  const pushSummary = () => {
    if (!p.summary) return;
    ch.push(sectionHead(label("summary")));
    ch.push(new Paragraph({
      children: [new TextRun({ text: p.summary, size: hp(10), color: DARK })],
      spacing: { before: sp(2), after: sp(3), ...LS },
    }));
  };

  const pushExperience = () => {
    if (!r.experience?.length) return;
    ch.push(sectionHead(label("experience")));
    for (const exp of r.experience) {
      const dates = [exp.start, exp.end].filter(Boolean).join(" – ");
      const sub   = [exp.company, exp.location].filter(Boolean).join(",  ");
      ch.push(entryRow(exp.role || "", dates));
      if (sub) ch.push(subLine(sub));
      for (const b of (exp.bullets || []).filter(Boolean)) ch.push(bulletItem(b));
      ch.push(gap(3));
    }
  };

  const pushEducation = () => {
    if (!r.education?.length) return;
    ch.push(sectionHead(label("education")));
    for (const ed of r.education) {
      const dates = [ed.start, ed.end].filter(Boolean).join(" – ");
      const sub   = [ed.school, ed.location].filter(Boolean).join(",  ");
      ch.push(entryRow(ed.degree || "", dates));
      if (sub) ch.push(subLine(sub));
      if (ed.details) {
        ch.push(new Paragraph({
          children: [new TextRun({ text: ed.details, size: hp(9.5), color: SUB })],
          spacing: { before: sp(1), after: sp(3), ...LS },
        }));
      } else {
        ch.push(gap(3));
      }
    }
  };

  const pushSkills = () => {
    if (!r.skills?.length) return;
    ch.push(sectionHead(label("skills")));
    ch.push(new Paragraph({
      children: [new TextRun({ text: r.skills.join("   ·   "), size: hp(10), color: DARK })],
      spacing: { before: sp(2), after: sp(3), ...LS },
    }));
  };

  const pushLanguages = () => {
    if (!r.languages?.length) return;
    ch.push(sectionHead("Languages"));
    ch.push(new Paragraph({
      children: [new TextRun({
        text: r.languages.map(l => `${l.name} (${l.level})`).join("   ·   "),
        size: hp(10), color: DARK,
      })],
      spacing: { before: sp(2), after: sp(3), ...LS },
    }));
  };

  const pushProjects = () => {
    if (!r.projects?.length) return;
    ch.push(sectionHead("Projects"));
    for (const proj of r.projects) {
      // Strip protocol so Word doesn't auto-hyperlink the URL
      const linkText = proj.link ? proj.link.replace(/^https?:\/\//, "") : "";
      const runs = [new TextRun({ text: proj.name || "", bold: true, size: hp(10.5), color: DARK })];
      if (linkText) runs.push(new TextRun({ text: `   ${linkText}`, size: hp(9), color: SUB }));
      ch.push(new Paragraph({ children: runs, spacing: { before: sp(4), after: sp(1), ...LS } }));
      if (proj.description) {
        ch.push(new Paragraph({
          children: [new TextRun({ text: proj.description, size: hp(10), color: DARK })],
          spacing: { before: 0, after: sp(3), ...LS },
        }));
      } else {
        ch.push(gap(3));
      }
    }
  };

  const pushCertifications = () => {
    if (!r.certifications?.length) return;
    ch.push(sectionHead("Certifications"));
    for (const cert of r.certifications) {
      const meta = [cert.issuer, cert.date].filter(Boolean).join(",  ");
      ch.push(new Paragraph({
        children: [
          new TextRun({ text: cert.name || "", bold: true, size: hp(10.5), color: DARK }),
          ...(meta ? [new TextRun({ text: `   —   ${meta}`, size: hp(9.5), color: SUB })] : []),
        ],
        spacing: { before: sp(4), after: sp(3), ...LS },
      }));
    }
  };

  // ── Render sections — fresher puts education before experience ───────────
  pushSummary();
  if (cfg.eduFirst) {
    pushEducation();
    pushSkills();
    pushExperience();
  } else {
    pushExperience();
    pushEducation();
    pushSkills();
  }
  pushLanguages();
  pushProjects();
  pushCertifications();

  // ── Assemble document ────────────────────────────────────────────────────
  const doc = new Document({
    numbering: {
      config: [{
        reference: "resume-bullets",
        levels: [{
          level: 0,
          format: "bullet",
          text: "•",
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: {
              // 0.25" left indent, 0.18" hanging → bullet sits at 0.07", text at 0.25"
              indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.18) },
              spacing: { ...LS },
            },
            run: { size: hp(10) },
          },
        }],
      }],
    },
    sections: [{
      properties: {
        page: {
          size: { width: convertInchesToTwip(8.27), height: convertInchesToTwip(11.69) },
          margin: {
            top:    convertInchesToTwip(MARGIN),
            bottom: convertInchesToTwip(MARGIN),
            left:   convertInchesToTwip(MARGIN),
            right:  convertInchesToTwip(MARGIN),
          },
        },
      },
      children: ch,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${(p.name || "resume").replace(/\s+/g, "_")}.docx`);
}

// ========== MAIN APP ==========
export default function App() {
  // Firebase auth
  const {
    currentUser, userDoc, isPremium, authLoading,
    logout, upgradeToPremium, updateUserProfile, deleteAccount,
    saveResumeToCloud, loadResumeFromCloud, trackDownload,
    loadUserResumes, saveResumeToSubcollection, deleteResumeDoc,
  } = useAuth();

  // Admin role is stored in Firestore users/{uid}.role — admin always gets pro access
  const isAdminUser = userDoc?.role === "admin";
  const effectivePremium = isPremium || isAdminUser;

  // Derived user object that matches the shape expected by all components
  const user = currentUser ? {
    uid: currentUser.uid,
    email: currentUser.email,
    name: userDoc?.displayName || currentUser.displayName || currentUser.email?.split("@")[0] || "User",
    plan: effectivePremium ? "pro" : "free",
    photoURL: currentUser.photoURL,
    provider: userDoc?.provider || "password",
    premiumExpiresAt: userDoc?.premiumExpiresAt || null,
  } : null;

  // -- UI State --
  const [view, setView] = useState("home");
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'signup'
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [toast, setToast] = useState(null); // { msg, type: 'success'|'error' }
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [myResumesOpen, setMyResumesOpen] = useState(false);
  const [supportOpen, setSupportOpen]   = useState(false);
  const [ticketsOpen, setTicketsOpen]   = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [unreadTickets, setUnreadTickets] = useState(0);
  const [userResumes, setUserResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(false);
  const [activeResumeId, setActiveResumeId] = useState(() => lsGet("rb_resume_id") || null);
  const pendingDownloadRef = useRef(false);
  // Ref so auto-save timeout always reads the latest activeResumeId without stale closure
  const activeResumeIdRef = useRef(activeResumeId);
  useEffect(() => { activeResumeIdRef.current = activeResumeId; }, [activeResumeId]);
  const [resume, setResume] = useState(() => {
    const ls = lsGet("rb_resume");
    return (ls && !isStaleDefault(ls)) ? ls : SAMPLE_RESUME;
  });
  const [templateId, setTemplateId] = useState(() => lsGet("rb_template") || "classic");
  const [activeSection, setActiveSection] = useState("personal");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [atsOpen, setAtsOpen] = useState(false);
  const [appReady, setAppReady] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // -- Unread support ticket badge --
  useEffect(() => {
    if (!currentUser?.uid) { setUnreadTickets(0); return; }
    const q = query(collection(db, 'supportTickets'), where('userId', '==', currentUser.uid), where('unreadByUser', '==', true));
    const unsub = onSnapshot(q, snap => setUnreadTickets(snap.size), () => {});
    return unsub;
  }, [currentUser?.uid]);

  // -- Sync from cloud once auth resolves --
  useEffect(() => {
    if (authLoading || !currentUser) return;
    (async () => {
      const { resumeData, templateId: tid } = await loadResumeFromCloud(currentUser.uid);

      // Seed resumes subcollection on first login if it's empty (migration from old single-doc storage)
      const existing = await loadUserResumes();
      if (existing.length === 0 && resumeData && !isStaleDefault(resumeData)) {
        const newId = await saveResumeToSubcollection(null, resumeData, tid || "classic");
        const seeded = { id: newId, title: resumeData?.personal?.name || "My Resume", resumeData, templateId: tid || "classic", updatedAt: null };
        setUserResumes(newId ? [seeded] : []);
      } else {
        setUserResumes(existing);
      }
      // Intentionally NOT auto-loading any resume into the editor.
      // Users explicitly open saved resumes from "My Resumes".
    })();
  }, [currentUser, authLoading]); // eslint-disable-line

  // -- Auto-save resume (debounced) --
  useEffect(() => {
    if (!appReady) return;
    setSaveStatus("saving");
    const t = setTimeout(async () => {
      const { _isSample: _stripped, ...resumeToSave } = resume;
      lsSet("rb_template", templateId);
      // resume._isSample is true only while SAMPLE_RESUME is unedited.
      // Editor's up/upP strips it on the first keypress, enabling saves.
      if (!resume._isSample && !isEmptyResume(resumeToSave)) {
        lsSet("rb_resume", resumeToSave);
        if (currentUser) {
          await saveResumeToCloud(resumeToSave, templateId); // backward compat
          const savedId = await saveResumeToSubcollection(activeResumeIdRef.current, resumeToSave, templateId);
          if (savedId && !activeResumeIdRef.current) {
            setActiveResumeId(savedId);
            lsSet("rb_resume_id", savedId);
          }
        }
      }
      setSaveStatus("saved");
    }, 800);
    return () => clearTimeout(t);
  }, [resume, templateId, appReady]); // eslint-disable-line

  const ats = useMemo(() => analyzeATS(resume), [resume]);

  // -- Handlers --
  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
  };

  const handleUpdateProfile = async (patch) => {
    await updateUserProfile(patch);
  };

  const handleDeleteAccount = async () => {
    lsDel("rb_resume"); lsDel("rb_template");
    await deleteAccount();
    setProfileOpen(false);
    setResume(SAMPLE_RESUME);
    setTemplateId("classic");
  };

  const handleImportResume = (parsed) => {
    setResume(r => ({
      ...r,
      personal: { ...r.personal, ...parsed.personal },
      experience: parsed.experience.length ? parsed.experience : r.experience,
      education: parsed.education.length ? parsed.education : r.education,
      skills: parsed.skills.length ? parsed.skills : r.skills,
      projects: parsed.projects.length ? parsed.projects : r.projects,
      certifications: parsed.certifications.length ? parsed.certifications : r.certifications,
    }));
    setImportOpen(false);
  };

  const handleUpgrade = async (paymentId = null, plan = 'monthly') => {
    if (!currentUser) return;
    await upgradeToPremium(paymentId, plan);
    setUpgradeModal(false);
    showToast("You're now Pro! All premium features unlocked.", "success");
  };

  // -- My Resumes handlers --
  const handleOpenMyResumes = async () => {
    setResumesLoading(true);
    setMyResumesOpen(true);
    const list = await loadUserResumes();
    setUserResumes(list);
    setResumesLoading(false);
  };

  const handleEditResume = (r) => {
    setResume(r.resumeData);
    setTemplateId(r.templateId || "classic");
    setActiveResumeId(r.id);
    lsSet("rb_resume_id", r.id);
    lsSet("rb_resume", r.resumeData);
    lsSet("rb_template", r.templateId || "classic");
    setMyResumesOpen(false);
    setView("builder");
  };

  const handleDownloadResumeFromModal = (r) => {
    setResume(r.resumeData);
    setTemplateId(r.templateId || "classic");
    setActiveResumeId(r.id);
    lsSet("rb_resume_id", r.id);
    lsSet("rb_resume", r.resumeData);
    lsSet("rb_template", r.templateId || "classic");
    pendingDownloadRef.current = true;
    setMyResumesOpen(false);
    setView("builder");
  };

  // Trigger PDF once modal closes and resume is loaded
  useEffect(() => {
    if (!myResumesOpen && pendingDownloadRef.current) {
      pendingDownloadRef.current = false;
      setTimeout(() => handlePDFDownload(), 150);
    }
  }, [myResumesOpen]); // eslint-disable-line

  const handleDeleteResume = async (id) => {
    try {
      await deleteResumeDoc(id);
    } catch (err) {
      console.error("[handleDeleteResume] Firestore delete failed:", err);
      showToast("Failed to delete resume. Please try again.", "error");
      return; // bail out — do NOT update local state if the cloud delete failed
    }

    const wasActive = activeResumeIdRef.current === id;
    const updatedList = userResumes.filter(r => r.id !== id);
    setUserResumes(updatedList);

    if (wasActive) {
      if (updatedList.length > 0) {
        // Switch editor to the next available resume so auto-save doesn't re-create
        const next = updatedList[0];
        setResume(next.resumeData || EMPTY_RESUME);
        setTemplateId(next.templateId || "classic");
        setActiveResumeId(next.id);
        lsSet("rb_resume_id", next.id);
        lsSet("rb_resume", next.resumeData || EMPTY_RESUME);
      } else {
        // No resumes left — reset to empty so auto-save has nothing to re-create
        setResume(EMPTY_RESUME);
        setTemplateId("classic");
        setActiveResumeId(null);
        lsDel("rb_resume_id");
        lsDel("rb_resume"); // critical: prevents auto-save from re-creating on refresh
      }
    }
  };

  const handleDuplicateResume = async (r) => {
    const newId = await saveResumeToSubcollection(null, r.resumeData, r.templateId, `${r.title || "Resume"} (copy)`);
    if (newId) {
      const fresh = await loadUserResumes();
      setUserResumes(fresh);
    }
  };

  const handleNewResume = () => {
    setResume(SAMPLE_RESUME);
    setTemplateId("classic");
    setActiveResumeId(null);
    lsDel("rb_resume_id");
    lsDel("rb_resume");
    setMyResumesOpen(false);
    setView("builder");
  };

  // Always allow template selection for preview; export is gated separately
  const handleSelectTemplate = (id) => setTemplateId(id);

  // True when a free user is previewing a premium template
  const isPreviewLocked = !effectivePremium && (TEMPLATES.find(x => x.id === templateId)?.premium === true);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Compute daily remaining for the counter shown in the builder UI
  const today = new Date().toISOString().slice(0, 10);
  const dailyCount = userDoc?.lastDownloadDate === today ? (userDoc?.downloadCount || 0) : 0;
  const downloadsRemaining = isAdminUser
    ? Infinity
    : isPremium
      ? Math.max(0, 10 - dailyCount)
      : Math.max(0, 3 - dailyCount);

  const handlePDFDownload = async () => {
    if (pdfGenerating) return;
    if (isPreviewLocked) { setUpgradeModal('monthly'); return; }
    // Gate check — read from already-loaded userDoc, no Firestore write yet
    if (currentUser && !isAdminUser && downloadsRemaining <= 0) {
      if (isPremium) {
        showToast("Daily limit reached — Pro plan allows 10 downloads/day. Resets at midnight (UTC).", "error");
      } else {
        showToast("Daily limit reached — 3 downloads/day on the free plan. Upgrade to Pro for 10/day.", "error");
        setUpgradeModal('monthly');
      }
      return;
    }
    setPdfGenerating(true);
    try {
      await exportPDF(resume);
      // Increment quota ONLY after the PDF was successfully received by the browser
      const { remaining } = await trackDownload();
      if (currentUser && !isAdminUser && remaining <= 1) {
        showToast(remaining === 0 ? "That was your last download for today." : "1 download left today.", "info");
      }
    } catch (err) {
      console.error("[PDF export]", err);
      showToast(err?.message || "PDF download failed. Please try again.", "error");
      // trackDownload intentionally NOT called — failed downloads must not consume quota
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleWordDownload = async () => {
    // Gate check — no Firestore write yet
    if (currentUser && !isAdminUser && downloadsRemaining <= 0) {
      if (isPremium) {
        showToast("Daily limit reached — Pro plan allows 10 downloads/day. Resets at midnight (UTC).", "error");
      } else {
        showToast("Daily limit reached — 3 downloads/day on the free plan. Upgrade to Pro for 10/day.", "error");
        setUpgradeModal('monthly');
      }
      return;
    }
    try {
      await exportWord(resume, templateId);
      // Increment quota ONLY after the Word file was successfully generated
      const { remaining } = await trackDownload();
      if (currentUser && !isAdminUser && remaining <= 1) {
        showToast(remaining === 0 ? "That was your last download for today." : "1 download left today.", "info");
      }
    } catch {
      showToast("Word download failed. Please try again.", "error");
      // trackDownload intentionally NOT called — failed downloads must not consume quota
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
        body { margin: 0; }
        .font-serif-display { font-family: 'Source Serif Pro', Georgia, serif; }
        .font-sans-ui { font-family: 'Inter', system-ui, sans-serif; }
        .paper-texture { background-image: radial-gradient(rgba(0,0,0,0.02) 1px, transparent 1px); background-size: 3px 3px; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.5s ease-out both; }
        .delay-1 { animation-delay: 0.1s; } .delay-2 { animation-delay: 0.2s; } .delay-3 { animation-delay: 0.3s; } .delay-4 { animation-delay: 0.4s; }
        input, textarea, select { font-family: inherit; }
        input:focus, textarea:focus, select:focus { outline: none; }
        /* Prevent iOS auto-zoom on inputs */
        @media (max-width: 768px) {
          input, textarea, select { font-size: 16px !important; }
        }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
        /* --- RESPONSIVE --- */
        @media (max-width: 768px) {
          .hp-nav { padding: 0 1.25rem !important; }
          .hp-nav-links { display: none !important; }
          .hp-nav-links.hp-open { display: flex !important; flex-direction: column; position: fixed; top: 64px; left: 0; right: 0; background: #fff; border-bottom: 1px solid #e0e0e0; padding: 1.25rem 1.5rem; gap: 0.875rem !important; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .hp-hamburger { display: flex !important; }
          .hp-hero-grid { grid-template-columns: 1fr !important; padding: 2.5rem 1.25rem 2rem !important; gap: 2rem !important; }
          .hp-preview-card { display: none !important; }
          .hp-features-section { padding: 3rem 1.25rem !important; }
          .hp-features-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
          .hp-templates-section { padding: 3rem 1.25rem !important; }
          .hp-templates-grid { grid-template-columns: repeat(2,1fr) !important; gap: 0.875rem !important; }
          .hp-pricing-section { padding: 3rem 1.25rem !important; }
          .hp-pricing-cards { grid-template-columns: 1fr !important; }
          .hp-footer { flex-direction: column !important; text-align: center !important; padding: 1.5rem 1.25rem !important; gap: 0.75rem !important; }
          .bldr-logo { display: none !important; }
          .bldr-divider { display: none !important; }
          .bldr-save { display: none !important; }
          .bldr-import { display: none !important; }
          .bldr-ats { display: none !important; }
          .bldr-jobs { display: none !important; }
          .bldr-cl { display: none !important; }
          .bldr-interview { display: none !important; }
          .bldr-word { display: none !important; }
          .bldr-user { display: none !important; }
          .bldr-signup { display: none !important; }
          .bldr-toggle { display: flex !important; }
          .bldr-editor { width: 100% !important; min-width: 0 !important; }
          .bldr-tab-edit .bldr-preview { display: none !important; }
          .bldr-tab-preview .bldr-editor { display: none !important; }
          .bldr-tabs-bar { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hp-hamburger { display: none !important; }
          .bldr-tabs-bar { display: none !important; }
          .bldr-toggle { display: none !important; }
        }
        @media (min-width: 769px) and (max-width: 1100px) {
          .hp-hero-grid { grid-template-columns: 1fr !important; padding: 4rem 2rem 3rem !important; }
          .hp-preview-card { display: none !important; }
          .hp-features-grid { grid-template-columns: repeat(2,1fr) !important; }
          .hp-templates-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
      <div className="font-sans-ui min-h-screen" style={{ background: "#faf7f2", color: "#1a1a1a" }}>
        {view === "home" ? (
          <HomePage
            user={user}
            onSignIn={() => setAuthModal("login")}
            onSignUp={() => setAuthModal("signup")}
            onLogout={handleLogout}
            onStart={() => setView("builder")}
            onUpgrade={(plan) => user ? setUpgradeModal(plan || 'monthly') : setAuthModal("signup")}
            onOpenProfile={() => setProfileOpen(true)}
            onContactSupport={() => setSupportOpen(true)}
          />
        ) : (
          <BuilderPage
            resume={resume} setResume={setResume}
            templateId={templateId} onSelectTemplate={handleSelectTemplate}
            activeSection={activeSection} setActiveSection={setActiveSection}
            saveStatus={saveStatus}
            ats={ats} atsOpen={atsOpen} setAtsOpen={setAtsOpen}
            user={user}
            onBackHome={() => setView("home")}
            onPDF={handlePDFDownload} onWord={handleWordDownload}
            onSignIn={() => setAuthModal("login")} onSignUp={() => setAuthModal("signup")}
            onLogout={handleLogout}
            onUpgrade={(plan) => user ? setUpgradeModal(plan || 'monthly') : setAuthModal("signup")}
            sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
            onOpenProfile={() => setProfileOpen(true)}
            onOpenImport={() => user?.plan === "pro" ? setImportOpen(true) : (user ? setUpgradeModal('monthly') : setAuthModal("signup"))}
            onOpenMyResumes={handleOpenMyResumes}
            downloadsRemaining={downloadsRemaining}
            isPreviewLocked={isPreviewLocked}
            isPdfLoading={pdfGenerating}
          />
        )}
        <PdfLoadingModal visible={pdfGenerating} />
        {myResumesOpen && (
          <MyResumesModal
            resumes={userResumes}
            loading={resumesLoading}
            onClose={() => setMyResumesOpen(false)}
            onEdit={handleEditResume}
            onDownload={handleDownloadResumeFromModal}
            onDelete={handleDeleteResume}
            onDuplicate={handleDuplicateResume}
            onNew={handleNewResume}
          />
        )}
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        {authModal && <FirebaseAuthModal mode={authModal} onClose={() => setAuthModal(null)} onSwitch={(m)=>setAuthModal(m)} onSuccess={(msg) => { setAuthModal(null); showToast(msg); }} />}
        {upgradeModal && <UpgradeModal onClose={() => setUpgradeModal(false)} onUpgrade={handleUpgrade} user={user} plan={upgradeModal} />}
        {profileOpen && <ProfileModal user={user} onClose={() => setProfileOpen(false)} onUpdate={handleUpdateProfile} onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} onContactSupport={() => { setProfileOpen(false); setSupportOpen(true); }} onMyTickets={() => { setProfileOpen(false); setTicketsOpen(true); }} onFeedback={() => { setProfileOpen(false); setFeedbackOpen(true); }} unreadTickets={unreadTickets} />}
        {feedbackOpen && <FeedbackModal user={user} onClose={() => setFeedbackOpen(false)} />}
        {importOpen && <ImportResumeModal onClose={() => setImportOpen(false)} onImport={handleImportResume} user={user} onUpgrade={() => { setImportOpen(false); user ? setUpgradeModal('monthly') : setAuthModal("signup"); }} />}
        {supportOpen && <SupportModal user={user} onClose={() => setSupportOpen(false)} onViewTickets={user ? () => setTicketsOpen(true) : undefined} />}
        {ticketsOpen && <MyTicketsModal user={user} onClose={() => setTicketsOpen(false)} onNewTicket={() => { setTicketsOpen(false); setSupportOpen(true); }} />}
      </div>
    </>
  );
}