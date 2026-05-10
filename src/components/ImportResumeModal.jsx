import React, { useState, useRef } from "react";
import { X, Crown, Upload, AlertCircle, Check } from "lucide-react";
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script"); s.src = src;
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}
async function extractTextFromPDF(file) {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js");
  const lib = window.pdfjsLib;
  lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const buf = await file.arrayBuffer();
  const doc = await lib.getDocument({ data: buf }).promise;
  let text = "";
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    // Group items by Y position so two-column PDFs read top-to-bottom correctly.
    // Round Y to nearest 3px to cluster items on the same visual line.
    const lineMap = {};
    for (const item of content.items) {
      if (!item.str) continue;
      const y = Math.round(item.transform[5] / 3) * 3;
      if (!lineMap[y]) lineMap[y] = [];
      lineMap[y].push({ x: item.transform[4], str: item.str });
    }
    const sortedYs = Object.keys(lineMap).map(Number).sort((a, b) => b - a);
    for (const y of sortedYs) {
      const lineItems = lineMap[y].sort((a, b) => a.x - b.x);
      const lineStr = lineItems.map(it => it.str).join(" ").replace(/\s+/g, " ").trim();
      if (lineStr) text += lineStr + "\n";
    }
    text += "\n";
  }
  return text;
}
async function extractTextFromDOCX(file) {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js");
  const buf = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer: buf });
  return result.value;
}


