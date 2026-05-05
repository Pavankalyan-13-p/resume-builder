import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { generateInterviewQuestions } from "../data/interviewQuestions.js";
const IS_CSS = `
  @keyframes is-blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes is-nailed-pop { 0%{transform:scale(1)} 40%{transform:scale(1.13)} 100%{transform:scale(1)} }
  @keyframes is-score-pop { 0%{opacity:0;transform:scale(0.5)} 70%{transform:scale(1.12)} 100%{opacity:1;transform:scale(1)} }
  @keyframes is-celebrate { 0%{opacity:0;transform:scale(0.55) translateY(16px)} 22%{opacity:1;transform:scale(1.1) translateY(-8px)} 60%{opacity:1;transform:scale(1) translateY(-14px)} 100%{opacity:0;transform:scale(0.88) translateY(-44px)} }
  .is-celebrate-wrap{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;pointer-events:none;}
  .is-celebrate-card{background:linear-gradient(135deg,#15803d,#16a34a);border-radius:20px;padding:1.25rem 2.5rem;text-align:center;box-shadow:0 8px 48px rgba(21,128,61,0.65);animation:is-celebrate 0.95s cubic-bezier(.36,.07,.19,.97) forwards;}
  .is-wrap{position:fixed;inset:0;z-index:100;background:#0f172a;overflow-y:auto;display:flex;flex-direction:column;box-sizing:border-box;}
  .is-hdr{display:flex;align-items:center;justify-content:space-between;padding:0.875rem 1.25rem;background:rgba(15,23,42,0.97);border-bottom:1px solid #1e293b;flex-shrink:0;position:sticky;top:0;z-index:10;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);}
  .is-close{background:rgba(255,255,255,0.08);border:none;cursor:pointer;color:#94a3b8;border-radius:6px;padding:7px;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
  .is-close:hover{background:rgba(255,255,255,0.16);color:#fff;}
  .is-intro{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 1.5rem;text-align:center;min-height:calc(100vh - 56px);}
  .is-select{flex:1;display:flex;flex-direction:column;align-items:center;padding:2rem 1.5rem;min-height:calc(100vh - 56px);}
  .is-cat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:0.875rem;width:100%;max-width:520px;margin:1.5rem 0 0;}
  .is-cat-card{background:#1e293b;border:1px solid #334155;border-left-width:3px;border-left-style:solid;border-radius:10px;padding:1.25rem 1rem;cursor:pointer;text-align:left;transition:all 0.18s;}
  .is-cat-card:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,0.45);}
  .is-full{grid-column:span 2;}
  .is-done{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 1.5rem;text-align:center;min-height:calc(100vh - 56px);}
  .is-score-badge{animation:is-score-pop 0.7s cubic-bezier(.36,.07,.19,.97) forwards;}
  .is-nailed-anim{animation:is-nailed-pop 0.5s cubic-bezier(.36,.07,.19,.97);}
  @media(max-width:520px){.is-cat-grid{grid-template-columns:1fr;}.is-full{grid-column:span 1;}.is-intro,.is-select,.is-done{padding:1.5rem 1rem;}}
`;

