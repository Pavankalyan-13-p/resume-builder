import React, { useState } from "react";
import { X, Lightbulb, CheckCircle } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config.js";

const CATEGORIES = [
  "Feature Request",
  "UI Improvement",
  "AI Feedback",
  "Bug Feedback",
  "General Suggestion",
];

export default function FeedbackModal({ user, onClose }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await addDoc(collection(db, "feedback"), {
        userId:   user?.uid   || null,
        email:    user?.email || "",
        name:     user?.name  || "",
        plan:     user?.plan  || "free",
        category,
        message:  message.trim(),
        status:   "new",
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('[feedback] Firestore write failed:', err.code, err.message);
      setError(
        err.code === 'permission-denied'
          ? 'Permission denied — please make sure you are signed in and try again.'
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(26,46,74,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={onClose}>
      <div
        style={{ background: "#fff", width: "100%", maxWidth: 460, boxShadow: "0 24px 64px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #ebebeb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Lightbulb style={{ width: 17, height: 17, color: "#b84a2e" }} />
            <h2 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "#1a2e4a", margin: 0 }}>
              Feedback &amp; Suggestions
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X style={{ width: 17, height: 17, color: "#888" }} />
          </button>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {submitted ? (
            /* ── Success state ─────────────────────────── */
            <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
              <CheckCircle style={{ width: 44, height: 44, color: "#15803d", margin: "0 auto 0.875rem" }} />
              <h3 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "#1a2e4a", margin: "0 0 0.5rem" }}>
                Thanks for your feedback!
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
                We read every submission and use it to improve the product.
              </p>
              <button
                onClick={onClose}
                style={{ padding: "9px 24px", background: "#1a2e4a", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", borderRadius: 4, fontFamily: "inherit" }}>
                Close
              </button>
            </div>
          ) : (
            /* ── Form ──────────────────────────────────── */
            <form onSubmit={handleSubmit}>
              <p style={{ fontSize: "0.83rem", color: "#666", lineHeight: 1.6, margin: "0 0 1.25rem" }}>
                Share an idea, flag something that feels off, or suggest how we can make this better. We read everything.
              </p>

              {/* Category */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#888", display: "block", marginBottom: 6 }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", background: "#faf7f2", fontSize: "0.9rem", color: "#1a1a1a", fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Message */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#888", display: "block", marginBottom: 6 }}>
                  Your Feedback <span style={{ color: "#b84a2e" }}>*</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder="Tell us what's on your mind…"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", background: "#faf7f2", fontSize: "0.875rem", lineHeight: 1.65, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                />
                <div style={{ textAlign: "right", fontSize: "0.68rem", color: "#bbb", marginTop: 3 }}>
                  {message.length} / 2000
                </div>
              </div>

              {error && (
                <p style={{ fontSize: "0.78rem", color: "#dc2626", margin: "0 0 0.75rem" }}>{error}</p>
              )}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ padding: "9px 16px", background: "#f5f5f5", color: "#555", border: "1px solid #e0e0e0", fontWeight: 500, fontSize: "0.85rem", cursor: "pointer", borderRadius: 4, fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  style={{ padding: "9px 20px", background: submitting || !message.trim() ? "#e5e7eb" : "#1a2e4a", color: submitting || !message.trim() ? "#9ca3af" : "#fff", border: "none", fontWeight: 700, fontSize: "0.875rem", cursor: submitting || !message.trim() ? "not-allowed" : "pointer", borderRadius: 4, fontFamily: "inherit", transition: "background 0.15s" }}>
                  {submitting ? "Sending…" : "Send Feedback"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