function parseResumeText(rawText) {
  const text = rawText || "";
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const result = {
    personal: { name:"", title:"", email:"", phone:"", location:"", website:"", linkedin:"", github:"", summary:"" },
    experience:[], education:[], skills:[], projects:[], certifications:[], languages:[]
  };

  // ── 1. Reliable contact-info extraction ──────────────────────────────────

  const emailM = text.match(/[\w.+\-]+@[\w.\-]+\.[a-zA-Z]{2,}/);
  if (emailM) result.personal.email = emailM[0];

  // Indian (+91) and generic international phone formats
  const phoneM = text.match(/(\+91[\s\-]?\d{5}[\s\-]?\d{5}|\+\d{1,3}[\s\-]?\(?\d{2,5}\)?[\s\-]?\d{3,5}[\s\-]?\d{4,5}|\b[6-9]\d{9}\b|\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4})/);
  if (phoneM) result.personal.phone = phoneM[0].trim();

  const liM = text.match(/linkedin\.com\/in\/[\w\-]+/i);
  if (liM) result.personal.linkedin = liM[0];

  const ghM = text.match(/github\.com\/[\w\-]+/i);
  if (ghM) result.personal.github = ghM[0];

  const webM = text.match(/https?:\/\/(?!.*linkedin)(?!.*github)[\w.\-\/]+/i);
  if (webM) result.personal.website = webM[0];

  // Location — labeled first, then Indian city list, then generic city,state
  const locLabel = text.match(/location\s*[:\-]\s*([^\n|]{3,50})/i);
  if (locLabel) {
    result.personal.location = locLabel[1].trim();
  } else {
    const hdr = lines.slice(0, 14).join("\n");
    const indiaCity = hdr.match(/\b(Mumbai|Delhi|New Delhi|Bangalore|Bengaluru|Chennai|Hyderabad|Kolkata|Pune|Ahmedabad|Jaipur|Lucknow|Surat|Noida|Gurgaon|Gurugram|Chandigarh|Coimbatore|Indore|Bhopal|Nagpur|Kochi|Vizag|Visakhapatnam|Patna|Vadodara|Agra|Bhubaneswar|Thiruvananthapuram|Mysore|Ranchi|Faridabad|Ghaziabad|Ludhiana)\b[^,\n]*(,\s*[^\n|]{2,30})?/i);
    if (indiaCity) {
      result.personal.location = indiaCity[0].replace(/[|\n].*/g,"").trim();
    } else {
      // Generic "City, State/Country" only in header region
      const cityM = hdr.match(/\b([A-Z][a-zA-Z\s]{2,20},\s*[A-Z][a-zA-Z\s]{2,20})\b/);
      if (cityM) result.personal.location = cityM[1].trim();
    }
  }

  // ── 2. Name and title from first few lines ────────────────────────────────

  for (const ln of lines.slice(0, 6)) {
    if (!ln.includes("@") && !/\d{5,}/.test(ln) && !ln.startsWith("http") &&
        ln.length >= 3 && ln.length <= 55 && !/^(resume|curriculum|cv\b)/i.test(ln)) {
      result.personal.name = ln; break;
    }
  }
  let foundName = false;
  for (const ln of lines.slice(0, 8)) {
    if (ln === result.personal.name) { foundName = true; continue; }
    if (foundName && !ln.includes("@") && !/\d{7,}/.test(ln) && !ln.startsWith("http") &&
        ln.length >= 3 && ln.length <= 70 &&
        !/(linkedin|github|gmail|yahoo|outlook)/i.test(ln)) {
      result.personal.title = ln; break;
    }
  }

  // ── 3. Section boundary detection ────────────────────────────────────────

  const SEC_RE = {
    summary:        /^(professional\s+)?(summary|profile|objective|about(\s+me)?|career\s+(objective|summary))\s*:?$/i,
    experience:     /^((work|professional|relevant)\s+)?(experience|employment|work\s+history|career\s+history)\s*:?$/i,
    education:      /^(education|academic(\s+background)?|educational\s+qualifications?|qualifications?)\s*:?$/i,
    skills:         /^((technical|core|key|professional)\s+)?(skills?|competencies|technologies|tech\s+stack|areas\s+of\s+expertise)\s*:?$/i,
    projects:       /^((personal|academic|key|notable)\s+)?projects?\s*:?$/i,
    certifications: /^(certifications?|certificates?|credentials?|licenses?\s*(&|and)?\s*certifications?|courses?\s*(&|and)?\s*certifications?)\s*:?$/i,
    languages:      /^(languages?(\s+known)?|language\s+proficiency)\s*:?$/i,
  };

  let curSec = null;
  const secBufs = {};
  for (const ln of lines) {
    let hit = false;
    for (const [k, re] of Object.entries(SEC_RE)) {
      if (re.test(ln) && ln.length < 55) { curSec = k; secBufs[k] = secBufs[k] || []; hit = true; break; }
    }
    if (!hit && curSec) secBufs[curSec].push(ln);
  }

  // ── 4. Summary ────────────────────────────────────────────────────────────

  if (secBufs.summary?.length) {
    result.personal.summary = secBufs.summary.slice(0, 8).join(" ").replace(/\s+/g, " ").trim();
  }

  // ── 5. Skills ─────────────────────────────────────────────────────────────

  if (secBufs.skills?.length) {
    const raw = secBufs.skills.join(" | ");
    result.skills = raw
      .split(/[,•·|\n\/]+/)
      .map(s => s.replace(/^[-–*▪◦]\s*/, "").trim())
      .filter(s => s && s.length >= 2 && s.length <= 40 && !/^\d+$/.test(s))
      .slice(0, 25);
  }

  // ── 6. Experience ─────────────────────────────────────────────────────────

  if (secBufs.experience?.length) {
    const expL = secBufs.experience;
    // Matches "Jan 2020 – Dec 2022", "2020 – 2022", "2020 - Present", "Jan 2020 – Present"
    const dateRangeRe = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)?\s*'?(\d{4})\s*[-–—to]+\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)?\s*'?(\d{4}|present|current|now|till\s+date)/i;
    const yearOnlyRe = /\b(20\d{2}|19\d{2})\s*[-–—]\s*(20\d{2}|19\d{2}|present|current)/i;

    let cur = null;
    for (let i = 0; i < expL.length; i++) {
      const ln = expL[i];
      const hasDateRange = dateRangeRe.test(ln) || yearOnlyRe.test(ln);

      if (hasDateRange) {
        if (cur) result.experience.push(cur);
        // Extract start/end
        const dm = ln.match(/((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec\w*)\s*)?'?(\d{4})\s*[-–—]+\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec\w*)\s*)?'?(\d{0,4}|present|current)/i);
        const start = dm ? ((dm[1] || "").trim() + " " + dm[2]).trim() : "";
        const end   = dm ? ((dm[3] || "").trim() + " " + dm[4]).trim() || "Present" : "Present";

        // Try to detect role and company from this line or adjacent lines
        // Pattern 1: "Role | Company | dates" or "Role at Company | dates"
        const stripped = ln.replace(dateRangeRe,"").replace(yearOnlyRe,"").trim();
        const pipeM  = stripped.match(/^(.+?)\s*[|·•,]\s*(.+)/);
        const atM    = stripped.match(/^(.+?)\s+at\s+(.+)/i);
        let role = "", company = "";
        if (pipeM && pipeM[1].length < 60) {
          role = pipeM[1].trim(); company = pipeM[2].replace(/[|,·•].*/,"").trim();
        } else if (atM) {
          role = atM[1].trim(); company = atM[2].trim();
        } else {
          // Date is standalone or on company line; use previous non-bullet line as role
          role = i > 0 ? expL[i - 1].replace(/^[•·\-–*]\s*/, "") : "";
          company = stripped.replace(/^[•·\-–*,|]\s*/, "").trim();
          if (company === role) company = "";
        }
        cur = { id: Date.now() + i, role, company, location: "", start, end, bullets: [] };
      } else if (cur) {
        if (/^[•·\-–*▪◦]\s/.test(ln)) {
          cur.bullets.push(ln.replace(/^[•·\-–*▪◦]\s*/, "").trim());
        } else if (!cur.company && ln.length < 70 && !/\d{4}/.test(ln)) {
          cur.company = ln; // second line = company when role was on previous line
        } else if (ln.length > 25 && /^[A-Z]/.test(ln)) {
          cur.bullets.push(ln); // long achievement line without bullet char
        }
      }
    }
    if (cur) result.experience.push(cur);
  }

  // ── 7. Education ──────────────────────────────────────────────────────────

  if (secBufs.education?.length) {
    const edL = secBufs.education;
    const degreeRe = /\b(b\.?\s*tech|b\.?\s*e\.?|b\.?\s*sc|b\.?\s*com|bca|be\b|b\.?c\.?a|m\.?\s*tech|m\.?\s*e\.?|m\.?\s*sc|mca|mba|m\.?b\.?a|ph\.?\s*d|phd|bachelor|master|diploma|higher\s+secondary|10\+2|12th|10th|sslc|hsc|ssc|pgdm|pgd)\b/i;
    const yearRe = /\b(20\d{2}|19\d{2})\b/g;

    let cur = null;
    for (let i = 0; i < edL.length; i++) {
      const ln = edL[i];
      const hasDegree = degreeRe.test(ln);
      const years = ln.match(yearRe);
      if (hasDegree || (years && years.length >= 1)) {
        if (cur) result.education.push(cur);
        const yr = ln.match(/(20\d{2}|19\d{2})\s*[-–—]\s*(20\d{2}|19\d{2}|present)/i);
        const degreeText = hasDegree ? ln.replace(/(20\d{2}|19\d{2})[\s\S]*/g,"").trim() : (edL[Math.max(0,i-1)] || ln);
        const schoolText = hasDegree && i + 1 < edL.length ? edL[i+1] : (hasDegree ? "" : ln.replace(/\d{4}.*/,"").trim());
        cur = {
          id: Date.now() + i,
          degree: degreeText,
          school: schoolText,
          location: "",
          start: yr ? yr[1] : (years ? years[0] : ""),
          end:   yr ? yr[2] : (years && years.length > 1 ? years[1] : ""),
          details: ""
        };
      } else if (cur && !cur.school && ln.length < 80) {
        cur.school = ln;
      } else if (cur && ln.length < 60 && !/\d{4}/.test(ln)) {
        cur.details = (cur.details ? cur.details + " " : "") + ln;
      }
    }
    if (cur) result.education.push(cur);
  }

  // ── 8. Projects ───────────────────────────────────────────────────────────

  if (secBufs.projects?.length) {
    let curP = null;
    for (let i = 0; i < secBufs.projects.length; i++) {
      const ln = secBufs.projects[i];
      const isBullet = /^[•·\-–*▪◦]\s/.test(ln);
      if (!isBullet && ln.length <= 80) {
        if (curP) result.projects.push(curP);
        const urlM = ln.match(/https?:\/\/[\w.\-\/]+/);
        curP = { id: Date.now() + i, name: ln.replace(/https?:\/\/[\w.\-\/]+/, "").trim(), description: "", link: urlM ? urlM[0] : "" };
      } else if (curP) {
        const clean = isBullet ? ln.replace(/^[•·\-–*▪◦]\s*/, "") : ln;
        curP.description = (curP.description ? curP.description + " " : "") + clean;
      }
    }
    if (curP) result.projects.push(curP);
  }

  // ── 9. Certifications ────────────────────────────────────────────────────

  if (secBufs.certifications?.length) {
    let certLines = secBufs.certifications;
    let i = 0;
    while (i < certLines.length) {
      const ln = certLines[i];
      if (!ln || /^[•·\-–*▪◦]\s*$/.test(ln)) { i++; continue; }
      const clean = ln.replace(/^[•·\-–*▪◦]\s*/, "").trim();
      const dateM = clean.match(/\b(20\d{2}|19\d{2})\b/);
      // Issuer often on the next line or after a dash/pipe
      const pipeM = clean.match(/^(.+?)\s*[|\-–]\s*(.+)/);
      let name = clean, issuer = "", date = dateM ? dateM[0] : "";
      if (pipeM) {
        name = pipeM[1].replace(/\b(20\d{2}|19\d{2})\b/,"").trim();
        issuer = pipeM[2].replace(/\b(20\d{2}|19\d{2})\b/,"").trim();
      } else {
        name = clean.replace(/\b(20\d{2}|19\d{2})\b/,"").replace(/[-|]\s*$/,"").trim();
        if (i + 1 < certLines.length && certLines[i+1].length < 50 && !certLines[i+1].match(/\b20\d{2}\b/)) {
          issuer = certLines[i+1]; i++;
        }
      }
      if (name) result.certifications.push({ id: Date.now() + i, name, issuer, date });
      i++;
    }
  }

  // ── 10. Languages ─────────────────────────────────────────────────────────

  if (secBufs.languages?.length) {
    const raw = secBufs.languages.join(" , ");
    raw.split(/[,•·|\n]+/).map(s => s.trim()).filter(s => s && s.length >= 2 && s.length <= 30).forEach((s, i) => {
      const lvlM = s.match(/\(([^)]+)\)/);
      result.languages.push({ id: Date.now() + i, name: s.replace(/\s*\([^)]+\)/, "").trim(), level: lvlM ? lvlM[1] : "" });
    });
  }

  return result;
}


