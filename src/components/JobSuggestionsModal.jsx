import React, { useState, useMemo, useEffect } from "react";
import { X, Crown, ExternalLink, Briefcase, ChevronRight, ArrowRight, Sparkles, Check, Lock } from "lucide-react";
import { JOB_ROLE_DEFS, JOB_PLATFORMS, analyzeJobRoles } from "../data/resumeData.js";
const JM_CSS = `
  .jm-bd{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;
    background:rgba(10,18,32,0.78);backdrop-filter:blur(5px);padding:20px;}
  .jm-sh{background:#fff;width:100%;max-width:560px;max-height:88vh;display:flex;flex-direction:column;
    border-radius:6px;box-shadow:0 28px 72px rgba(0,0,0,0.38);overflow:hidden;}
  .jm-hd{background:linear-gradient(135deg,#0f172a,#1a2e4a);padding:1.3rem 1.4rem;flex-shrink:0;position:relative;}
  .jm-cl{position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.1);border:none;cursor:pointer;
    color:#94a3b8;border-radius:4px;padding:5px;display:flex;align-items:center;justify-content:center;}
  .jm-cl:hover{background:rgba(255,255,255,0.2);color:#fff;}
  .jm-bd2{flex:1;overflow-y:auto;padding:1.25rem 1.4rem;}
  .jm-rc{display:flex;align-items:center;gap:11px;padding:11px 13px;border:1.5px solid #e2e8f0;
    cursor:pointer;transition:all 0.13s;margin-bottom:7px;background:#fff;border-radius:4px;}
  .jm-rc:hover{border-color:#1a2e4a;background:#f8faff;transform:translateX(2px);}
  .jm-rc.sel{border-color:#1a2e4a;background:#f0f5ff;box-shadow:0 2px 8px rgba(26,46,74,0.12);}
  .jm-sb{height:5px;border-radius:99px;background:#e2e8f0;flex:1;overflow:hidden;position:relative;}
  .jm-sf{height:100%;border-radius:99px;transition:width 0.5s ease;}
  .jm-pb{display:flex;align-items:center;gap:7px;padding:10px 14px;border:1.5px solid #e2e8f0;
    background:#fff;cursor:pointer;font-size:0.8rem;font-weight:700;font-family:inherit;
    border-radius:4px;transition:all 0.13s;text-decoration:none;color:#1e293b;flex:1;justify-content:center;}
  .jm-pb:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.12);}
  @keyframes jmPulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
  @keyframes jmSlide{0%{left:-60%;}100%{left:120%;}}
  .jm-pulse{animation:jmPulse 1.5s ease-in-out infinite;}
  .jm-scan-bar{position:absolute;top:0;left:-60%;width:50%;height:100%;
    background:linear-gradient(90deg,transparent,rgba(99,102,241,0.35),transparent);
    animation:jmSlide 1.3s ease-in-out infinite;}
  @media(max-width:500px){
    .jm-bd{padding:0;align-items:flex-end;}
    .jm-sh{max-width:100%;max-height:91vh;border-radius:8px 8px 0 0;}
    .jm-bd2{padding:1rem;}
    .jm-hd{padding:1.1rem 1rem;}
  }
`;

