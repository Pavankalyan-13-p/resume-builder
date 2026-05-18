import React, { useState, useEffect, useRef } from "react";
import { X, RefreshCw, History, ChevronLeft } from "lucide-react";
import { fetchInterviewQuestion } from "../data/interviewQuestions.js";
import { db } from "../firebase/config.js";
import {
  collection, addDoc, getDocs, query, orderBy,
  serverTimestamp, doc, setDoc,
} from "firebase/firestore";

// ─── Constants ────────────────────────────────────────────────────────────────

const AI_SESSION_LIMIT = 3; // new AI sessions per day for Pro users

const CAT_Q_COUNTS = { hr: 5, technical: 8, roleSpecific: 5, projects: 4, situational: 4 };

const CATS = [
  { id:'hr',           label:'HR & Personal',  emoji:'\u{1F464}', color:'#3b82f6', desc:'Walk-ins, strengths & career goals' },
  { id:'technical',    label:'Technical',       emoji:'\u{1F4BB}', color:'#b84a2e', desc:'Skills, tools & architecture' },
  { id:'roleSpecific', label:'Role-Specific',   emoji:'\u{1F3AF}', color:'#0ea5e9', desc:'Deep questions for your exact role' },
  { id:'projects',     label:'Project-Based',   emoji:'\u{1F680}', color:'#10b981', desc:'Your projects, decisions & impact' },
  { id:'situational',  label:'Situational',     emoji:'\u{1F9E0}', color:'#8b5cf6', desc:'STAR method & behavioural rounds' },
];