export default function ImportResumeModal({ onClose, onImport, user, onUpgrade }) {
  const [step, setStep] = useState("upload"); // upload | parsing | preview
  const [pasteText, setPasteText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  if (!user || user.plan !== "pro") {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(26,46,74,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={onClose}>
        <div style={{ background: "#fff", maxWidth: "420px", width: "100%", padding: "2rem", textAlign: "center" }} onClick={e => e.stopPropagation()}>
          <Crown style={{ width: 40, height: 40, color: "#b84a2e", margin: "0 auto 1rem" }} />
          <h2 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1.5rem", fontWeight: 700, color: "#1a2e4a", margin: "0 0 0.75rem" }}>Pro Feature</h2>
          <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: 1.6, margin: "0 0 1.5rem" }}>Import and auto-fill your resume from an existing PDF or Word document. Upgrade to Pro to access this feature.</p>
          <button onClick={onUpgrade} style={{ width: "100%", padding: "12px", background: "#b84a2e", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", marginBottom: "8px" }}>Upgrade to Pro — Rs. 99/mo</button>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "0.8rem" }}>Maybe later</button>
        </div>
      </div>
    );
  }

  const processText = (text) => {
    if (!text.trim()) { setError("No text found in file. Try pasting your resume text instead."); setStep("upload"); return; }
    const result = parseResumeText(text);
    setParsed(result);
    setStep("preview");
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setStep("parsing");
    try {
      let text = "";
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        text = await extractTextFromPDF(file);
      } else if (file.name.toLowerCase().endsWith(".docx")) {
        text = await extractTextFromDOCX(file);
      } else if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
        text = await file.text();
      } else {
        setError("Supported formats: PDF, DOCX, TXT. Try pasting your resume text below.");
        setStep("upload"); return;
      }
      processText(text);
    } catch (e) {
      setError("Could not parse file. Try pasting your resume text below.");
      setStep("upload");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(26,46,74,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={onClose}>
      <div style={{ background: "#fff", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflow: "auto", WebkitOverflowScrolling: "touch" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #ebebeb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1.3rem", fontWeight: 700, color: "#1a2e4a", margin: 0 }}>Import Resume</h2>
            <p style={{ fontSize: "0.8rem", color: "#888", margin: "3px 0 0 0" }}>Auto-fill your resume from an existing PDF or Word file</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X style={{ width: 18, height: 18, color: "#888" }} /></button>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {step === "upload" && (
            <>
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${dragOver ? "#b84a2e" : "#d0d0d0"}`, padding: "2.5rem", textAlign: "center", cursor: "pointer", background: dragOver ? "#fff5f3" : "#fafaf9", marginBottom: "1.25rem", transition: "all 0.15s" }}
              >
                <Upload style={{ width: 32, height: 32, color: "#aaa", margin: "0 auto 12px" }} />
                <div style={{ fontWeight: 600, color: "#333", marginBottom: "4px" }}>Drop your resume here</div>
                <div style={{ fontSize: "0.8rem", color: "#888" }}>PDF, DOCX, or TXT · or click to browse</div>
                <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
              </div>

              {error && (
                <div style={{ display: "flex", gap: "8px", padding: "10px 12px", background: "#fef2f2", color: "#dc2626", fontSize: "0.8rem", marginBottom: "1rem", alignItems: "flex-start" }}>
                  <AlertCircle style={{ width: 14, height: 14, flexShrink: 0, marginTop: "1px" }} /> {error}
                </div>
              )}

              {/* Paste fallback */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#888", display: "block", marginBottom: "8px" }}>Or paste resume text</label>
                <textarea
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  placeholder="Paste the text content of your resume here…"
                  rows={7}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", background: "#faf7f2", fontSize: "0.85rem", lineHeight: 1.6, resize: "vertical", boxSizing: "border-box", outline: "none" }}
                />
              </div>
              {pasteText.trim() && (
                <button
                  onClick={() => processText(pasteText)}
                  style={{ width: "100%", padding: "11px", background: "#1a2e4a", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}
                >
                  Parse &amp; Preview →
                </button>
              )}
              <p style={{ fontSize: "0.72rem", color: "#bbb", textAlign: "center", marginTop: "12px" }}>Your file is processed in your browser — nothing is uploaded to any server.</p>
            </>
          )}

          {step === "parsing" && (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <div style={{ width: 48, height: 48, border: "3px solid #1a2e4a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ fontWeight: 600, color: "#1a2e4a" }}>Extracting resume content…</div>
              <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "4px" }}>Parsing text and identifying sections</div>
            </div>
          )}

          {step === "preview" && parsed && (
            <>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", fontSize: "0.8rem", color: "#15803d", marginBottom: "1.25rem", display: "flex", gap: "8px", alignItems: "center" }}>
                <Check style={{ width: 14, height: 14, flexShrink: 0 }} /> Extracted successfully — review the fields below before applying
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.25rem" }}>
                {[
                  ["Name", parsed.personal.name],
                  ["Title", parsed.personal.title],
                  ["Email", parsed.personal.email],
                  ["Phone", parsed.personal.phone],
                  ["Location", parsed.personal.location],
                  ["LinkedIn", parsed.personal.linkedin],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: "#fafaf9", padding: "8px 10px", border: "1px solid #ebebeb" }}>
                    <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#aaa", marginBottom: "2px" }}>{label}</div>
                    <div style={{ fontSize: "0.85rem", color: val ? "#1a1a1a" : "#ccc" }}>{val || "-"}</div>
                  </div>
                ))}
              </div>

              {parsed.personal.summary && (
                <div style={{ background: "#fafaf9", padding: "10px", border: "1px solid #ebebeb", marginBottom: "1.25rem" }}>
                  <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#aaa", marginBottom: "4px" }}>Summary</div>
                  <div style={{ fontSize: "0.82rem", color: "#444", lineHeight: 1.5 }}>{parsed.personal.summary.slice(0, 180)}{parsed.personal.summary.length > 180 ? "…" : ""}</div>
                </div>
              )}

              <div style={{ display: "flex", gap: "6px", fontSize: "0.78rem", color: "#666", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                {parsed.experience.length > 0 && <span style={{ background: "#edf2f7", padding: "3px 10px", color: "#1a2e4a" }}>{parsed.experience.length} experience</span>}
                {parsed.education.length > 0 && <span style={{ background: "#edf2f7", padding: "3px 10px", color: "#1a2e4a" }}>{parsed.education.length} education</span>}
                {parsed.skills.length > 0 && <span style={{ background: "#edf2f7", padding: "3px 10px", color: "#1a2e4a" }}>{parsed.skills.length} skills</span>}
                {parsed.projects?.length > 0 && <span style={{ background: "#edf2f7", padding: "3px 10px", color: "#1a2e4a" }}>{parsed.projects.length} projects</span>}
                {parsed.certifications?.length > 0 && <span style={{ background: "#edf2f7", padding: "3px 10px", color: "#1a2e4a" }}>{parsed.certifications.length} certifications</span>}
                {parsed.languages?.length > 0 && <span style={{ background: "#edf2f7", padding: "3px 10px", color: "#1a2e4a" }}>{parsed.languages.length} languages</span>}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => { onImport(parsed); }} style={{ flex: 1, padding: "11px", background: "#1a2e4a", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
                  Apply to my resume
                </button>
                <button onClick={() => { setStep("upload"); setParsed(null); setError(""); setPasteText(""); }} style={{ padding: "11px 16px", background: "#fff", border: "1px solid #e0e0e0", cursor: "pointer", fontSize: "0.8rem", color: "#666" }}>
                  Try again
                </button>
              </div>
              <p style={{ fontSize: "0.72rem", color: "#bbb", textAlign: "center", marginTop: "10px" }}>Existing resume data for non-empty sections will be preserved if nothing was extracted.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
