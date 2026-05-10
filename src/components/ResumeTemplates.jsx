import React from "react";

// ── PDF link helpers ─────────────────────────────────────────────────────────
// window.print() → PDF preserves <a href> as real clickable links.
// These helpers derive the correct href from each field type.
const eHref = v => v ? `mailto:${v}` : null;
const pHref = v => v ? `tel:${v.replace(/[^\d+]/g, "")}` : null;
const uHref = v => !v ? null : /^https?:\/\//i.test(v) ? v : `https://${v}`;
// Auto-detect for templates that map over all contact values without knowing which is which
const autoHref = v => {
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${v}`;
  if (/^\+?[\d()\s\-.]{6,}$/.test(v)) return `tel:${v.replace(/[^\d+]/g, "")}`;
  if (!v.includes(" ") && v.includes(".")) return `https://${v}`;
  return null; // plain text like "New York, NY"
};
// Renders as <a> when href exists, plain wrapper otherwise.
// Inherits color/decoration from parent so it blends in visually.
const PL = ({ href, children, style, className }) =>
  href
    ? <a href={href} style={{ color: "inherit", textDecoration: "none", ...style }} className={className}>{children}</a>
    : <span style={style} className={className}>{children}</span>;

const JUSTIFY = { textAlign: "justify", textJustify: "inter-word" };

// ========== RESUME TEMPLATES (preview components) ==========
function TemplateClassic({ r }) {
  return (
    <div className="p-10 text-[#1a1a1a]" style={{ fontFamily: "'Source Serif Pro', 'Georgia', serif", fontSize: "10.5pt", lineHeight: 1.45 }}>
      <div style={{ textAlign: "center", marginBottom: "20px", display: "block" }}>
        <h1 className="text-[26pt] font-bold tracking-wide mb-1" style={{ color: "#1a2e4a" }}>{r.personal.name || "Your Name"}</h1>
        {r.personal.title && <div className="text-[12pt] italic mb-2" style={{ color: "#555" }}>{r.personal.title}</div>}
        <div className="text-[9.5pt] flex flex-wrap gap-x-3 gap-y-1 justify-center" style={{ color: "#333" }}>
          {r.personal.email && <PL href={eHref(r.personal.email)}>{r.personal.email}</PL>}
          {r.personal.phone && <><span>&middot;</span><PL href={pHref(r.personal.phone)}>{r.personal.phone}</PL></>}
          {r.personal.location && <><span>&middot;</span><span>{r.personal.location}</span></>}
          {r.personal.website && <><span>&middot;</span><PL href={uHref(r.personal.website)}>{r.personal.website}</PL></>}
          {r.personal.linkedin && <><span>&middot;</span><PL href={uHref(r.personal.linkedin)}>{r.personal.linkedin}</PL></>}
          {r.personal.github && <><span>&middot;</span><PL href={uHref(r.personal.github)}>{r.personal.github}</PL></>}
        </div>
        <div style={{ display: "block", height: "2px", width: "100%", backgroundColor: "#1a2e4a", marginTop: "16px" }}></div>
      </div>
      {r.personal.summary && <Section title="Summary" color="#1a2e4a"><p style={JUSTIFY}>{r.personal.summary}</p></Section>}
      {r.experience.length > 0 && <Section title="Experience" color="#1a2e4a">{r.experience.map(e=>(
        <div key={e.id} className="mb-3">
          <div className="flex justify-between items-baseline"><div className="font-bold">{e.role}</div><div className="text-[9.5pt] italic">{e.start} - {e.end}</div></div>
          <div className="italic">{e.company}{e.location && ` · ${e.location}`}</div>
          <ul className="list-disc ml-5 mt-1">{(e.bullets||[]).filter(Boolean).map((b,i)=><li key={i}>{b}</li>)}</ul>
        </div>
      ))}</Section>}
      {r.education.length > 0 && <Section title="Education" color="#1a2e4a">{r.education.map(ed=>(
        <div key={ed.id} className="mb-2">
          <div className="flex justify-between items-baseline"><div className="font-bold">{ed.degree}</div><div className="text-[9.5pt] italic">{ed.start} - {ed.end}</div></div>
          <div className="italic">{ed.school}{ed.location && ` · ${ed.location}`}</div>
          {ed.details && <div className="text-[9.5pt]">{ed.details}</div>}
        </div>
      ))}</Section>}
      {r.skills.length > 0 && <Section title="Skills" color="#1a2e4a"><p>{r.skills.join(" · ")}</p></Section>}
      {(r.languages||[]).length > 0 && <Section title="Languages" color="#1a2e4a"><p>{r.languages.map(l=>l.level?`${l.name} (${l.level})`:l.name).join(" · ")}</p></Section>}
      {r.projects.length > 0 && <Section title="Projects" color="#1a2e4a">{r.projects.map(p=>(
        <div key={p.id} className="mb-2"><span className="font-bold">{p.name}</span>{p.description && ` - ${p.description}`}{p.link && <span className="italic"> (<PL href={uHref(p.link)}>{p.link}</PL>)</span>}</div>
      ))}</Section>}
      {r.certifications.length > 0 && <Section title="Certifications" color="#1a2e4a">{r.certifications.map(c=>(
        <div key={c.id} className="mb-1"><span className="font-bold">{c.name}</span> - {c.issuer}{c.date && `, ${c.date}`}</div>
      ))}</Section>}
    </div>
  );
}

function Section({ title, color, children }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "11pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", color, display: "block", marginBottom: "3px" }}>{title}</div>
      <div style={{ display: "block", height: "1px", width: "100%", backgroundColor: color, marginBottom: "8px" }}></div>
      {children}
    </div>
  );
}

function TemplateModern({ r }) {
  return (
    <div className="text-[#1a1a1a]" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "10pt", lineHeight: 1.5 }}>
      <header className="px-10 pt-10 pb-6" style={{ background: "#fdf6f2" }}>
        <h1 className="text-[28pt] font-black tracking-tight leading-none" style={{ color: "#b84a2e" }}>{r.personal.name || "Your Name"}</h1>
        {r.personal.title && <div className="text-[13pt] mt-1 font-medium" style={{ color: "#333" }}>{r.personal.title}</div>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9.5pt] mt-3" style={{ color: "#555" }}>
          {r.personal.email && <span>{'✉'} <PL href={eHref(r.personal.email)}>{r.personal.email}</PL></span>}
          {r.personal.phone && <span>{'☎'} <PL href={pHref(r.personal.phone)}>{r.personal.phone}</PL></span>}
          {r.personal.location && <span>{'◉'} {r.personal.location}</span>}
          {r.personal.website && <span>{'\u{1F517}'} <PL href={uHref(r.personal.website)}>{r.personal.website}</PL></span>}
          {r.personal.linkedin && <span>in <PL href={uHref(r.personal.linkedin)}>{r.personal.linkedin}</PL></span>}
          {r.personal.github && <span>gh: <PL href={uHref(r.personal.github)}>{r.personal.github}</PL></span>}
        </div>
      </header>
      <div className="grid grid-cols-[1fr_240px] gap-6 px-10 py-6">
        <div>
          {r.personal.summary && <ModernSection title="Profile"><p style={JUSTIFY}>{r.personal.summary}</p></ModernSection>}
          {r.experience.length > 0 && <ModernSection title="Experience">{r.experience.map(e=>(
            <div key={e.id} className="mb-3">
              <div className="font-bold text-[10.5pt]">{e.role}</div>
              <div className="text-[9.5pt]" style={{ color: "#b84a2e" }}>{e.company} &middot; {e.start} - {e.end}</div>
              <ul className="list-disc ml-4 mt-1">{(e.bullets||[]).filter(Boolean).map((b,i)=><li key={i}>{b}</li>)}</ul>
            </div>
          ))}</ModernSection>}
          {r.projects.length > 0 && <ModernSection title="Projects">{r.projects.map(p=>(
            <div key={p.id} className="mb-2"><span className="font-bold">{p.name}</span>{p.description && <span> - {p.description}</span>}</div>
          ))}</ModernSection>}
        </div>
        <aside>
          {r.education.length > 0 && <ModernSection title="Education">{r.education.map(ed=>(
            <div key={ed.id} className="mb-2">
              <div className="font-bold text-[9.5pt]">{ed.degree}</div>
              <div className="text-[9pt]">{ed.school}</div>
              <div className="text-[9pt]" style={{ color: "#777" }}>{ed.start} - {ed.end}</div>
            </div>
          ))}</ModernSection>}
          {r.skills.length > 0 && <ModernSection title="Skills"><div className="flex flex-wrap gap-1">{r.skills.map((s,i)=><span key={i} className="text-[9pt] px-2 py-0.5" style={{ background: "#fdf6f2", color: "#b84a2e" }}>{s}</span>)}</div></ModernSection>}
          {(r.languages||[]).length > 0 && <ModernSection title="Languages"><div className="space-y-1">{r.languages.map((l,i)=><div key={i} className="text-[9pt] flex justify-between"><span>{l.name}</span>{l.level&&<span style={{color:"#b84a2e"}}>{l.level}</span>}</div>)}</div></ModernSection>}
          {r.certifications.length > 0 && <ModernSection title="Certifications">{r.certifications.map(c=>(
            <div key={c.id} className="mb-1 text-[9pt]"><div className="font-bold">{c.name}</div><div>{c.issuer}{c.date && ` · ${c.date}`}</div></div>
          ))}</ModernSection>}
        </aside>
      </div>
    </div>
  );
}

