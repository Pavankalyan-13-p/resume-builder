import React, { useState } from "react";
import { X, Download, Edit3, Check, ArrowRight } from "lucide-react";
import { jsPDF } from "jspdf";
const CL_CSS = `
  .cl-bd{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.78);padding:20px;}
  .cl-sh{background:#fff;width:100%;max-width:560px;max-height:92vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,0.35);border-radius:4px;}
  .cl-hd{background:#1a2e4a;padding:1.25rem 1.5rem;flex-shrink:0;position:relative;}
  .cl-cl{position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.12);border:none;cursor:pointer;color:#94a3b8;border-radius:3px;padding:5px;display:flex;align-items:center;justify-content:center;}
  .cl-cl:hover{background:rgba(255,255,255,0.22);color:#fff;}
  .cl-bd2{flex:1;overflow-y:auto;padding:1.5rem;}
  .cl-inp{width:100%;padding:9px 12px;border:1px solid #e2e8f0;background:#f8faff;font-family:inherit;font-size:0.875rem;color:#1e293b;outline:none;transition:border-color 0.15s;box-sizing:border-box;}
  .cl-inp:focus{border-color:#1a2e4a;background:#fff;}
  .cl-tone{padding:7px 14px;border:1.5px solid #e2e8f0;background:#fff;cursor:pointer;font-size:0.75rem;font-weight:600;color:#475569;transition:all 0.15s;font-family:inherit;border-radius:3px;}
  .cl-tone.on{border-color:#1a2e4a;background:#1a2e4a;color:#fff;}
  .cl-letter{font-family:Georgia,'Times New Roman',serif;font-size:0.9rem;line-height:1.9;color:#1a1a1a;white-space:pre-wrap;padding:1.5rem;background:#fafaf9;border:1px solid #e8e8e8;min-height:300px;}
  .cl-edit{font-family:Georgia,'Times New Roman',serif;font-size:0.9rem;line-height:1.9;color:#1a1a1a;width:100%;min-height:340px;padding:1.5rem;background:#fff;border:1.5px solid #1a2e4a;resize:vertical;outline:none;box-sizing:border-box;}
  .cl-act{display:inline-flex;align-items:center;gap:6px;padding:8px 15px;font-size:0.78rem;font-weight:700;cursor:pointer;font-family:inherit;border-radius:3px;transition:all 0.15s;}
  @media(max-width:520px){.cl-bd{padding:0;align-items:flex-end;}.cl-sh{max-width:100%;max-height:92vh;border-radius:8px 8px 0 0;}.cl-bd2{padding:1rem;}.cl-hd{padding:1rem;}}
`;