export default function JobSuggestionsModal({ resume, user, onClose, onUpgrade }) {
  const isPro = user?.plan === 'pro';
  const [phase, setPhase]   = useState('scan'); // scan | list | detail
  const [roles, setRoles]   = useState([]);
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const r = analyzeJobRoles(resume);
      setRoles(r);
      setPhase(r.length ? 'list' : 'empty');
    }, 1500);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  const scoreColor = (s) => s >= 75 ? '#16a34a' : s >= 55 ? '#d97706' : '#6366f1';

  // Scanning phase
  if (phase === 'scan') return (
    <>
      <style>{JM_CSS}</style>
      <div className="jm-bd" onClick={onClose}>
        <div className="jm-sh" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
          <div className="jm-hd" style={{ padding: '1.75rem 1.5rem' }}>
            <button className="jm-cl" onClick={onClose}><X style={{ width: 15, height: 15 }} /></button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}><Sparkles style={{ width: 36, height: 36, color: '#6366f1' }} /></div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>Analysing your resume...</div>
              <div className="jm-pulse" style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Scanning skills &middot; experience &middot; projects &middot; education</div>
            </div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            {['Detecting technical skills', 'Matching career patterns', 'Scoring role compatibility', 'Preparing personalised matches'].map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div className="jm-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: 4 }}>{label}</div>
                  <div className="jm-sb">
                    <div className="jm-scan-bar" style={{ animationDelay: `${i * 0.3}s` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // Empty phase
  if (phase === 'empty') return (
    <>
      <style>{JM_CSS}</style>
      <div className="jm-bd" onClick={onClose}>
        <div className="jm-sh" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
          <div className="jm-hd">
            <button className="jm-cl" onClick={onClose}><X style={{ width: 15, height: 15 }} /></button>
            <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', fontWeight: 700, marginBottom: 6 }}>Career Match</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>No strong matches yet</div>
          </div>
          <div className="jm-bd2" style={{ textAlign: 'center', paddingTop: '2rem', paddingBottom: '2rem' }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Sparkles style={{ width: 40, height: 40, color: '#6366f1' }} /></div>
            <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
              Add more details to your resume - skills, experience bullet points, and projects help us find your best career matches.
            </p>
            <button onClick={onClose} style={{ padding: '9px 20px', background: '#1a2e4a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', borderRadius: 4, fontFamily: 'inherit' }}>
              Go back and fill in details
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // Role list
  if (phase === 'list') return (
    <>
      <style>{JM_CSS}</style>
      <div className="jm-bd" onClick={onClose}>
        <div className="jm-sh" onClick={e => e.stopPropagation()}>
          <div className="jm-hd">
            <button className="jm-cl" onClick={onClose}><X style={{ width: 15, height: 15 }} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Sparkles style={{ width: 16, height: 16, color: '#fbbf24' }} />
              <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', fontWeight: 700 }}>Career Match Engine</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              {roles.length} roles matched your profile
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Based on your skills, experience &amp; projects - click any role to explore
            </div>
          </div>
          <div className="jm-bd2">
            {roles.map((r, i) => (
              <div key={r.id} className="jm-rc" onClick={() => { setPicked(r); setPhase('detail'); }}>
                <div style={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0 }}>{r.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{r.role}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: scoreColor(r.score), flexShrink: 0, marginLeft: 8 }}>{r.score}%</span>
                  </div>
                  <div className="jm-sb">
                    <div className="jm-sf" style={{ width: `${r.score}%`, background: scoreColor(r.score) }} />
                  </div>
                  {r.matchedSkills.length > 0 && (
                    <div style={{ marginTop: 5, display: 'flex', flexWrap: 'wrap', gap: '3px 5px' }}>
                      {r.matchedSkills.slice(0, 4).map((sk, j) => (
                        <span key={j} style={{ fontSize: '0.65rem', padding: '1px 6px', background: '#f1f5f9', color: '#475569', borderRadius: 99, fontWeight: 600 }}>{sk}</span>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronRight style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} />
              </div>
            ))}
            <div style={{ marginTop: 10, padding: '10px 14px', background: '#f8faff', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
              Scores are based on keyword matches between your resume content and each role's skill requirements. Add more skills and experience details to improve accuracy.
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Role detail
  if (phase === 'detail' && picked) return (
    <>
      <style>{JM_CSS}</style>
      <div className="jm-bd" onClick={onClose}>
        <div className="jm-sh" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="jm-hd">
            <button className="jm-cl" onClick={onClose}><X style={{ width: 15, height: 15 }} /></button>
            <button onClick={() => setPhase('list')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10, padding: 0, fontFamily: 'inherit' }}>
              &larr; Back to all matches
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.6rem' }}>{picked.icon}</span>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{picked.role}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                  <span style={{ fontWeight: 700, color: scoreColor(picked.score) }}>{picked.score}% match</span> &middot; Based on your resume
                </div>
              </div>
            </div>
          </div>

          <div className="jm-bd2">
            {/* Why this fits */}
            <div style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: 4, padding: '12px 14px', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#3b82f6', marginBottom: 5 }}>Why this fits you</div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155', lineHeight: 1.6 }}>{picked.why}</p>
            </div>

            {/* Strengths */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Key Strengths Detected</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {picked.strengths.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.83rem', color: '#1e293b' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check style={{ width: 10, height: 10, color: '#16a34a' }} />
                    </div>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Skill match */}
            {picked.matchedSkills.length > 0 && (
              <div style={{ marginBottom: '1.1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Skills matched from your resume</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 6px' }}>
                  {picked.matchedSkills.map((sk, i) => (
                    <span key={i} style={{ padding: '3px 10px', background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: 700, borderRadius: 99 }}>{sk}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Match bar */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: 5 }}>
                <span>Role compatibility</span>
                <span style={{ fontWeight: 700, color: scoreColor(picked.score) }}>{picked.score}%</span>
              </div>
              <div style={{ height: 8, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${picked.score}%`, background: scoreColor(picked.score), borderRadius: 99 }} />
              </div>
            </div>

            {/* CTA section */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.1rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                {isPro ? `Find ${picked.role} openings on:` : 'Upgrade to Pro to access job openings'}
              </div>

              {isPro ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {JOB_PLATFORMS.map(p => (
                    <a key={p.name} href={p.url(picked.role)} target="_blank" rel="noopener noreferrer" className="jm-pb"
                      style={{ background: p.bg, color: '#fff', border: `1.5px solid ${p.bg}` }}>
                      <Briefcase style={{ width: 13, height: 13 }} />
                      {p.name}
                      <ExternalLink style={{ width: 11, height: 11, opacity: 0.75, marginLeft: 'auto' }} />
                    </a>
                  ))}
                </div>
              ) : (
                <>
                  {/* Blurred preview of platforms */}
                  <div style={{ position: 'relative', marginBottom: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none' }}>
                      {JOB_PLATFORMS.map(p => (
                        <div key={p.name} className="jm-pb" style={{ background: p.bg, color: '#fff', border: `1.5px solid ${p.bg}` }}>
                          <Briefcase style={{ width: 13, height: 13 }} />
                          {p.name}
                        </div>
                      ))}
                    </div>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(1px)', borderRadius: 4 }}>
                      <Lock style={{ width: 18, height: 18, color: '#b84a2e' }} />
                    </div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg,#1a2e4a,#0f172a)', borderRadius: 5, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
                      <Crown style={{ width: 15, height: 15, color: '#fbbf24' }} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Pro Feature - Job Openings Access</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 12px', lineHeight: 1.5 }}>
                      Unlock direct links to <strong style={{ color: '#e2e8f0' }}>{picked.role}</strong> openings on LinkedIn, Indeed, Naukri &amp; Internshala.
                    </p>
                    <button onClick={() => { onClose(); onUpgrade('monthly'); }}
                      style={{ width: '100%', padding: '9px', background: '#b84a2e', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', borderRadius: 4, fontFamily: 'inherit' }}>
                      Upgrade to Pro - View Job Openings
                    </button>
                    <p style={{ fontSize: '0.67rem', color: '#475569', margin: '8px 0 0' }}>Career matches are always free &middot; Job access requires Pro</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return null;
}