const SAMPLE_QS = [
  "Tell me about yourself — walk me through your background and what you're looking for.",
  "Describe a challenging technical problem you solved and how you approached it.",
  "Tell me about a project you're proud of and the impact it had.",
];
const UPGRADE_FEATURES = [
  { icon: '🎯', text: '5 rounds: HR, Technical, Role-Specific, Projects & Situational' },
  { icon: '📋', text: 'AI-generated questions personalized directly from your resume' },
  { icon: '💡', text: 'Answer strategy + sample professional answers revealed on demand' },
  { icon: '✅', text: '"Nailed It" scoring to track your confidence as you practice' },
  { icon: '🔄', text: 'Retry any round until you feel fully interview-ready' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildContext(resume) {
  const parts = [];
  if (resume?.experience?.length) {
    const expStr = resume.experience.slice(0, 2)
      .map(e => [e.role, e.company].filter(Boolean).join(' at '))
      .filter(Boolean).join(', ');
    if (expStr) parts.push(expStr);
  }
  if (resume?.projects?.length) {
    const projStr = resume.projects.slice(0, 2).map(p => p.name).filter(Boolean).join(', ');
    if (projStr) parts.push(`Projects: ${projStr}`);
  }
  if (resume?.education?.length) {
    const e = resume.education[0];
    const eduStr = [e.degree, e.school].filter(Boolean).join(' from ');
    if (eduStr) parts.push(eduStr);
  }
  return parts.join('. ');
}

function fmtSession(ts) {
  if (!ts) return '—';
  let d;
  try { d = ts.toDate ? ts.toDate() : new Date((ts.seconds || 0) * 1000); }
  catch { return '—'; }
  const diff = Date.now() - d.getTime();
  if (diff < 60000)    return 'Just now';
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const IS_CSS = `
  @keyframes is-blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes is-nailed-pop { 0%{transform:scale(1)} 40%{transform:scale(1.13)} 100%{transform:scale(1)} }
  @keyframes is-score-pop { 0%{opacity:0;transform:scale(0.5)} 70%{transform:scale(1.12)} 100%{opacity:1;transform:scale(1)} }
  @keyframes is-celebrate { 0%{opacity:0;transform:scale(0.55) translateY(16px)} 22%{opacity:1;transform:scale(1.1) translateY(-8px)} 60%{opacity:1;transform:scale(1) translateY(-14px)} 100%{opacity:0;transform:scale(0.88) translateY(-44px)} }
  @keyframes is-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
  @keyframes is-fade-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .is-celebrate-wrap{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;pointer-events:none;}
  .is-celebrate-card{background:linear-gradient(135deg,#15803d,#16a34a);border-radius:20px;padding:1.25rem 2.5rem;text-align:center;box-shadow:0 8px 48px rgba(21,128,61,0.65);animation:is-celebrate 0.95s cubic-bezier(.36,.07,.19,.97) forwards;}
  .is-wrap{position:fixed;inset:0;z-index:100;background:#0f172a;overflow-y:auto;display:flex;flex-direction:column;box-sizing:border-box;}
  .is-hdr{display:flex;align-items:center;justify-content:space-between;padding:0.875rem 1.25rem;background:rgba(15,23,42,0.97);border-bottom:1px solid #1e293b;flex-shrink:0;position:sticky;top:0;z-index:10;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);}
  .is-close{background:rgba(255,255,255,0.08);border:none;cursor:pointer;color:#94a3b8;border-radius:6px;padding:7px;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
  .is-close:hover{background:rgba(255,255,255,0.16);color:#fff;}
  .is-hdr-btn{background:rgba(255,255,255,0.06);border:1px solid #1e293b;cursor:pointer;color:#94a3b8;border-radius:6px;padding:5px 10px;display:flex;align-items:center;gap:5px;font-size:0.7rem;font-weight:600;font-family:inherit;transition:all 0.15s;}
  .is-hdr-btn:hover{background:rgba(255,255,255,0.12);color:#e2e8f0;border-color:#334155;}
  .is-intro{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 1.5rem;text-align:center;min-height:calc(100vh - 56px);}
  .is-select{flex:1;display:flex;flex-direction:column;align-items:center;padding:2rem 1.5rem;min-height:calc(100vh - 56px);}
  .is-cat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:0.875rem;width:100%;max-width:520px;margin:1.5rem 0 0;}
  .is-cat-card{background:#1e293b;border:1px solid #334155;border-left-width:3px;border-left-style:solid;border-radius:10px;padding:1.25rem 1rem;cursor:pointer;text-align:left;transition:all 0.18s;}
  .is-cat-card:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,0.45);}
  .is-full{grid-column:span 2;}
  .is-done{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 1.5rem;text-align:center;min-height:calc(100vh - 56px);}
  .is-score-badge{animation:is-score-pop 0.7s cubic-bezier(.36,.07,.19,.97) forwards;}
  .is-nailed-anim{animation:is-nailed-pop 0.5s cubic-bezier(.36,.07,.19,.97);}
  .is-skeleton{background:linear-gradient(90deg,#1e293b 25%,#2d3f54 50%,#1e293b 75%);background-size:200% 100%;animation:is-pulse 1.4s ease-in-out infinite;border-radius:6px;}
  .is-hist-item{background:#1e293b;border:1px solid #334155;border-radius:10px;padding:1rem 1.25rem;cursor:pointer;transition:all 0.18s;animation:is-fade-in 0.2s ease;}
  .is-hist-item:hover{border-color:#475569;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.3);}
  .is-review-q{background:#1e293b;border:1px solid #334155;border-radius:10px;padding:1.25rem;margin-bottom:1rem;animation:is-fade-in 0.2s ease;}
  @media(max-width:520px){.is-cat-grid{grid-template-columns:1fr;}.is-full{grid-column:span 1;}.is-intro,.is-select,.is-done{padding:1.5rem 1rem;}}
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function InterviewSimulator({ resume, user, onClose, onUpgrade }) {
  const [phase, setPhase]           = useState('intro');
  const [category, setCategory]     = useState(null);
  const [qIdx, setQIdx]             = useState(0);
  const [currentQ, setCurrentQ]     = useState(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [loadError, setLoadError]   = useState(null);
  const [revealed, setRevealed]     = useState(false);
  const [typedQ, setTypedQ]         = useState('');
  const [isTyping, setIsTyping]     = useState(false);
  const [nailedAnim, setNailedAnim]     = useState(false);
  const [nailedCount, setNailedCount]   = useState(0);
  const [celebration, setCelebration]   = useState(false);
  const [showUpgradeGate, setShowUpgradeGate] = useState(false);

  // ── History & session state ─────────────────────────────────────────────
  const sessionLogRef = useRef([]); // {question, hint, answer, nailed} — avoids stale closures
  const [sessions, setSessions]           = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [viewSession, setViewSession]     = useState(null);
  const [sessionLimitReached, setSessionLimitReached] = useState(false);

  // AI session count for today, seeded from the user prop once on mount
  const [aiUsedToday, setAiUsedToday] = useState(() => {
    if (!user?.uid) return 0;
    const today = new Date().toISOString().slice(0, 10);
    return (user.aiInterviewDate === today) ? (user.aiInterviewCount || 0) : 0;
  });

  const isPro    = user?.plan === 'pro';
  const isAdmin  = user?.role === 'admin';
  const canUseAI = isPro || isAdmin;

  const catInfo  = CATS.find(c => c.id === category) || CATS[0];
  const total    = category ? (CAT_Q_COUNTS[category] ?? 5) : 5;
  const scorePct = Math.round((nailedCount / total) * 100);
  const progPct  = (qIdx / total) * 100;
  const role     = resume?.personal?.title || '';
  const skills   = resume?.skills || [];

  // ── Session saving ──────────────────────────────────────────────────────

  const saveSession = async (catId, log, nailed) => {
    if (!user?.uid || log.length === 0) return;
    const cat = CATS.find(c => c.id === catId) || CATS[0];
    const sc  = Math.round((nailed / log.length) * 100);
    try {
      await addDoc(collection(db, 'users', user.uid, 'interviewSessions'), {
        category:       catId,
        categoryLabel:  cat.label,
        categoryEmoji:  cat.emoji,
        role:           resume?.personal?.title || 'Professional',
        questions:      log,
        nailedCount:    nailed,
        score:          sc,
        totalQuestions: log.length,
        createdAt:      serverTimestamp(),
      });
    } catch (_) {} // non-critical — session is already complete in the UI
  };

  // ── History loading ─────────────────────────────────────────────────────

  const loadHistory = async () => {
    if (!user?.uid) return;
    setHistoryLoading(true);
    try {
      const q    = query(collection(db, 'users', user.uid, 'interviewSessions'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (_) {}
    setHistoryLoading(false);
  };

  const goHistory = () => {
    setPhase('history');
    setViewSession(null);
    loadHistory();
  };

  // ── AI question loading ─────────────────────────────────────────────────

  const loadQuestion = async (catId, qNumber = 1) => {
    setIsLoading(true);
    setLoadError(null);
    setCurrentQ(null);
    setRevealed(false);
    try {
      const q = await fetchInterviewQuestion({
        category:       catId,
        role:           resume?.personal?.title || 'Professional',
        skills:         resume?.skills || [],
        context:        buildContext(resume),
        questionNumber: qNumber,
      });
      setCurrentQ(q);
      // Store question at the correct slot (handles retries gracefully)
      const entry = { question: q.question, hint: q.hint, answer: q.answer || '', nailed: false };
      sessionLogRef.current = [
        ...sessionLogRef.current.slice(0, qNumber - 1),
        entry,
      ];
    } catch (err) {
      if (err.code === 'PREMIUM_REQUIRED') {
        setPhase('select');
        setShowUpgradeGate(true);
      } else {
        setLoadError(err.message || 'Failed to load question. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Typing animation ────────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'practice' || !currentQ) return;
    setTypedQ('');
    setNailedAnim(false);
    setIsTyping(true);
    const text  = currentQ.question;
    const speed = Math.max(6, Math.min(22, 1600 / text.length));
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTypedQ(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setIsTyping(false); }
    }, speed);
    return () => clearInterval(id);
  }, [currentQ, phase]);

  // ── Navigation helpers ──────────────────────────────────────────────────

  const next = () => {
    const nextIdx = qIdx + 1;
    if (nextIdx >= total) {
      const log    = sessionLogRef.current;
      const nailed = log.filter(q => q.nailed).length;
      saveSession(category, log, nailed);
      setPhase('done');
    } else {
      setQIdx(nextIdx);
      loadQuestion(category, nextIdx + 1);
    }
  };

  const nail = () => {
    // Mark current question as nailed in the log ref (no state = no stale closure)
    const lastIdx = sessionLogRef.current.length - 1;
    if (lastIdx >= 0) {
      sessionLogRef.current[lastIdx] = { ...sessionLogRef.current[lastIdx], nailed: true };
    }
    setNailedAnim(true);
    setNailedCount(n => n + 1);
    setCelebration(true);
    setTimeout(() => { setCelebration(false); next(); }, 950);
  };

  const startCat = (id) => {
    if (canUseAI) {
      // Check daily limit (admin is always exempt)
      if (!isAdmin && aiUsedToday >= AI_SESSION_LIMIT) {
        setSessionLimitReached(true);
        return;
      }
      // Increment daily AI session count
      if (!isAdmin) {
        const today    = new Date().toISOString().slice(0, 10);
        const newCount = aiUsedToday + 1;
        setAiUsedToday(newCount);
        if (user?.uid) {
          setDoc(doc(db, 'users', user.uid), {
            aiInterviewCount: newCount,
            aiInterviewDate:  today,
          }, { merge: true }).catch(() => {});
        }
      }
    }
    sessionLogRef.current = [];
    setCategory(id);
    setQIdx(0);
    setRevealed(false);
    setNailedAnim(false);
    setNailedCount(0);
    setCurrentQ(null);
    setLoadError(null);
    setPhase('practice');
    loadQuestion(id, 1);
  };

  const goSelect = () => { setPhase('select'); setCurrentQ(null); setLoadError(null); };

  const sessionsLeft = AI_SESSION_LIMIT - aiUsedToday;

  const trophy  = scorePct >= 80 ? '\u{1F3C6}' : scorePct >= 60 ? '⭐' : '\u{1F4AA}';
  const doneMsg = scorePct >= 80
    ? "Outstanding! You're interview-ready."
    : scorePct >= 60
    ? "Solid effort. A few more reps and you'll ace it."
    : "Every rep builds confidence. Keep going!";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{IS_CSS}</style>
      <div className="is-wrap">

        {/* ── STICKY HEADER ──────────────────────────────────────────── */}
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
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            {/* History button — shown on all screens except practice/history itself */}
            {canUseAI && user?.uid && phase !== 'practice' && phase !== 'history' && (
              <button className="is-hdr-btn" onClick={goHistory}>
                <History style={{ width:13, height:13 }} /> History
              </button>
            )}
            {phase === 'practice' && (
              <button onClick={goSelect} className="is-hdr-btn">&larr; Rounds</button>
            )}
            {phase === 'history' && (
              <button onClick={() => { setPhase('intro'); setViewSession(null); }} className="is-hdr-btn">
                <ChevronLeft style={{ width:12, height:12 }} /> Back
              </button>
            )}
            <button className="is-close" onClick={onClose}><X style={{ width:15, height:15 }} /></button>
          </div>
        </div>

        {/* ── PROGRESS BAR ───────────────────────────────────────────── */}
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

        {/* ── INTRO SCREEN ───────────────────────────────────────────── */}
        {phase === 'intro' && (
          <div className="is-intro">
            <div style={{ fontSize:'3.5rem', lineHeight:1, marginBottom:'0.875rem' }}>{'\u{1F3AF}'}</div>
            <h1 style={{ color:'#f1f5f9', fontSize:'clamp(1.75rem,4vw,2.5rem)', fontFamily:"'Source Serif Pro',Georgia,serif", fontWeight:700, margin:'0 0 0.75rem', lineHeight:1.2 }}>
              Ready to Ace<br /><span style={{ color:'#f97316', fontStyle:'italic' }}>Your Interview?</span>
            </h1>
            <p style={{ color:'#94a3b8', fontSize:'0.95rem', lineHeight:1.7, maxWidth:400, margin:'0 auto 2rem' }}>
              Practice with <strong style={{ color:'#e2e8f0' }}>AI-generated questions</strong> pulled directly from your resume.<br />
              Build real confidence — one answer at a time.
            </p>

            {/* Resume profile card */}
            <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:12, padding:'1rem 1.5rem', marginBottom:'2rem', maxWidth:380, width:'100%', textAlign:'left' }}>
              <div style={{ fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.12em', color:'#475569', fontWeight:700, marginBottom:6 }}>Your Profile</div>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'1rem', marginBottom:3 }}>{role || 'Professional'}</div>
              {skills.length > 0 && <div style={{ color:'#64748b', fontSize:'0.78rem', marginBottom:8 }}>{skills.slice(0, 3).join(' · ')}</div>}
              <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:4 }}>
                {CATS.map(c => (
                  <span key={c.id} style={{ fontSize:'0.62rem', background:'#0f172a', border:'1px solid #1e293b', color:c.color, padding:'2px 8px', borderRadius:99, fontWeight:600 }}>
                    {c.emoji} {c.label.split(' ')[0]}
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
            <p style={{ color:'#334155', fontSize:'0.73rem', marginTop:'0.75rem' }}>Resume-personalised &middot; 4–8 questions per round &middot; No time limit</p>

            {/* History link */}
            {canUseAI && user?.uid && (
              <button
                onClick={goHistory}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#7c3aed', fontSize:'0.82rem', fontFamily:'inherit', marginTop:'0.75rem', display:'flex', alignItems:'center', gap:5, textDecoration:'underline' }}>
                <History style={{ width:13, height:13 }} /> View Past Sessions
              </button>
            )}
          </div>
        )}

        {/* ── CATEGORY SELECT SCREEN ─────────────────────────────────── */}
        {phase === 'select' && (
          <div className="is-select">
            <div style={{ textAlign:'center', maxWidth:520, width:'100%' }}>
              <div style={{ fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.15em', color:'#b84a2e', fontWeight:700, marginBottom:8 }}>Choose Your Round</div>
              <h2 style={{ color:'#f1f5f9', fontSize:'clamp(1.3rem,3vw,1.8rem)', fontFamily:"'Source Serif Pro',Georgia,serif", fontWeight:700, margin:'0 0 6px' }}>
                Which round do you want to practice?
              </h2>
              <p style={{ color:'#64748b', fontSize:'0.85rem', margin:0 }}>Each round targets a different type of interview question.</p>
            </div>

            {/* Session quota indicator */}
            {canUseAI && !isAdmin && user?.uid && (
              <div style={{ marginTop:'1rem', fontSize:'0.72rem', color:'#475569', textAlign:'center' }}>
                {sessionsLeft > 0 ? (
                  <span>
                    <span style={{ color:'#94a3b8', fontWeight:600 }}>{sessionsLeft}</span> of {AI_SESSION_LIMIT} AI sessions left today · resets at midnight UTC
                  </span>
                ) : (
                  <span>
                    <span style={{ color:'#f87171', fontWeight:600 }}>Daily AI limit reached</span> ·{' '}
                    <button onClick={goHistory} style={{ background:'none', border:'none', cursor:'pointer', color:'#a78bfa', fontSize:'0.72rem', textDecoration:'underline', padding:0, fontFamily:'inherit' }}>
                      browse history
                    </button>
                  </span>
                )}
              </div>
            )}

            <div className="is-cat-grid">
              {CATS.map((cat, i) => (
                <div
                  key={cat.id}
                  className={`is-cat-card${i === 4 ? ' is-full' : ''}`}
                  style={{ borderLeftColor:cat.color }}
                  onClick={() => canUseAI ? startCat(cat.id) : setShowUpgradeGate(true)}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:'1.5rem', lineHeight:1 }}>{cat.emoji}</span>
                    <span style={{ fontSize:'0.62rem', background:cat.color+'22', color:cat.color, padding:'2px 8px', borderRadius:99, fontWeight:700 }}>
                      {canUseAI ? `${CAT_Q_COUNTS[cat.id]} Qs` : '🔒 Pro'}
                    </span>
                  </div>
                  <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'0.9rem', marginBottom:3 }}>{cat.label}</div>
                  <div style={{ color:'#64748b', fontSize:'0.75rem', lineHeight:1.5, marginBottom:8 }}>{cat.desc}</div>
                  <div style={{ color:canUseAI ? cat.color : '#475569', fontSize:'0.7rem', fontWeight:600 }}>
                    {canUseAI ? 'Start Round →' : 'Upgrade to unlock →'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PRACTICE SCREEN ────────────────────────────────────────── */}
        {phase === 'practice' && (
          <div style={{ flex:1, overflowY:'auto', padding:'1.25rem 1.5rem', maxWidth:660, width:'100%', margin:'0 auto', boxSizing:'border-box' }}>

            {/* Interviewer chip */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1rem' }}>
              <div style={{ width:40, height:40, background:'linear-gradient(135deg,#1e293b,#334155)', border:`2px solid ${catInfo.color}`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>
                {'\u{1F464}'}
              </div>
              <div>
                <div style={{ color:'#f1f5f9', fontWeight:600, fontSize:'0.875rem' }}>Interviewer</div>
                <div style={{ color:'#475569', fontSize:'0.7rem' }}>
                  {isLoading ? 'Generating question…' : isTyping ? 'Typing…' : loadError ? 'Error' : 'Asked a question'}
                </div>
              </div>
            </div>

            {/* Question bubble */}
            <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'4px 16px 16px 16px', padding:'1.25rem 1.5rem', marginBottom:'1.25rem', minHeight:80 }}>
              {isLoading ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div className="is-skeleton" style={{ height:14, width:'90%' }} />
                  <div className="is-skeleton" style={{ height:14, width:'75%' }} />
                  <div className="is-skeleton" style={{ height:14, width:'55%' }} />
                </div>
              ) : loadError ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'0.5rem 0' }}>
                  <p style={{ color:'#f87171', fontSize:'0.85rem', margin:0, textAlign:'center' }}>{loadError}</p>
                  <button
                    onClick={() => loadQuestion(category, qIdx + 1)}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 16px', background:'#b84a2e', border:'none', color:'#fff', fontWeight:600, fontSize:'0.78rem', cursor:'pointer', borderRadius:6, fontFamily:'inherit' }}>
                    <RefreshCw style={{ width:12, height:12 }} /> Try Again
                  </button>
                </div>
              ) : (
                <p style={{ color:'#f1f5f9', fontSize:'1rem', lineHeight:1.7, margin:0, fontWeight:500 }}>
                  {typedQ}
                  {isTyping && (
                    <span style={{ display:'inline-block', width:2, height:'1em', background:'#b84a2e', marginLeft:3, verticalAlign:'middle', animation:'is-blink 0.7s step-end infinite' }} />
                  )}
                </p>
              )}
            </div>

            {/* Answer area */}
            {!isLoading && !loadError && currentQ && !isTyping && (
              <div>
                <div style={{ position:'relative' }}>
                  <div style={{ transition:'filter 0.4s ease,opacity 0.4s ease', filter:revealed?'none':'blur(7px)', opacity:revealed?1:0.4, pointerEvents:revealed?'auto':'none', userSelect:revealed?'auto':'none' }}>
                    <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, padding:'1rem 1.25rem', marginBottom:8 }}>
                      <div style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.13em', fontWeight:700, color:'#b45309', marginBottom:5 }}>Answer Strategy</div>
                      <p style={{ color:'#1e293b', fontSize:'0.84rem', lineHeight:1.65, margin:0, whiteSpace:'pre-wrap' }}>{currentQ.hint}</p>
                    </div>
                    {currentQ.answer && (
                      <div style={{ background:'#fff', border:'1px solid #d1fae5', borderLeft:'3px solid #15803d', borderRadius:'0 8px 8px 0', padding:'1rem 1.25rem' }}>
                        <div style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.13em', fontWeight:700, color:'#15803d', marginBottom:5 }}>Sample Professional Answer</div>
                        <p style={{ color:'#1e293b', fontSize:'0.875rem', lineHeight:1.72, margin:0, fontStyle:'italic' }}>
                          &ldquo;{currentQ.answer}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                  {!revealed && (
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
                      <div style={{ background:'rgba(15,23,42,0.78)', padding:'6px 16px', borderRadius:99, fontSize:'0.75rem', color:'#94a3b8', display:'flex', alignItems:'center', gap:6 }}>
                        Answer hidden — click to reveal
                      </div>
                    </div>
                  )}
                </div>
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
                        Nailed It — Next Question
                      </button>
                      <button
                        onClick={next}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b', fontSize:'0.78rem', padding:'4px', textDecoration:'underline', fontFamily:'inherit' }}>
                        Not sure — skip to next
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY SCREEN ─────────────────────────────────────────── */}
        {phase === 'history' && (
          <div style={{ flex:1, overflowY:'auto', padding:'1.5rem', maxWidth:660, width:'100%', margin:'0 auto', boxSizing:'border-box' }}>

            {viewSession ? (
              /* ── SESSION DETAIL ────────────────────────────────────── */
              <>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.5rem' }}>
                  <button onClick={() => setViewSession(null)} className="is-close">
                    <ChevronLeft style={{ width:15, height:15 }} />
                  </button>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:'1.25rem' }}>{viewSession.categoryEmoji || '🎯'}</span>
                      <span style={{ color:'#f1f5f9', fontWeight:700, fontSize:'1rem' }}>{viewSession.categoryLabel}</span>
                      <span style={{
                        fontSize:'0.65rem', fontWeight:700, padding:'2px 8px', borderRadius:99,
                        background: viewSession.score >= 80 ? 'rgba(21,128,61,0.2)' : viewSession.score >= 60 ? 'rgba(249,115,22,0.2)' : 'rgba(100,116,139,0.2)',
                        color:      viewSession.score >= 80 ? '#4ade80' : viewSession.score >= 60 ? '#f97316' : '#94a3b8',
                      }}>
                        {viewSession.score}%
                      </span>
                    </div>
                    <div style={{ color:'#475569', fontSize:'0.72rem', marginTop:2 }}>
                      {viewSession.role} · {fmtSession(viewSession.createdAt)} · {viewSession.nailedCount}/{viewSession.totalQuestions || viewSession.questions?.length || 0} nailed
                    </div>
                  </div>
                </div>

                {(viewSession.questions || []).map((q, i) => {
                  const cat = CATS.find(c => c.id === viewSession.category) || CATS[0];
                  return (
                    <div key={i} className="is-review-q">
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                        <span style={{ fontSize:'0.62rem', background:cat.color+'22', color:cat.color, padding:'2px 8px', borderRadius:99, fontWeight:700 }}>
                          Q{i + 1}
                        </span>
                        {q.nailed && (
                          <span style={{ fontSize:'0.62rem', background:'rgba(21,128,61,0.2)', color:'#4ade80', padding:'2px 8px', borderRadius:99, fontWeight:700 }}>
                            ✓ Nailed
                          </span>
                        )}
                      </div>
                      <p style={{ color:'#f1f5f9', fontSize:'0.95rem', lineHeight:1.65, margin:'0 0 12px', fontWeight:500 }}>
                        {q.question}
                      </p>
                      {q.hint && (
                        <div style={{ background:'rgba(251,191,36,0.07)', border:'1px solid rgba(251,191,36,0.18)', borderRadius:7, padding:'0.75rem 1rem', marginBottom:8 }}>
                          <div style={{ fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.13em', fontWeight:700, color:'#f59e0b', marginBottom:4 }}>Answer Strategy</div>
                          <p style={{ color:'#e2e8f0', fontSize:'0.82rem', lineHeight:1.65, margin:0, whiteSpace:'pre-wrap' }}>{q.hint}</p>
                        </div>
                      )}
                      {q.answer && (
                        <div style={{ background:'rgba(21,128,61,0.07)', border:'1px solid rgba(21,128,61,0.18)', borderRadius:7, padding:'0.75rem 1rem' }}>
                          <div style={{ fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.13em', fontWeight:700, color:'#4ade80', marginBottom:4 }}>Sample Answer</div>
                          <p style={{ color:'#e2e8f0', fontSize:'0.82rem', lineHeight:1.65, margin:0, fontStyle:'italic' }}>"{q.answer}"</p>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div style={{ marginTop:'1.5rem', display:'flex', flexDirection:'column', gap:8, maxWidth:340 }}>
                  <button
                    onClick={() => { setViewSession(null); setPhase('select'); }}
                    style={{ padding:'0.875rem', background:'linear-gradient(135deg,#b84a2e,#f97316)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', borderRadius:8, fontFamily:'inherit' }}>
                    Practice a New Round
                  </button>
                  <button
                    onClick={() => setViewSession(null)}
                    style={{ padding:'0.875rem', background:'#1e293b', border:'1px solid #334155', color:'#e2e8f0', fontWeight:600, fontSize:'0.9rem', cursor:'pointer', borderRadius:8, fontFamily:'inherit' }}>
                    ← Back to History
                  </button>
                </div>
              </>
            ) : (
              /* ── SESSION LIST ────────────────────────────────────────── */
              <>
                <div style={{ marginBottom:'1.5rem' }}>
                  <h2 style={{ color:'#f1f5f9', fontFamily:"'Source Serif Pro',Georgia,serif", fontSize:'1.5rem', fontWeight:700, margin:'0 0 4px' }}>Interview History</h2>
                  <p style={{ color:'#475569', fontSize:'0.82rem', margin:0 }}>Revisit past AI practice sessions — unlimited, no quota used.</p>
                </div>

                {historyLoading && (
                  <div style={{ display:'flex', justifyContent:'center', padding:'3rem 0' }}>
                    <RefreshCw className="is-skeleton" style={{ width:22, height:22, color:'#7c3aed', borderRadius:'50%', animation:'is-pulse 1s ease-in-out infinite' }} />
                  </div>
                )}

                {!historyLoading && sessions.length === 0 && (
                  <div style={{ textAlign:'center', padding:'4rem 1rem' }}>
                    <div style={{ fontSize:'3rem', marginBottom:'0.75rem' }}>📭</div>
                    <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'1rem', marginBottom:6 }}>No sessions yet</div>
                    <p style={{ color:'#475569', fontSize:'0.82rem', margin:'0 0 1.5rem', maxWidth:300, lineHeight:1.6 }}>
                      Complete an AI practice round and it will appear here for you to review anytime.
                    </p>
                    <button
                      onClick={() => setPhase('select')}
                      style={{ padding:'0.75rem 1.75rem', background:'linear-gradient(135deg,#b84a2e,#f97316)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', borderRadius:8, fontFamily:'inherit' }}>
                      Start First Session →
                    </button>
                  </div>
                )}

                {!historyLoading && sessions.map(s => {
                  const cat = CATS.find(c => c.id === s.category) || CATS[0];
                  return (
                    <div key={s.id} className="is-hist-item" onClick={() => setViewSession(s)} style={{ marginBottom:10 }}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:'1.4rem', lineHeight:1 }}>{s.categoryEmoji || cat.emoji}</span>
                          <div>
                            <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'0.875rem' }}>{s.categoryLabel || cat.label}</div>
                            <div style={{ color:'#475569', fontSize:'0.72rem', marginTop:1 }}>{s.role}</div>
                          </div>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <div style={{
                            fontSize:'1rem', fontWeight:700,
                            color: s.score >= 80 ? '#4ade80' : s.score >= 60 ? '#f97316' : '#94a3b8',
                          }}>{s.score}%</div>
                          <div style={{ color:'#334155', fontSize:'0.65rem', marginTop:1 }}>{fmtSession(s.createdAt)}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        <span style={{ fontSize:'0.62rem', background:'rgba(99,102,241,0.12)', color:'#a78bfa', padding:'2px 8px', borderRadius:99 }}>
                          {s.totalQuestions || s.questions?.length || 0} questions
                        </span>
                        <span style={{ fontSize:'0.62rem', background: s.nailedCount > 0 ? 'rgba(21,128,61,0.15)' : '#0f172a', color: s.nailedCount > 0 ? '#4ade80' : '#475569', padding:'2px 8px', borderRadius:99 }}>
                          {s.nailedCount} nailed
                        </span>
                        <span style={{ fontSize:'0.62rem', background:'#0f172a', color:'#64748b', padding:'2px 8px', borderRadius:99 }}>
                          Review →
                        </span>
                      </div>
                    </div>
                  );
                })}

                {!historyLoading && sessions.length > 0 && (
                  <div style={{ marginTop:'1.5rem' }}>
                    <button
                      onClick={() => setPhase('select')}
                      style={{ width:'100%', padding:'0.875rem', background:'linear-gradient(135deg,#b84a2e,#f97316)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', borderRadius:8, fontFamily:'inherit' }}>
                      Start a New Session →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── CELEBRATION OVERLAY ────────────────────────────────────── */}
        {celebration && (
          <div className="is-celebrate-wrap">
            <div className="is-celebrate-card">
              <div style={{ fontSize:'2.5rem', lineHeight:1, marginBottom:6 }}>{'\u{1F389}'}</div>
              <div style={{ color:'#fff', fontWeight:800, fontSize:'1.2rem', letterSpacing:'-0.01em' }}>Nailed it!</div>
              <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.75rem', marginTop:4 }}>+1 confidence point {'\u{1F31F}'}</div>
            </div>
          </div>
        )}

        {/* ── UPGRADE GATE ───────────────────────────────────────────── */}
        {showUpgradeGate && (
          <div style={{ position:'fixed', inset:0, zIndex:150, background:'rgba(0,0,0,0.78)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', boxSizing:'border-box' }}
            onClick={() => setShowUpgradeGate(false)}>
            <div style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:16, maxWidth:420, width:'100%', overflow:'hidden' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ background:'linear-gradient(135deg,rgba(184,74,46,0.18),rgba(249,115,22,0.12))', borderBottom:'1px solid #1e293b', padding:'1.5rem 1.5rem 1.25rem', textAlign:'center' }}>
                <div style={{ fontSize:'2rem', lineHeight:1, marginBottom:8 }}>👑</div>
                <h3 style={{ color:'#f1f5f9', margin:'0 0 6px', fontSize:'1.15rem', fontWeight:700, fontFamily:"'Source Serif Pro',Georgia,serif" }}>Pro Feature</h3>
                <p style={{ color:'#94a3b8', margin:0, fontSize:'0.82rem', lineHeight:1.5 }}>Upgrade to practice with AI-generated interview questions from your resume.</p>
              </div>
              <div style={{ padding:'1.25rem 1.5rem 0.75rem' }}>
                <div style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.13em', color:'#b84a2e', fontWeight:700, marginBottom:10 }}>Sample Questions You'd Get</div>
                {SAMPLE_QS.map((sq, i) => (
                  <div key={i} style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:8, padding:'0.65rem 1rem', marginBottom:7, display:'flex', gap:10, alignItems:'flex-start' }}>
                    <span style={{ color:'#475569', fontSize:'0.68rem', fontWeight:700, flexShrink:0, marginTop:1 }}>Q{i + 1}</span>
                    <span style={{ color:'#cbd5e1', fontSize:'0.8rem', lineHeight:1.55 }}>{sq}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding:'0.5rem 1.5rem 1rem' }}>
                {UPGRADE_FEATURES.map((f, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:7 }}>
                    <span style={{ fontSize:'0.9rem', flexShrink:0, lineHeight:1.4 }}>{f.icon}</span>
                    <span style={{ color:'#94a3b8', fontSize:'0.8rem', lineHeight:1.4 }}>{f.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding:'0 1.5rem 1.5rem', display:'flex', flexDirection:'column', gap:8 }}>
                <button
                  onClick={() => { setShowUpgradeGate(false); onUpgrade("monthly"); }}
                  style={{ width:'100%', padding:'0.875rem', background:'linear-gradient(135deg,#b84a2e,#f97316)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', borderRadius:8, fontFamily:'inherit', boxShadow:'0 4px 16px rgba(184,74,46,0.35)' }}>
                  Upgrade to Pro — Unlock Simulator
                </button>
                <button
                  onClick={() => setShowUpgradeGate(false)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#475569', fontSize:'0.78rem', padding:'4px', fontFamily:'inherit', textDecoration:'underline' }}>
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DAILY AI LIMIT GATE ────────────────────────────────────── */}
        {sessionLimitReached && (
          <div
            style={{ position:'fixed', inset:0, zIndex:150, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', boxSizing:'border-box' }}
            onClick={() => setSessionLimitReached(false)}>
            <div
              style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:16, maxWidth:380, width:'100%', padding:'2rem', textAlign:'center' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ fontSize:'2.5rem', lineHeight:1, marginBottom:'0.75rem' }}>⏳</div>
              <h3 style={{ color:'#f1f5f9', margin:'0 0 0.5rem', fontSize:'1.1rem', fontFamily:"'Source Serif Pro',Georgia,serif", fontWeight:700 }}>Daily AI Limit Reached</h3>
              <p style={{ color:'#94a3b8', fontSize:'0.85rem', lineHeight:1.6, margin:'0 0 1.25rem' }}>
                You've used all <strong style={{ color:'#e2e8f0' }}>{AI_SESSION_LIMIT} AI sessions</strong> for today.
                Resets at midnight UTC.
              </p>
              <p style={{ color:'#64748b', fontSize:'0.8rem', margin:'0 0 1.25rem', lineHeight:1.5 }}>
                Your past sessions are still available — revisit any round for unlimited review.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <button
                  onClick={() => { setSessionLimitReached(false); goHistory(); }}
                  style={{ padding:'0.75rem', background:'#7c3aed', border:'none', color:'#fff', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', borderRadius:8, fontFamily:'inherit' }}>
                  📚 Browse Past Sessions
                </button>
                <button
                  onClick={() => setSessionLimitReached(false)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#475569', fontSize:'0.78rem', padding:'4px', fontFamily:'inherit', textDecoration:'underline' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DONE SCREEN ────────────────────────────────────────────── */}
        {phase === 'done' && (
          <div className="is-done">
            <div className="is-score-badge" style={{ fontSize:'4rem', lineHeight:1, marginBottom:'0.75rem' }}>{trophy}</div>
            <h2 style={{ color:'#f1f5f9', fontSize:'clamp(1.5rem,3vw,2rem)', fontFamily:"'Source Serif Pro',Georgia,serif", fontWeight:700, margin:'0 0 0.5rem' }}>
              Round Complete!
            </h2>
            <p style={{ color:'#94a3b8', fontSize:'0.9rem', margin:'0 0 2rem', maxWidth:360 }}>{doneMsg}</p>

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

            <div style={{ display:'flex', flexDirection:'column', gap:10, width:'100%', maxWidth:340 }}>
              <button onClick={() => startCat(category)} style={{ padding:'0.875rem', background:'linear-gradient(135deg,#b84a2e,#f97316)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', borderRadius:8, fontFamily:'inherit' }}>
                Retry This Round
              </button>
              <button onClick={goSelect} style={{ padding:'0.875rem', background:'#1e293b', border:'1px solid #334155', color:'#e2e8f0', fontWeight:600, fontSize:'0.9rem', cursor:'pointer', borderRadius:8, fontFamily:'inherit' }}>
                Practice Another Round
              </button>
              {user?.uid && (
                <button onClick={goHistory} style={{ padding:'0.875rem', background:'#1e293b', border:'1px solid #7c3aed', color:'#a78bfa', fontWeight:600, fontSize:'0.9rem', cursor:'pointer', borderRadius:8, fontFamily:'inherit' }}>
                  📚 View Session in History
                </button>
              )}
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