export default function InterviewSimulator({ resume, user, onClose, onUpgrade }) {
  const [phase, setPhase]           = useState('intro');
  const [category, setCategory]     = useState(null);
  const [qIdx, setQIdx]             = useState(0);
  const [revealed, setRevealed]     = useState(false);
  const [typedQ, setTypedQ]         = useState('');
  const [isTyping, setIsTyping]     = useState(false);
  const [nailedAnim, setNailedAnim]     = useState(false);
  const [nailedCount, setNailedCount]   = useState(0);
  const [celebration, setCelebration]   = useState(false);

  const data = useMemo(() => generateInterviewQuestions(resume), [resume]);

  const CATS = [
    { id:'hr',           label:'HR & Personal',  emoji:'\u{1F464}', color:'#3b82f6', desc:'Walk-ins, strengths & career goals' },
    { id:'technical',    label:'Technical',       emoji:'\u{1F4BB}', color:'#b84a2e', desc:'Skills, tools & architecture' },
    { id:'roleSpecific', label:'Role-Specific',   emoji:'\u{1F3AF}', color:'#0ea5e9', desc:'Deep questions for your exact role' },
    { id:'projects',     label:'Project-Based',   emoji:'\u{1F680}', color:'#10b981', desc:'Your projects, decisions & impact' },
    { id:'situational',  label:'Situational',     emoji:'\u{1F9E0}', color:'#8b5cf6', desc:'STAR method & behavioural rounds' },
  ];

  const qs       = category ? (data[category] || []) : [];
  const q        = qs[qIdx] || null;
  const total    = qs.length;
  const catInfo  = CATS.find(c => c.id === category) || CATS[0];
  const totalQs  = CATS.reduce((n, c) => n + (data[c.id]?.length || 0), 0);
  const scorePct = total > 0 ? Math.round((nailedCount / total) * 100) : 0;
  const progPct  = total > 0 ? (qIdx / total) * 100 : 0;
  const role     = resume?.personal?.title || '';
  const skills   = resume?.skills || [];

  // Typing animation for each new question
  useEffect(() => {
    if (phase !== 'practice' || !q) return;
    setTypedQ('');
    setRevealed(false);
    setNailedAnim(false);
    setIsTyping(true);
    const text = q.q;
    const speed = Math.max(6, Math.min(22, 1600 / text.length));
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTypedQ(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setIsTyping(false); }
    }, speed);
    return () => clearInterval(id);
  }, [qIdx, category, phase]);

  const next = () => {
    if (qIdx + 1 >= total) { setPhase('done'); }
    else { setQIdx(n => n + 1); setRevealed(false); }
  };

  // Fallback sample answer when a question has no hand-crafted answer
  const hintToAnswer = (hint = '') => `In my experience: ${hint.replace(/\.$/, '')}. I have applied this consistently in real-world projects and found it produces reliable, well-reasoned results. Understanding these trade-offs deeply helps me make better architectural decisions and communicate clearly with both technical and non-technical stakeholders.`;

  const nail = () => {
    setNailedAnim(true);
    setNailedCount(n => n + 1);
    setCelebration(true);
    setTimeout(() => { setCelebration(false); next(); }, 950);
  };

  const startCat = (id) => {
    setCategory(id);
    setQIdx(0);
    setRevealed(false);
    setNailedAnim(false);
    setNailedCount(0);
    setPhase('practice');
  };

  const goSelect = () => setPhase('select');

  const trophy  = scorePct >= 80 ? '\u{1F3C6}' : scorePct >= 60 ? '⭐' : '\u{1F4AA}';
  const doneMsg = scorePct >= 80
    ? "Outstanding! You're interview-ready."
    : scorePct >= 60
    ? "Solid effort. A few more reps and you'll ace it."
    : "Every rep builds confidence. Keep going!";

  return (
    <>
      <style>{IS_CSS}</style>
      <div className="is-wrap">

        {/* STICKY HEADER */}
        <div className="is-hdr">
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:30, height:30, background:'linear-gradient(135deg,#b84a2e,#f97316)', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', flexShrink:0 }}>{'\u{1F3AF}'}</div>
              <span style={{ color:'#f1f5f9', fontWeight:700, fontSize:'0.95rem' }}>Interview Simulator</span>
            </div>
            {phase === 'practice' && (
              <div style={{ fontSize:'0.68rem', color:catInfo.color, marginTop:2, paddingLeft:38 }}>{catInfo.emoji} {catInfo.label}</div>
            )}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {phase === 'practice' && (
              <button onClick={goSelect} style={{ background:'#1e293b', border:'1px solid #334155', color:'#94a3b8', cursor:'pointer', padding:'5px 10px', fontSize:'0.7rem', borderRadius:6, fontFamily:'inherit', transition:'all 0.15s' }}>
                &larr; Rounds
              </button>
            )}
            <button className="is-close" onClick={onClose}><X style={{ width:15, height:15 }} /></button>
          </div>
        </div>

        {/* PROGRESS BAR (practice only) */}
        {phase === 'practice' && (
          <div style={{ flexShrink:0 }}>
            <div style={{ height:3, background:'#1e293b' }}>
              <div style={{ width:`${progPct}%`, height:3, background:'linear-gradient(90deg,#b84a2e,#f97316)', transition:'width 0.5s cubic-bezier(.4,0,.2,1)' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 1.25rem', fontSize:'0.67rem', color:'#475569' }}>
              <span>Q {qIdx + 1} / {total}</span>
              <span style={{ color:catInfo.color }}>{nailedCount} nailed {'✓'}</span>
            </div>
          </div>
        )}

        {/* INTRO SCREEN */}
        {phase === 'intro' && (
          <div className="is-intro">
            <div style={{ fontSize:'3.5rem', lineHeight:1, marginBottom:'0.875rem' }}>{'\u{1F3AF}'}</div>
            <h1 style={{ color:'#f1f5f9', fontSize:'clamp(1.75rem,4vw,2.5rem)', fontFamily:"'Source Serif Pro',Georgia,serif", fontWeight:700, margin:'0 0 0.75rem', lineHeight:1.2 }}>
              Ready to Ace<br /><span style={{ color:'#f97316', fontStyle:'italic' }}>Your Interview?</span>
            </h1>
            <p style={{ color:'#94a3b8', fontSize:'0.95rem', lineHeight:1.7, maxWidth:400, margin:'0 auto 2rem' }}>
              Practice with <strong style={{ color:'#e2e8f0' }}>{totalQs} questions</strong> pulled directly from your resume.<br />
              Build real confidence - one answer at a time.
            </p>

            {/* Resume profile card */}
            <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:12, padding:'1rem 1.5rem', marginBottom:'2rem', maxWidth:380, width:'100%', textAlign:'left' }}>
              <div style={{ fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.12em', color:'#475569', fontWeight:700, marginBottom:6 }}>Your Profile</div>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'1rem', marginBottom:3 }}>{role || 'Professional'}</div>
              {skills.length > 0 && <div style={{ color:'#64748b', fontSize:'0.78rem', marginBottom:8 }}>{skills.slice(0, 3).join(' · ')}</div>}
              <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:4 }}>
                {CATS.map(c => (
                  <span key={c.id} style={{ fontSize:'0.62rem', background:'#0f172a', border:'1px solid #1e293b', color:c.color, padding:'2px 8px', borderRadius:99, fontWeight:600 }}>
                    {c.emoji} {data[c.id]?.length || 0}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setPhase('select')}
              style={{ padding:'0.9rem 2.5rem', background:'linear-gradient(135deg,#b84a2e,#f97316)', border:'none', color:'#fff', fontWeight:700, fontSize:'1rem', cursor:'pointer', borderRadius:8, boxShadow:'0 4px 20px rgba(184,74,46,0.4)', transition:'transform 0.15s,box-shadow 0.15s', fontFamily:'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.transform='scale(1.03)'; e.currentTarget.style.boxShadow='0 6px 28px rgba(184,74,46,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(184,74,46,0.4)'; }}>
              Start Practice Session &rarr;
            </button>
            <p style={{ color:'#334155', fontSize:'0.73rem', marginTop:'0.75rem' }}>All rounds free &middot; No time limit &middot; Resume-personalised</p>
          </div>
        )}

        {/* CATEGORY SELECT SCREEN */}
        {phase === 'select' && (
          <div className="is-select">
            <div style={{ textAlign:'center', maxWidth:520, width:'100%' }}>
              <div style={{ fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'#b84a2e', fontWeight:700, marginBottom:8 }}>Choose Your Round</div>
              <h2 style={{ color:'#f1f5f9', fontSize:'clamp(1.3rem,3vw,1.8rem)', fontFamily:"'Source Serif Pro',Georgia,serif", fontWeight:700, margin:'0 0 6px' }}>
                Which round do you want to practice?
              </h2>
              <p style={{ color:'#64748b', fontSize:'0.85rem', margin:0 }}>Each round targets a different type of interview question.</p>
            </div>
            <div className="is-cat-grid">
              {CATS.map((cat, i) => (
                <div
                  key={cat.id}
                  className={`is-cat-card${i === 4 ? ' is-full' : ''}`}
                  style={{ borderLeftColor:cat.color }}
                  onClick={() => startCat(cat.id)}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:'1.5rem', lineHeight:1 }}>{cat.emoji}</span>
                    <span style={{ fontSize:'0.62rem', background:cat.color+'22', color:cat.color, padding:'2px 8px', borderRadius:99, fontWeight:700 }}>
                      {data[cat.id]?.length || 0} Qs
                    </span>
                  </div>
                  <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'0.9rem', marginBottom:3 }}>{cat.label}</div>
                  <div style={{ color:'#64748b', fontSize:'0.75rem', lineHeight:1.5, marginBottom:8 }}>{cat.desc}</div>
                  <div style={{ color:cat.color, fontSize:'0.7rem', fontWeight:600 }}>Start Round &rarr;</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRACTICE SCREEN */}
        {phase === 'practice' && q && (
          <div style={{ flex:1, overflowY:'auto', padding:'1.25rem 1.5rem', maxWidth:660, width:'100%', margin:'0 auto', boxSizing:'border-box' }}>

            {/* Interviewer chip */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1rem' }}>
              <div style={{ width:40, height:40, background:'linear-gradient(135deg,#1e293b,#334155)', border:`2px solid ${catInfo.color}`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>
                {'\u{1F464}'}
              </div>
              <div>
                <div style={{ color:'#f1f5f9', fontWeight:600, fontSize:'0.875rem' }}>Interviewer</div>
                <div style={{ color:'#475569', fontSize:'0.7rem' }}>
                  {isTyping ? 'Typing...' : 'Asked a question'}
                </div>
              </div>
            </div>

            {/* Question bubble with typing animation */}
            <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'4px 16px 16px 16px', padding:'1.25rem 1.5rem', marginBottom:'1.25rem', minHeight:80 }}>
              <p style={{ color:'#f1f5f9', fontSize:'1rem', lineHeight:1.7, margin:0, fontWeight:500 }}>
                {typedQ}
                {isTyping && (
                  <span style={{ display:'inline-block', width:2, height:'1em', background:'#b84a2e', marginLeft:3, verticalAlign:'middle', animation:'is-blink 0.7s step-end infinite' }} />
                )}
              </p>
            </div>

            {/* Answer area - only visible once typing finishes */}
            {!isTyping && (
              <div>
                {/* Dual-section card - blurred until revealed */}
                <div style={{ position:'relative' }}>
                  <div style={{ transition:'filter 0.4s ease,opacity 0.4s ease', filter:revealed?'none':'blur(7px)', opacity:revealed?1:0.4, pointerEvents:revealed?'auto':'none', userSelect:revealed?'auto':'none' }}>

                    {/* A - Answer Strategy */}
                    <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, padding:'1rem 1.25rem', marginBottom:8 }}>
                      <div style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.13em', fontWeight:700, color:'#b45309', marginBottom:5 }}>Answer Strategy</div>
                      <p style={{ color:'#1e293b', fontSize:'0.84rem', lineHeight:1.65, margin:0 }}>{q.hint}</p>
                    </div>

                    {/* B - Sample Professional Answer */}
                    <div style={{ background:'#fff', border:'1px solid #d1fae5', borderLeft:'3px solid #15803d', borderRadius:'0 8px 8px 0', padding:'1rem 1.25rem' }}>
                      <div style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.13em', fontWeight:700, color:'#15803d', marginBottom:5 }}>Sample Professional Answer</div>
                      <p style={{ color:'#1e293b', fontSize:'0.875rem', lineHeight:1.72, margin:0, fontStyle:'italic' }}>
                        &ldquo;{q.answer || hintToAnswer(q.hint)}&rdquo;
                      </p>
                    </div>
                  </div>

                  {!revealed && (
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
                      <div style={{ background:'rgba(15,23,42,0.78)', padding:'6px 16px', borderRadius:99, fontSize:'0.75rem', color:'#94a3b8', display:'flex', alignItems:'center', gap:6 }}>
                        Answer hidden - click to reveal
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ marginTop:'1rem', display:'flex', flexDirection:'column', gap:8 }}>
                  {!revealed ? (
                    <button
                      onClick={() => setRevealed(true)}
                      style={{ width:'100%', padding:'0.9rem', background:'transparent', border:'1.5px solid #b84a2e', color:'#b84a2e', cursor:'pointer', fontWeight:700, fontSize:'0.875rem', borderRadius:8, fontFamily:'inherit', transition:'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background='#b84a2e'; e.currentTarget.style.color='#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#b84a2e'; }}>
                      Reveal Strategy &amp; Sample Answer
                    </button>
                  ) : (
                    <>
                      <button
                        className={nailedAnim ? 'is-nailed-anim' : ''}
                        onClick={nail}
                        style={{ width:'100%', padding:'0.9rem', background:'linear-gradient(135deg,#15803d,#16a34a)', border:'none', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:'0.9rem', borderRadius:8, fontFamily:'inherit', boxShadow:'0 4px 14px rgba(21,128,61,0.3)', transition:'transform 0.15s' }}>
                        Nailed It - Next Question
                      </button>
                      <button
                        onClick={next}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b', fontSize:'0.78rem', padding:'4px', textDecoration:'underline', fontFamily:'inherit' }}>
                        Not sure - skip to next
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CELEBRATION OVERLAY */}
        {celebration && (
          <div className="is-celebrate-wrap">
            <div className="is-celebrate-card">
              <div style={{ fontSize:'2.5rem', lineHeight:1, marginBottom:6 }}>{'\u{1F389}'}</div>
              <div style={{ color:'#fff', fontWeight:800, fontSize:'1.2rem', letterSpacing:'-0.01em' }}>Nailed it!</div>
              <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.75rem', marginTop:4 }}>+1 confidence point {'\u{1F31F}'}</div>
            </div>
          </div>
        )}

        {/* DONE SCREEN */}
        {phase === 'done' && (
          <div className="is-done">
            <div className="is-score-badge" style={{ fontSize:'4rem', lineHeight:1, marginBottom:'0.75rem' }}>{trophy}</div>
            <h2 style={{ color:'#f1f5f9', fontSize:'clamp(1.5rem,3vw,2rem)', fontFamily:"'Source Serif Pro',Georgia,serif", fontWeight:700, margin:'0 0 0.5rem' }}>
              Round Complete!
            </h2>
            <p style={{ color:'#94a3b8', fontSize:'0.9rem', margin:'0 0 2rem', maxWidth:360 }}>{doneMsg}</p>

            {/* Score card */}
            <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:12, padding:'1.5rem 2rem', marginBottom:'1.75rem', width:'100%', maxWidth:340, textAlign:'center' }}>
              <div style={{ display:'flex', justifyContent:'space-around', marginBottom:'1rem' }}>
                <div>
                  <div style={{ color:'#f1f5f9', fontFamily:"'Source Serif Pro',Georgia,serif", fontSize:'2.25rem', fontWeight:700, lineHeight:1 }}>{nailedCount}</div>
                  <div style={{ color:'#64748b', fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4 }}>Nailed</div>
                </div>
                <div style={{ width:'1px', background:'#334155' }} />
                <div>
                  <div style={{ color:'#f1f5f9', fontFamily:"'Source Serif Pro',Georgia,serif", fontSize:'2.25rem', fontWeight:700, lineHeight:1 }}>{total}</div>
                  <div style={{ color:'#64748b', fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4 }}>Total</div>
                </div>
                <div style={{ width:'1px', background:'#334155' }} />
                <div>
                  <div style={{ color:'#f97316', fontFamily:"'Source Serif Pro',Georgia,serif", fontSize:'2.25rem', fontWeight:700, lineHeight:1 }}>{scorePct}%</div>
                  <div style={{ color:'#64748b', fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4 }}>Score</div>
                </div>
              </div>
              <div style={{ background:'#0f172a', borderRadius:99, height:6, overflow:'hidden' }}>
                <div style={{ width:`${scorePct}%`, height:'100%', background:'linear-gradient(90deg,#b84a2e,#f97316)', borderRadius:99, transition:'width 1s cubic-bezier(.4,0,.2,1)' }} />
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display:'flex', flexDirection:'column', gap:10, width:'100%', maxWidth:340 }}>
              <button onClick={() => startCat(category)} style={{ padding:'0.875rem', background:'linear-gradient(135deg,#b84a2e,#f97316)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', borderRadius:8, fontFamily:'inherit' }}>
                Retry This Round
              </button>
              <button onClick={goSelect} style={{ padding:'0.875rem', background:'#1e293b', border:'1px solid #334155', color:'#e2e8f0', fontWeight:600, fontSize:'0.9rem', cursor:'pointer', borderRadius:8, fontFamily:'inherit' }}>
                Practice Another Round
              </button>
              <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#475569', fontSize:'0.8rem', padding:'6px', fontFamily:'inherit' }}>
                Exit Simulator
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