function generateCoverLetter(resume, { jobTitle, company, hiringManager, tone }) {
  const p = resume.personal || {};
  const name = p.name || 'Your Name';
  const role = jobTitle || p.title || 'this position';
  const co = company || 'your company';
  const skills = (resume.skills || []).slice(0, 5);
  const exp = resume.experience || [];
  const proj = resume.projects || [];
  const edu = resume.education || [];
  const hasExp = exp.length > 0;
  const e0 = exp[0] || {};
  const ed0 = edu[0] || {};
  const pr0 = proj[0] || {};
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const greeting = hiringManager ? `Dear ${hiringManager},` : 'Dear Hiring Manager,';
  const skillStr = skills.slice(0, 3).join(', ');

  const hdr = [
    name,
    [p.email, p.phone].filter(Boolean).join('  ·  '),
    [p.location, p.linkedin].filter(Boolean).join('  ·  '),
    '',
    today,
    '',
    co !== 'your company' ? co : '',
    hiringManager ? `Attention: ${hiringManager}` : '',
  ].filter(Boolean).join('\n');

  let p1, p2, p3;

  if (tone === 'concise') {
    p1 = hasExp
      ? `I am applying for the ${role} role at ${co}. With experience as ${e0.role || 'a professional'}${e0.company ? ` at ${e0.company}` : ''} and expertise in ${skillStr}, I am confident I can add immediate value to your team. My background maps directly to the core requirements of this position, and I am ready to contribute from the first week.`
      : `I am applying for the ${role} role at ${co}. As a ${ed0.degree || 'recent graduate'} with skills in ${skillStr}, I am ready to contribute from day one. I am a focused, self-driven professional who prioritises outcomes and adapts quickly to new environments.`;
    p2 = hasExp && e0.bullets?.length
      ? `Key achievement: ${e0.bullets[0].replace(/^[-·•]\s*/, '')}. ${e0.bullets[1] ? `I also ${e0.bullets[1].toLowerCase().replace(/^[-·•]\s*/, '')}.` : `My work in ${skillStr} has consistently delivered measurable results.`}`
      : pr0.name
        ? `I have built ${pr0.name}${pr0.description ? ' - ' + pr0.description : ''}. This project reflects my ability to own a problem end-to-end and deliver tangible output.`
        : `I bring proven skills in ${skillStr} and a track record of executing efficiently under pressure.`;
    p3 = `I would welcome a brief conversation to discuss how I can contribute to ${co}. I am available at your convenience and can start promptly. Thank you for your time and consideration.`;
  } else if (tone === 'enthusiastic') {
    p1 = hasExp
      ? `I was thrilled to come across the ${role} opening at ${co}! Having spent meaningful time as ${e0.role || 'a professional'}${e0.company ? ` at ${e0.company}` : ''}, I am genuinely excited to bring my passion for ${skills[0] || 'this field'} to your incredible team. The work ${co} is doing resonates deeply with my professional values, and I would be proud to contribute to it.`
      : `I am absolutely excited about the ${role} opportunity at ${co}! As someone deeply passionate about ${skills[0] || 'this domain'} since my time at ${ed0.school || 'university'}, I believe this role is the perfect launchpad for my career. I am the kind of person who dives in headfirst, learns fast, and brings energy to every project.`;
    p2 = hasExp && e0.bullets?.length
      ? `My journey at ${e0.company || 'my previous company'} has been incredibly rewarding - I ${e0.bullets[0].toLowerCase().replace(/^[-·•]\s*/, '')}${e0.bullets[1] ? '. I also had the exciting opportunity to ' + e0.bullets[1].toLowerCase().replace(/^[-·•]\s*/, '') : ''}. These experiences have sharpened my ${skills.slice(0, 2).join(' and ')} skills in ways I am eager to channel at ${co}. I thrive when given ownership over meaningful challenges and love turning complex problems into clean solutions!`
      : pr0.name
        ? `I am particularly proud of "${pr0.name}"${pr0.description ? ' - ' + pr0.description : ''}. Building this showcases exactly the kind of creative problem-solver I am! I bring ${skillStr} expertise and an infectious drive to make things better.`
        : `I bring strong expertise in ${skillStr} and a genuine burning desire to tackle challenges that matter. I am the kind of teammate who lifts the energy of a room and never stops pushing for better.`;
    p3 = `I would absolutely love the chance to discuss how I can contribute to ${co}'s mission and help the team reach new heights. I bring not just skills, but genuine enthusiasm and a commitment to making a real difference. Thank you so much for considering my application - I look forward to connecting!`;
  } else {
    // professional
    p1 = hasExp
      ? `I am writing to apply for the ${role} position at ${co}. With ${exp.length > 1 ? exp.length + ' professional engagements' : 'solid hands-on experience'} - most recently as ${e0.role || 'a professional'}${e0.company ? ` at ${e0.company}` : ''} - I have developed a strong foundation in ${skillStr} that aligns well with the demands of this role. I am particularly drawn to ${co} and believe my experience positions me to contribute meaningfully from day one.`
      : `I am writing to express my interest in the ${role} position at ${co}. As a ${ed0.degree || 'recent graduate'} with a grounding in ${skillStr}, I am eager to begin my professional journey and contribute meaningfully to your team. I am confident that my academic background, combined with a strong self-driven work ethic, makes me a well-suited candidate for this opportunity.`;
    if (hasExp && e0.bullets?.length) {
      const b0 = e0.bullets[0].replace(/^[-·•]\s*/, '');
      const b1 = e0.bullets[1] ? e0.bullets[1].replace(/^[-·•]\s*/, '') : null;
      const skillMention = skills.length > 2 ? ` My proficiency in ${skills.slice(0, 4).join(', ')} has allowed me to drive impact across cross-functional initiatives consistently.` : '';
      p2 = `During my tenure at ${e0.company || 'my previous organisation'}, I ${b0.charAt(0).toLowerCase() + b0.slice(1)}${b1 ? `. Additionally, I ${b1.charAt(0).toLowerCase() + b1.slice(1)}` : ''}.${skillMention} These accomplishments reflect my ability to deliver results while collaborating effectively with diverse stakeholders.`;
    } else if (pr0.name) {
      p2 = `One of my notable projects is "${pr0.name}"${pr0.description ? ' - ' + pr0.description : ''}. This work demonstrates my ability to take full ownership of complex challenges and deliver tangible, measurable outcomes - a quality I intend to bring to every initiative at ${co}. I complement technical depth with strong communication and a collaborative mindset.`;
    } else {
      p2 = `I bring proficiency in ${skillStr}, developed through hands-on experience and continuous learning. I am a fast learner who takes initiative, adapts to evolving priorities, and thrives in collaborative environments where quality and ownership are valued.`;
    }
    p3 = `I am enthusiastic about contributing to ${co}'s goals and would welcome the opportunity to discuss how my skills and experience can support your team. I am confident that a brief conversation would demonstrate the value I can bring to this role. I am available for an interview at your earliest convenience.\n\nThank you for your time and consideration.`;
  }

  return [hdr, '', greeting, '', p1, '', p2, p3 ? '' : null, p3, '', 'Sincerely,', name]
    .filter(l => l !== null).join('\n');
}