function ModernSection({ title, children }) {
  return (
    <section className="mb-4">
      <h2 className="text-[10pt] font-bold uppercase tracking-widest mb-2" style={{ color: "#b84a2e" }}>{title}</h2>
      {children}
    </section>
  );
}

function TemplateMinimal({ r }) {
  return (
    <div className="p-12 text-[#1a1a1a]" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "10pt", lineHeight: 1.6 }}>
      <header className="mb-8">
        <h1 className="text-[22pt] font-light tracking-tight">{r.personal.name || "Your Name"}</h1>
        {r.personal.title && <div className="text-[11pt] mt-1" style={{ color: "#666" }}>{r.personal.title}</div>}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9pt] mt-3" style={{ color: "#666" }}>
          {[r.personal.email, r.personal.phone, r.personal.location, r.personal.website, r.personal.linkedin, r.personal.github].filter(Boolean).map((x,i,arr)=>(<React.Fragment key={i}><PL href={autoHref(x)}>{x}</PL>{i<arr.length-1 && <span>/</span>}</React.Fragment>))}
        </div>
      </header>
      {r.personal.summary && <section className="mb-6"><p style={JUSTIFY}>{r.personal.summary}</p></section>}
      {r.experience.length > 0 && <section className="mb-6">
        <h2 className="text-[9pt] uppercase tracking-[0.2em] mb-3" style={{ color: "#999" }}>Experience</h2>
        {r.experience.map(e=>(
          <div key={e.id} className="mb-4 grid grid-cols-[90px_1fr] gap-4">
            <div className="text-[9pt]" style={{ color: "#999" }}>{e.start}-{e.end}</div>
            <div>
              <div className="font-medium">{e.role}, <span style={{ color: "#666" }}>{e.company}</span></div>
              <ul className="mt-1 space-y-0.5">{(e.bullets||[]).filter(Boolean).map((b,i)=><li key={i} style={{ color: "#444" }}>- {b}</li>)}</ul>
            </div>
          </div>
        ))}
      </section>}
      {r.education.length > 0 && <section className="mb-6">
        <h2 className="text-[9pt] uppercase tracking-[0.2em] mb-3" style={{ color: "#999" }}>Education</h2>
        {r.education.map(ed=>(<div key={ed.id} className="grid grid-cols-[90px_1fr] gap-4 mb-2">
          <div className="text-[9pt]" style={{ color: "#999" }}>{ed.start}-{ed.end}</div>
          <div><div className="font-medium">{ed.degree}</div><div style={{ color: "#666" }}>{ed.school}</div></div>
        </div>))}
      </section>}
      {r.skills.length > 0 && <section className="mb-6">
        <h2 className="text-[9pt] uppercase tracking-[0.2em] mb-3" style={{ color: "#999" }}>Skills</h2>
        <p style={{ color: "#444" }}>{r.skills.join(", ")}</p>
      </section>}
      {(r.languages||[]).length > 0 && <section className="mb-6">
        <h2 className="text-[9pt] uppercase tracking-[0.2em] mb-3" style={{ color: "#999" }}>Languages</h2>
        <p style={{ color: "#444" }}>{r.languages.map(l=>l.level?`${l.name} (${l.level})`:l.name).join(", ")}</p>
      </section>}
      {r.projects.length > 0 && <section className="mb-6">
        <h2 className="text-[9pt] uppercase tracking-[0.2em] mb-3" style={{ color: "#999" }}>Projects</h2>
        {r.projects.map(p=><div key={p.id} className="mb-1"><span className="font-medium">{p.name}</span>{p.description && <span style={{ color: "#666" }}> - {p.description}</span>}</div>)}
      </section>}
      {r.certifications.length > 0 && <section>
        <h2 className="text-[9pt] uppercase tracking-[0.2em] mb-3" style={{ color: "#999" }}>Certifications</h2>
        {r.certifications.map(c=><div key={c.id} className="mb-1">{c.name} - <span style={{ color: "#666" }}>{c.issuer}{c.date && `, ${c.date}`}</span></div>)}
      </section>}
    </div>
  );
}

function TemplateExecutive({ r }) {
  return (
    <div className="text-[#0d2540]" style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "10.5pt", lineHeight: 1.5 }}>
      <header className="px-10 py-8 text-white" style={{ background: "#0d2540" }}>
        <h1 className="text-[30pt] font-bold tracking-tight uppercase" style={{ letterSpacing: "0.05em" }}>{r.personal.name || "Your Name"}</h1>
        <div className="w-16 h-0.5 bg-white/60 my-2"></div>
        {r.personal.title && <div className="text-[12pt] uppercase tracking-[0.2em]">{r.personal.title}</div>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9.5pt] mt-3 text-white/85">
          {r.personal.email && <PL href={eHref(r.personal.email)}>{r.personal.email}</PL>}
          {r.personal.phone && <PL href={pHref(r.personal.phone)}>{r.personal.phone}</PL>}
          {r.personal.location && <span>{r.personal.location}</span>}
          {r.personal.website && <PL href={uHref(r.personal.website)}>{r.personal.website}</PL>}
          {r.personal.linkedin && <PL href={uHref(r.personal.linkedin)}>{r.personal.linkedin}</PL>}
          {r.personal.github && <PL href={uHref(r.personal.github)}>{r.personal.github}</PL>}
        </div>
      </header>
      <div className="px-10 py-6">
        {r.personal.summary && <section className="mb-5">
          <div style={{ fontSize: "11pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.2em", display: "block", marginBottom: "4px" }}>Executive Profile</div>
          <div style={{ display: "block", height: "2px", width: "100%", backgroundColor: "#0d2540", marginBottom: "8px" }}></div>
          <p className="italic" style={JUSTIFY}>{r.personal.summary}</p>
        </section>}
        {r.experience.length > 0 && <section className="mb-5">
          <div style={{ fontSize: "11pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.2em", display: "block", marginBottom: "4px" }}>Leadership Experience</div>
          <div style={{ display: "block", height: "2px", width: "100%", backgroundColor: "#0d2540", marginBottom: "8px" }}></div>
          {r.experience.map(e=>(<div key={e.id} className="mb-3">
            <div className="flex justify-between items-baseline"><div className="font-bold text-[11pt]">{e.role.toUpperCase()}</div><div className="text-[9.5pt] italic">{e.start} - {e.end}</div></div>
            <div className="italic">{e.company}{e.location && ` · ${e.location}`}</div>
            <ul className="list-disc ml-5 mt-1">{(e.bullets||[]).filter(Boolean).map((b,i)=><li key={i}>{b}</li>)}</ul>
          </div>))}
        </section>}
        <div className="grid grid-cols-2 gap-6">
          {r.education.length > 0 && <section>
            <div style={{ fontSize: "11pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.2em", display: "block", marginBottom: "4px" }}>Education</div>
            <div style={{ display: "block", height: "2px", width: "100%", backgroundColor: "#0d2540", marginBottom: "8px" }}></div>
            {r.education.map(ed=>(<div key={ed.id} className="mb-2"><div className="font-bold">{ed.degree}</div><div className="italic">{ed.school}</div><div className="text-[9.5pt]">{ed.start} - {ed.end}</div></div>))}
          </section>}
          {r.skills.length > 0 && <section>
            <div style={{ fontSize: "11pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.2em", display: "block", marginBottom: "4px" }}>Core Competencies</div>
            <div style={{ display: "block", height: "2px", width: "100%", backgroundColor: "#0d2540", marginBottom: "8px" }}></div>
            <ul className="list-disc ml-5">{r.skills.map((s,i)=><li key={i}>{s}</li>)}</ul>
          </section>}
        </div>
        {(r.languages||[]).length > 0 && <section className="mt-4">
          <div style={{ fontSize: "11pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.2em", display: "block", marginBottom: "4px" }}>Languages</div>
          <div style={{ display: "block", height: "2px", width: "100%", backgroundColor: "#0d2540", marginBottom: "8px" }}></div>
          <div className="flex flex-wrap gap-x-4">{r.languages.map((l,i)=><span key={i}>{l.name}{l.level&&<span className="text-[9.5pt] italic"> &middot; {l.level}</span>}</span>)}</div>
        </section>}
        {r.certifications.length > 0 && <section className="mt-4">
          <div style={{ fontSize: "11pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.2em", display: "block", marginBottom: "4px" }}>Certifications</div>
          <div style={{ display: "block", height: "2px", width: "100%", backgroundColor: "#0d2540", marginBottom: "8px" }}></div>
          {r.certifications.map(c=><div key={c.id}><span className="font-bold">{c.name}</span> - {c.issuer}{c.date && `, ${c.date}`}</div>)}
        </section>}
      </div>
    </div>
  );
}

