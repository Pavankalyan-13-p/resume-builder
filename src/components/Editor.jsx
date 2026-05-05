import React, { useState } from "react";
import { X, Plus, Crown, Eye, Trash2 } from "lucide-react";
import { TEMPLATES } from "../data/resumeData.js";
export default function Editor({ resume, setResume, section, templateId, onSelectTemplate, user }) {
  const up = (patch) => setResume(r => ({ ...r, ...patch }));
  const upP = (patch) => setResume(r => ({ ...r, personal: { ...r.personal, ...patch } }));

  if (section === "personal") return (
    <div className="space-y-4">
      <SectionHeader title="Personal details" />
      <Field label="Full name"><input value={resume.personal.name} onChange={e=>upP({name:e.target.value})} className="w-full p-2 border bg-[#faf7f2]" style={{ borderColor: "#1a2e4a20" }} /></Field>
      <Field label="Professional title"><input value={resume.personal.title} onChange={e=>upP({title:e.target.value})} placeholder="e.g. Senior Software Engineer" className="w-full p-2 border bg-[#faf7f2]" style={{ borderColor: "#1a2e4a20" }} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Email"><input value={resume.personal.email} onChange={e=>upP({email:e.target.value})} className="w-full p-2 border bg-[#faf7f2]" style={{ borderColor: "#1a2e4a20", fontSize: "16px" }} /></Field>
        <Field label="Phone"><input value={resume.personal.phone} onChange={e=>upP({phone:e.target.value})} className="w-full p-2 border bg-[#faf7f2]" style={{ borderColor: "#1a2e4a20", fontSize: "16px" }} /></Field>
      </div>
      <Field label="Location"><input value={resume.personal.location} onChange={e=>upP({location:e.target.value})} placeholder="City, State" className="w-full p-2 border bg-[#faf7f2]" style={{ borderColor: "#1a2e4a20" }} /></Field>
      <Field label="Website"><input value={resume.personal.website} onChange={e=>upP({website:e.target.value})} className="w-full p-2 border bg-[#faf7f2]" style={{ borderColor: "#1a2e4a20" }} /></Field>
      <Field label="LinkedIn"><input value={resume.personal.linkedin} onChange={e=>upP({linkedin:e.target.value})} className="w-full p-2 border bg-[#faf7f2]" style={{ borderColor: "#1a2e4a20" }} /></Field>
      <Field label="GitHub"><input value={resume.personal.github} onChange={e=>upP({github:e.target.value})} className="w-full p-2 border bg-[#faf7f2]" style={{ borderColor: "#1a2e4a20" }} /></Field>
    </div>
  );

  if (section === "summary") return (
    <div className="space-y-4">
      <SectionHeader title="Professional summary" hint="40-80 words describing who you are and what you bring." />
      <textarea value={resume.personal.summary} onChange={e=>upP({summary:e.target.value})} rows={8} className="w-full p-3 border bg-[#faf7f2] text-sm leading-relaxed" style={{ borderColor: "#1a2e4a20" }} />
      <div className="text-xs" style={{ color: "#888" }}>{(resume.personal.summary||"").trim().split(/\s+/).filter(Boolean).length} words</div>
    </div>
  );

  if (section === "experience") return (
    <ListEditor
      title="Work experience"
      items={resume.experience}
      onChange={(items) => up({ experience: items })}
      empty={{ role: "", company: "", location: "", start: "", end: "", bullets: [""] }}
      renderItem={(it, upd) => (
        <>
          <div className="grid grid-cols-2 gap-2">
            <input value={it.role} onChange={e=>upd({role:e.target.value})} placeholder="Role" className="p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
            <input value={it.company} onChange={e=>upd({company:e.target.value})} placeholder="Company" className="p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
          </div>
          <input value={it.location} onChange={e=>upd({location:e.target.value})} placeholder="Location" className="w-full p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
          <div className="grid grid-cols-2 gap-2">
            <input value={it.start} onChange={e=>upd({start:e.target.value})} placeholder="Start (e.g. Jan 2022)" className="p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
            <input value={it.end} onChange={e=>upd({end:e.target.value})} placeholder="End (or Present)" className="p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest" style={{ color: "#666" }}>Bullet points</label>
            {(it.bullets||[]).map((b, i) => (
              <div key={i} className="flex gap-1">
                <textarea value={b} onChange={e=>{ const nb=[...it.bullets]; nb[i]=e.target.value; upd({bullets:nb}); }} rows={2} placeholder="Start with an action verb. Include metrics." className="flex-1 p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
                <button onClick={()=>{ const nb=it.bullets.filter((_,j)=>j!==i); upd({bullets:nb}); }} className="px-2 hover:text-[#b84a2e]"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <button onClick={()=>upd({bullets:[...(it.bullets||[]),""]})} className="text-xs flex items-center gap-1 hover:text-[#b84a2e]"><Plus className="w-3 h-3" /> Add bullet</button>
          </div>
        </>
      )}
    />
  );

  if (section === "education") return (
    <ListEditor
      title="Education"
      items={resume.education}
      onChange={(items) => up({ education: items })}
      empty={{ degree: "", school: "", location: "", start: "", end: "", details: "" }}
      renderItem={(it, upd) => (
        <>
          <input value={it.degree} onChange={e=>upd({degree:e.target.value})} placeholder="Degree (e.g. B.S. Computer Science)" className="w-full p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
          <input value={it.school} onChange={e=>upd({school:e.target.value})} placeholder="School" className="w-full p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
          <input value={it.location} onChange={e=>upd({location:e.target.value})} placeholder="Location" className="w-full p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
          <div className="grid grid-cols-2 gap-2">
            <input value={it.start} onChange={e=>upd({start:e.target.value})} placeholder="Start" className="p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
            <input value={it.end} onChange={e=>upd({end:e.target.value})} placeholder="End" className="p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
          </div>
          <textarea value={it.details} onChange={e=>upd({details:e.target.value})} rows={2} placeholder="GPA, honors, relevant coursework (optional)" className="w-full p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
        </>
      )}
    />
  );

  if (section === "skills") {
    return (
      <div className="space-y-4">
        <SectionHeader title="Skills" hint="Add 5–15 skills. Press Enter to add. ATS loves specific, listable terms." />
        <SkillInput value={resume.skills} onChange={(skills) => up({ skills })} />
      </div>
    );
  }

  if (section === "projects") return (
    <ListEditor
      title="Projects"
      items={resume.projects}
      onChange={(items) => up({ projects: items })}
      empty={{ name: "", description: "", link: "" }}
      renderItem={(it, upd) => (
        <>
          <input value={it.name} onChange={e=>upd({name:e.target.value})} placeholder="Project name" className="w-full p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
          <textarea value={it.description} onChange={e=>upd({description:e.target.value})} rows={2} placeholder="One-line description" className="w-full p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
          <input value={it.link} onChange={e=>upd({link:e.target.value})} placeholder="Link (optional)" className="w-full p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
        </>
      )}
    />
  );

  if (section === "languages") return (
    <div className="space-y-4">
      <SectionHeader title="Languages" hint="Optional. Add languages you speak with proficiency level." />
      <LanguageInput value={resume.languages || []} onChange={(languages) => up({ languages })} />
    </div>
  );

  if (section === "certifications") return (
    <ListEditor
      title="Certifications"
      items={resume.certifications}
      onChange={(items) => up({ certifications: items })}
      empty={{ name: "", issuer: "", date: "" }}
      renderItem={(it, upd) => (
        <>
          <input value={it.name} onChange={e=>upd({name:e.target.value})} placeholder="Certification name" className="w-full p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
          <input value={it.issuer} onChange={e=>upd({issuer:e.target.value})} placeholder="Issuing organization" className="w-full p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
          <input value={it.date} onChange={e=>upd({date:e.target.value})} placeholder="Date (e.g. 2023)" className="w-full p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
        </>
      )}
    />
  );

  if (section === "templates") return (
    <div className="space-y-4">
      <SectionHeader title="Choose a template" hint="Click any template to preview instantly. Pro templates require upgrade to export." />

      {/* Free templates */}
      <div style={{ fontSize: "0.67rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, color: "#999", marginBottom: 4 }}>Free</div>
      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
        {TEMPLATES.filter(t => !t.premium).map(t => {
          const active = t.id === templateId;
          return (
            <TemplatePickerCard key={t.id} t={t} active={active} locked={false} onSelect={onSelectTemplate} />
          );
        })}
      </div>

      {/* Premium templates */}
      <div style={{ fontSize: "0.67rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, color: "#b84a2e", marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
        <Crown style={{ width: 10, height: 10 }} /> Pro Templates
      </div>
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.filter(t => t.premium).map(t => {
          const locked = !user || user.plan !== "pro";
          const active = t.id === templateId;
          return (
            <TemplatePickerCard key={t.id} t={t} active={active} locked={locked} onSelect={onSelectTemplate} />
          );
        })}
      </div>

      {/* Upgrade CTA strip if any premium template is active */}
      {TEMPLATES.find(x => x.id === templateId)?.premium && (!user || user.plan !== "pro") && (
        <div style={{ background: "#fef3c7", border: "1px solid #fde68a", padding: "10px 14px", fontSize: "0.78rem", color: "#92400e", display: "flex", alignItems: "center", gap: 8 }}>
          <Crown style={{ width: 13, height: 13, color: "#b84a2e", flexShrink: 0 }} />
          <span>Previewing a Pro template — <strong>upgrade to export your resume.</strong></span>
        </div>
      )}
    </div>
  );

  return null;
}

function TemplatePickerCard({ t, active, locked, onSelect }) {
  const isPreviewActive = active && locked; // active but user can't export
  const serif = t.id === "classic" || t.id === "executive" || t.id === "elegant" || t.id === "international";
  const mono  = t.id === "technical";
  const ff    = mono ? "'JetBrains Mono', monospace" : serif ? "'Source Serif Pro', serif" : "'Inter', sans-serif";
  return (
    <button
      onClick={() => onSelect(t.id)}
      style={{
        position: "relative", padding: "10px", border: `2px solid ${isPreviewActive ? "#f59e0b" : active ? "#b84a2e" : "#1a2e4a20"}`,
        background: isPreviewActive ? "#fffbeb" : active ? "#fdf6f2" : "#fff",
        textAlign: "left", cursor: "pointer", transition: "border-color 0.15s",
      }}
      className="hover:border-[#b84a2e]"
    >
      {/* Crown badge for premium */}
      {t.premium && (
        <div style={{ position: "absolute", top: 6, right: 6, display: "flex", alignItems: "center", gap: 2, padding: "1px 5px", background: isPreviewActive ? "#f59e0b" : locked ? "#fef3c7" : "#b84a2e", borderRadius: 2 }}>
          <Crown style={{ width: 8, height: 8, color: isPreviewActive ? "#fff" : locked ? "#92400e" : "#fff" }} />
          <span style={{ fontSize: "0.55rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: isPreviewActive ? "#fff" : locked ? "#92400e" : "#fff" }}>Pro</span>
        </div>
      )}
      {/* Thumbnail */}
      <div style={{ height: 88, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", background: t.accent + "08", borderRadius: 1 }}>
        <div style={{ width: 58, height: 74, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", padding: "6px 5px", fontFamily: ff, overflow: "hidden" }}>
          <div style={{ fontWeight: 700, color: t.accent, fontSize: "5.5px", marginBottom: "1.5px" }}>NAME</div>
          <div style={{ height: "0.5px", background: t.accent, marginBottom: "3px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5px" }}>
            <div style={{ height: "1.5px", background: "#ddd", borderRadius: "1px", width: "100%" }} />
            <div style={{ height: "1.5px", background: "#e8e8e8", borderRadius: "1px", width: "80%" }} />
            <div style={{ height: "1.5px", background: "#e8e8e8", borderRadius: "1px", width: "60%" }} />
            <div style={{ height: "1.5px", background: "#ddd", borderRadius: "1px", width: "90%", marginTop: "3px" }} />
            <div style={{ height: "1.5px", background: "#e8e8e8", borderRadius: "1px", width: "75%" }} />
            <div style={{ height: "1.5px", background: "#e8e8e8", borderRadius: "1px", width: "85%" }} />
            <div style={{ height: "1.5px", background: "#ddd", borderRadius: "1px", width: "55%", marginTop: "3px" }} />
            <div style={{ height: "1.5px", background: "#e8e8e8", borderRadius: "1px", width: "70%" }} />
          </div>
        </div>
      </div>
      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2 }}>{t.name}</div>
      <div style={{ fontSize: "0.67rem", color: "#888", marginTop: 2, lineHeight: 1.3 }}>{t.desc}</div>
      {isPreviewActive && (
        <div style={{ fontSize: "0.62rem", color: "#d97706", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}>
          <Eye style={{ width: 9, height: 9 }} /> Preview only
        </div>
      )}
    </button>
  );
}

function SectionHeader({ title, hint }) {
  return (
    <div>
      <h2 className="font-serif-display text-xl font-bold" style={{ color: "#1a2e4a" }}>{title}</h2>
      {hint && <p className="text-xs mt-1" style={{ color: "#888" }}>{hint}</p>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest block mb-1" style={{ color: "#666" }}>{label}</label>
      {children}
    </div>
  );
}

function ListEditor({ title, items, onChange, empty, renderItem }) {
  const addItem = () => onChange([...items, { id: Date.now(), ...empty }]);
  const updateItem = (id, patch) => onChange(items.map(it => it.id === id ? { ...it, ...patch } : it));
  const removeItem = (id) => onChange(items.filter(it => it.id !== id));
  const moveUp = (id) => {
    const i = items.findIndex(x => x.id === id);
    if (i <= 0) return;
    const n = [...items]; [n[i-1], n[i]] = [n[i], n[i-1]]; onChange(n);
  };
  return (
    <div className="space-y-4">
      <SectionHeader title={title} />
      {items.length === 0 && <div className="text-sm p-6 border-2 border-dashed text-center" style={{ borderColor: "#1a2e4a30", color: "#888" }}>No entries yet. Add your first below.</div>}
      {items.map((it, i) => (
        <div key={it.id} className="p-3 border space-y-2" style={{ borderColor: "#1a2e4a20", background: "#faf7f2" }}>
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-widest" style={{ color: "#888" }}>#{i+1}</span>
            <div className="flex gap-1">
              {i > 0 && <button onClick={()=>moveUp(it.id)} className="text-xs hover:text-[#b84a2e]">↑ Move up</button>}
              <button onClick={()=>removeItem(it.id)} className="text-xs flex items-center gap-1 hover:text-[#b84a2e]"><Trash2 className="w-3 h-3" /> Delete</button>
            </div>
          </div>
          <div className="space-y-2">{renderItem(it, (patch) => updateItem(it.id, patch))}</div>
        </div>
      ))}
      <button onClick={addItem} className="w-full p-3 border-2 border-dashed text-sm font-medium flex items-center justify-center gap-2 hover:border-[#b84a2e] hover:text-[#b84a2e]" style={{ borderColor: "#1a2e4a30", color: "#1a2e4a" }}>
        <Plus className="w-4 h-4" /> Add entry
      </button>
    </div>
  );
}

function SkillInput({ value, onChange }) {
  const [input, setInput] = useState("");
  const add = () => {
    const trimmed = input.trim();
    if (!trimmed || value.some(s => s.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...value, trimmed]);
    setInput("");
  };
  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") { e.preventDefault(); add(); }}} placeholder="e.g. Python, React, Leadership" className="flex-1 p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
        <button onClick={add} className="px-4 text-white text-sm" style={{ background: "#1a2e4a" }}>Add</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2 py-1 text-xs border" style={{ borderColor: "#1a2e4a30", background: "white" }}>
            {s}
            <button onClick={()=>onChange(value.filter((_,j)=>j!==i))} className="hover:text-[#b84a2e]"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ========== LANGUAGE INPUT ==========
const LANGUAGE_LEVELS = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"];

function LanguageInput({ value, onChange }) {
  const [lang, setLang] = useState("");
  const [level, setLevel] = useState("Fluent");
  const add = () => {
    const trimmed = lang.trim();
    if (!trimmed) return;
    onChange([...value, { id: Date.now(), name: trimmed, level }]);
    setLang("");
  };
  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input value={lang} onChange={e=>setLang(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();add();}}} placeholder="e.g. Spanish, French" className="flex-1 p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }} />
        <select value={level} onChange={e=>setLevel(e.target.value)} className="p-2 border bg-[#faf7f2] text-sm" style={{ borderColor: "#1a2e4a20" }}>
          {LANGUAGE_LEVELS.map(l=><option key={l}>{l}</option>)}
        </select>
        <button onClick={add} className="px-4 text-white text-sm" style={{ background: "#1a2e4a" }}>Add</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((l, i) => (
          <span key={l.id||i} className="inline-flex items-center gap-1 px-2 py-1 text-xs border" style={{ borderColor: "#1a2e4a30", background: "white" }}>
            <span className="font-medium">{l.name}</span>
            {l.level && <span style={{color:"#888"}}>· {l.level}</span>}
            <button onClick={()=>onChange(value.filter((_,j)=>j!==i))} className="hover:text-[#b84a2e]"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );
}