export default function CoverLetterModal({ resume, user, onClose, onUpgrade }) {
  const [phase, setPhase]          = useState('input');
  const [editing, setEditing]      = useState(false);
  const [jobTitle, setJobTitle]    = useState(resume.personal?.title || '');
  const [company, setCompany]      = useState('');
  const [hiringMgr, setHiringMgr] = useState('');
  const [tone, setTone]            = useState('professional');
  const [letter, setLetter]        = useState('');
  const [copied, setCopied]        = useState(false);

  const generate = () => {
    setLetter(generateCoverLetter(resume, { jobTitle, company, hiringManager: hiringMgr, tone }));
    setPhase('preview'); setEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(letter).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleDownload = () => {
    if (!user) { onClose(); return; }

    const p = resume.personal || {};
    const name = p.name || '';
    const contactParts = [p.email, p.phone, p.location, p.linkedin].filter(Boolean);
    const contactStr = contactParts.join('  ·  ');

    // Body: strip the name+contact block, start from the date line
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const todayIdx = letter.indexOf(today);
    const bodyText = todayIdx >= 0 ? letter.slice(todayIdx) : letter;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = 210, pageH = 297;
    const mX = 17, mY = 16, mBottom = 17;
    const contentW = pageW - mX * 2;
    const cx = pageW / 2;
    let y = mY;

    // Justify a single wrapped line by distributing inter-word space evenly.
    // Last line of each paragraph is left-aligned (standard typographic rule).
    const renderLine = (line, lx, ly, justify) => {
      const words = line.trim().split(/\s+/);
      if (!justify || words.length <= 1) { doc.text(line, lx, ly); return; }
      const wordsWidth = words.reduce((s, w) => s + doc.getTextWidth(w), 0);
      const gap = (contentW - wordsWidth) / (words.length - 1);
      let wx = lx;
      for (const word of words) { doc.text(word, wx, ly); wx += doc.getTextWidth(word) + gap; }
    };

    // "COVER LETTER" heading
    doc.setFont('times', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(26, 46, 74);
    const titleW = doc.getTextWidth('C O V E R   L E T T E R');
    doc.text('C O V E R   L E T T E R', (pageW - titleW) / 2, y);
    y += 12;                                    // increased gap between title and name

    // Name
    if (name) {
      doc.setFont('times', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(26, 26, 26);
      const nameW = doc.getTextWidth(name);
      doc.text(name, (pageW - nameW) / 2, y);
      y += 5.5;
    }

    // Contact row
    if (contactStr) {
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      const contactLines = doc.splitTextToSize(contactStr, contentW);
      doc.text(contactLines, cx, y, { align: 'center' });
      y += contactLines.length * 4.2 + 9;
    } else {
      y += 9;
    }

    // Body text — justified, 11.5pt
    doc.setFont('times', 'normal');
    doc.setFontSize(11.5);
    doc.setTextColor(26, 26, 26);
    const lineH = 5.8;

    for (const rawLine of bodyText.split('\n')) {
      if (rawLine.trim() === '') { y += lineH * 0.5; continue; }
      const wrapped = doc.splitTextToSize(rawLine, contentW);
      for (let j = 0; j < wrapped.length; j++) {
        if (y > pageH - mBottom) { doc.addPage(); y = mY; }
        renderLine(wrapped[j], mX, y, j < wrapped.length - 1);  // justify all but last line
        y += lineH;
      }
    }

    const filename = `Cover_Letter_${(name || 'Document').replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
  };

  const tones = [['professional','Professional'],['enthusiastic','Enthusiastic'],['concise','Concise']];
  const toneHints = { professional:'Formal and measured - ideal for corporate & enterprise roles.', enthusiastic:'Energetic and passionate - great for startups & creative companies.', concise:'Brief and direct - best for companies that value efficiency.' };

  return (
    <>
      <style>{CL_CSS}</style>
      <div className="cl-bd" onClick={onClose}>
        <div className="cl-sh" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="cl-hd">
            <button className="cl-cl" onClick={onClose}><X style={{ width:15,height:15 }} /></button>
            {phase === 'preview' && (
              <button onClick={() => setPhase('input')} style={{ background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:'0.75rem',fontWeight:600,display:'flex',alignItems:'center',gap:5,marginBottom:8,padding:0,fontFamily:'inherit' }}>
                &larr; Back
              </button>
            )}
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:5 }}>
              <Edit3 style={{ width:15,height:15,color:'#fbbf24' }} />
              <span style={{ fontSize:'0.6rem',textTransform:'uppercase',letterSpacing:'0.15em',color:'#94a3b8',fontWeight:700 }}>Cover Letter Generator</span>
            </div>
            <div style={{ fontFamily:"'Source Serif Pro',Georgia,serif",fontSize:'1.1rem',fontWeight:700,color:'#fff',lineHeight:1.25 }}>
              {phase === 'input' ? 'Generate a Matching Cover Letter' : 'Your Cover Letter is Ready'}
            </div>
            <div style={{ fontSize:'0.73rem',color:'#64748b',marginTop:3 }}>
              {phase === 'input'
                ? 'Built from your resume &middot; ATS-friendly &middot; Recruiter-ready'
                : 'Edit &middot; Copy &middot; Download as PDF'}
            </div>
          </div>

          {/* Body */}
          <div className="cl-bd2">
            {phase === 'input' ? (
              /* Input form - available to ALL users */
              <div style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
                <div>
                  <label style={{ display:'block',fontSize:'0.7rem',fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6 }}>Job Title Applying For *</label>
                  <input className="cl-inp" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer, Product Manager" />
                </div>
                <div>
                  <label style={{ display:'block',fontSize:'0.7rem',fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6 }}>Company Name *</label>
                  <input className="cl-inp" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, Infosys, TCS" />
                </div>
                <div>
                  <label style={{ display:'block',fontSize:'0.7rem',fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6 }}>
                    Hiring Manager Name <span style={{ color:'#94a3b8',fontWeight:400,textTransform:'none',fontSize:'0.68rem' }}>(optional)</span>
                  </label>
                  <input className="cl-inp" value={hiringMgr} onChange={e => setHiringMgr(e.target.value)} placeholder="e.g. Rahul Sharma (leave blank for generic)" />
                </div>
                <div>
                  <label style={{ display:'block',fontSize:'0.7rem',fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8 }}>Writing Tone</label>
                  <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                    {tones.map(([v,l]) => (
                      <button key={v} className={`cl-tone${tone===v?' on':''}`} onClick={() => setTone(v)}>{l}</button>
                    ))}
                  </div>
                  <div style={{ marginTop:6,fontSize:'0.72rem',color:'#94a3b8' }}>{toneHints[tone]}</div>
                </div>
                <div style={{ height:1,background:'#f1f5f9' }} />
                <button onClick={generate} disabled={!jobTitle.trim()||!company.trim()}
                  style={{ width:'100%',padding:'11px',background:!jobTitle.trim()||!company.trim()?'#94a3b8':'#1a2e4a',color:'#fff',border:'none',cursor:!jobTitle.trim()||!company.trim()?'not-allowed':'pointer',fontWeight:700,fontSize:'0.9rem',fontFamily:'inherit',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                  <Edit3 style={{ width:14,height:14 }} /> Generate Cover Letter <ArrowRight style={{ width:14,height:14 }} />
                </button>
                <p style={{ fontSize:'0.7rem',color:'#94a3b8',textAlign:'center',margin:0 }}>
                  Preview is free for everyone &middot; Download requires Pro
                </p>
              </div>
            ) : (
              /* Preview - available to ALL users */
              <div>
                {/* Small utility actions */}
                <div style={{ display:'flex',gap:8,marginBottom:'1rem',flexWrap:'wrap' }}>
                  <button className="cl-act" onClick={() => setEditing(v => !v)} style={{ background:editing?'#1a2e4a':'#f1f5f9',color:editing?'#fff':'#1a2e4a',border:`1.5px solid ${editing?'#1a2e4a':'#e2e8f0'}` }}>
                    <Edit3 style={{ width:12,height:12 }} />{editing?'Done Editing':'Edit'}
                  </button>
                  <button className="cl-act" onClick={handleCopy} style={{ background:copied?'#15803d':'#f1f5f9',color:copied?'#fff':'#1a2e4a',border:`1.5px solid ${copied?'#15803d':'#e2e8f0'}` }}>
                    <Check style={{ width:12,height:12 }} />{copied?'Copied!':'Copy Text'}
                  </button>
                </div>

                {/* Letter preview */}
                {editing
                  ? <textarea className="cl-edit" value={letter} onChange={e => setLetter(e.target.value)} />
                  : <div className="cl-letter">{letter}</div>
                }

                {/* Download CTA — free for all signed-in users */}
                <div style={{ marginTop:'1.25rem' }}>
                  <button onClick={handleDownload}
                    style={{ width:'100%',padding:'12px',background:'#1a2e4a',color:'#fff',border:'none',cursor:'pointer',fontWeight:700,fontSize:'0.9rem',fontFamily:'inherit',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                    <Download style={{ width:15,height:15 }} /> Download Cover Letter (PDF)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
