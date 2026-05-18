import React, { useState } from "react";
import {
  FileText, Check, X, Menu, ArrowRight, Crown, Zap, Shield,
  Star, Download, Target, Sparkles, ExternalLink,
  Briefcase, GraduationCap, Edit3, Eye, ChevronRight,
  Wand2, MessageSquare, Brain
} from "lucide-react";
import { TEMPLATES } from "../data/resumeData.js";

export default function HomePage({ user, onSignIn, onSignUp, onLogout, onStart, onUpgrade, onOpenProfile, onContactSupport }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#fafaf9", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .hp-nav-link { color: #555; text-decoration: none; font-size: 0.875rem; transition: color 0.15s; }
        .hp-nav-link:hover { color: #1a2e4a; }
        .hp-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.12) !important; transform: translateY(-2px); }
        .hp-card { transition: all 0.2s ease; }
        .hp-btn-primary { background: #1a2e4a; color: #fff; border: none; padding: 0.875rem 1.75rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: background 0.15s; }
        .hp-btn-primary:hover { background: #243d60; }
        .hp-btn-secondary { background: #fff; color: #1a2e4a; border: 2px solid #1a2e4a; padding: 0.875rem 1.75rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .hp-btn-secondary:hover { background: #f0f4f8; }
        .hp-feat-card { padding: 1.5rem; background: #fff; border: 1px solid #ebebeb; position: relative; transition: all 0.2s ease; }
        .hp-feat-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.10); transform: translateY(-2px); border-color: #d0d8e4; }
        .hp-feat-badge-pro { position: absolute; top: 12px; right: 12px; font-size: 0.58rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 2px 7px; background: #b84a2e; color: #fff; }
        .hp-feat-badge-ai { position: absolute; top: 12px; right: 12px; font-size: 0.58rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 2px 8px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; display: inline-flex; align-items: center; gap: 3px; }
        .hp-ai-card { background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%) !important; border: 1px solid #c4b5fd !important; }
        .hp-ai-card:hover { box-shadow: 0 8px 28px rgba(109,40,217,0.12) !important; border-color: #a78bfa !important; }
        .hp-stats-strip { display: flex; align-items: center; justify-content: center; gap: 3rem; flex-wrap: wrap; }
        @media (max-width: 768px) { .hp-stats-strip { gap: 1.5rem; padding: 1.25rem 1.25rem !important; } }
        .hp-problem-bar { background: #fff7ed; border-left: 3px solid #b84a2e; padding: 0.875rem 1.25rem; margin-bottom: 1.75rem; font-size: 0.88rem; color: #7c2d12; font-weight: 500; line-height: 1.55; }
        .hp-ai-badge-hero { display: inline-flex; align-items: center; gap: 7px; padding: 6px 14px; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4f46e5 100%); font-size: 0.72rem; font-weight: 700; color: #fff; margin-bottom: 1.25rem; letter-spacing: 0.04em; box-shadow: 0 4px 18px rgba(79,70,229,0.35); }
        .hp-workflow-step { background: #fff; border: 1px solid #e8e8e8; padding: 1.75rem 1.5rem; position: relative; transition: all 0.2s ease; }
        .hp-workflow-step:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        .hp-ai-glow { box-shadow: 0 0 0 3px rgba(79,70,229,0.12), 0 20px 60px rgba(0,0,0,0.14); }
        @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes slide-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .hp-typing-dot { width: 6px; height: 6px; border-radius: 50%; background: #4f46e5; animation: pulse-dot 1.4s ease-in-out infinite; }
        .hp-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .hp-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @media (max-width: 900px) {
          .hp-hero-grid { grid-template-columns: 1fr !important; }
          .hp-preview-card { display: none !important; }
          .hp-features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hp-interview-featured { grid-column: span 2 !important; flex-direction: column !important; }
          .hp-workflow-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .hp-features-grid { grid-template-columns: 1fr !important; }
          .hp-interview-featured { grid-column: span 1 !important; }
          .hp-pricing-cards { grid-template-columns: 1fr !important; }
          .hp-templates-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hp-hamburger { display: flex !important; }
          .hp-nav-links { display: none !important; }
        }
      `}</style>

      {/* LAUNCH ANNOUNCEMENT BANNER */}
      <div style={{ background: "linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #1a2e4a 100%)", padding: "9px 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#4f46e5", color: "#fff", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", padding: "2px 8px" }}>
          ✦ AI-Powered
        </span>
        <span style={{ color: "#e2e8f0", fontSize: "0.82rem", fontWeight: 400, lineHeight: 1.4, textAlign: "center" }}>
          <strong style={{ color: "#fbbf24" }}>Launch offer:</strong> Download resumes free without signup &mdash; first <strong style={{ color: "#fbbf24" }}>199 users</strong> who sign up within 15 days keep higher download limits permanently
        </span>
        {!user && (
          <button onClick={onSignUp} style={{ background: "#b84a2e", color: "#fff", border: "none", padding: "5px 14px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em", flexShrink: 0, whiteSpace: "nowrap" }}>
            Claim your spot →
          </button>
        )}
      </div>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.82)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: "1px solid rgba(232,232,232,0.7)", padding: "0 2.5rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #1a2e4a, #312e81)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Sparkles style={{ width: 16, height: 16, color: "#fff" }} />
          </div>
          <span style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontWeight: 700, fontSize: "1.15rem", color: "#1a2e4a", letterSpacing: "-0.01em" }}>Foliant</span>
          <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#4f46e5", background: "#ede9fe", padding: "2px 6px" }}>AI</span>
        </div>
        <div className="hp-nav-links" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <a href="#features" className="hp-nav-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#templates" className="hp-nav-link" onClick={() => setMobileMenuOpen(false)}>Templates</a>
          <a href="#pricing" className="hp-nav-link" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <button
            onClick={() => { onContactSupport(); setMobileMenuOpen(false); }}
            className="hp-nav-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: '0.875rem' }}
          >
            Support
          </button>
          {mobileMenuOpen && (
            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "0.75rem", marginTop: "0.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {user ? (
                <>
                  <button onClick={() => { onOpenProfile(); setMobileMenuOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", color: "#333", fontWeight: 500, textAlign: "left", padding: 0 }}>My profile</button>
                  <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", color: "#666", textAlign: "left", padding: 0 }}>Sign out</button>
                </>
              ) : (
                <>
                  <button onClick={() => { onSignIn(); setMobileMenuOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", color: "#333", fontWeight: 500, textAlign: "left", padding: 0 }}>Sign in</button>
                  <button onClick={() => { onSignUp(); setMobileMenuOpen(false); }} style={{ background: "#1a2e4a", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, padding: "10px 16px", textAlign: "center" }}>Get started - free</button>
                </>
              )}
              <button onClick={() => { onContactSupport(); setMobileMenuOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", color: "#666", textAlign: "left", padding: 0 }}>Contact Support</button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button onClick={onOpenProfile} style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: user.plan === "pro" ? "#b84a2e" : "#1a2e4a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: 700 }}>
                  {user.name[0].toUpperCase()}
                </div>
                <span style={{ fontSize: "0.875rem", color: "#333", fontWeight: 500 }}>{user.name}</span>
                {user.plan === "pro" && <span style={{ fontSize: "0.65rem", fontWeight: 700, background: "#b84a2e", color: "#fff", padding: "2px 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pro</span>}
              </button>
              <button onClick={onLogout} style={{ background: "none", border: "1px solid #e0e0e0", cursor: "pointer", padding: "6px 12px", fontSize: "0.8rem", color: "#666" }}>Sign out</button>
            </div>
          ) : (
            <>
              <button onClick={onSignIn} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", color: "#444", fontWeight: 500, padding: "6px 12px" }}>Sign in</button>
              <button onClick={onSignUp} className="hp-btn-primary" style={{ padding: "8px 20px", fontSize: "0.875rem" }}>Get started</button>
            </>
          )}
          <button
            className="hp-hamburger"
            onClick={() => setMobileMenuOpen(m => !m)}
            style={{ display: "none", alignItems: "center", justifyContent: "center", background: "none", border: "1px solid #e0e0e0", cursor: "pointer", padding: "7px 10px" }}
          >
            {mobileMenuOpen ? <X style={{ width: 18, height: 18, color: "#1a2e4a" }} /> : <Menu style={{ width: 18, height: 18, color: "#1a2e4a" }} />}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hp-hero-grid" style={{ maxWidth: "1200px", margin: "0 auto", padding: "5rem 2.5rem 4rem", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "4rem", alignItems: "center" }}>
        <div>
          {/* AI Power Badge */}
          <div className="hp-ai-badge-hero">
            <Sparkles style={{ width: 12, height: 12 }} />
            Powered by Gemini AI · Next-Gen Resume Platform
          </div>

          {/* Problem callout */}
          <div className="hp-problem-bar">
            Most resumes get rejected in <strong>6 seconds</strong> by an ATS bot — before a human ever reads them.
          </div>

          {/* H1 */}
          <h1 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "clamp(2.6rem, 4vw, 4.25rem)", fontWeight: 700, lineHeight: 1.05, margin: "0 0 1.5rem 0", color: "#111", letterSpacing: "-0.02em" }}>
            Build Smarter.<br />Apply Faster.<br /><span style={{ color: "#b84a2e", fontStyle: "italic" }}>Get Hired.</span>
          </h1>

          {/* Subtext */}
          <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "#555", margin: "0 0 2.25rem 0", maxWidth: "520px" }}>
            AI writes your professional summary, <strong style={{ color: "#1a2e4a" }}>scores your ATS compatibility</strong>, and generates personalized interview questions directly from your resume. Stop editing — start getting offers.
          </p>

          {/* Launch urgency */}
          {!user && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "7px 14px", background: "#fff7ed", border: "1px solid #fcd5c9", marginBottom: "1.25rem", fontSize: "0.78rem", color: "#9a3412", fontWeight: 500, lineHeight: 1.4 }}>
              <Zap style={{ width: 12, height: 12, color: "#b84a2e", flexShrink: 0 }} />
              <span>During launch: download free without signup &mdash; sign up within 15 days to lock in higher limits permanently</span>
            </div>
          )}

          {/* CTAs */}
          <div style={{ display: "flex", gap: "0.875rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
            <button onClick={onStart} className="hp-btn-primary" style={{ flex: "1 1 auto", justifyContent: "center", fontSize: "0.92rem", background: "linear-gradient(135deg, #1a2e4a, #243d60)" }}>
              Build My AI Resume — Free <ArrowRight style={{ width: 15, height: 15 }} />
            </button>
            <button onClick={onStart} className="hp-btn-secondary" style={{ flex: "1 1 auto", justifyContent: "center" }}>
              Browse All Templates
            </button>
          </div>

          {/* Trust micro-signals */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {[
              "AI Summary Generator",
              "ATS Score Checker",
              "AI Interview Prep",
              "15 Templates",
            ].map(f => (
              <span key={f} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#666" }}>
                <Check style={{ width: 13, height: 13, color: "#4f46e5", flexShrink: 0 }} /> {f}
              </span>
            ))}
          </div>
        </div>

        {/* Preview card with AI glow */}
        <div className="hp-preview-card" style={{ position: "relative", paddingTop: "16px", paddingRight: "16px" }}>
          <div style={{ position: "absolute", top: 0, right: 0, left: "16px", bottom: "16px", border: "2px solid #4f46e5", zIndex: 0, opacity: 0.5 }}></div>
          <div className="hp-ai-glow" style={{ position: "relative", zIndex: 1, background: "#fff", padding: "2rem", fontFamily: "'Source Serif Pro', Georgia, serif" }}>
            {/* AI writing indicator at top */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 12px", background: "linear-gradient(135deg, #ede9fe, #ddd6fe)", border: "1px solid #c4b5fd", marginBottom: "1.25rem", fontSize: "0.72rem", color: "#5b21b6", fontWeight: 600 }}>
              <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
                <div className="hp-typing-dot" />
                <div className="hp-typing-dot" />
                <div className="hp-typing-dot" />
              </div>
              AI writing your professional summary…
            </div>
            <div style={{ borderBottom: "2px solid #1a2e4a", paddingBottom: "14px", marginBottom: "14px" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a2e4a", marginBottom: "2px" }}>Foliant-AI</div>
              <div style={{ fontSize: "0.8rem", color: "#666", fontStyle: "italic" }}>Software Engineer · React / Node.js</div>
              <div style={{ fontSize: "0.72rem", color: "#888", marginTop: "4px", fontFamily: "system-ui, sans-serif" }}>ai@foliant.app · Andhra Pradesh, India</div>
            </div>
            {/* AI-generated summary preview */}
            <div style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, color: "#4f46e5", marginBottom: "6px", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", gap: "4px" }}>
              <Sparkles style={{ width: 9, height: 9 }} /> AI Summary
            </div>
            <div style={{ fontSize: "0.7rem", color: "#444", lineHeight: 1.6, fontFamily: "system-ui, sans-serif", marginBottom: "12px", background: "#f8f6ff", padding: "8px 10px", borderLeft: "2px solid #7c3aed" }}>
              Results-driven Software Engineer with 2+ years building scalable React applications serving 50,000+ users at Infosys…
            </div>
            <div style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, color: "#1a2e4a", marginBottom: "8px", fontFamily: "system-ui, sans-serif" }}>Experience</div>
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1a1a1a" }}>Frontend Developer</div>
              <div style={{ fontSize: "0.72rem", fontStyle: "italic", color: "#666" }}>Infosys · 2022 – Present</div>
              <div style={{ fontSize: "0.72rem", color: "#444", marginTop: "5px", lineHeight: 1.5, fontFamily: "system-ui, sans-serif" }}>
                - Built React dashboard used by 50,000+ users<br />
                - Reduced page load by 40% via code splitting
              </div>
            </div>
            <div style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, color: "#1a2e4a", marginBottom: "6px", fontFamily: "system-ui, sans-serif" }}>Skills</div>
            <div style={{ fontSize: "0.72rem", color: "#444", fontFamily: "system-ui, sans-serif" }}>React · Node.js · TypeScript · MongoDB · AWS</div>
          </div>
          {/* ATS score */}
          <div style={{ position: "absolute", bottom: 0, right: 0, background: "#fff", padding: "8px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", border: "2px solid #4f46e5", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: 700, color: "#1a2e4a", zIndex: 2 }}>
            <Target style={{ width: 14, height: 14, color: "#4f46e5" }} /> ATS Score: 91
          </div>
          {/* Job match badge */}
          <div style={{ position: "absolute", top: 28, left: -4, background: "#f0fdf4", border: "1.5px solid #86efac", padding: "5px 11px", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.7rem", fontWeight: 700, color: "#15803d", zIndex: 2 }}>
            <Briefcase style={{ width: 10, height: 10 }} /> 7 Role Matches Found
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <div style={{ background: "linear-gradient(135deg, #1a2e4a 0%, #1e1b4b 100%)", padding: "1.5rem 2.5rem" }}>
        <div className="hp-stats-strip" style={{ maxWidth: "960px", margin: "0 auto" }}>
          {[
            { num: "10,000+", label: "AI-Optimized Resumes" },
            { num: "95%",     label: "ATS Pass Rate" },
            { num: "4.8 ★",  label: "User Rating" },
            { num: "Gemini",  label: "AI Engine" },
          ].map((s, i) => (
            <div key={s.label} style={{ textAlign: "center", padding: "0.25rem 1.5rem", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
              <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1.75rem", fontWeight: 700, color: i === 3 ? "#a78bfa" : "#fff", lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI WORKFLOW SECTION */}
      <section style={{ background: "#fff", borderTop: "1px solid #ebebeb", borderBottom: "1px solid #ebebeb", padding: "4rem 2.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "#4f46e5", marginBottom: "14px", fontWeight: 700 }}>
              <Sparkles style={{ width: 11, height: 11 }} /> How It Works
            </div>
            <h2 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#111", margin: "0 0 12px 0" }}>
              From Blank Page to <span style={{ color: "#4f46e5", fontStyle: "italic" }}>Interview-Ready</span> in Minutes
            </h2>
            <p style={{ color: "#666", fontSize: "0.95rem", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
              Foliant's AI handles the hard parts — writing, optimizing, and interview prep — so you focus on what matters: getting the job.
            </p>
          </div>

          <div className="hp-workflow-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", position: "relative" }}>
            {/* Connecting line */}
            <div style={{ position: "absolute", top: "3rem", left: "calc(33.33% + 1rem)", right: "calc(33.33% + 1rem)", height: "2px", background: "linear-gradient(90deg, #c4b5fd, #7c3aed, #c4b5fd)", zIndex: 0, display: "block" }} />

            {[
              {
                step: "01",
                icon: <Edit3 style={{ width: 22, height: 22, color: "#fff" }} />,
                color: "#1a2e4a",
                title: "Fill Your Details",
                desc: "Add your experience, skills, and education using our guided form. Takes 5 minutes. AI pre-suggests content based on your role.",
              },
              {
                step: "02",
                icon: <Sparkles style={{ width: 22, height: 22, color: "#fff" }} />,
                color: "#4f46e5",
                title: "AI Optimizes Everything",
                desc: "Gemini AI writes your professional summary, scores ATS compatibility, flags improvements, and generates your interview questions.",
                highlight: true,
              },
              {
                step: "03",
                icon: <Target style={{ width: 22, height: 22, color: "#fff" }} />,
                color: "#b84a2e",
                title: "Download & Get Hired",
                desc: "Export a pixel-perfect PDF. Apply to matched jobs. Ace your interviews with AI-personalized practice questions.",
              },
            ].map(s => (
              <div key={s.step} className="hp-workflow-step" style={{ background: s.highlight ? "linear-gradient(135deg, #f5f3ff, #ede9fe)" : "#fff", border: s.highlight ? "1px solid #c4b5fd" : "1px solid #e8e8e8", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
                  <div style={{ width: 44, height: 44, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, ...(s.highlight ? { boxShadow: "0 4px 16px rgba(79,70,229,0.35)" } : {}) }}>
                    {s.icon}
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 800, color: s.highlight ? "#4f46e5" : "#ccc", letterSpacing: "0.15em" }}>STEP {s.step}</span>
                </div>
                <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 8px", color: "#111" }}>{s.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
                {s.highlight && (
                  <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {["AI Summary", "ATS Check", "Interview Prep"].map(tag => (
                      <span key={tag} style={{ fontSize: "0.65rem", fontWeight: 700, background: "#ede9fe", color: "#5b21b6", padding: "3px 8px", letterSpacing: "0.03em" }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background: "#fafaf9", padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "#4f46e5", marginBottom: "14px", fontWeight: 700 }}>
              <Sparkles style={{ width: 11, height: 11 }} /> AI-Powered Career Tools
            </div>
            <h2 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "clamp(2rem, 3vw, 2.75rem)", fontWeight: 700, color: "#111", margin: "0 0 14px 0" }}>
              From Resume to Hired —<br /><span style={{ color: "#b84a2e", fontStyle: "italic" }}>AI Does the Heavy Lifting.</span>
            </h2>
            <p style={{ color: "#666", fontSize: "1rem", maxWidth: "580px", margin: "0 auto", lineHeight: 1.7 }}>
              Foliant uses Gemini AI to write, optimize, and interview-prep you. Spend less time editing, more time getting offers.
            </p>
          </div>

          {/* ── AI SUPERPOWERS: Featured Interview Simulator ── */}
          <div className="hp-features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>

            {/* Interview Simulator — full-width featured card */}
            <div className="hp-interview-featured" style={{ gridColumn: "span 3", background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #1a2e4a 100%)", padding: "2.5rem 2.5rem", display: "flex", gap: "3rem", alignItems: "center", position: "relative", overflow: "hidden", border: "none" }}>
              {/* Background glow orb */}
              <div style={{ position: "absolute", top: -80, right: 80, width: 260, height: 260, background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -60, left: 60, width: 200, height: 200, background: "radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />

              {/* Left: content */}
              <div style={{ flex: "0 0 auto", maxWidth: "380px", position: "relative", zIndex: 1 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.4)", padding: "4px 10px", fontSize: "0.65rem", fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "1rem" }}>
                  <Star style={{ width: 9, height: 9 }} /> ✦ AI-Powered · Premium Feature
                </div>
                <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1.75rem", fontWeight: 700, color: "#fff", margin: "0 0 12px", lineHeight: 1.2 }}>
                  AI Interview Simulator
                </h3>
                <p style={{ fontSize: "0.88rem", color: "#c4b5fd", lineHeight: 1.75, margin: "0 0 1.5rem" }}>
                  5 targeted rounds — HR, Technical, Role-Specific, Project-Based, and Situational — with questions generated <strong style={{ color: "#e0d9ff" }}>directly from your resume</strong>. Gemini AI reveals the answer strategy and a sample professional response for every question.
                </p>
                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  {[
                    { n: "5", label: "Practice Rounds" },
                    { n: "26", label: "Total Questions" },
                    { n: "AI", label: "Hints & Answers" },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1.4rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{s.n}</div>
                      <div style={{ fontSize: "0.67rem", color: "#a78bfa", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.72rem", color: "#a78bfa", fontWeight: 600 }}>
                  <Crown style={{ width: 11, height: 11 }} /> Available with Pro plan
                </div>
              </div>

              {/* Right: mock interview UI */}
              <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "1.5rem", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.67rem", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>Technical Round · Q3 of 10</div>
                  <div style={{ display: "flex", gap: "3px" }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ width: 20, height: 3, background: i <= 3 ? "#7c3aed" : "rgba(255,255,255,0.15)" }} />
                    ))}
                  </div>
                </div>
                <div style={{ color: "#fff", fontSize: "0.88rem", lineHeight: 1.65, marginBottom: "1.25rem", padding: "1rem", background: "rgba(255,255,255,0.06)", borderLeft: "3px solid #7c3aed" }}>
                  "You've worked with React at Infosys. How would you diagnose and fix a component re-rendering 200+ times per second?"
                </div>
                {/* Blurred answer */}
                <div style={{ position: "relative" }}>
                  <div style={{ padding: "0.875rem 1rem", background: "rgba(0,0,0,0.25)", fontSize: "0.8rem", color: "#c4b5fd", lineHeight: 1.6, filter: "blur(3.5px)", userSelect: "none" }}>
                    Start with React DevTools Profiler to identify which components re-render unnecessarily. Apply React.memo and useCallback to stabilize props, useMemo for expensive derivations, and consider virtualization for large lists…
                  </div>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "rgba(124,58,237,0.85)", color: "#fff", fontSize: "0.72rem", fontWeight: 700, padding: "6px 14px", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "5px" }}>
                      <Eye style={{ width: 11, height: 11 }} /> Click to reveal answer
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "1rem", display: "flex", gap: "8px" }}>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", fontSize: "0.72rem", color: "#a78bfa", textAlign: "center", cursor: "pointer" }}>Strategy Hint</div>
                  <div style={{ flex: 1, background: "rgba(124,58,237,0.5)", border: "1px solid #7c3aed", padding: "6px 12px", fontSize: "0.72rem", color: "#fff", fontWeight: 600, textAlign: "center", cursor: "pointer" }}>Next Question →</div>
                </div>
              </div>
            </div>

            {/* AI Resume Summary Generator */}
            <div className="hp-feat-card hp-ai-card">
              <span className="hp-feat-badge-ai"><Sparkles style={{ width: 7, height: 7 }} /> AI</span>
              <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, #4f46e5, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", boxShadow: "0 4px 14px rgba(79,70,229,0.3)" }}>
                <Wand2 style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>AI Resume Summary</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: "0 0 1rem" }}>
                One click and Gemini AI writes a <strong>professional summary tailored to your role</strong> — ATS-optimized, keyword-rich, and interview-ready. No more staring at a blank page.
              </p>
              <div style={{ background: "#f0ecff", border: "1px solid #ddd6fe", padding: "10px 12px", fontSize: "0.75rem", color: "#5b21b6", lineHeight: 1.6, fontStyle: "italic" }}>
                "Results-driven Software Engineer with 2+ years building scalable React applications. Proven ability to optimize performance by 40% through strategic code splitting…"
              </div>
            </div>

            {/* ATS Score Checker */}
            <div className="hp-feat-card">
              <div style={{ width: 44, height: 44, background: "#1a2e4a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Target style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Real-Time ATS Score</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                Get a live score with <strong>specific improvement tips</strong> — action verbs, keyword gaps, formatting issues, and contact completeness. Know exactly what to fix before you apply.
              </p>
            </div>

            {/* Smart Career Fit Engine */}
            <div className="hp-feat-card hp-ai-card">
              <span className="hp-feat-badge-ai"><Sparkles style={{ width: 7, height: 7 }} /> AI</span>
              <div style={{ width: 44, height: 44, background: "linear-gradient(135deg, #14532d, #166534)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Sparkles style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Smart Career Fit Engine</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                AI scans your resume and surfaces the <strong>career paths you're genuinely qualified for</strong> — with a match score and the exact skills driving it. No guesswork.
              </p>
            </div>

            {/* Job Openings */}
            <div className="hp-feat-card" style={{ borderColor: "#fde68a", background: "#fffbeb" }}>
              <span className="hp-feat-badge-pro">Pro</span>
              <div style={{ width: 44, height: 44, background: "#92400e", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Briefcase style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Job Openings Access</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                One click to <strong>live job listings on LinkedIn, Indeed, Naukri &amp; Internshala</strong> — filtered to your exact matched role. Stop searching manually. Start applying.
              </p>
            </div>

            {/* PDF Downloads */}
            <div className="hp-feat-card">
              <div style={{ width: 44, height: 44, background: "#0f4c81", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Download style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Unlimited PDF Downloads</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                Export your resume as a <strong>pixel-perfect, ATS-clean PDF</strong> any time. No account required. No watermarks. No limits. Just download and apply.
              </p>
            </div>

            {/* Fresher Templates */}
            <div className="hp-feat-card">
              <div style={{ width: 44, height: 44, background: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <GraduationCap style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Internship &amp; Placement Templates</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                Dedicated <strong>education-first layouts</strong> for students, freshers, and new graduates. Highlight projects, internships, and academics exactly the way recruiters expect.
              </p>
            </div>

            {/* Word Export */}
            <div className="hp-feat-card">
              <div style={{ width: 44, height: 44, background: "#1e5faa", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <FileText style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Word (.docx) Export</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                Some recruiters specifically ask for Word files. <strong>Download your resume as .docx</strong> instantly — formatted, clean, and ready to submit without re-formatting.
              </p>
            </div>

            {/* Cover Letter */}
            <div className="hp-feat-card">
              <div style={{ width: 44, height: 44, background: "#b84a2e", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Edit3 style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Cover Letter Generator</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                A <strong>tailored cover letter</strong> generated from your resume in seconds — choose your tone, preview, edit, and download as a professional PDF. Free for all signed-in users.
              </p>
            </div>

            {/* Live Preview */}
            <div className="hp-feat-card">
              <div style={{ width: 44, height: 44, background: "#374151", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Eye style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Live A4 Preview</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                <strong>WYSIWYG, real-time rendering</strong> in true A4 proportions as you type. What you see in the browser is exactly what gets printed. No layout surprises after download.
              </p>
            </div>

            {/* Auto-save */}
            <div className="hp-feat-card">
              <div style={{ width: 44, height: 44, background: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Shield style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Auto-Save Across Sessions</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                <strong>Never lose your work.</strong> Every change is saved instantly — close your laptop, switch devices, come back days later. Your resume is waiting exactly where you left it.
              </p>
            </div>

          </div>

          {/* Bottom CTA inside features */}
          <div style={{ textAlign: "center", marginTop: "3rem", padding: "2.5rem 2rem", background: "linear-gradient(135deg, #1e1b4b 0%, #1a2e4a 100%)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "radial-gradient(circle, rgba(139,92,246,0.2), transparent)", pointerEvents: "none" }} />
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", padding: "4px 12px", fontSize: "0.65rem", fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "1rem" }}>
              <Sparkles style={{ width: 9, height: 9 }} /> Powered by Gemini AI
            </div>
            <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: 10, position: "relative" }}>
              Your Next Interview Could Be Tomorrow.
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "0 0 1.5rem", lineHeight: 1.6, position: "relative" }}>
              AI writes your resume, optimizes it for ATS, and preps you for interviews — <strong style={{ color: "#c4b5fd" }}>all in one place.</strong>
            </p>
            <button onClick={onStart} className="hp-btn-primary" style={{ justifyContent: "center", background: "#4f46e5", position: "relative" }}>
              Start for Free — No Signup Needed <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      </section>

      {/* TEMPLATES */}
      <section id="templates" style={{ background: "#fff", padding: "5rem 2.5rem", borderTop: "1px solid #ebebeb" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "#b84a2e", marginBottom: "12px", fontWeight: 600 }}>Resume Templates</div>
              <h2 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "clamp(2rem, 3vw, 2.75rem)", fontWeight: 700, color: "#111", margin: 0 }}>
                Internship to Executive —<br /><span style={{ fontStyle: "italic", color: "#b84a2e" }}>There's a Template for You.</span>
              </h2>
            </div>
            <button onClick={onStart} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", fontWeight: 600, color: "#1a2e4a", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Preview all templates <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
          <div className="hp-templates-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
            {TEMPLATES.map(t => (
              <div key={t.id} className="hp-card" onClick={onStart} style={{ background: "#fff", border: "1px solid #e5e5e5", cursor: "pointer", position: "relative" }}>
                {t.premium && (
                  <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 1, display: "flex", alignItems: "center", gap: "4px", padding: "3px 8px", background: "#b84a2e", color: "#fff", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
                    <Crown style={{ width: 9, height: 9 }} /> Pro
                  </div>
                )}
                <div style={{ height: "175px", display: "flex", alignItems: "center", justifyContent: "center", background: t.accent + "0e", padding: "1rem" }}>
                  <div style={{ width: "90px", height: "118px", background: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.1)", padding: "10px", fontFamily: t.id === "technical" ? "'JetBrains Mono', monospace" : t.id === "classic" || t.id === "executive" ? "'Source Serif Pro', Georgia, serif" : "system-ui, sans-serif" }}>
                    <div style={{ fontWeight: 700, color: t.accent, fontSize: "7px", marginBottom: "3px" }}>NAME</div>
                    <div style={{ height: "1px", background: t.accent, marginBottom: "5px" }}></div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      <div style={{ height: "2px", background: "#ddd", borderRadius: "1px" }}></div>
                      <div style={{ height: "2px", background: "#e8e8e8", borderRadius: "1px", width: "80%" }}></div>
                      <div style={{ height: "2px", background: "#e8e8e8", borderRadius: "1px" }}></div>
                      <div style={{ height: "2px", background: "#ddd", borderRadius: "1px", width: "70%", marginTop: "4px" }}></div>
                      <div style={{ height: "2px", background: "#e8e8e8", borderRadius: "1px" }}></div>
                      <div style={{ height: "2px", background: "#e8e8e8", borderRadius: "1px", width: "85%" }}></div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "4px" }}>
                    <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>{t.name}</h3>
                    <span style={{ fontSize: "0.7rem", color: t.premium ? "#b84a2e" : "#999", fontWeight: t.premium ? 600 : 400 }}>{t.premium ? "Pro" : "Free"}</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#666", lineHeight: 1.5, margin: 0 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ background: "#1a2e4a", padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "#a78bfa", marginBottom: "14px", fontWeight: 700 }}>
              <Sparkles style={{ width: 11, height: 11 }} /> Pricing
            </div>
            <h2 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "clamp(2rem, 3vw, 2.75rem)", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>
              Unlock the Full AI Suite with Pro.
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>Affordable plans built for students &amp; job seekers. Start free, upgrade anytime.</p>
          </div>

          {/* Launch offer banner */}
          <div style={{ background: "linear-gradient(135deg, #b84a2e, #e05c38)", padding: "14px 24px", marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap", textAlign: "center" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>🚀 Launch Offer</span>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.875rem" }}>—</span>
            <span style={{ color: "#fff", fontSize: "0.875rem" }}>Download free without signup during launch · First <strong>199 users</strong> who sign up within 15 days keep higher download limits permanently · Pro at <strong>Rs. 99/month</strong></span>
            <button onClick={() => onUpgrade('monthly')} style={{ background: "#fff", color: "#b84a2e", border: "none", padding: "6px 18px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", letterSpacing: "0.03em" }}>Grab the offer →</button>
          </div>

          <div className="hp-pricing-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {/* Free */}
            <div style={{ background: "#fff", padding: "2rem", color: "#1a2e4a" }}>
              <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, marginBottom: "10px", color: "#888" }}>Free</div>
              <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "2.75rem", fontWeight: 700, lineHeight: 1, marginBottom: "4px" }}>Rs. 0</div>
              <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "1.5rem" }}>Free forever · No credit card needed</div>
              <div style={{ height: "1px", background: "#ebebeb", marginBottom: "1.5rem" }} />
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem 0", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "5 free templates (Classic, Modern, Simple ATS, Sleek, Canvas)",
                  "PDF & Word (.docx) downloads (3/day)",
                  "ATS Score Checker",
                  "Resume Preview",
                  "Job Role Suggestions Preview",
                  "Cover Letter Generator (PDF download — free after login)",
                ].map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.875rem", color: "#333", lineHeight: 1.4 }}>
                    <Check style={{ width: 15, height: 15, color: "#b84a2e", flexShrink: 0, marginTop: "2px" }} /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={onStart} style={{ width: "100%", padding: "0.875rem", border: "2px solid #1a2e4a", background: "#fff", color: "#1a2e4a", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
                Start for free
              </button>
            </div>

            {/* Pro Monthly */}
            <div style={{ background: "#fff", padding: "2rem", color: "#1a2e4a", position: "relative", boxShadow: "10px 10px 0 #b84a2e" }}>
              <div style={{ position: "absolute", top: "-13px", left: "20px", background: "#b84a2e", color: "#fff", padding: "4px 14px", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>Launch Offer</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, color: "#1a2e4a" }}>Pro Monthly</div>
                <Crown style={{ width: 13, height: 13, color: "#b84a2e" }} />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "2px" }}>
                <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "2.75rem", fontWeight: 700, lineHeight: 1 }}>Rs. 99</div>
                <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1.5rem", fontWeight: 400, color: "#bbb", textDecoration: "line-through" }}>Rs. 299</div>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "1.5rem" }}>per month · <span style={{ color: "#b84a2e", fontWeight: 600 }}>First 100 users — then Rs. 299/mo</span></div>
              <div style={{ height: "1px", background: "#ebebeb", marginBottom: "1.5rem" }} />
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem 0", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "All 10 premium templates (+ free 5 = 15 total)",
                  "AI Resume Summary Generator",
                  "Personalized Job Matches",
                  "AI Interview Simulator — 5 rounds, 26 AI questions",
                  "Up to 10 PDF & Word exports/day",
                  "Priority Support + all future features",
                ].map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.875rem", color: "#333", lineHeight: 1.4 }}>
                    <Check style={{ width: 15, height: 15, color: "#b84a2e", flexShrink: 0, marginTop: "2px" }} /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => onUpgrade('monthly')} style={{ width: "100%", padding: "0.875rem", border: "none", background: "#b84a2e", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.01em" }}>
                Get the Full AI Suite →
              </button>
            </div>

            {/* Yearly */}
            <div style={{ background: "#fff", padding: "2rem", color: "#1a2e4a", position: "relative", outline: "2px solid #15803d", outlineOffset: "-2px" }}>
              <div style={{ position: "absolute", top: "-13px", left: "20px", background: "#15803d", color: "#fff", padding: "4px 14px", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>Save 58% — Best Value</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, color: "#1a2e4a" }}>Pro Yearly</div>
                <Crown style={{ width: 13, height: 13, color: "#b84a2e" }} />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "2px" }}>
                <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "2.75rem", fontWeight: 700, lineHeight: 1 }}>Rs. 1,499</div>
                <div style={{ fontSize: "1rem", color: "#888", fontWeight: 400 }}>/year</div>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "1.5rem" }}>
                <span style={{ color: "#15803d", fontWeight: 600 }}>Rs. 125/month effective</span> · Save Rs. 2,089 vs regular Rs. 299/mo
              </div>
              <div style={{ height: "1px", background: "#ebebeb", marginBottom: "1.5rem" }} />
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem 0", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "Everything in Pro Monthly",
                  "All future templates included",
                  "Best value — pay once, use all year",
                  "Priority Support & early features",
                ].map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.875rem", color: "#333", lineHeight: 1.4 }}>
                    <Check style={{ width: 15, height: 15, color: "#15803d", flexShrink: 0, marginTop: "2px" }} /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => onUpgrade('yearly')} style={{ width: "100%", padding: "0.875rem", border: "none", background: "#1a2e4a", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.01em" }}>
                Get Hired Faster — Best Value →
              </button>
            </div>
          </div>

          {/* Trust note */}
          <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.78rem", marginTop: "2rem", margin: "2rem 0 0" }}>
            No hidden fees · Cancel anytime · Instant access after upgrade · Secured by Razorpay
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#fafaf9", borderTop: "1px solid #e8e8e8", padding: "1.5rem 2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 26, height: 26, background: "linear-gradient(135deg, #1a2e4a, #312e81)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles style={{ width: 13, height: 13, color: "#fff" }} />
          </div>
          <span style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontWeight: 700, color: "#1a2e4a" }}>Foliant</span>
          <span style={{ color: "#bbb", fontSize: "0.8rem" }}>· AI Resume Builder</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem 1rem" }}>
          <a href="/privacy" style={{ color: "#aaa", fontSize: "0.8rem", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => { e.target.style.color = '#1a2e4a'; }} onMouseLeave={e => { e.target.style.color = '#aaa'; }}>
            Privacy
          </a>
          <span style={{ color: "#ddd", fontSize: "0.75rem" }}>·</span>
          <a href="/terms" style={{ color: "#aaa", fontSize: "0.8rem", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => { e.target.style.color = '#1a2e4a'; }} onMouseLeave={e => { e.target.style.color = '#aaa'; }}>
            Terms
          </a>
          <span style={{ color: "#ddd", fontSize: "0.75rem" }}>·</span>
          <a href="/refund" style={{ color: "#aaa", fontSize: "0.8rem", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => { e.target.style.color = '#1a2e4a'; }} onMouseLeave={e => { e.target.style.color = '#aaa'; }}>
            Refunds
          </a>
          <span style={{ color: "#ddd", fontSize: "0.75rem" }}>·</span>
          <button
            onClick={onContactSupport}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "0.8rem", padding: 0, fontFamily: "inherit", transition: "color 0.15s" }}
            onMouseEnter={e => { e.target.style.color = '#1a2e4a'; }}
            onMouseLeave={e => { e.target.style.color = '#aaa'; }}
          >
            Contact Support
          </button>
          <span style={{ color: "#aaa", fontSize: "0.8rem" }}>&copy; 2026 Foliant. Built for job seekers.</span>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div style={{ padding: "1.5rem", background: "#fff", border: "1px solid #ebebeb" }}>
      <div style={{ width: "48px", height: "48px", background: "#1a2e4a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", flexShrink: 0 }}>
        {React.cloneElement(icon, { style: { width: "22px", height: "22px", color: "#fff" } })}
      </div>
      <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.5rem", color: "#1a1a1a", margin: "0 0 6px 0" }}>{title}</h3>
      <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "#666", margin: 0 }}>{desc}</p>
    </div>
  );
}
