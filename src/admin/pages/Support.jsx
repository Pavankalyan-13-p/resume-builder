import React, { useState, useEffect, useRef } from 'react';
import {
  collection, addDoc, updateDoc, doc, serverTimestamp,
  query, orderBy, onSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { RefreshCw, Plus, MessageSquare, Search, Send, X, CheckCircle, Wifi } from 'lucide-react';
import { useAdminToast } from '../useAdminToast.jsx';

const COLLECTION = 'supportTickets';

function fmt(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_BDG = { open: 'bdg-open', replied: 'bdg-info', closed: 'bdg-closed', resolved: 'bdg-ok' };

export default function SupportPage() {
  const { showToast, toastEl } = useAdminToast();
  const [tickets, setTickets]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('open');
  const [selected, setSelected]   = useState(null);
  const [reply, setReply]         = useState('');
  const [replyBusy, setReplyBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [form, setForm] = useState({ email: '', subject: '', message: '', category: 'other' });
  const [tick, setTick] = useState(0); // increment to re-subscribe
  const unsubRef = useRef(null);

  // ── Real-time subscription ────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError('');

    if (unsubRef.current) unsubRef.current();

    let q;
    try {
      q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    } catch {
      q = collection(db, COLLECTION);
    }

    unsubRef.current = onSnapshot(
      q,
      snap => {
        setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      err => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [tick]);

  // Keep selected in sync with real-time updates (don't interrupt active reply)
  useEffect(() => {
    if (!selected || replyBusy) return;
    const refreshed = tickets.find(t => t.id === selected.id);
    if (refreshed) setSelected(refreshed);
  }, [tickets]); // eslint-disable-line

  // ── Actions ───────────────────────────────────────────────────────────────
  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setReplyBusy(true);
    try {
      const responses = [
        ...(selected.responses || []),
        { text: reply.trim(), from: 'admin', at: new Date().toISOString() },
      ];
      await updateDoc(doc(db, COLLECTION, selected.id), {
        responses,
        status: 'replied',
        lastReplyAt: serverTimestamp(),
      });
      // Optimistic update so panel reflects immediately
      const updated = { ...selected, responses, status: 'replied' };
      setSelected(updated);
      setReply('');
      showToast('Reply sent', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to send reply', 'error');
    }
    setReplyBusy(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, COLLECTION, id), { status, updatedAt: serverTimestamp() });
      // Optimistic local update
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
    } catch (e) {
      showToast(e.message || 'Failed to update status', 'error');
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    setCreateBusy(true);
    try {
      await addDoc(collection(db, COLLECTION), {
        ...form,
        userId: null,
        status: 'open',
        responses: [],
        createdAt: serverTimestamp(),
      });
      setShowCreate(false);
      setForm({ email: '', subject: '', message: '', category: 'other' });
      showToast('Ticket created', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to create ticket', 'error');
    }
    setCreateBusy(false);
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const openCount     = tickets.filter(t => t.status === 'open').length;
  const repliedCount  = tickets.filter(t => t.status === 'replied').length;
  const closedCount   = tickets.filter(t => t.status === 'closed' || t.status === 'resolved').length;

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchQ = !q || t.email?.toLowerCase().includes(q) || t.subject?.toLowerCase().includes(q);
    const matchF = filter === 'all' || t.status === filter;
    return matchQ && matchF;
  });

  return (
    <div className="a-page">
      {toastEl}

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Support Tickets</h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Wifi style={{ width: 11, height: 11, color: '#10b981' }} />
            Live · {openCount} open · {repliedCount} replied · {closedCount} closed
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="a-btn a-btn-ghost" onClick={() => setTick(t => t + 1)} disabled={loading}>
            <RefreshCw style={{ width: 13, height: 13 }} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button className="a-btn a-btn-primary" onClick={() => setShowCreate(true)}>
            <Plus style={{ width: 13, height: 13 }} /> New Ticket
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Open',    value: openCount,       color: '#0369a1', bg: '#e0f2fe' },
          { label: 'Replied', value: repliedCount,    color: '#6366f1', bg: '#ede9fe' },
          { label: 'Closed',  value: closedCount,     color: '#64748b', bg: '#f1f5f9' },
          { label: 'Total',   value: tickets.length,  color: '#0f172a', bg: '#fff'    },
        ].map(s => (
          <div key={s.label} className="a-card" style={{ padding: '0.875rem 1.1rem', background: s.bg }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
          <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8', pointerEvents: 'none' }} />
          <input className="a-input" style={{ paddingLeft: 32, width: '100%' }}
            placeholder="Search by email or subject…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="a-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="replied">Replied</option>
          <option value="closed">Closed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', borderRadius: 6, color: '#991b1b', fontSize: '0.82rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Main grid: ticket list + reply panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1rem', alignItems: 'start' }}>

        {/* Ticket list */}
        <div className="a-card">
          <div className="ox">
            <table className="a-tbl">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <RefreshCw className="spin" style={{ width: 20, height: 20, color: '#6366f1' }} />
                  </td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '2.5rem', fontSize: '0.85rem' }}>
                    {tickets.length === 0 ? 'No support tickets yet' : 'No tickets match your search'}
                  </td></tr>
                )}
                {!loading && filtered.map(t => (
                  <tr
                    key={t.id}
                    style={{ cursor: 'pointer', background: selected?.id === t.id ? '#f5f3ff' : undefined }}
                    onClick={() => { setSelected(t); setReply(''); }}
                  >
                    <td style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                      <div>{t.email || '—'}</div>
                      {t.userId && <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>uid: {t.userId.slice(0, 8)}…</div>}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#475569', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.subject || '—'}
                    </td>
                    <td>
                      <span className={`bdg ${STATUS_BDG[t.status] || 'bdg-free'}`}>{t.status || 'open'}</span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>{fmt(t.createdAt)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        className="a-select"
                        style={{ padding: '3px 7px', fontSize: '0.72rem' }}
                        value={t.status || 'open'}
                        onChange={e => updateStatus(t.id, e.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="replied">Replied</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reply / detail panel */}
        {selected && (
          <div className="a-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: 620, position: 'sticky', top: 70 }}>
            {/* Panel header */}
            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexShrink: 0 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selected.subject || '(no subject)'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                  {selected.email} · {fmt(selected.createdAt)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span className={`bdg ${STATUS_BDG[selected.status] || 'bdg-free'}`}>{selected.status || 'open'}</span>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <X style={{ width: 15, height: 15, color: '#94a3b8' }} />
                </button>
              </div>
            </div>

            {/* Message thread */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Original user message */}
              <div style={{ background: '#f8fafc', borderRadius: 6, padding: '0.75rem', fontSize: '0.82rem', color: '#334155', lineHeight: 1.65 }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: 5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  User Message
                </div>
                {selected.message || '(no message)'}
              </div>

              {/* Response history */}
              {(selected.responses || []).map((r, i) => (
                <div
                  key={i}
                  style={{
                    background: r.from === 'admin' ? '#ede9fe' : '#f8fafc',
                    borderRadius: 6,
                    padding: '0.75rem',
                    fontSize: '0.82rem',
                    color: '#334155',
                    lineHeight: 1.65,
                    alignSelf: r.from === 'admin' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: 5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {r.from === 'admin' ? '🛡 Admin' : '👤 User'} · {r.at ? new Date(r.at).toLocaleString() : ''}
                  </div>
                  {r.text}
                </div>
              ))}
            </div>

            {/* Reply input */}
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
              {selected.status === 'closed' || selected.status === 'resolved' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.8rem' }}>
                  <CheckCircle style={{ width: 14, height: 14, color: '#10b981' }} />
                  Ticket {selected.status}.
                  <button className="a-btn a-btn-ghost" style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                    onClick={() => updateStatus(selected.id, 'open')}>
                    Reopen
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <textarea
                    className="a-textarea"
                    style={{ flex: 1, resize: 'none', height: 64, fontSize: '0.82rem' }}
                    placeholder="Type a reply… (Ctrl+Enter to send)"
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendReply(); }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <button
                      className="a-btn a-btn-primary"
                      style={{ padding: '6px 10px' }}
                      disabled={!reply.trim() || replyBusy}
                      onClick={sendReply}
                    >
                      <Send style={{ width: 13, height: 13 }} />
                    </button>
                    <button
                      className="a-btn a-btn-success"
                      style={{ padding: '5px 10px', fontSize: '0.7rem' }}
                      onClick={() => updateStatus(selected.id, 'resolved')}
                      title="Mark resolved"
                    >
                      <CheckCircle style={{ width: 12, height: 12 }} />
                    </button>
                    <button
                      className="a-btn a-btn-ghost"
                      style={{ padding: '5px 10px', fontSize: '0.7rem' }}
                      onClick={() => updateStatus(selected.id, 'closed')}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create ticket modal (admin-created tickets) */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="a-card" style={{ padding: '1.75rem', maxWidth: 440, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
              <MessageSquare style={{ width: 20, height: 20, color: '#6366f1' }} />
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Create Support Ticket</span>
            </div>
            <form onSubmit={createTicket}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>User Email *</label>
                  <input className="a-input" style={{ width: '100%' }} required
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="user@example.com" />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Category</label>
                  <select className="a-select" style={{ width: '100%' }}
                    value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="billing">Billing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Subject *</label>
                  <input className="a-input" style={{ width: '100%' }} required
                    value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Briefly describe the issue" />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Message *</label>
                  <textarea className="a-textarea" style={{ width: '100%', height: 90 }} required
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Full description…" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="button" className="a-btn a-btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="a-btn a-btn-primary" disabled={createBusy}>
                  {createBusy ? 'Creating…' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
