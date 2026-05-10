import React, { useState } from "react";
import { FileText, Plus, Edit2, Trash2, Copy, X, Clock, Download } from "lucide-react";

function timeAgo(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function MyResumesModal({ resumes, loading, onClose, onEdit, onDownload, onDelete, onDuplicate, onNew }) {
  const [confirmId, setConfirmId]       = useState(null);
  const [deletingId, setDeletingId]     = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await onDelete(id);
      setConfirmId(null);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (r) => {
    setDuplicatingId(r.id);
    await onDuplicate(r);
    setDuplicatingId(null);
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "48px 16px 32px", overflowY: "auto",
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 780,
        boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
        animation: "mrModalIn 0.28s cubic-bezier(0.34,1.4,0.64,1) both",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px 18px", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>My Resumes</h2>
            <p style={{ margin: "2px 0 0", fontSize: "0.76rem", color: "#94a3b8" }}>
              {loading ? "Loading…" : `${resumes.length} resume${resumes.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onNew}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#1a2e4a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}
            >
              <Plus style={{ width: 14, height: 14 }} /> New Resume
            </button>
            <button
              onClick={onClose}
              style={{ padding: 8, background: "#f1f5f9", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center" }}
            >
              <X style={{ width: 16, height: 16, color: "#64748b" }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px 28px" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8", fontSize: "0.88rem" }}>Loading your resumes…</div>
          )}

          {!loading && resumes.length === 0 && (
            <div style={{ textAlign: "center", padding: "52px 24px" }}>
              <FileText style={{ width: 44, height: 44, color: "#e2e8f0", margin: "0 auto 14px", display: "block" }} />
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#475569", marginBottom: 6 }}>No resumes yet</div>
              <div style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: 22 }}>Create your first resume to get started</div>
              <button onClick={onNew} style={{ padding: "10px 22px", background: "#1a2e4a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "0.88rem", fontWeight: 600 }}>
                Create Resume
              </button>
            </div>
          )}

          {!loading && resumes.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 12 }}>
              {resumes.map(r => (
                <div key={r.id} style={{ border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "16px", background: "#fafafa", position: "relative" }}>
                  {/* Card header */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 38, height: 38, background: "#1a2e4a", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FileText style={{ width: 18, height: 18, color: "#fff" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.title || r.resumeData?.personal?.name || "Untitled Resume"}
                      </div>
                      <div style={{ fontSize: "0.73rem", color: "#94a3b8", marginTop: 3, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        {r.templateId && <span style={{ textTransform: "capitalize", background: "#f1f5f9", padding: "1px 6px", borderRadius: 4 }}>{r.templateId}</span>}
                        {r.updatedAt && (
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Clock style={{ width: 10, height: 10 }} /> {timeAgo(r.updatedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Inline delete confirmation */}
                  {confirmId === r.id ? (
                    <div style={{ background: "#fee2e2", borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: "0.78rem", color: "#991b1b", fontWeight: 500 }}>
                        {deletingId === r.id ? "Deleting…" : "Delete this resume?"}
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => setConfirmId(null)}
                          disabled={deletingId === r.id}
                          style={{ padding: "4px 10px", background: "#fff", border: "1px solid #fca5a5", borderRadius: 5, cursor: deletingId === r.id ? "not-allowed" : "pointer", fontSize: "0.75rem", color: "#374151", opacity: deletingId === r.id ? 0.5 : 1 }}
                        >Cancel</button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          style={{ padding: "4px 10px", background: "#dc2626", border: "none", borderRadius: 5, cursor: deletingId === r.id ? "not-allowed" : "pointer", fontSize: "0.75rem", color: "#fff", fontWeight: 600, opacity: deletingId === r.id ? 0.7 : 1, minWidth: 52 }}
                        >
                          {deletingId === r.id ? "…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => onEdit(r)}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "7px", background: "#1a2e4a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}
                      >
                        <Edit2 style={{ width: 12, height: 12 }} /> Edit
                      </button>
                      <button onClick={() => onDownload(r)} title="Download PDF" style={{ padding: "7px 11px", background: "#f1f5f9", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center" }}>
                        <Download style={{ width: 13, height: 13, color: "#475569" }} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(r)}
                        disabled={duplicatingId === r.id}
                        title="Duplicate"
                        style={{ padding: "7px 11px", background: "#f1f5f9", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center" }}
                      >
                        <Copy style={{ width: 13, height: 13, color: duplicatingId === r.id ? "#cbd5e1" : "#475569" }} />
                      </button>
                      <button
                        onClick={() => setConfirmId(r.id)}
                        title="Delete"
                        style={{ padding: "7px 11px", background: "#fff0f0", border: "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center" }}
                      >
                        <Trash2 style={{ width: 13, height: 13, color: "#dc2626" }} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes mrModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
}
