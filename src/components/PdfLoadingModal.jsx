import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";

const MESSAGES = [
  "Preparing your professional PDF...",
  "Launching PDF engine...",
  "Loading fonts and styles...",
  "Rendering resume layout...",
  "Generating PDF file...",
  "Polishing final output...",
  "Almost ready...",
  "Still working — nearly done...",
];

export default function PdfLoadingModal({ visible }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!visible) {
      setMsgIndex(0);
      setFade(true);
      return;
    }
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMsgIndex(prev => (prev + 1) % MESSAGES.length);
        setFade(true);
      }, 300);
    }, 2200);
    return () => clearInterval(id);
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(10,15,30,0.6)",
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "24px",
        padding: "52px 60px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "32px",
        boxShadow: "0 40px 100px rgba(0,0,0,0.3)",
        maxWidth: "400px", width: "90%",
        animation: "pdfModalIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>

        {/* Spinner + icon */}
        <div style={{ position: "relative", width: "80px", height: "80px" }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "3.5px solid #e5e7eb",
            borderTopColor: "#1a2e4a",
            borderRightColor: "#1a2e4a",
            animation: "pdfSpin 0.9s linear infinite",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              background: "linear-gradient(135deg, #1a2e4a 0%, #2d4a7a 100%)",
              borderRadius: "14px", padding: "10px",
              boxShadow: "0 4px 16px rgba(26,46,74,0.25)",
              animation: "pdfPulseIcon 2s ease-in-out infinite",
            }}>
              <FileText size={22} color="#fff" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "1.2rem", fontWeight: 700, color: "#111827",
            marginBottom: "10px", letterSpacing: "-0.01em",
          }}>
            Generating your PDF
          </div>
          <div style={{
            fontSize: "0.9rem", color: "#6b7280",
            transition: "opacity 0.3s ease",
            opacity: fade ? 1 : 0,
            minHeight: "1.5em", lineHeight: 1.5,
          }}>
            {MESSAGES[msgIndex]}
          </div>
        </div>

        {/* Bouncing dots */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: "9px", height: "9px", borderRadius: "50%",
              background: "#1a2e4a",
              animation: `pdfDot 1.4s ease-in-out ${i * 0.18}s infinite`,
            }} />
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.75rem", color: "#9ca3af", letterSpacing: "0.02em" }}>
            Usually ready in 10–20 seconds
          </div>
          <div style={{ fontSize: "0.7rem", color: "#c4c9d4", marginTop: "4px", letterSpacing: "0.01em" }}>
            First download of the day may take up to 60 s while the server warms up
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pdfSpin { to { transform: rotate(360deg); } }
        @keyframes pdfDot {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.75); }
          40%            { opacity: 1;    transform: scale(1.15); }
        }
        @keyframes pdfPulseIcon {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }
        @keyframes pdfModalIn {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
