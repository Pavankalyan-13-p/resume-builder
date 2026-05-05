import React from "react";
import { Check, X } from "lucide-react";

export default function Toast({ msg, type = "success", onClose }) {
  const bg = type === "success" ? "#15803d" : type === "error" ? "#dc2626" : "#1a2e4a";
  return (
    <div style={{
      position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 99999,
      background: bg, color: "#fff", padding: "12px 20px 12px 16px",
      display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      fontSize: "0.875rem", fontWeight: 500, maxWidth: "420px", animation: "slideDown 0.25s ease-out",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      <Check style={{ width: 16, height: 16, flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.8)", padding: "2px" }}>
        <X style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
}