function TemplateCreative({ r }) {
  return (
    <div className="text-[#1a1a1a]" style={{ fontFamily: "'Inter', sans-serif", fontSize: "10pt", lineHeight: 1.5 }}>
      <div className="grid grid-cols-[220px_1fr]">
        <aside className="p-6 text-white min-h-full" style={{ background: "#7c2d12" }}>
          <h1 className="text-[20pt] font-black leading-none mb-4">{r.personal.name || "Your Name"}</h1>
          {r.personal.title && <div className="text-[10pt] uppercase tracking-widest mb-4 opacity-90">{r.personal.title}</div>}
          <div className="space-y-1 text-[9pt] opacity-90 mb-5">
            {r.personal.email && <div><PL href={eHref(r.personal.email)}>{r.personal.email}</PL></div>}
            {r.personal.phone && <div><PL href={pHref(r.personal.phone)}>{r.personal.phone}</PL></div>}
            {r.personal.location && <div>{r.personal.location}</div>}
            {r.personal.website && <div><PL href={uHref(r.personal.website)}>{r.personal.website}</PL></div>}
            {r.personal.linkedin && <div><PL href={uHref(r.personal.linkedin)}>{r.personal.linkedin}</PL></div>}
            {r.personal.github && <div><PL href={uHref(r.personal.github)}>{r.personal.github}</PL></div>}
          </div>
          {r.skills.length > 0 && <div className="mb-5">
            <div style={{ fontSize: "10pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>Skills</div>
            <div style={{ display: "block", height: "1px", width: "100%", backgroundColor: "rgba(255,255,255,0.4)", marginBottom: "8px" }}></div>
            <div className="space-y-1 text-[9pt]">{r.skills.map((s,i)=><div key={i}>- {s}</div>)}</div>
          </div>}
          {(r.languages||[]).length > 0 && <div className="mb-5">
            <div style={{ fontSize: "10pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>Languages</div>
            <div style={{ display: "block", height: "1px", width: "100%", backgroundColor: "rgba(255,255,255,0.4)", marginBottom: "8px" }}></div>
            <div className="space-y-1 text-[9pt]">{r.languages.map((l,i)=><div key={i} className="flex justify-between"><span>{l.name}</span>{l.level&&<span className="opacity-70">{l.level}</span>}</div>)}</div>
          </div>}
          {r.education.length > 0 && <div>
            <div style={{ fontSize: "10pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>Education</div>
            <div style={{ display: "block", height: "1px", width: "100%", backgroundColor: "rgba(255,255,255,0.4)", marginBottom: "8px" }}></div>
            {r.education.map(ed=>(<div key={ed.id} className="text-[9pt] mb-2"><div className="font-bold">{ed.degree}</div><div>{ed.school}</div><div className="opacity-80">{ed.start}-{ed.end}</div></div>))}
          </div>}
        </aside>
        <main className="p-6">
          {r.personal.summary && <section className="mb-5">
            <h2 className="text-[12pt] font-black uppercase mb-2" style={{ color: "#7c2d12" }}>About</h2>
            <p style={JUSTIFY}>{r.personal.summary}</p>
          </section>}
          {r.experience.length > 0 && <section className="mb-5">
            <h2 className="text-[12pt] font-black uppercase mb-2" style={{ color: "#7c2d12" }}>Experience</h2>
            {r.experience.map(e=>(<div key={e.id} className="mb-3">
              <div className="font-bold">{e.role}</div>
              <div className="text-[9.5pt]" style={{ color: "#7c2d12" }}>{e.company} &middot; {e.start}-{e.end}</div>
              <ul className="list-disc ml-4 mt-1">{(e.bullets||[]).filter(Boolean).map((b,i)=><li key={i}>{b}</li>)}</ul>
            </div>))}
          </section>}
          {r.projects.length > 0 && <section className="mb-5">
            <h2 className="text-[12pt] font-black uppercase mb-2" style={{ color: "#7c2d12" }}>Projects</h2>
            {r.projects.map(p=><div key={p.id} className="mb-2"><span className="font-bold">{p.name}</span>{p.description && ` - ${p.description}`}</div>)}
          </section>}
          {r.certifications.length > 0 && <section>
            <h2 className="text-[12pt] font-black uppercase mb-2" style={{ color: "#7c2d12" }}>Certifications</h2>
            {r.certifications.map(c=><div key={c.id}><span className="font-bold">{c.name}</span> - {c.issuer}{c.date && `, ${c.date}`}</div>)}
          </section>}
        </main>
      </div>
    </div>
  );
}

function TemplateTechnical({ r }) {
  return (
    <div className="p-10 text-[#1a1a1a]" style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: "9.5pt", lineHeight: 1.5 }}>
      <div style={{ marginBottom: "20px", display: "block" }}>
        <div className="text-[9pt]" style={{ color: "#14532d" }}>~/resume</div>
        <h1 className="text-[24pt] font-bold" style={{ color: "#14532d" }}># {r.personal.name || "Your Name"}</h1>
        {r.personal.title && <div className="text-[11pt]">&gt; {r.personal.title}</div>}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9pt] mt-2" style={{ color: "#555" }}>
          {r.personal.email && <span>email: <PL href={eHref(r.personal.email)}>{r.personal.email}</PL></span>}
          {r.personal.phone && <span>tel: <PL href={pHref(r.personal.phone)}>{r.personal.phone}</PL></span>}
          {r.personal.location && <span>loc: {r.personal.location}</span>}
          {r.personal.website && <span>web: <PL href={uHref(r.personal.website)}>{r.personal.website}</PL></span>}
          {r.personal.github && <span>git: <PL href={uHref(r.personal.github)}>{r.personal.github}</PL></span>}
          {r.personal.linkedin && <span>in: <PL href={uHref(r.personal.linkedin)}>{r.personal.linkedin}</PL></span>}
        </div>
        <div style={{ display: "block", height: "2px", width: "100%", backgroundColor: "#14532d", marginTop: "12px" }}></div>
      </div>
      {r.personal.summary && <TechSection title="## about"><p style={JUSTIFY}>{r.personal.summary}</p></TechSection>}
      {r.experience.length > 0 && <TechSection title="## experience">{r.experience.map(e=>(
        <div key={e.id} className="mb-3">
          <div><span className="font-bold" style={{ color: "#14532d" }}>{e.role}</span> @ {e.company} <span style={{ color: "#888" }}>[{e.start}-{e.end}]</span></div>
          <ul className="ml-4 mt-1">{(e.bullets||[]).filter(Boolean).map((b,i)=><li key={i}>{"- "}{b}</li>)}</ul>
        </div>
      ))}</TechSection>}
      {r.skills.length > 0 && <TechSection title="## skills"><div className="flex flex-wrap gap-1">{r.skills.map((s,i)=><span key={i} className="px-2 py-0.5 text-[8.5pt]" style={{ background: "#14532d20", color: "#14532d" }}>{s}</span>)}</div></TechSection>}
      {(r.languages||[]).length > 0 && <TechSection title="## languages"><div className="flex flex-wrap gap-x-4">{r.languages.map((l,i)=><span key={i}>{l.name}{l.level&&<span style={{color:"#888"}}> [{l.level}]</span>}</span>)}</div></TechSection>}
      {r.projects.length > 0 && <TechSection title="## projects">{r.projects.map(p=>(
        <div key={p.id} className="mb-1"><span className="font-bold">{p.name}</span>{p.link && <span style={{ color: "#14532d" }}> &middot; <PL href={uHref(p.link)}>{p.link}</PL></span>}{p.description && <div className="ml-4">{p.description}</div>}</div>
      ))}</TechSection>}
      {r.education.length > 0 && <TechSection title="## education">{r.education.map(ed=>(
        <div key={ed.id} className="mb-1"><span className="font-bold">{ed.degree}</span>, {ed.school} <span style={{ color: "#888" }}>[{ed.start}-{ed.end}]</span></div>
      ))}</TechSection>}
      {r.certifications.length > 0 && <TechSection title="## certifications">{r.certifications.map(c=>(
        <div key={c.id}><span className="font-bold">{c.name}</span> - {c.issuer}{c.date && ` (${c.date})`}</div>
      ))}</TechSection>}
    </div>
  );
}
function TechSection({ title, children }) {
  return <section className="mb-4"><h2 className="text-[11pt] font-bold mb-1" style={{ color: "#14532d" }}>{title}</h2>{children}</section>;
}

// Minimal Elegant
function TemplateElegant({ r }) {
  const accent = "#78350f";
  return (
    <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "10.5pt", lineHeight: 1.55, color: "#1a1a1a", padding: "48px 52px" }}>
      <header style={{ textAlign: "center", marginBottom: 28, borderBottom: `1px solid ${accent}40`, paddingBottom: 20 }}>
        <h1 style={{ fontSize: "26pt", fontWeight: 300, letterSpacing: "0.12em", textTransform: "uppercase", color: "#111", margin: "0 0 6px" }}>{r.personal.name || "Your Name"}</h1>
        {r.personal.title && <div style={{ fontSize: "11pt", color: accent, fontStyle: "italic", marginBottom: 10 }}>{r.personal.title}</div>}
        <div style={{ fontSize: "9pt", color: "#666", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 16px" }}>
          {[r.personal.email, r.personal.phone, r.personal.location, r.personal.website, r.personal.linkedin, r.personal.github].filter(Boolean).map((x, i) => <PL key={i} href={autoHref(x)}>{x}</PL>)}
        </div>
      </header>
      {r.personal.summary && <ElegantSection title="Profile" accent={accent}><p style={{ fontStyle: "italic", color: "#333", ...JUSTIFY }}>{r.personal.summary}</p></ElegantSection>}
      {r.experience.length > 0 && <ElegantSection title="Experience" accent={accent}>{r.experience.map(e => (
        <div key={e.id} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontWeight: 700 }}>{e.role}</span>
            <span style={{ fontSize: "9pt", color: "#888", fontStyle: "italic" }}>{e.start} - {e.end}</span>
          </div>
          <div style={{ color: accent, fontSize: "9.5pt", fontStyle: "italic", marginBottom: 4 }}>{e.company}{e.location && ` · ${e.location}`}</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>{(e.bullets || []).filter(Boolean).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}</ul>
        </div>
      ))}</ElegantSection>}
      {r.education.length > 0 && <ElegantSection title="Education" accent={accent}>{r.education.map(ed => (
        <div key={ed.id} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700 }}>{ed.degree}</span>
            <span style={{ fontSize: "9pt", color: "#888", fontStyle: "italic" }}>{ed.start} - {ed.end}</span>
          </div>
          <div style={{ fontStyle: "italic", color: "#555" }}>{ed.school}{ed.location && ` · ${ed.location}`}</div>
          {ed.details && <div style={{ fontSize: "9.5pt", color: "#666" }}>{ed.details}</div>}
        </div>
      ))}</ElegantSection>}
      {r.skills.length > 0 && <ElegantSection title="Skills" accent={accent}><p style={{ color: "#444" }}>{r.skills.join(" · ")}</p></ElegantSection>}
      {(r.languages || []).length > 0 && <ElegantSection title="Languages" accent={accent}><p style={{ color: "#444" }}>{r.languages.map(l => l.level ? `${l.name} (${l.level})` : l.name).join(" · ")}</p></ElegantSection>}
      {r.projects.length > 0 && <ElegantSection title="Projects" accent={accent}>{r.projects.map(p => (
        <div key={p.id} style={{ marginBottom: 8 }}><span style={{ fontWeight: 700 }}>{p.name}</span>{p.description && <span style={{ color: "#555" }}> - {p.description}</span>}</div>
      ))}</ElegantSection>}
      {r.certifications.length > 0 && <ElegantSection title="Certifications" accent={accent}>{r.certifications.map(c => (
        <div key={c.id} style={{ marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{c.name}</span> - {c.issuer}{c.date && `, ${c.date}`}</div>
      ))}</ElegantSection>}
    </div>
  );
}
function ElegantSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: "8.5pt", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, color: accent }}>{title}</span>
        <div style={{ flex: 1, height: "0.5px", background: `${accent}50` }} />
      </div>
      {children}
    </div>
  );
}

