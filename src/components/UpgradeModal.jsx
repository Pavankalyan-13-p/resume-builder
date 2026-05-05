import React from "react";
import { X, Crown, Check, Zap, ArrowRight } from "lucide-react";

const UPGRADE_MODAL_CSS = `
  .um-backdrop { position:fixed; inset:0; z-index:50; display:flex; align-items:center; justify-content:center;
    background:rgba(26,46,74,0.72); padding:20px; }
  .um-sheet { background:#fff; width:100%; max-width:400px; max-height:88vh;
    overflow-y:auto; border-radius:4px; box-shadow:0 20px 60px rgba(0,0,0,0.3);
    display:flex; flex-direction:column; }
  .um-header { background:#1a2e4a; padding:1.25rem 1.25rem 1.1rem; position:relative; flex-shrink:0; }
  .um-close { position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.1);
    border:none; cursor:pointer; color:#94a3b8; border-radius:3px; padding:5px;
    display:flex; align-items:center; justify-content:center; transition:background 0.15s; }
  .um-close:hover { background:rgba(255,255,255,0.2); color:#fff; }
  .um-body { padding:1.1rem 1.25rem 1.25rem; flex:1; overflow-y:auto; }
  .um-price { font-family:'Source Serif Pro',Georgia,serif; font-size:2.25rem; font-weight:700; color:#1a2e4a; line-height:1; }
  .um-strike { font-family:'Source Serif Pro',Georgia,serif; font-size:1.1rem; color:#ccc; text-decoration:line-through; }
  .um-features { list-style:none; padding:0; margin:0 0 1rem 0; display:flex; flex-direction:column; gap:7px; }
  .um-cta { width:100%; padding:0.8rem; border:none; cursor:pointer; font-weight:700;
    font-size:0.88rem; letter-spacing:0.02em; font-family:inherit; transition:opacity 0.15s;
    display:flex; align-items:center; justify-content:center; gap:7px; }
  .um-cta:hover { opacity:0.9; }
  @media (max-width: 480px) {
    .um-backdrop { padding:12px; align-items:flex-end; }
    .um-sheet { max-width:100%; max-height:82vh; border-radius:4px 4px 0 0; }
    .um-header { padding:1rem 1rem 0.9rem; }
    .um-body { padding:0.9rem 1rem 1.1rem; }
    .um-price { font-size:1.9rem; }
    .um-features { gap:6px; }
  }
`;

export default function UpgradeModal({ onClose, onUpgrade, user, plan }) {
  const isYearly = plan === 'yearly';
  const accent = isYearly ? "#15803d" : "#b84a2e";
  const ctaBg  = isYearly ? "#1a2e4a" : "#b84a2e";

  return (
    <>
      <style>{UPGRADE_MODAL_CSS}</style>
      <div className="um-backdrop" onClick={onClose}>
        <div className="um-sheet" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="um-header">
            <button className="um-close" onClick={onClose} aria-label="Close">
              <X style={{ width: 15, height: 15 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <Crown style={{ width: 15, height: 15, color: "#fbbf24" }} />
              <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#94a3b8", fontWeight: 700 }}>
                {isYearly ? "Pro Yearly &middot; Best Value" : "Pro Monthly &middot; Launch Offer"}
              </span>
            </div>
            <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "#fff", lineHeight: 1.25 }}>
              Get Hired Faster with Pro
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>
              {isYearly ? "Pay once, use all year - best value for job seekers." : "Premium templates, job access & priority support."}
            </div>
          </div>

          {/* Body */}
          <div className="um-body">

            {/* Offer pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: isYearly ? "#f0fdf4" : "#fff8f6",
              border: `1.5px solid ${accent}`, borderRadius: 3, padding: "6px 12px", marginBottom: "0.9rem" }}>
              <Zap style={{ width: 14, height: 14, color: accent }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: accent }}>
                {isYearly ? "Save 40% - Best Value" : "Launch Offer - Rs.99 for First 100 Users"}
              </span>
            </div>

            {/* Price row */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
              <span className="um-price">{isYearly ? "Rs.1,499" : "Rs.99"}</span>
              <span className="um-strike">{isYearly ? "Rs.3,588" : "Rs.299"}</span>
              <span style={{ fontSize: "0.82rem", color: "#888" }}>{isYearly ? "/year" : "/month"}</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#888", marginBottom: "0.9rem" }}>
              {isYearly
                ? <span><span style={{ color: "#15803d", fontWeight: 600 }}>Rs.125/month effective</span> &middot; Save Rs.2,089 vs monthly billing</span>
                : <span>Regular price Rs.299/month &middot; <span style={{ color: "#b84a2e", fontWeight: 600 }}>First 100 users only</span> &middot; Or Rs.1,499/year</span>}
            </div>

            <div style={{ height: 1, background: "#ebebeb", marginBottom: "0.9rem" }} />

            {/* Features */}
            <ul className="um-features">
              {(isYearly ? [
                "Everything in Pro Monthly",
                "All 11 premium templates",
                "Personalized Job Matches",
                "Cover Letter Generator (PDF download)",
                "Unlimited PDF & Word exports",
                "All future features + Priority Support",
              ] : [
                "All 11 premium templates",
                "Personalized Job Matches",
                "Cover Letter Generator (PDF download)",
                "Unlimited PDF & Word exports",
                "Import resume from PDF or Word",
                "Priority Support + all future features",
              ]).map(f => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.83rem", color: "#333" }}>
                  <Check style={{ width: 13, height: 13, color: accent, flexShrink: 0, marginTop: 2 }} /> {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button className="um-cta" onClick={onUpgrade} style={{ background: ctaBg, color: "#fff", marginBottom: 6 }}>
              {user
                ? (isYearly ? <>Get Hired Faster - Rs.1,499/year <ArrowRight style={{ width: 14, height: 14 }} /></> : <>Get Hired Faster with Pro <ArrowRight style={{ width: 14, height: 14 }} /></>)
                : <>Sign up &amp; Get Hired Faster <ArrowRight style={{ width: 14, height: 14 }} /></>}
            </button>
            {!isYearly && (
              <div style={{ textAlign: "center", fontSize: "0.72rem", color: "#64748b", marginBottom: 6 }}>
                Or get <strong style={{ color: "#15803d" }}>Yearly - Rs.1,499/year</strong> and save 40%
              </div>
            )}
            <p style={{ fontSize: "0.67rem", textAlign: "center", color: "#bbb", margin: 0 }}>
              No hidden fees &middot; Cancel anytime &middot; Instant access after upgrade
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
