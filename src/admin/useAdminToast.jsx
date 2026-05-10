import React, { useState, useCallback } from "react";
import { Check, X } from "lucide-react";

function AdminToast({ msg, type, onClose }) {
  const bg = type === "error" ? "#dc2626" : type === "success" ? "#15803d" : "#1e293b";
  return (
    <div style={{
      position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 99999,
      background: bg, color: "#fff", padding: "11px 18px 11px 14px",
      display: "flex", alignItems: "center", gap: "10px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)", borderRadius: "8px",
      fontSize: "0.875rem", fontWeight: 500, maxWidth: "420px",
      animation: "aToastIn 0.25s ease-out",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <style>{`@keyframes aToastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      <Check style={{ width: 15, height: 15, flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.75)", padding: "2px", lineHeight: 0 }}>
        <X style={{ width: 13, height: 13 }} />
      </button>
    </div>
  );
}

export function useAdminToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const toastEl = toast
    ? <AdminToast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
    : null;

  return { showToast, toastEl };
}
