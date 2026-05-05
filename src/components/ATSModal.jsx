import React from "react";
import { Check, X } from "lucide-react";

export default function ATSModal({ ats, onClose }) {
  const color = ats.score >= 80 ? "#15803d" : ats.score >= 60 ? "#b84a2e" : "#dc2626";
  const verdict = ats.score >= 80 ? "Excellent" : ats.score >= 60 ? "Needs polish" : "Needs work";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(26,46,74,0.6)" }} onClick={onClose}>
      <div className="bg-white w-full max-h-[90vh] overflow-y-auto scrollbar-thin" style={{ maxWidth: "min(672px, calc(100vw - 2rem))" }} onClick={e=>e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "#1a2e4a20" }}>
          <div>
            <h2 className="font-serif-display text-2xl font-bold" style={{ color: "#1a2e4a" }}>ATS Audit</h2>
            <p className="text-sm" style={{ color: "#666" }}>How your resume reads to Applicant Tracking Systems.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#faf7f2]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-6 mb-6 pb-6 border-b" style={{ borderColor: "#1a2e4a20" }}>
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="42" strokeWidth="6" fill="none" stroke="#1a2e4a15" />
                <circle cx="48" cy="48" r="42" strokeWidth="6" fill="none" stroke={color} strokeDasharray={264} strokeDashoffset={264 - (264 * ats.score) / 100} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="font-serif-display text-3xl font-bold" style={{ color }}>{ats.score}</div>
                <div className="text-[9px] uppercase tracking-widest" style={{ color: "#888" }}>/ 100</div>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color }}>{verdict}</div>
              <p className="text-sm" style={{ color: "#444" }}>
                {ats.score >= 80 ? "Your resume hits the marks ATS software looks for. Ready to submit." :
                 ats.score >= 60 ? "A few more adjustments and you'll be in great shape. Check the flagged items below." :
                 "Your resume needs work before it's ATS-ready. Focus on the failed checks first."}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {ats.checks.map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-3" style={{ background: c.passed ? "#f0fdf4" : "#fef2f2" }}>
                <div className="flex-shrink-0 mt-0.5">
                  {c.passed ? <Check className="w-5 h-5" style={{ color: "#15803d" }} /> : <X className="w-5 h-5" style={{ color: "#dc2626" }} />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{c.label}</div>
                  <div className="text-xs" style={{ color: "#666" }}>{c.detail}</div>
                </div>
                <div className="text-xs" style={{ color: "#888" }}>+{c.weight}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
