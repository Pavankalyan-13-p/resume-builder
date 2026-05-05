import React, { useState } from "react";
import {
  FileText, Check, X, Menu, ArrowRight, Crown, Zap, Shield,
  Star, Download, Target, Sparkles, ExternalLink,
  Briefcase, Upload, GraduationCap, Edit3, Eye, ChevronRight
} from "lucide-react";
import { TEMPLATES } from "../data/resumeData.js";
export default function HomePage({ user, onSignIn, onSignUp, onLogout, onStart, onUpgrade, onOpenProfile }) {
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
        .hp-feat-badge-pro { position: absolute; top: 12px; right: 12px; font-size: 0.58rem; fontWeight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 2px 7px; background: #b84a2e; color: #fff; }
        .hp-feat-badge-soon { position: absolute; top: 12px; right: 12px; font-size: 0.58rem; fontWeight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 2px 7px; background: #6366f1; color: #fff; }
        .hp-stats-strip { display: flex; align-items: center; justify-content: center; gap: 3rem; flex-wrap: wrap; }
        @media (max-width: 768px) { .hp-stats-strip { gap: 1.5rem; padding: 1.25rem 1.25rem !important; } }
        .hp-problem-bar { background: #fff7ed; border-left: 3px solid #b84a2e; padding: 0.875rem 1.25rem; margin-bottom: 1.75rem; font-size: 0.88rem; color: #7c2d12; font-weight: 500; line-height: 1.55; }
      `}</style>

      {/* LAUNCH ANNOUNCEMENT BANNER */}
      <div style={{ background: "linear-gradient(90deg, #1a2e4a 0%, #243d60 100%)", padding: "9px 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#b84a2e", color: "#fff", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", padding: "2px 8px" }}>
          🚀 Launch Offer
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
      <nav className="hp-nav" style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.82)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: "1px solid rgba(232,232,232,0.7)", padding: "0 2.5rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 34, height: 34, background: "#1a2e4a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FileText style={{ width: 16, height: 16, color: "#fff" }} />
          </div>
          <span style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontWeight: 700, fontSize: "1.15rem", color: "#1a2e4a", letterSpacing: "-0.01em" }}>Foliant</span>
        </div>
        {/* Nav links - hidden on mobile, shown as dropdown when open */}
        <div className={`hp-nav-links${mobileMenuOpen ? " hp-open" : ""}`} style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <a href="#features" className="hp-nav-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#templates" className="hp-nav-link" onClick={() => setMobileMenuOpen(false)}>Templates</a>
          <a href="#pricing" className="hp-nav-link" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          {/* Extra items visible only in mobile menu */}
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
          {/* Hamburger - hidden on desktop via CSS */}
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
          {/* Problem-aware badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "#fff1ee", border: "1px solid #fcd5c9", fontSize: "0.72rem", fontWeight: 700, color: "#b84a2e", marginBottom: "1.25rem", letterSpacing: "0.02em" }}>
            Trusted by students &amp; job seekers to land interviews faster
          </div>

          {/* Problem callout */}
          <div className="hp-problem-bar">
            Most resumes get rejected in <strong>6 seconds</strong> by an ATS bot - before a human ever reads them.
          </div>

          {/* H1 */}
          <h1 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "clamp(2.6rem, 4vw, 4.25rem)", fontWeight: 700, lineHeight: 1.05, margin: "0 0 1.5rem 0", color: "#111", letterSpacing: "-0.02em" }}>
            Your Resume Should<br />Open Doors -<br /><span style={{ color: "#b84a2e", fontStyle: "italic" }}>Not Just Look Good.</span>
          </h1>

          {/* Subtext */}
          <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "#555", margin: "0 0 2.25rem 0", maxWidth: "520px" }}>
            Build resumes that <strong style={{ color: "#1a2e4a" }}>pass ATS filters</strong>, impress recruiters, and help you land interviews faster. From freshers to senior professionals - we help you build <strong style={{ color: "#1a2e4a" }}>confidence</strong>, not just documents.
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
            <button onClick={onStart} className="hp-btn-primary" style={{ flex: "1 1 auto", justifyContent: "center", fontSize: "0.92rem" }}>
              Get Hired Faster - It's Free <ArrowRight style={{ width: 15, height: 15 }} />
            </button>
            <button onClick={onStart} className="hp-btn-secondary" style={{ flex: "1 1 auto", justifyContent: "center" }}>
              Browse All Templates
            </button>
          </div>

          {/* Trust micro-signals */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {[
              "Free PDF - No signup",
              "Live ATS Score",
              "Job Match Engine",
              "11 Pro Templates",
            ].map(f => (
              <span key={f} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#666" }}>
                <Check style={{ width: 13, height: 13, color: "#b84a2e", flexShrink: 0 }} /> {f}
              </span>
            ))}
          </div>
        </div>

        {/* Preview card - relatable job seeker profile */}
        <div className="hp-preview-card" style={{ position: "relative", paddingTop: "16px", paddingRight: "16px" }}>
          <div style={{ position: "absolute", top: 0, right: 0, left: "16px", bottom: "16px", border: "2px solid #b84a2e", zIndex: 0 }}></div>
          <div style={{ position: "relative", zIndex: 1, background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.14)", padding: "2rem", fontFamily: "'Source Serif Pro', Georgia, serif" }}>
            <div style={{ borderBottom: "2px solid #1a2e4a", paddingBottom: "14px", marginBottom: "14px" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a2e4a", marginBottom: "2px" }}>Geetha_Venkat</div>
              <div style={{ fontSize: "0.8rem", color: "#666", fontStyle: "italic" }}>Software Engineer &middot; React / Node.js</div>
              <div style={{ fontSize: "0.72rem", color: "#888", marginTop: "4px", fontFamily: "system-ui, sans-serif" }}>Geetha_venkat@email.com &middot; Bangalore, India</div>
            </div>
            <div style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, color: "#1a2e4a", marginBottom: "8px", fontFamily: "system-ui, sans-serif" }}>Experience</div>
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1a1a1a" }}>Frontend Developer</div>
              <div style={{ fontSize: "0.72rem", fontStyle: "italic", color: "#666" }}>Infosys &middot; 2022 - Present</div>
              <div style={{ fontSize: "0.72rem", color: "#444", marginTop: "5px", lineHeight: 1.5, fontFamily: "system-ui, sans-serif" }}>
                - Built React dashboard used by 50,000+ users<br />
                - Reduced page load by 40% via code splitting
              </div>
            </div>
            <div style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, color: "#1a2e4a", marginBottom: "6px", fontFamily: "system-ui, sans-serif" }}>Skills</div>
            <div style={{ fontSize: "0.72rem", color: "#444", fontFamily: "system-ui, sans-serif" }}>React &middot; Node.js &middot; TypeScript &middot; MongoDB &middot; AWS</div>
          </div>
          {/* ATS score */}
          <div style={{ position: "absolute", bottom: 0, right: 0, background: "#fff", padding: "8px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", border: "2px solid #b84a2e", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: 700, color: "#1a2e4a", zIndex: 2 }}>
            <Target style={{ width: 14, height: 14, color: "#b84a2e" }} /> ATS Score: 91
          </div>
          {/* Job match badge */}
          <div style={{ position: "absolute", top: 28, left: -4, background: "#f0fdf4", border: "1.5px solid #86efac", padding: "5px 11px", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.7rem", fontWeight: 700, color: "#15803d", zIndex: 2 }}>
            <Briefcase style={{ width: 10, height: 10 }} /> 7 Role Matches Found
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <div style={{ background: "#1a2e4a", padding: "1.5rem 2.5rem" }}>
        <div className="hp-stats-strip" style={{ maxWidth: "960px", margin: "0 auto" }}>
          {[
            { num: "10,000+", label: "Resumes Created" },
            { num: "95%",     label: "ATS Pass Rate" },
            { num: "4.8 *",   label: "User Rating" },
            { num: "4",       label: "Job Platforms" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center", padding: "0.25rem 1.5rem", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1.75rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="hp-features-section" style={{ background: "#fff", borderTop: "1px solid #ebebeb", borderBottom: "1px solid #ebebeb", padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "#b84a2e", marginBottom: "14px", fontWeight: 600 }}>Everything you need</div>
            <h2 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "clamp(2rem, 3vw, 2.75rem)", fontWeight: 700, color: "#111", margin: "0 0 14px 0" }}>
              Land More Interviews.<br /><span style={{ color: "#b84a2e", fontStyle: "italic" }}>Faster.</span>
            </h2>
            <p style={{ color: "#666", fontSize: "1rem", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
              Built for students, freshers, and professionals who want <strong style={{ color: "#1a2e4a" }}>real results</strong> - not just good-looking documents.
            </p>
          </div>

          <div className="hp-features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>

            {/* 1 - ATS Score */}
            <div className="hp-feat-card">
              <div style={{ width: 44, height: 44, background: "#1a2e4a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Target style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>ATS Score Checker</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                Get a real-time score with <strong>specific improvement tips</strong> - action verbs, keyword gaps, formatting issues, and contact completeness. Stop guessing, start improving.
              </p>
            </div>

            {/* 2 - Templates */}
            <div className="hp-feat-card">
              <div style={{ width: 44, height: 44, background: "#b84a2e", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <FileText style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>11 Premium Resume Templates</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                From Basic Professional to Executive, Tech Pro, Fresher, and Two-Column. <strong>Preview all templates free</strong> - export premium ones with Pro. Recruiter-tested, ATS-optimised.
              </p>
            </div>

            {/* 3 - Job Suggestions */}
            <div className="hp-feat-card">
              <div style={{ width: 44, height: 44, background: "#14532d", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Sparkles style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Smart Career Fit Engine</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                AI scans your resume and surfaces the <strong>career paths you're genuinely qualified for</strong> - with a match score and the exact skills driving it. No guesswork, just clarity.
              </p>
            </div>

            {/* 4 - Job Openings */}
            <div className="hp-feat-card" style={{ borderColor: "#fde68a", background: "#fffbeb" }}>
              <span className="hp-feat-badge-pro">Pro</span>
              <div style={{ width: 44, height: 44, background: "#92400e", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Briefcase style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Job Openings Access</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                One click to <strong>live job listings on LinkedIn, Indeed, Naukri &amp; Internshala</strong> - filtered to your exact matched role. Stop searching manually. Start applying.
              </p>
            </div>

            {/* 5 - PDF Downloads */}
            <div className="hp-feat-card">
              <div style={{ width: 44, height: 44, background: "#0f4c81", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Download style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Unlimited PDF Downloads</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                Export your resume as a <strong>pixel-perfect, ATS-clean PDF</strong> any time. No account required. No watermarks. No limits. Just download and apply.
              </p>
            </div>

            {/* 6 - Resume Import */}
            <div className="hp-feat-card" style={{ borderColor: "#fde68a", background: "#fffbeb" }}>
              <span className="hp-feat-badge-pro">Pro</span>
              <div style={{ width: 44, height: 44, background: "#6d28d9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Upload style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Resume Import (PDF / Word)</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                Already have a resume? <strong>Upload your old PDF or .docx</strong> and we'll parse your data automatically - so you can upgrade your design in seconds, not hours.
              </p>
            </div>

            {/* 7 - Fresher Templates */}
            <div className="hp-feat-card">
              <div style={{ width: 44, height: 44, background: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <GraduationCap style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Internship &amp; Placement Templates</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                Dedicated <strong>education-first layouts</strong> for students, freshers, and new graduates. Highlight your projects, internships, and academics exactly the way recruiters expect.
              </p>
            </div>

            {/* 8 - Word Export */}
            <div className="hp-feat-card" style={{ borderColor: "#fde68a", background: "#fffbeb" }}>
              <span className="hp-feat-badge-pro">Pro</span>
              <div style={{ width: 44, height: 44, background: "#1e5faa", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <FileText style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Word (.docx) Export</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                Some recruiters specifically ask for Word files. <strong>Download your resume as .docx</strong> instantly - formatted, clean, and ready to submit without re-formatting.
              </p>
            </div>

            {/* 9 - Cover Letter */}
            <div className="hp-feat-card">
              <div style={{ width: 44, height: 44, background: "#b84a2e", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Edit3 style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Cover Letter Generator</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                A <strong>tailored cover letter</strong> generated from your resume in seconds - choose your tone, preview, edit, and download as a professional PDF. Free for all signed-in users.
              </p>
            </div>

            {/* 10 - Interview Prep */}
            <div className="hp-feat-card" style={{ borderColor: "#ede9fe", background: "#f5f3ff" }}>
              <span className="hp-feat-badge-pro">Pro</span>
              <div style={{ width: 44, height: 44, background: "#6d28d9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Star style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Interview Simulator</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                A <strong>full practice experience</strong> built from your resume - questions appear one by one with typing animation, answers stay blurred until you're ready, then track your confidence score round by round.
              </p>
            </div>

            {/* 11 - Live Preview */}
            <div className="hp-feat-card">
              <div style={{ width: 44, height: 44, background: "#374151", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Eye style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Live A4 Preview</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                <strong>WYSIWYG, real-time rendering</strong> in true A4 proportions as you type. What you see in the browser is exactly what gets printed. No layout surprises after download.
              </p>
            </div>

            {/* 12 - Auto-save */}
            <div className="hp-feat-card">
              <div style={{ width: 44, height: 44, background: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                <Shield style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1rem", fontWeight: 700, margin: "0 0 6px", color: "#111" }}>Auto-Save Across Sessions</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.65, margin: 0 }}>
                <strong>Never lose your work.</strong> Every change is saved instantly - close your laptop, switch devices, come back days later. Your resume is waiting exactly where you left it.
              </p>
            </div>

          </div>

          {/* Bottom CTA inside features */}
          <div style={{ textAlign: "center", marginTop: "3rem", padding: "2rem", background: "#f8faff", border: "1px solid #e2e8f0" }}>
            <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1.4rem", fontWeight: 700, color: "#1a2e4a", marginBottom: 8 }}>
              Build Your Future, Not Just Your Resume.
            </div>
            <p style={{ color: "#666", fontSize: "0.9rem", margin: "0 0 1.25rem", lineHeight: 1.6 }}>
              From students to professionals - <strong>stop just building resumes, start getting hired faster.</strong>
            </p>
            <button onClick={onStart} className="hp-btn-primary" style={{ justifyContent: "center" }}>
              Start for Free - No Signup Needed <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      </section>

      {/* TEMPLATES */}
      <section id="templates" className="hp-templates-section" style={{ padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "#b84a2e", marginBottom: "12px", fontWeight: 600 }}>Resume Templates</div>
              <h2 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "clamp(2rem, 3vw, 2.75rem)", fontWeight: 700, color: "#111", margin: 0 }}>
                Internship to Executive -<br /><span style={{ fontStyle: "italic", color: "#b84a2e" }}>There's a Template for You.</span>
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
      <section id="pricing" className="hp-pricing-section" style={{ background: "#1a2e4a", padding: "5rem 2.5rem" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "#b84a2e", marginBottom: "14px", fontWeight: 600 }}>Pricing</div>
            <h2 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "clamp(2rem, 3vw, 2.75rem)", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>Get Hired Faster - with Pro.</h2>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>Affordable plans built for students &amp; job seekers. Start free, upgrade anytime.</p>
          </div>

          {/* Launch offer banner */}
          <div style={{ background: "linear-gradient(135deg, #b84a2e, #e05c38)", padding: "14px 24px", marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap", textAlign: "center" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>🚀 Launch Offer</span>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.875rem" }}>—</span>
            <span style={{ color: "#fff", fontSize: "0.875rem" }}>Download free without signup during launch &middot; First <strong>199 users</strong> who sign up within 15 days keep higher download limits permanently &middot; Pro at <strong>Rs. 99/month</strong></span>
            <button onClick={() => onUpgrade('monthly')} style={{ background: "#fff", color: "#b84a2e", border: "none", padding: "6px 18px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", letterSpacing: "0.03em" }}>Grab the offer -&gt;</button>
          </div>

          <div className="hp-pricing-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {/* Free */}
            <div style={{ background: "#fff", padding: "2rem", color: "#1a2e4a" }}>
              <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, marginBottom: "10px", color: "#888" }}>Free</div>
              <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "2.75rem", fontWeight: 700, lineHeight: 1, marginBottom: "4px" }}>Rs. 0</div>
              <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "1.5rem" }}>Free forever &middot; No credit card needed</div>
              <div style={{ height: "1px", background: "#ebebeb", marginBottom: "1.5rem" }} />
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem 0", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "3 free templates (Classic, Modern, Simple ATS)",
                  "Unlimited PDF downloads",
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
              <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "1.5rem" }}>per month &middot; <span style={{ color: "#b84a2e", fontWeight: 600 }}>First 100 users - then Rs. 299/mo</span></div>
              <div style={{ height: "1px", background: "#ebebeb", marginBottom: "1.5rem" }} />
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem 0", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "All 11 premium templates",
                  "Personalized Job Matches",
                  "Interview Simulator — 50+ personalised questions",
                  "Unlimited PDF & Word exports",
                  "Import resume from PDF or Word",
                  "Priority Support + all future features",
                ].map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.875rem", color: "#333", lineHeight: 1.4 }}>
                    <Check style={{ width: 15, height: 15, color: "#b84a2e", flexShrink: 0, marginTop: "2px" }} /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => onUpgrade('monthly')} style={{ width: "100%", padding: "0.875rem", border: "none", background: "#b84a2e", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.01em" }}>
                Get Hired Faster with Pro -&gt;
              </button>
            </div>

            {/* Yearly */}
            <div style={{ background: "#fff", padding: "2rem", color: "#1a2e4a", position: "relative", outline: "2px solid #15803d", outlineOffset: "-2px" }}>
              <div style={{ position: "absolute", top: "-13px", left: "20px", background: "#15803d", color: "#fff", padding: "4px 14px", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>Save 40% - Best Value</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, color: "#1a2e4a" }}>Pro Yearly</div>
                <Crown style={{ width: 13, height: 13, color: "#b84a2e" }} />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "2px" }}>
                <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "2.75rem", fontWeight: 700, lineHeight: 1 }}>Rs. 1,499</div>
                <div style={{ fontSize: "1rem", color: "#888", fontWeight: 400 }}>/year</div>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "1.5rem" }}>
                <span style={{ color: "#15803d", fontWeight: 600 }}>Rs. 125/month effective</span> &middot; Save Rs. 2,089 vs monthly
              </div>
              <div style={{ height: "1px", background: "#ebebeb", marginBottom: "1.5rem" }} />
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem 0", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  "Everything in Pro Monthly",
                  "All future templates included",
                  "Best value - pay once, use all year",
                  "Priority Support & early features",
                ].map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.875rem", color: "#333", lineHeight: 1.4 }}>
                    <Check style={{ width: 15, height: 15, color: "#15803d", flexShrink: 0, marginTop: "2px" }} /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => onUpgrade('yearly')} style={{ width: "100%", padding: "0.875rem", border: "none", background: "#1a2e4a", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.01em" }}>
                Get Hired Faster - Best Value -&gt;
              </button>
            </div>
          </div>

          {/* Trust note */}
          <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.78rem", marginTop: "2rem", margin: "2rem 0 0" }}>
            No hidden fees &middot; Cancel anytime &middot; Instant access after upgrade
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="hp-footer" style={{ background: "#fafaf9", borderTop: "1px solid #e8e8e8", padding: "1.75rem 2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 26, height: 26, background: "#1a2e4a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText style={{ width: 13, height: 13, color: "#fff" }} />
          </div>
          <span style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontWeight: 700, color: "#1a2e4a" }}>Foliant</span>
          <span style={{ color: "#bbb", fontSize: "0.8rem" }}>&middot; Get Hired Faster</span>
        </div>
        <div style={{ color: "#aaa", fontSize: "0.8rem" }}>&copy; 2026 Foliant. Built for job seekers.</div>
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