// Corporate Pro
function TemplateCorporate({ r }) {
  const accent = "#1e3a5f";
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "10pt", lineHeight: 1.5, color: "#1a1a1a" }}>
      <header style={{ background: accent, color: "#fff", padding: "28px 40px 22px" }}>
        <h1 style={{ fontSize: "24pt", fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.01em" }}>{r.personal.name || "Your Name"}</h1>
        {r.personal.title && <div style={{ fontSize: "11pt", color: "rgba(255,255,255,0.8)", marginBottom: 10, fontWeight: 300 }}>{r.personal.title}</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px", fontSize: "8.5pt", color: "rgba(255,255,255,0.75)" }}>
          {r.personal.email && <span>{'✉'} <PL href={eHref(r.personal.email)}>{r.personal.email}</PL></span>}
          {r.personal.phone && <span>{'✆'} <PL href={pHref(r.personal.phone)}>{r.personal.phone}</PL></span>}
          {r.personal.location && <span>{'⊙'} {r.personal.location}</span>}
          {r.personal.linkedin && <span>in <PL href={uHref(r.personal.linkedin)}>{r.personal.linkedin}</PL></span>}
          {r.personal.website && <span>{'⊕'} <PL href={uHref(r.personal.website)}>{r.personal.website}</PL></span>}
          {r.personal.github && <span>gh: <PL href={uHref(r.personal.github)}>{r.personal.github}</PL></span>}
        </div>
      </header>
      <div style={{ padding: "22px 40px" }}>
        {r.personal.summary && <CorpSection title="Professional Summary" accent={accent}><p style={{ color: "#334155", lineHeight: 1.6, ...JUSTIFY }}>{r.personal.summary}</p></CorpSection>}
        {r.experience.length > 0 && <CorpSection title="Work Experience" accent={accent}>{r.experience.map(e => (
          <div key={e.id} style={{ marginBottom: 14, paddingLeft: 12, borderLeft: `3px solid ${accent}25` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div><div style={{ fontWeight: 700, fontSize: "10.5pt" }}>{e.role}</div>
              <div style={{ color: accent, fontSize: "9.5pt", fontWeight: 600 }}>{e.company}{e.location && ` · ${e.location}`}</div></div>
              <div style={{ fontSize: "8.5pt", color: "#64748b", whiteSpace: "nowrap", marginLeft: 8 }}>{e.start} - {e.end}</div>
            </div>
            <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>{(e.bullets || []).filter(Boolean).map((b, i) => <li key={i} style={{ color: "#374151", marginBottom: 2 }}>{b}</li>)}</ul>
          </div>
        ))}</CorpSection>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {r.education.length > 0 && <CorpSection title="Education" accent={accent}>{r.education.map(ed => (
            <div key={ed.id} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: "9.5pt" }}>{ed.degree}</div>
              <div style={{ color: accent, fontSize: "9pt" }}>{ed.school}</div>
              <div style={{ color: "#64748b", fontSize: "8.5pt" }}>{ed.start} - {ed.end}</div>
              {ed.details && <div style={{ fontSize: "8.5pt", color: "#666" }}>{ed.details}</div>}
            </div>
          ))}</CorpSection>}
          {r.skills.length > 0 && <CorpSection title="Core Skills" accent={accent}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 6px" }}>
              {r.skills.map((s, i) => <span key={i} style={{ padding: "2px 8px", background: `${accent}12`, color: accent, fontSize: "8.5pt", fontWeight: 600 }}>{s}</span>)}
            </div>
          </CorpSection>}
        </div>
        {(r.languages || []).length > 0 && <CorpSection title="Languages" accent={accent}><div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>{r.languages.map((l, i) => <span key={i} style={{ fontSize: "9pt" }}>{l.name}{l.level && <span style={{ color: "#888" }}> ({l.level})</span>}</span>)}</div></CorpSection>}
        {r.projects.length > 0 && <CorpSection title="Projects" accent={accent}>{r.projects.map(p => (
          <div key={p.id} style={{ marginBottom: 6 }}><span style={{ fontWeight: 700 }}>{p.name}</span>{p.description && <span style={{ color: "#555" }}> - {p.description}</span>}{p.link && <span style={{ color: accent, fontSize: "8.5pt" }}> &middot; <PL href={uHref(p.link)}>{p.link}</PL></span>}</div>
        ))}</CorpSection>}
        {r.certifications.length > 0 && <CorpSection title="Certifications" accent={accent}>{r.certifications.map(c => (
          <div key={c.id} style={{ marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{c.name}</span> - {c.issuer}{c.date && `, ${c.date}`}</div>
        ))}</CorpSection>}
      </div>
    </div>
  );
}
function CorpSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: "9pt", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, color: accent, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
        {title} <span style={{ flex: 1, height: 1, background: `${accent}30`, display: "inline-block" }} />
      </h2>
      {children}
    </div>
  );
}

// Fresher / Student
function TemplateFresher({ r }) {
  const accent = "#2563eb";
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "10pt", lineHeight: 1.5, color: "#0f172a" }}>
      {/* Clean white header — no gradient, ATS-safe */}
      <header style={{ padding: "36px 44px 18px" }}>
        <h1 style={{ fontSize: "22pt", fontWeight: 700, margin: "0 0 3px", letterSpacing: "-0.015em", color: "#0f172a" }}>{r.personal.name || "Your Name"}</h1>
        {r.personal.title && <div style={{ fontSize: "10.5pt", fontWeight: 500, color: accent, marginBottom: 10 }}>{r.personal.title}</div>}
        {/* Contact row — pipe-separated, auto-linked */}
        <div style={{ borderTop: `2px solid ${accent}`, paddingTop: 9, display: "flex", flexWrap: "wrap", fontSize: "8.5pt", color: "#475569" }}>
          {[r.personal.email, r.personal.phone, r.personal.location, r.personal.linkedin, r.personal.github, r.personal.website]
            .filter(Boolean)
            .map((x, i, arr) => (
              <React.Fragment key={i}>
                <PL href={autoHref(x)}>{x}</PL>
                {i < arr.length - 1 && <span style={{ margin: "0 7px", color: "#cbd5e1" }}>·</span>}
              </React.Fragment>
            ))}
        </div>
      </header>

      <div style={{ padding: "6px 44px 36px" }}>
        {r.personal.summary && (
          <FreshSection title="Objective" accent={accent}>
            <p style={{ color: "#475569", margin: 0, ...JUSTIFY }}>{r.personal.summary}</p>
          </FreshSection>
        )}

        {/* Education first — the primary credential for freshers */}
        {r.education.length > 0 && (
          <FreshSection title="Education" accent={accent}>
            {r.education.map(ed => (
              <div key={ed.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: "10.5pt", color: "#0f172a" }}>{ed.degree}</span>
                  <span style={{ fontSize: "8.5pt", color: "#94a3b8", whiteSpace: "nowrap", flexShrink: 0 }}>{ed.start} – {ed.end}</span>
                </div>
                <div style={{ color: accent, fontSize: "9.5pt", fontWeight: 500, marginTop: 1 }}>{ed.school}{ed.location && ` · ${ed.location}`}</div>
                {ed.details && <div style={{ fontSize: "9pt", color: "#64748b", marginTop: 3 }}>{ed.details}</div>}
              </div>
            ))}
          </FreshSection>
        )}

        {r.skills.length > 0 && (
          <FreshSection title="Skills" accent={accent}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 6px" }}>
              {r.skills.map((s, i) => (
                <span key={i} style={{ fontSize: "9pt", color: "#1e293b", background: "#f1f5f9", borderLeft: `2.5px solid ${accent}`, padding: "2px 9px" }}>{s}</span>
              ))}
            </div>
          </FreshSection>
        )}

        {r.projects.length > 0 && (
          <FreshSection title="Projects" accent={accent}>
            {r.projects.map(p => (
              <div key={p.id} style={{ marginBottom: 10 }}>
                <div>
                  <span style={{ fontWeight: 700 }}>{p.name}</span>
                  {p.link && <span style={{ fontSize: "8.5pt", color: "#64748b", marginLeft: 8 }}><PL href={uHref(p.link)}>{p.link}</PL></span>}
                </div>
                {p.description && <p style={{ color: "#475569", margin: "2px 0 0", fontSize: "9.5pt" }}>{p.description}</p>}
              </div>
            ))}
          </FreshSection>
        )}

        {r.experience.length > 0 && (
          <FreshSection title="Experience & Internships" accent={accent}>
            {r.experience.map(e => (
              <div key={e.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{e.role}</span>
                    {e.company && <span style={{ color: accent, fontSize: "9.5pt", marginLeft: 6 }}>{e.company}</span>}
                    {e.location && <span style={{ color: "#94a3b8", fontSize: "9pt" }}>{` · ${e.location}`}</span>}
                  </div>
                  <span style={{ fontSize: "8.5pt", color: "#94a3b8", whiteSpace: "nowrap", flexShrink: 0 }}>{e.start} – {e.end}</span>
                </div>
                <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                  {(e.bullets || []).filter(Boolean).map((b, i) => <li key={i} style={{ color: "#475569", marginBottom: 2 }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </FreshSection>
        )}

        {r.certifications.length > 0 && (
          <FreshSection title="Certifications" accent={accent}>
            {r.certifications.map(c => (
              <div key={c.id} style={{ marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <span style={{ fontWeight: 700 }}>{c.name}</span>
                  {c.issuer && <span style={{ color: "#64748b", fontSize: "9.5pt" }}> · {c.issuer}</span>}
                </div>
                {c.date && <span style={{ fontSize: "8.5pt", color: "#94a3b8", whiteSpace: "nowrap", marginLeft: 8 }}>{c.date}</span>}
              </div>
            ))}
          </FreshSection>
        )}

        {(r.languages || []).length > 0 && (
          <FreshSection title="Languages" accent={accent}>
            <div style={{ display: "flex", gap: "4px 20px", flexWrap: "wrap" }}>
              {r.languages.map((l, i) => (
                <span key={i} style={{ fontSize: "9.5pt" }}>
                  <strong>{l.name}</strong>
                  {l.level && <span style={{ color: "#94a3b8" }}> · {l.level}</span>}
                </span>
              ))}
            </div>
          </FreshSection>
        )}
      </div>
    </div>
  );
}
function FreshSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
        <span style={{ display: "inline-block", width: 3, height: 14, background: accent, flexShrink: 0 }} />
        <h2 style={{ margin: 0, fontSize: "9pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#0f172a" }}>{title}</h2>
        <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
      </div>
      {children}
    </div>
  );
}

// International
function TemplateInternational({ r }) {
  const accent = "#374151";
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "10pt", lineHeight: 1.55, color: "#1f2937", padding: "40px 48px" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "22pt", fontWeight: 700, margin: "0 0 2px", letterSpacing: "0.01em" }}>{r.personal.name || "Your Name"}</h1>
        {r.personal.title && <div style={{ fontSize: "11pt", color: "#6b7280", marginBottom: 10 }}>{r.personal.title}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 24px", fontSize: "8.5pt", color: "#4b5563", borderTop: `2px solid ${accent}`, borderBottom: `1px solid #e5e7eb`, padding: "8px 0" }}>
          {r.personal.email && <span>Email: <PL href={eHref(r.personal.email)}>{r.personal.email}</PL></span>}
          {r.personal.phone && <span>Phone: <PL href={pHref(r.personal.phone)}>{r.personal.phone}</PL></span>}
          {r.personal.location && <span>Location: {r.personal.location}</span>}
          {r.personal.website && <span>Web: <PL href={uHref(r.personal.website)}>{r.personal.website}</PL></span>}
          {r.personal.linkedin && <span>LinkedIn: <PL href={uHref(r.personal.linkedin)}>{r.personal.linkedin}</PL></span>}
          {r.personal.github && <span>GitHub: <PL href={uHref(r.personal.github)}>{r.personal.github}</PL></span>}
        </div>
      </header>
      {r.personal.summary && <IntlSection title="Personal Statement" accent={accent}><p style={{ color: "#374151", ...JUSTIFY }}>{r.personal.summary}</p></IntlSection>}
      {r.experience.length > 0 && <IntlSection title="Work Experience" accent={accent}>{r.experience.map(e => (
        <div key={e.id} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "0 16px", marginBottom: 14 }}>
          <div style={{ fontSize: "8.5pt", color: "#6b7280", paddingTop: 1 }}>{e.start} -<br />{e.end}</div>
          <div>
            <div style={{ fontWeight: 700 }}>{e.role}</div>
            <div style={{ color: "#6b7280", fontSize: "9.5pt", marginBottom: 4 }}>{e.company}{e.location && `, ${e.location}`}</div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>{(e.bullets || []).filter(Boolean).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}</ul>
          </div>
        </div>
      ))}</IntlSection>}
      {r.education.length > 0 && <IntlSection title="Education" accent={accent}>{r.education.map(ed => (
        <div key={ed.id} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "0 16px", marginBottom: 10 }}>
          <div style={{ fontSize: "8.5pt", color: "#6b7280", paddingTop: 1 }}>{ed.start} -<br />{ed.end}</div>
          <div>
            <div style={{ fontWeight: 700 }}>{ed.degree}</div>
            <div style={{ color: "#6b7280", fontSize: "9.5pt" }}>{ed.school}{ed.location && `, ${ed.location}`}</div>
            {ed.details && <div style={{ fontSize: "9pt", color: "#555", marginTop: 2 }}>{ed.details}</div>}
          </div>
        </div>
      ))}</IntlSection>}
      {r.skills.length > 0 && <IntlSection title="Skills" accent={accent}><p style={{ color: "#374151" }}>{r.skills.join(" · ")}</p></IntlSection>}
      {(r.languages || []).length > 0 && <IntlSection title="Languages" accent={accent}>
        <div style={{ display: "flex", gap: "4px 24px", flexWrap: "wrap" }}>
          {r.languages.map((l, i) => <span key={i}><strong>{l.name}</strong>{l.level && <span style={{ color: "#6b7280" }}> - {l.level}</span>}</span>)}
        </div>
      </IntlSection>}
      {r.projects.length > 0 && <IntlSection title="Projects" accent={accent}>{r.projects.map(p => (
        <div key={p.id} style={{ marginBottom: 6 }}><span style={{ fontWeight: 700 }}>{p.name}</span>{p.description && <span style={{ color: "#4b5563" }}> - {p.description}</span>}</div>
      ))}</IntlSection>}
      {r.certifications.length > 0 && <IntlSection title="Certifications &amp; Awards" accent={accent}>{r.certifications.map(c => (
        <div key={c.id} style={{ marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{c.name}</span>, {c.issuer}{c.date && `, ${c.date}`}</div>
      ))}</IntlSection>}
    </div>
  );
}
function IntlSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: "9pt", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, color: accent, margin: "0 0 8px", paddingBottom: 3, borderBottom: `1px solid #d1d5db` }}>{title}</h2>
      {children}
    </div>
  );
}

