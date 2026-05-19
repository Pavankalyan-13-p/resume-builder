import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Loader2, MessageSquare } from 'lucide-react';

const COLLECTION = 'feedback';

const CAT_COLORS = {
  'Feature Request':  { bg: '#dbeafe', color: '#1e40af' },
  'UI Improvement':   { bg: '#cffafe', color: '#0e7490' },
  'AI Feedback':      { bg: '#ede9fe', color: '#6d28d9' },
  'Bug Feedback':     { bg: '#fee2e2', color: '#991b1b' },
  'General Suggestion': { bg: '#d1fae5', color: '#065f46' },
};

const STATUS_COLORS = {
  new:      { bg: '#dbeafe', color: '#1e40af', label: 'New' },
  reviewed: { bg: '#d1fae5', color: '#065f46', label: 'Reviewed' },
};

function fmtDate(ts) {
  if (!ts) return '—';
  try {
    const d = ts.toDate ? ts.toDate() : new Date((ts.seconds || 0) * 1000);
    const diff = Date.now() - d.getTime();
    if (diff < 60000)     return 'Just now';
    if (diff < 3600000)   return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000)  return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 172800000) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return '—'; }
}

export default function FeedbackAdminPage() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch]       = useState('');

  useEffect(() => {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const markReviewed = async (id) => {
    await updateDoc(doc(db, COLLECTION, id), { status: 'reviewed' });
    if (selected?.id === id) setSelected(s => ({ ...s, status: 'reviewed' }));
  };

  const allCats = [...new Set(items.map(i => i.category).filter(Boolean))].sort();

  const visible = items.filter(it => {
    if (catFilter !== 'all' && it.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!it.email?.toLowerCase().includes(q) && !it.message?.toLowerCase().includes(q) && !it.category?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const newCount      = items.filter(i => i.status === 'new' || !i.status).length;
  const reviewedCount = items.filter(i => i.status === 'reviewed').length;

  return (
    <div className="a-page">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total',    value: items.length,  bg: '#f8fafc', col: '#1e293b' },
          { label: 'New',      value: newCount,      bg: '#eff6ff', col: '#1d4ed8' },
          { label: 'Reviewed', value: reviewedCount, bg: '#f0fdf4', col: '#15803d' },
        ].map(s => (
          <div key={s.label} className="a-card" style={{ padding: '14px 18px', background: s.bg }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.col, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search email or message…"
          className="a-input"
          style={{ flex: 1, minWidth: 180 }}
        />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="a-select">
          <option value="all">All categories</option>
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        {/* List */}
        <div className="a-card" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: 10 }}>
              <Loader2 className="spin" style={{ width: 20, height: 20, color: '#6366f1' }} />
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading…</span>
            </div>
          ) : visible.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <MessageSquare style={{ width: 36, height: 36, color: '#cbd5e1', margin: '0 auto 0.75rem' }} />
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No feedback yet</div>
            </div>
          ) : (
            <div className="ox">
              <table className="a-tbl">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Category</th>
                    <th>Preview</th>
                    <th>Plan</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(item => {
                    const catStyle = CAT_COLORS[item.category] || { bg: '#f1f5f9', color: '#475569' };
                    const isNew    = !item.status || item.status === 'new';
                    const isActive = selected?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelected(isActive ? null : item)}
                        style={{ cursor: 'pointer', background: isActive ? '#f5f3ff' : undefined }}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1e293b' }}>{item.email || '—'}</div>
                          {item.name && <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.name}</div>}
                        </td>
                        <td>
                          <span className="bdg" style={{ background: catStyle.bg, color: catStyle.color }}>{item.category || '—'}</span>
                        </td>
                        <td style={{ maxWidth: 260 }}>
                          <span style={{ fontSize: '0.82rem', color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.message}
                          </span>
                        </td>
                        <td>
                          <span className={`bdg ${item.plan === 'pro' ? 'bdg-pro' : 'bdg-free'}`}>{item.plan || 'free'}</span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: '#64748b' }}>{fmtDate(item.createdAt)}</td>
                        <td>
                          {isNew ? (
                            <button
                              className="a-btn a-btn-ghost"
                              style={{ fontSize: '0.72rem', padding: '3px 10px' }}
                              onClick={ev => { ev.stopPropagation(); markReviewed(item.id); }}>
                              Mark reviewed
                            </button>
                          ) : (
                            <span className="bdg bdg-ok">Reviewed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="a-card" style={{ width: 320, flexShrink: 0, padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>Full Feedback</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2, lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b' }}>{selected.email || '—'}</div>
              {selected.name && <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{selected.name}</div>}
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>{fmtDate(selected.createdAt)}</div>
            </div>

            {(() => {
              const s = CAT_COLORS[selected.category] || { bg: '#f1f5f9', color: '#475569' };
              return <span className="bdg" style={{ background: s.bg, color: s.color, marginBottom: 14, display: 'inline-flex' }}>{selected.category}</span>;
            })()}

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '12px 14px', marginTop: 10, marginBottom: 14 }}>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#1e293b', margin: 0, whiteSpace: 'pre-wrap' }}>{selected.message}</p>
            </div>

            {(!selected.status || selected.status === 'new') && (
              <button
                className="a-btn a-btn-success"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => markReviewed(selected.id)}>
                Mark as Reviewed
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
