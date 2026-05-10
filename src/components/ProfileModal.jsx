import React, { useState } from "react";
import { X, Crown, LogOut, MessageCircle } from "lucide-react";

export default function ProfileModal({ user, onClose, onUpdate, onLogout, onDeleteAccount, onContactSupport }) {
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onUpdate({ displayName: name.trim() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const avatarBg = user?.plan === "pro" ? "#b84a2e" : "#1a2e4a";
  const initial = (user?.name || "?")[0].toUpperCase();

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(26,46,74,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={onClose}>
      <div style={{ background: "#fff", width: "100%", maxWidth: "480px", boxShadow: "0 24px 64px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #ebebeb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1.4rem", fontWeight: 700, color: "#1a2e4a", margin: 0 }}>Your Profile</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}><X style={{ width: 18, height: 18, color: "#888" }} /></button>
        </div>

        <div style={{ padding: "1.75rem" }}>
          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.75rem" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: avatarBg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "2rem", fontWeight: 700, flexShrink: 0 }}>
              {initial}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1a1a1a" }}>{user?.name}</div>
              <div style={{ fontSize: "0.85rem", color: "#888", marginTop: "2px" }}>{user?.email}</div>
              <div style={{ marginTop: "6px" }}>
                {user?.plan === "pro" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#b84a2e", color: "#fff", padding: "2px 10px", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    <Crown style={{ width: 9, height: 9 }} /> Pro
                  </span>
                ) : (
                  <span style={{ display: "inline-block", background: "#edf2f7", color: "#1a2e4a", padding: "2px 10px", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Free Plan</span>
                )}
                {user?.plan === "pro" && user?.premiumExpiresAt && (() => {
                  const exp = user.premiumExpiresAt;
                  const d   = exp.toDate ? exp.toDate() : new Date((exp.seconds || 0) * 1000);
                  return (
                    <span style={{ marginLeft: 6, fontSize: "0.7rem", color: "#888" }}>
                      · Renews {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  );
                })()}
                {user?.provider === "google" && (
                  <span style={{ marginLeft: "6px", display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "0.7rem", color: "#888" }}>
                    <svg width="12" height="12" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/></svg>
                    Google
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Display name edit */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#888", display: "block", marginBottom: "6px" }}>Display name</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && save()}
                style={{ flex: 1, padding: "8px 12px", border: "1px solid #e0e0e0", background: "#faf7f2", fontSize: "0.9rem", outline: "none" }}
              />
              <button
                onClick={save}
                disabled={saving || name.trim() === user?.name || !name.trim()}
                style={{ padding: "8px 16px", background: saved ? "#15803d" : "#1a2e4a", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, opacity: name.trim() === user?.name || !name.trim() ? 0.5 : 1 }}
              >
                {saving ? "..." : saved ? "Saved!" : "Save"}
              </button>
            </div>
          </div>

          {/* Email (read-only) */}
          <div style={{ marginBottom: "1.75rem" }}>
            <label style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#888", display: "block", marginBottom: "6px" }}>Email</label>
            <div style={{ padding: "8px 12px", background: "#f5f5f5", color: "#888", fontSize: "0.9rem" }}>{user?.email}</div>
          </div>

          <div style={{ height: "1px", background: "#ebebeb", margin: "0 0 1.25rem 0" }} />

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={onContactSupport}
              style={{ padding: "10px 16px", background: "#f5f5f5", color: "#1a2e4a", border: "1px solid #e0e0e0", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}
            >
              <MessageCircle style={{ width: 15, height: 15 }} /> Contact Support
            </button>
            <button
              onClick={onLogout}
              style={{ padding: "10px 16px", background: "#f5f5f5", color: "#333", border: "1px solid #e0e0e0", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}
            >
              <LogOut style={{ width: 15, height: 15 }} /> Sign out of this device
            </button>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{ padding: "10px 16px", background: "#fff5f5", color: "#dc2626", border: "1px solid #fecaca", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}
              >
                Delete account & all data
              </button>
            ) : (
              <div style={{ padding: "12px", background: "#fef2f2", border: "1px solid #fecaca" }}>
                <p style={{ fontSize: "0.825rem", color: "#dc2626", margin: "0 0 10px 0", fontWeight: 500 }}>This will permanently delete your account and all resume data. There's no undo.</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={onDeleteAccount} style={{ flex: 1, padding: "8px", background: "#dc2626", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>Yes, delete everything</button>
                  <button onClick={() => setConfirmDelete(false)} style={{ padding: "8px 16px", background: "#fff", border: "1px solid #e0e0e0", cursor: "pointer", fontSize: "0.8rem" }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
