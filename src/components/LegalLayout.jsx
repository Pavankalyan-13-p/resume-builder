import React, { useEffect } from "react";
import { Sparkles } from "lucide-react";

export function LegalSection({ title, children }) {
  return (
    <section style={{ marginBottom: "2rem" }}>
      <h2 style={{
        fontFamily: "'Source Serif Pro', Georgia, serif",
        fontSize: "1.1rem", fontWeight: 700, color: "#1a2e4a",
        margin: "0 0 0.65rem", paddingBottom: "0.5rem",
        borderBottom: "1.5px solid #e8e8e8",
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function LP({ children }) {
  return (
    <p style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "#374151", margin: "0 0 0.8rem" }}>
      {children}
    </p>
  );
}

export function LegalList({ items }) {
  return (
    <ul style={{ margin: "0 0 0.8rem 1.25rem", padding: 0 }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "#374151", marginBottom: "0.25rem" }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

const LINK_STYLE = {
  color: "#9ca3af", fontSize: "0.8rem",
  textDecoration: "none", transition: "color 0.15s",
};

export default function LegalLayout({ title, lastUpdated, children }) {
  useEffect(() => {
    document.title = `${title} — Foliant`;
    return () => { document.title = "Foliant — AI Resume Builder"; };
  }, [title]);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#fafaf9", minHeight: "100vh", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .ll-back:hover { color: #fff !important; }
        .ll-footer-link:hover { color: #1a2e4a !important; }
        @media (max-width: 600px) {
          .ll-header-inner { padding: 0 1.25rem !important; }
          .ll-title-wrap { padding: 1.5rem 1.25rem !important; }
          .ll-main { padding: 1.75rem 1.25rem 3rem !important; }
          .ll-footer { padding: 1.25rem 1.25rem !important; }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header style={{ background: "#1a2e4a", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="ll-header-inner" style={{ maxWidth: 820, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 54, padding: "0 2rem" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 26, height: 26, background: "linear-gradient(135deg, #2d4a7a, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
              <Sparkles style={{ width: 13, height: 13, color: "#fff" }} />
            </div>
            <span style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontWeight: 700, color: "#fff", fontSize: "1rem" }}>Foliant</span>
          </a>
          <a href="/" className="ll-back" style={{ color: "#94a3b8", fontSize: "0.82rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 5, transition: "color 0.15s" }}>
            ← Back to home
          </a>
        </div>
      </header>

      {/* ── Page title ─────────────────────────────────────────────── */}
      <div className="ll-title-wrap" style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "2rem 2rem 1.75rem" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <h1 style={{
            fontFamily: "'Source Serif Pro', Georgia, serif",
            fontSize: "clamp(1.5rem, 3.5vw, 1.9rem)",
            fontWeight: 700, color: "#1a2e4a", margin: "0 0 0.4rem",
          }}>
            {title}
          </h1>
          <p style={{ fontSize: "0.78rem", color: "#9ca3af", margin: 0 }}>
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <main className="ll-main" style={{ maxWidth: 820, margin: "0 auto", padding: "2.5rem 2rem 4rem" }}>
        {children}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="ll-footer" style={{ borderTop: "1px solid #e8e8e8", background: "#fafaf9", padding: "1.5rem 2rem", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.6rem 1.25rem", flexWrap: "wrap", marginBottom: "0.6rem" }}>
          <a href="/privacy" className="ll-footer-link" style={LINK_STYLE}>Privacy Policy</a>
          <span style={{ color: "#e5e7eb", fontSize: "0.75rem" }}>|</span>
          <a href="/terms"   className="ll-footer-link" style={LINK_STYLE}>Terms &amp; Conditions</a>
          <span style={{ color: "#e5e7eb", fontSize: "0.75rem" }}>|</span>
          <a href="/refund"  className="ll-footer-link" style={LINK_STYLE}>Refund Policy</a>
        </div>
        <p style={{ fontSize: "0.72rem", color: "#c4c9d4", margin: 0 }}>
          &copy; {new Date().getFullYear()} Foliant. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