// Two Column Premium
function TemplateTwoColumn({ r }) {
  const accent = "#1a1a2e";
  const sideAccent = "#e2e8f0";
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "10pt", lineHeight: 1.5, color: "#1e293b", display: "grid", gridTemplateColumns: "200px 1fr" }}>
      {/* Sidebar */}
      <aside style={{ background: accent, color: "#e2e8f0", padding: "28px 18px", minHeight: "100%" }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: "16pt", fontWeight: 700, color: "#fff", margin: "0 0 4px", lineHeight: 1.2 }}>{r.personal.name || "Your Name"}</h1>
          {r.personal.title && <div style={{ fontSize: "8.5pt", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1.4 }}>{r.personal.title}</div>}
        </div>
        <TwoColSideSection title="Contact" accent={sideAccent}>
          <div style={{ fontSize: "8pt", color: "#94a3b8", lineHeight: 1.8 }}>
            {r.personal.email && <div><PL href={eHref(r.personal.email)}>{r.personal.email}</PL></div>}
            {r.personal.phone && <div><PL href={pHref(r.personal.phone)}>{r.personal.phone}</PL></div>}
            {r.personal.location && <div>{r.personal.location}</div>}
            {r.personal.linkedin && <div><PL href={uHref(r.personal.linkedin)}>{r.personal.linkedin}</PL></div>}
            {r.personal.website && <div><PL href={uHref(r.personal.website)}>{r.personal.website}</PL></div>}
            {r.personal.github && <div><PL href={uHref(r.personal.github)}>{r.personal.github}</PL></div>}
          </div>
        </TwoColSideSection>
        {r.skills.length > 0 && <TwoColSideSection title="Skills" accent={sideAccent}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {r.skills.map((s, i) => (
              <div key={i} style={{ fontSize: "8.5pt", color: "#cbd5e1", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#60a5fa", flexShrink: 0 }} />{s}
              </div>
            ))}
          </div>
        </TwoColSideSection>}
        {r.education.length > 0 && <TwoColSideSection title="Education" accent={sideAccent}>{r.education.map(ed => (
          <div key={ed.id} style={{ marginBottom: 10, fontSize: "8.5pt" }}>
            <div style={{ fontWeight: 700, color: "#e2e8f0" }}>{ed.degree}</div>
            <div style={{ color: "#94a3b8" }}>{ed.school}</div>
            <div style={{ color: "#64748b" }}>{ed.start} - {ed.end}</div>
          </div>
        ))}</TwoColSideSection>}
        {(r.languages || []).length > 0 && <TwoColSideSection title="Languages" accent={sideAccent}>{r.languages.map((l, i) => (
          <div key={i} style={{ fontSize: "8.5pt", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#e2e8f0" }}>{l.name}</span>{l.level && <span style={{ fontSize: "7.5pt" }}>{l.level}</span>}
          </div>
        ))}</TwoColSideSection>}
      </aside>
      {/* Main */}
      <main style={{ padding: "28px 28px 28px 22px" }}>
        {r.personal.summary && <TwoColMainSection title="Professional Summary" accent={accent}><p style={{ color: "#475569", lineHeight: 1.6, ...JUSTIFY }}>{r.personal.summary}</p></TwoColMainSection>}
        {r.experience.length > 0 && <TwoColMainSection title="Experience" accent={accent}>{r.experience.map(e => (
          <div key={e.id} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div><div style={{ fontWeight: 700 }}>{e.role}</div><div style={{ color: "#3b82f6", fontSize: "9.5pt", fontWeight: 600 }}>{e.company}{e.location && ` · ${e.location}`}</div></div>
              <span style={{ fontSize: "8.5pt", color: "#64748b", whiteSpace: "nowrap", marginLeft: 8 }}>{e.start} - {e.end}</span>
            </div>
            <ul style={{ margin: "5px 0 0", paddingLeft: 16 }}>{(e.bullets || []).filter(Boolean).map((b, i) => <li key={i} style={{ color: "#374151", marginBottom: 2 }}>{b}</li>)}</ul>
          </div>
        ))}</TwoColMainSection>}
        {r.projects.length > 0 && <TwoColMainSection title="Projects" accent={accent}>{r.projects.map(p => (
          <div key={p.id} style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 700 }}>{p.name}</span>
            {p.link && <span style={{ color: "#3b82f6", fontSize: "8.5pt" }}> &middot; <PL href={uHref(p.link)}>{p.link}</PL></span>}
            {p.description && <p style={{ color: "#475569", margin: "3px 0 0", fontSize: "9.5pt" }}>{p.description}</p>}
          </div>
        ))}</TwoColMainSection>}
        {r.certifications.length > 0 && <TwoColMainSection title="Certifications" accent={accent}>{r.certifications.map(c => (
          <div key={c.id} style={{ marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{c.name}</span> - {c.issuer}{c.date && `, ${c.date}`}</div>
        ))}</TwoColMainSection>}
      </main>
    </div>
  );
}
function TwoColSideSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: "7.5pt", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, color: accent, margin: "0 0 8px" }}>{title}</h2>
      <div style={{ height: "0.5px", background: "rgba(255,255,255,0.15)", marginBottom: 8 }} />
      {children}
    </div>
  );
}
function TwoColMainSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: "9.5pt", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, color: accent, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}>
        {title}<span style={{ flex: 1, height: 1, background: `${accent}25` }} />
      </h2>
      {children}
    </div>
  );
}

