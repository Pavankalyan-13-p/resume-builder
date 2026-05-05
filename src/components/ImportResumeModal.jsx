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
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it => it.str).join(" ") + "\n";
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
  const lines = text.split(/\n|\r\n/).map(l => l.trim()).filter(Boolean);
  const result = {
    personal: { name:"", title:"", email:"", phone:"", location:"", website:"", linkedin:"", github:"", summary:"" },
    experience:[], education:[], skills:[], projects:[], certifications:[]
  };

  // Extract structured fields
  const emailM = text.match(/[\w.+\-]+@[\w.\-]+\.[a-zA-Z]{2,}/);
  if (emailM) result.personal.email = emailM[0];

  const phoneM = text.match(/(\+?1?\s*[\-.(]?\s*\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})/);
  if (phoneM) result.personal.phone = phoneM[0].trim();

  const liM = text.match(/linkedin\.com\/in\/[\w\-]+/i);
  if (liM) result.personal.linkedin = liM[0];

  const ghM = text.match(/github\.com\/[\w\-]+/i);
  if (ghM) result.personal.github = ghM[0];

  const cityM = text.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s+\d{5})?)/);
  if (cityM) result.personal.location = cityM[0].trim();

  // Name = first long-ish line without @/digits/http
  for (const ln of lines.slice(0, 5)) {
    if (!ln.includes("@") && !ln.match(/\d{4}/) && !ln.startsWith("http") && ln.length >= 4 && ln.length <= 50) {
      result.personal.name = ln; break;
    }
  }
  // Title = second such line
  let foundName = false;
  for (const ln of lines.slice(0, 6)) {
    if (ln === result.personal.name) { foundName = true; continue; }
    if (foundName && !ln.includes("@") && !ln.match(/\d{3}/) && ln.length <= 70) {
      result.personal.title = ln; break;
    }
  }

  // Section detection
  const SEC = {
    summary: /^(professional\s+)?(summary|profile|objective|about\s*me)/i,
    experience: /^(work\s+)?(experience|employment|work history|career)/i,
    education: /^education|^academic/i,
    skills: /^(technical\s+)?skills?|^competencies|^technologies/i,
    projects: /^projects?|^portfolio/i,
    certifications: /^certifications?|^certificates?|^credentials/i,
  };

  let curSec = null;
  const secBufs = {};
  for (const ln of lines) {
    let hit = false;
    for (const [k, re] of Object.entries(SEC)) {
      if (re.test(ln) && ln.length < 45) { curSec = k; secBufs[k] = secBufs[k] || []; hit = true; break; }
    }
    if (!hit && curSec) secBufs[curSec].push(ln);
  }

  if (secBufs.summary) result.personal.summary = secBufs.summary.slice(0,6).join(" ");

  if (secBufs.skills) {
    const raw = secBufs.skills.join(" , ");
    result.skills = raw.split(/[,•·|\n]+/).map(s=>s.trim()).filter(s=>s && s.length<40).slice(0,20);
  }

  if (secBufs.experience) {
    const expL = secBufs.experience;
    const dateRe = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})/i;
    let cur = null;
    for (let i = 0; i < expL.length; i++) {
      const ln = expL[i];
      if (dateRe.test(ln) && i > 0) {
        if (cur) result.experience.push(cur);
        const yr = ln.match(/\d{4}/g) || [];
        cur = { id:Date.now()+i, role:expL[i-1]||"", company:ln, location:"", start:yr[0]||"", end:yr[1]||"Present", bullets:[] };
      } else if (cur && (ln.startsWith("•")||ln.startsWith("–")||ln.startsWith("-")||ln.startsWith("·"))) {
        cur.bullets.push(ln.replace(/^[•–\-·]\s*/,""));
      }
    }
    if (cur) result.experience.push(cur);
  }

  if (secBufs.education) {
    const edL = secBufs.education;
    for (let i = 0; i < edL.length; i++) {
      const yr = edL[i].match(/\d{4}/g) || [];
      if (yr.length) {
        result.education.push({ id:Date.now()+i, degree:edL[Math.max(0,i-1)]||"", school:edL[i], location:"", start:yr[0]||"", end:yr[1]||"", details:"" });
      }
    }
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
          <button onClick={onUpgrade} style={{ width: "100%", padding: "12px", background: "#b84a2e", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", marginBottom: "8px" }}>Upgrade to Pro — $9/mo</button>
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

              <div style={{ display: "flex", gap: "8px", fontSize: "0.8rem", color: "#666", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                {parsed.experience.length > 0 && <span style={{ background: "#edf2f7", padding: "3px 10px", color: "#1a2e4a" }}>{parsed.experience.length} experience entries</span>}
                {parsed.education.length > 0 && <span style={{ background: "#edf2f7", padding: "3px 10px", color: "#1a2e4a" }}>{parsed.education.length} education entries</span>}
                {parsed.skills.length > 0 && <span style={{ background: "#edf2f7", padding: "3px 10px", color: "#1a2e4a" }}>{parsed.skills.length} skills</span>}
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