// ── Sleek ─────────────────────────────────────────────────────────────────────
// Free. Single-column with split header: name+title left, contact stacked right.
// Teal accent, small square dot before section headings.
function TemplateSleek({ r }) {
  const accent = "#0f766e";
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "10pt", lineHeight: 1.5, color: "#0f172a" }}>
      <header style={{ padding: "32px 44px 20px", borderBottom: `2.5px solid ${accent}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: "23pt", fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.01em", color: "#0f172a" }}>{r.personal.name || "Your Name"}</h1>
            {r.personal.title && <div style={{ fontSize: "10.5pt", fontWeight: 500, color: accent }}>{r.personal.title}</div>}
          </div>
          <div style={{ textAlign: "right", fontSize: "8.5pt", color: "#475569", lineHeight: 1.9, flexShrink: 0 }}>
            {r.personal.email    && <div><PL href={eHref(r.personal.email)}>{r.personal.email}</PL></div>}
            {r.personal.phone    && <div><PL href={pHref(r.personal.phone)}>{r.personal.phone}</PL></div>}
            {r.personal.location && <div>{r.personal.location}</div>}
            {r.personal.linkedin && <div><PL href={uHref(r.personal.linkedin)}>{r.personal.linkedin}</PL></div>}
            {r.personal.github   && <div><PL href={uHref(r.personal.github)}>{r.personal.github}</PL></div>}
            {r.personal.website  && <div><PL href={uHref(r.personal.website)}>{r.personal.website}</PL></div>}
          </div>
        </div>
      </header>
      <div style={{ padding: "20px 44px 36px" }}>
        {r.personal.summary && <SleekSection title="Summary" accent={accent}><p style={{ color: "#475569", margin: 0, ...JUSTIFY }}>{r.personal.summary}</p></SleekSection>}
        {r.experience.length > 0 && <SleekSection title="Experience" accent={accent}>{r.experience.map(e => (
          <div key={e.id} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: "10.5pt" }}>{e.role}</span>
                {e.company && <span style={{ color: accent, fontSize: "9.5pt", marginLeft: 8 }}>{e.company}</span>}
                {e.location && <span style={{ color: "#94a3b8", fontSize: "9pt" }}>{` · ${e.location}`}</span>}
              </div>
              <span style={{ fontSize: "8.5pt", color: "#94a3b8", whiteSpace: "nowrap", flexShrink: 0 }}>{e.start} – {e.end}</span>
            </div>
            <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>{(e.bullets || []).filter(Boolean).map((b, i) => <li key={i} style={{ color: "#334155", marginBottom: 2 }}>{b}</li>)}</ul>
          </div>
        ))}</SleekSection>}
        {r.education.length > 0 && <SleekSection title="Education" accent={accent}>{r.education.map(ed => (
          <div key={ed.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontWeight: 700 }}>{ed.degree}</span>
              <span style={{ fontSize: "8.5pt", color: "#94a3b8", whiteSpace: "nowrap", flexShrink: 0 }}>{ed.start} – {ed.end}</span>
            </div>
            <div style={{ color: accent, fontSize: "9.5pt", fontWeight: 500 }}>{ed.school}{ed.location && ` · ${ed.location}`}</div>
            {ed.details && <div style={{ fontSize: "9pt", color: "#64748b", marginTop: 2 }}>{ed.details}</div>}
          </div>
        ))}</SleekSection>}
        {r.skills.length > 0 && <SleekSection title="Skills" accent={accent}><p style={{ color: "#334155", margin: 0 }}>{r.skills.join("   ·   ")}</p></SleekSection>}
        {(r.languages || []).length > 0 && <SleekSection title="Languages" accent={accent}><p style={{ color: "#334155", margin: 0 }}>{r.languages.map(l => l.level ? `${l.name} (${l.level})` : l.name).join("   ·   ")}</p></SleekSection>}
        {r.projects.length > 0 && <SleekSection title="Projects" accent={accent}>{r.projects.map(p => (
          <div key={p.id} style={{ marginBottom: 10 }}>
            <div><span style={{ fontWeight: 700 }}>{p.name}</span>{p.link && <span style={{ fontSize: "8.5pt", color: accent, marginLeft: 8 }}><PL href={uHref(p.link)}>{p.link}</PL></span>}</div>
            {p.description && <p style={{ color: "#475569", margin: "2px 0 0", fontSize: "9.5pt" }}>{p.description}</p>}
          </div>
        ))}</SleekSection>}
        {r.certifications.length > 0 && <SleekSection title="Certifications" accent={accent}>{r.certifications.map(c => (
          <div key={c.id} style={{ marginBottom: 5, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div><span style={{ fontWeight: 700 }}>{c.name}</span>{c.issuer && <span style={{ color: "#64748b", fontSize: "9.5pt" }}> · {c.issuer}</span>}</div>
            {c.date && <span style={{ fontSize: "8.5pt", color: "#94a3b8" }}>{c.date}</span>}
          </div>
        ))}</SleekSection>}
      </div>
    </div>
  );
}
function SleekSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
        <div style={{ width: 7, height: 7, background: accent, flexShrink: 0 }} />
        <h2 style={{ margin: 0, fontSize: "9.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#0f172a" }}>{title}</h2>
        <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
      </div>
      {children}
    </div>
  );
}

// ── Canvas ────────────────────────────────────────────────────────────────────
// Free. Light stone sidebar (contact/skills/education) + white main content.
// Warm charcoal palette. Different from Creative/TwoColumn which use dark sidebars.
function TemplateCanvas({ r }) {
  const dark    = "#1c1917";
  const muted   = "#78716c";
  const faint   = "#a8a29e";
  const sidebar = "#f5f5f4";
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "10pt", lineHeight: 1.5, color: dark, display: "grid", gridTemplateColumns: "178px 1fr" }}>
      {/* Sidebar */}
      <aside style={{ background: sidebar, padding: "30px 16px", borderRight: "1px solid #e7e5e4", minHeight: "100%" }}>
        <div style={{ paddingBottom: 16, marginBottom: 16, borderBottom: `2px solid ${dark}` }}>
          <h1 style={{ fontSize: "13pt", fontWeight: 700, color: dark, margin: "0 0 3px", lineHeight: 1.25 }}>{r.personal.name || "Your Name"}</h1>
          {r.personal.title && <div style={{ fontSize: "8pt", color: muted, lineHeight: 1.45, fontWeight: 400 }}>{r.personal.title}</div>}
        </div>
        <CanvasSideSection title="Contact">
          <div style={{ fontSize: "8pt", color: muted, lineHeight: 1.9 }}>
            {r.personal.email    && <div><PL href={eHref(r.personal.email)}>{r.personal.email}</PL></div>}
            {r.personal.phone    && <div><PL href={pHref(r.personal.phone)}>{r.personal.phone}</PL></div>}
            {r.personal.location && <div>{r.personal.location}</div>}
            {r.personal.linkedin && <div><PL href={uHref(r.personal.linkedin)}>{r.personal.linkedin}</PL></div>}
            {r.personal.github   && <div><PL href={uHref(r.personal.github)}>{r.personal.github}</PL></div>}
            {r.personal.website  && <div><PL href={uHref(r.personal.website)}>{r.personal.website}</PL></div>}
          </div>
        </CanvasSideSection>
        {r.skills.length > 0 && <CanvasSideSection title="Skills">
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {r.skills.map((s, i) => <span key={i} style={{ fontSize: "8.5pt", color: dark }}>{s}</span>)}
          </div>
        </CanvasSideSection>}
        {r.education.length > 0 && <CanvasSideSection title="Education">
          {r.education.map(ed => (
            <div key={ed.id} style={{ marginBottom: 10, fontSize: "8.5pt" }}>
              <div style={{ fontWeight: 700, color: dark, lineHeight: 1.3 }}>{ed.degree}</div>
              <div style={{ color: muted, lineHeight: 1.4 }}>{ed.school}</div>
              <div style={{ color: faint }}>{ed.start} – {ed.end}</div>
              {ed.details && <div style={{ color: muted, marginTop: 2, fontSize: "8pt" }}>{ed.details}</div>}
            </div>
          ))}
        </CanvasSideSection>}
        {(r.languages || []).length > 0 && <CanvasSideSection title="Languages">
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {r.languages.map((l, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "8.5pt" }}>
                <span style={{ color: dark }}>{l.name}</span>
                {l.level && <span style={{ color: faint, fontSize: "7.5pt" }}>{l.level}</span>}
              </div>
            ))}
          </div>
        </CanvasSideSection>}
      </aside>
      {/* Main */}
      <main style={{ padding: "30px 28px 30px 22px", background: "#fff" }}>
        {r.personal.summary && <CanvasMainSection title="Profile"><p style={{ color: "#44403c", margin: 0, ...JUSTIFY }}>{r.personal.summary}</p></CanvasMainSection>}
        {r.experience.length > 0 && <CanvasMainSection title="Experience">{r.experience.map(e => (
          <div key={e.id} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: "10.5pt" }}>{e.role}</span>
                {e.company && <span style={{ color: "#57534e", fontSize: "9.5pt", marginLeft: 6 }}>{e.company}</span>}
                {e.location && <span style={{ color: faint, fontSize: "9pt" }}>{` · ${e.location}`}</span>}
              </div>
              <span style={{ fontSize: "8.5pt", color: faint, whiteSpace: "nowrap", flexShrink: 0 }}>{e.start} – {e.end}</span>
            </div>
            <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>{(e.bullets || []).filter(Boolean).map((b, i) => <li key={i} style={{ color: "#44403c", marginBottom: 2 }}>{b}</li>)}</ul>
          </div>
        ))}</CanvasMainSection>}
        {r.projects.length > 0 && <CanvasMainSection title="Projects">{r.projects.map(p => (
          <div key={p.id} style={{ marginBottom: 10 }}>
            <div><span style={{ fontWeight: 700 }}>{p.name}</span>{p.link && <span style={{ fontSize: "8.5pt", color: muted, marginLeft: 8 }}><PL href={uHref(p.link)}>{p.link}</PL></span>}</div>
            {p.description && <p style={{ color: "#57534e", margin: "2px 0 0", fontSize: "9.5pt" }}>{p.description}</p>}
          </div>
        ))}</CanvasMainSection>}
        {r.certifications.length > 0 && <CanvasMainSection title="Certifications">{r.certifications.map(c => (
          <div key={c.id} style={{ marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div><span style={{ fontWeight: 700 }}>{c.name}</span>{c.issuer && <span style={{ color: muted, fontSize: "9.5pt" }}> · {c.issuer}</span>}</div>
            {c.date && <span style={{ fontSize: "8.5pt", color: faint }}>{c.date}</span>}
          </div>
        ))}</CanvasMainSection>}
      </main>
    </div>
  );
}
function CanvasSideSection({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ margin: "0 0 6px", fontSize: "7.5pt", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, color: "#1c1917" }}>{title}</h2>
      <div style={{ height: "0.5px", background: "#d6d3d1", marginBottom: 7 }} />
      {children}
    </div>
  );
}
function CanvasMainSection({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ margin: "0 0 9px", fontSize: "9.5pt", fontWeight: 700, color: "#1c1917", textTransform: "uppercase", letterSpacing: "0.08em", paddingBottom: 5, borderBottom: "1px solid #d6d3d1" }}>{title}</h2>
      {children}
    </div>
  );
}

// ── Apex ─────────────────────────────────────────────────────────────────────
// Premium. Single-column, Source Serif Pro, clean white throughout.
// Blue accent with gradient-underline section headings. Finance / consulting feel.
function TemplateApex({ r }) {
  const accent = "#2563eb";
  const muted  = "#64748b";
  const faint  = "#94a3b8";
  return (
    <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "10.5pt", lineHeight: 1.55, color: "#1e293b", padding: "44px 52px" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "27pt", fontWeight: 300, letterSpacing: "0.04em", margin: "0 0 5px", color: "#0f172a" }}>{r.personal.name || "Your Name"}</h1>
        {r.personal.title && <div style={{ fontSize: "11pt", fontWeight: 600, color: accent, letterSpacing: "0.03em", marginBottom: 10 }}>{r.personal.title}</div>}
        <div style={{ height: "1.5px", background: `linear-gradient(90deg, ${accent}, ${accent}35 60%, transparent)`, marginBottom: 10 }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0 22px", fontSize: "8.5pt", color: muted }}>
          {r.personal.email    && <PL href={eHref(r.personal.email)}>{r.personal.email}</PL>}
          {r.personal.phone    && <PL href={pHref(r.personal.phone)}>{r.personal.phone}</PL>}
          {r.personal.location && <span>{r.personal.location}</span>}
          {r.personal.linkedin && <PL href={uHref(r.personal.linkedin)}>{r.personal.linkedin}</PL>}
          {r.personal.github   && <PL href={uHref(r.personal.github)}>{r.personal.github}</PL>}
          {r.personal.website  && <PL href={uHref(r.personal.website)}>{r.personal.website}</PL>}
        </div>
      </header>
      {r.personal.summary && <ApexSection title="Profile" accent={accent}><p style={{ color: "#334155", margin: 0, ...JUSTIFY }}>{r.personal.summary}</p></ApexSection>}
      {r.experience.length > 0 && <ApexSection title="Experience" accent={accent}>{r.experience.map(e => (
        <div key={e.id} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: "10.5pt" }}>{e.role}</span>
            <span style={{ fontSize: "9pt", color: faint, whiteSpace: "nowrap", flexShrink: 0, fontStyle: "italic" }}>{e.start} – {e.end}</span>
          </div>
          <div style={{ color: accent, fontSize: "9.5pt", fontWeight: 500, marginBottom: 5 }}>{e.company}{e.location && ` · ${e.location}`}</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>{(e.bullets || []).filter(Boolean).map((b, i) => <li key={i} style={{ color: "#475569", marginBottom: 3 }}>{b}</li>)}</ul>
        </div>
      ))}</ApexSection>}
      {r.education.length > 0 && <ApexSection title="Education" accent={accent}>{r.education.map(ed => (
        <div key={ed.id} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontWeight: 700 }}>{ed.degree}</span>
            <span style={{ fontSize: "9pt", color: faint, whiteSpace: "nowrap", flexShrink: 0, fontStyle: "italic" }}>{ed.start} – {ed.end}</span>
          </div>
          <div style={{ color: accent, fontSize: "9.5pt", fontWeight: 500 }}>{ed.school}{ed.location && ` · ${ed.location}`}</div>
          {ed.details && <div style={{ fontSize: "9pt", color: muted, marginTop: 2 }}>{ed.details}</div>}
        </div>
      ))}</ApexSection>}
      {r.skills.length > 0 && <ApexSection title="Skills" accent={accent}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 8px" }}>
          {r.skills.map((s, i) => <span key={i} style={{ padding: "3px 10px", background: `${accent}0d`, color: accent, fontSize: "9pt", fontWeight: 500, border: `1px solid ${accent}25` }}>{s}</span>)}
        </div>
      </ApexSection>}
      {(r.languages || []).length > 0 && <ApexSection title="Languages" accent={accent}><p style={{ color: "#475569", margin: 0 }}>{r.languages.map(l => l.level ? `${l.name} (${l.level})` : l.name).join("   ·   ")}</p></ApexSection>}
      {r.projects.length > 0 && <ApexSection title="Projects" accent={accent}>{r.projects.map(p => (
        <div key={p.id} style={{ marginBottom: 10 }}>
          <div><span style={{ fontWeight: 700 }}>{p.name}</span>{p.link && <span style={{ color: accent, fontSize: "8.5pt", marginLeft: 8 }}><PL href={uHref(p.link)}>{p.link}</PL></span>}</div>
          {p.description && <p style={{ color: "#475569", margin: "2px 0 0", fontSize: "9.5pt" }}>{p.description}</p>}
        </div>
      ))}</ApexSection>}
      {r.certifications.length > 0 && <ApexSection title="Certifications" accent={accent}>{r.certifications.map(c => (
        <div key={c.id} style={{ marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div><span style={{ fontWeight: 700 }}>{c.name}</span>{c.issuer && <span style={{ color: muted, fontSize: "9.5pt" }}> · {c.issuer}</span>}</div>
          {c.date && <span style={{ fontSize: "8.5pt", color: faint }}>{c.date}</span>}
        </div>
      ))}</ApexSection>}
    </div>
  );
}
function ApexSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ marginBottom: 11 }}>
        <h2 style={{ margin: "0 0 5px", fontSize: "9.5pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: accent }}>{title}</h2>
        <div style={{ height: "1.5px", background: `linear-gradient(90deg, ${accent} 0%, ${accent}30 40%, transparent 100%)` }} />
      </div>
      {children}
    </div>
  );
}

// ── Meridian ──────────────────────────────────────────────────────────────────
// Premium. Bold full-width header (huge name left + contact right), then
// main content (left) + info panel (right). Right panel layout — reversed from
// all other templates. Sky-700 accent, all-light palette, Inter.
function TemplateMeridian({ r }) {
  const accent = "#0369a1";
  const panel  = "#F1F5F9"; // slate-100
  const text   = "#0f172a";
  const muted  = "#475569";
  const faint  = "#94a3b8";
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "10pt", lineHeight: 1.55, color: text }}>

      {/* ── Full-width header ── */}
      <header style={{ padding: "26px 36px 22px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, borderBottom: `3px solid ${accent}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: "25pt", fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 5px", color: text, lineHeight: 1.05 }}>{r.personal.name || "Your Name"}</h1>
          {r.personal.title && <div style={{ fontSize: "10.5pt", fontWeight: 500, color: accent, letterSpacing: "0.01em" }}>{r.personal.title}</div>}
        </div>
        <div style={{ textAlign: "right", fontSize: "8.5pt", color: muted, lineHeight: 1.95, flexShrink: 0, paddingTop: 3 }}>
          {r.personal.email    && <div><PL href={eHref(r.personal.email)}>{r.personal.email}</PL></div>}
          {r.personal.phone    && <div><PL href={pHref(r.personal.phone)}>{r.personal.phone}</PL></div>}
          {r.personal.location && <div>{r.personal.location}</div>}
          {r.personal.linkedin && <div><PL href={uHref(r.personal.linkedin)}>{r.personal.linkedin}</PL></div>}
          {r.personal.github   && <div><PL href={uHref(r.personal.github)}>{r.personal.github}</PL></div>}
          {r.personal.website  && <div><PL href={uHref(r.personal.website)}>{r.personal.website}</PL></div>}
        </div>
      </header>

      {/* ── Body: main (left) + info panel (right) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 205px" }}>

        {/* Main — white */}
        <main style={{ padding: "22px 24px 32px 36px" }}>
          {r.personal.summary && <MeridianMainSection title="Summary" accent={accent}><p style={{ color: muted, margin: 0, ...JUSTIFY }}>{r.personal.summary}</p></MeridianMainSection>}
          {r.experience.length > 0 && <MeridianMainSection title="Experience" accent={accent}>
            {r.experience.map(e => (
              <div key={e.id} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "10.5pt", color: text }}>{e.role}</div>
                    <div style={{ color: accent, fontSize: "9.5pt", fontWeight: 600, marginTop: 1 }}>{e.company}{e.location && ` · ${e.location}`}</div>
                  </div>
                  <div style={{ fontSize: "8pt", color: faint, whiteSpace: "nowrap", flexShrink: 0, marginTop: 3, background: `${accent}0d`, padding: "2px 7px", borderRadius: 2 }}>{e.start} – {e.end}</div>
                </div>
                <ul style={{ margin: "6px 0 0", paddingLeft: 17 }}>{(e.bullets || []).filter(Boolean).map((b, i) => <li key={i} style={{ color: "#334155", marginBottom: 3 }}>{b}</li>)}</ul>
              </div>
            ))}
          </MeridianMainSection>}
          {r.projects.length > 0 && <MeridianMainSection title="Projects" accent={accent}>
            {r.projects.map(p => (
              <div key={p.id} style={{ marginBottom: 11 }}>
                <div><span style={{ fontWeight: 700 }}>{p.name}</span>{p.link && <span style={{ color: accent, fontSize: "8.5pt", marginLeft: 8 }}><PL href={uHref(p.link)}>{p.link}</PL></span>}</div>
                {p.description && <p style={{ color: muted, margin: "3px 0 0", fontSize: "9.5pt" }}>{p.description}</p>}
              </div>
            ))}
          </MeridianMainSection>}
        </main>

        {/* Info panel — slate-100, right side */}
        <aside style={{ background: panel, borderLeft: "1px solid #e2e8f0", padding: "22px 18px 32px 16px" }}>
          {r.skills.length > 0 && <MeridianPanelSection title="Skills" accent={accent}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 5px" }}>
              {r.skills.map((s, i) => <span key={i} style={{ fontSize: "7.5pt", background: "#fff", color: "#1e293b", padding: "2px 7px", border: "1px solid #e2e8f0", fontWeight: 500 }}>{s}</span>)}
            </div>
          </MeridianPanelSection>}
          {r.education.length > 0 && <MeridianPanelSection title="Education" accent={accent}>
            {r.education.map(ed => (
              <div key={ed.id} style={{ marginBottom: 12, fontSize: "8.5pt" }}>
                <div style={{ fontWeight: 700, color: text, lineHeight: 1.3 }}>{ed.degree}</div>
                <div style={{ color: accent, fontWeight: 500, marginTop: 2 }}>{ed.school}</div>
                <div style={{ color: faint, marginTop: 1 }}>{ed.start} – {ed.end}</div>
                {ed.details && <div style={{ color: muted, marginTop: 2, fontSize: "7.5pt" }}>{ed.details}</div>}
              </div>
            ))}
          </MeridianPanelSection>}
          {r.certifications.length > 0 && <MeridianPanelSection title="Certifications" accent={accent}>
            {r.certifications.map(c => (
              <div key={c.id} style={{ marginBottom: 10, fontSize: "8.5pt" }}>
                <div style={{ fontWeight: 700, color: text, lineHeight: 1.3 }}>{c.name}</div>
                {c.issuer && <div style={{ color: muted, marginTop: 1 }}>{c.issuer}</div>}
                {c.date && <div style={{ color: faint, fontSize: "7.5pt", marginTop: 1 }}>{c.date}</div>}
              </div>
            ))}
          </MeridianPanelSection>}
          {(r.languages || []).length > 0 && <MeridianPanelSection title="Languages" accent={accent}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {r.languages.map((l, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "8.5pt" }}>
                  <span style={{ color: "#1e293b", fontWeight: 500 }}>{l.name}</span>
                  {l.level && <span style={{ color: faint, fontSize: "7.5pt" }}>{l.level}</span>}
                </div>
              ))}
            </div>
          </MeridianPanelSection>}
        </aside>

      </div>
    </div>
  );
}
function MeridianMainSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, borderLeft: `3px solid ${accent}`, paddingLeft: 9 }}>
        <h2 style={{ margin: 0, fontSize: "9pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.13em", color: "#0f172a" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}
function MeridianPanelSection({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ margin: "0 0 4px", fontSize: "7pt", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, color: accent }}>{title}</h2>
      <div style={{ height: "1px", background: `${accent}40`, marginBottom: 9 }} />
      {children}
    </div>
  );
}

export const TEMPLATE_COMPONENTS = {
  classic: TemplateClassic, modern: TemplateModern, minimal: TemplateMinimal,
  sleek: TemplateSleek, canvas: TemplateCanvas,
  executive: TemplateExecutive, creative: TemplateCreative, technical: TemplateTechnical,
  elegant: TemplateElegant, corporate: TemplateCorporate, fresher: TemplateFresher,
  international: TemplateInternational, twocolumn: TemplateTwoColumn,
  apex: TemplateApex, meridian: TemplateMeridian,
};
