import React, { useState, useEffect, useRef } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
  updateDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  X, MessageCircle, Send, ChevronLeft, CheckCircle,
  RefreshCw, Plus, Clock,
} from 'lucide-react';

// Normalize old-format (message + responses) and new-format (messages[]) tickets
function normalizeMessages(ticket) {
  if (ticket.messages?.length > 0) return ticket.messages;
  const msgs = [];
  if (ticket.message) {
    msgs.push({
      sender: 'user',
      text: ticket.message,
      createdAt: ticket.createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
    });
  }
  for (const r of ticket.responses ?? []) {
    msgs.push({
      sender: r.from === 'admin' ? 'admin' : 'user',
      text: r.text,
      createdAt: r.at ?? new Date().toISOString(),
    });
  }
  return msgs;
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtFull(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_COLOR = {
  open:     { bg: '#dbeafe', color: '#1d4ed8', label: 'Open' },
  replied:  { bg: '#ede9fe', color: '#6d28d9', label: 'Replied' },
  resolved: { bg: '#d1fae5', color: '#065f46', label: 'Resolved' },
  closed:   { bg: '#f1f5f9', color: '#475569', label: 'Closed' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLOR[status] ?? STATUS_COLOR.open;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 999,
      fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em',
      background: s.bg, color: s.color, textTransform: 'uppercase',
    }}>
      {s.label}
    </span>
  );
}

export default function MyTicketsModal({ user, onClose, onNewTicket }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Real-time ticket subscription for this user
  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    let q;
    try {
      q = query(
        collection(db, 'supportTickets'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
      );
    } catch {
      q = query(collection(db, 'supportTickets'), where('userId', '==', user.uid));
    }
    const unsub = onSnapshot(q,
      snap => { setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
      () => setLoading(false),
    );
    return unsub;
  }, [user?.uid]);

  // Keep selected ticket in sync with real-time updates
  useEffect(() => {
    if (!selected) return;
    const fresh = tickets.find(t => t.id === selected.id);
    if (fresh) setSelected(fresh);
  }, [tickets]); // eslint-disable-line

  // Scroll to bottom when thread opens or new message arrives
  const messages = selected ? normalizeMessages(selected) : [];
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, selected?.id]);

  // Mark unread as read when user opens thread
  useEffect(() => {
    if (selected?.unreadByUser) {
      updateDoc(doc(db, 'supportTickets', selected.id), { unreadByUser: false }).catch(() => {});
    }
  }, [selected?.id]); // eslint-disable-line

  const openTicket = (t) => {
    setSelected(t);
    setReply('');
    setSendError('');
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    setSendError('');
    const newMsg = {
      sender: 'user',
      text: reply.trim(),
      createdAt: new Date().toISOString(),
      senderName: user.name || user.email,
    };
    try {
      const existing = normalizeMessages(selected);
      await updateDoc(doc(db, 'supportTickets', selected.id), {
        messages: [...existing, newMsg],
        status: selected.status === 'closed' || selected.status === 'resolved' ? 'open' : selected.status,
        unreadByAdmin: true,
        updatedAt: serverTimestamp(),
      });
      setReply('');
    } catch {
      setSendError('Failed to send. Please try again.');
    }
    setSending(false);
  };

  const unreadCount = tickets.filter(t => t.unreadByUser).length;
  const isClosed = selected?.status === 'closed' || selected?.status === 'resolved';

  const overlay = { position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(26,46,74,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' };
  const modal   = { background: '#fff', width: '100%', maxWidth: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden' };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #ebebeb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {selected && (
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 4px', display: 'flex', alignItems: 'center', color: '#94a3b8', marginRight: 2 }}
              >
                <ChevronLeft style={{ width: 18, height: 18 }} />
              </button>
            )}
            <MessageCircle style={{ width: 18, height: 18, color: '#1a2e4a' }} />
            <div>
              <h2 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: '1.2rem', fontWeight: 700, color: '#1a2e4a', margin: 0, lineHeight: 1.2 }}>
                {selected ? selected.subject || '(no subject)' : 'My Support Tickets'}
              </h2>
              {selected && (
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <StatusBadge status={selected.status} />
                  <span>·</span>
                  <span>{selected.email}</span>
                </div>
              )}
              {!selected && unreadCount > 0 && (
                <div style={{ fontSize: '0.72rem', color: '#6d28d9', marginTop: 1 }}>
                  {unreadCount} new {unreadCount === 1 ? 'reply' : 'replies'}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!selected && (
              <button
                onClick={onNewTicket}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#1a2e4a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
              >
                <Plus style={{ width: 13, height: 13 }} /> New Ticket
              </button>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <X style={{ width: 18, height: 18, color: '#888' }} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        {!selected ? (
          /* ── Ticket list ── */
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <RefreshCw className="spin" style={{ width: 22, height: 22, color: '#6366f1' }} />
              </div>
            )}
            {!loading && tickets.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
                <MessageCircle style={{ width: 36, height: 36, color: '#cbd5e1', margin: '0 auto 1rem' }} />
                <div style={{ fontWeight: 600, color: '#475569', marginBottom: 6 }}>No tickets yet</div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
                  Submit a support request and track replies here.
                </div>
                <button
                  onClick={onNewTicket}
                  style={{ padding: '9px 20px', background: '#1a2e4a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                >
                  Contact Support
                </button>
              </div>
            )}
            {!loading && tickets.map(t => {
              const msgs = normalizeMessages(t);
              const lastMsg = msgs[msgs.length - 1];
              const isUnread = !!t.unreadByUser;
              return (
                <button
                  key={t.id}
                  onClick={() => openTicket(t)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '1rem 1.5rem', background: isUnread ? '#f5f3ff' : '#fff',
                    border: 'none', borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isUnread) e.currentTarget.style.background = '#fafaf9'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isUnread ? '#f5f3ff' : '#fff'; }}
                >
                  {/* Unread dot */}
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: isUnread ? '#6d28d9' : 'transparent', flexShrink: 0, marginTop: 6 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: isUnread ? 700 : 600, color: '#1e293b', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.subject || '(no subject)'}
                      </span>
                      <StatusBadge status={t.status} />
                    </div>
                    {lastMsg && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600, color: lastMsg.sender === 'admin' ? '#6d28d9' : '#475569' }}>
                          {lastMsg.sender === 'admin' ? 'Support: ' : 'You: '}
                        </span>
                        {lastMsg.text}
                      </div>
                    )}
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock style={{ width: 10, height: 10 }} />
                      {lastMsg ? fmtDate(lastMsg.createdAt) : fmtDate(t.createdAt?.toDate?.().toISOString())}
                      <span>· {msgs.length} message{msgs.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* ── Thread view ── */
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc' }}>
              {messages.map((m, i) => {
                const isAdmin = m.sender === 'admin';
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-start' : 'flex-end' }}>
                    <div style={{
                      maxWidth: '80%', padding: '0.7rem 0.9rem',
                      background: isAdmin ? '#fff' : '#1a2e4a',
                      color: isAdmin ? '#1e293b' : '#fff',
                      borderRadius: isAdmin ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                      fontSize: '0.85rem', lineHeight: 1.65,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                    }}>
                      {m.text}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 3, padding: '0 4px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontWeight: 600, color: isAdmin ? '#6d28d9' : '#64748b' }}>
                        {isAdmin ? 'Support' : 'You'}
                      </span>
                      · {fmtFull(m.createdAt)}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Reply input */}
            <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid #e2e8f0', flexShrink: 0, background: '#fff' }}>
              {isClosed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#64748b' }}>
                  <CheckCircle style={{ width: 14, height: 14, color: '#10b981' }} />
                  This ticket is {selected.status}. Sending a new message will reopen it.
                  <button
                    onClick={sendReply}
                    disabled={!reply.trim()}
                    style={{ marginLeft: 'auto', padding: '6px 14px', background: '#1a2e4a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                  >
                    Reply anyway
                  </button>
                </div>
              ) : null}
              {sendError && (
                <div style={{ fontSize: '0.78rem', color: '#b91c1c', marginBottom: 6 }}>{sendError}</div>
              )}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea
                  ref={textareaRef}
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendReply(); }}
                  placeholder={isClosed ? 'Send a follow-up…' : 'Type your reply… (Ctrl+Enter to send)'}
                  rows={2}
                  style={{
                    flex: 1, padding: '9px 12px', border: '1px solid #e0e0e0',
                    background: '#faf7f2', fontSize: '0.875rem', resize: 'none',
                    outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#1a2e4a'; }}
                  onBlur={e  => { e.target.style.borderColor = '#e0e0e0'; }}
                />
                <button
                  onClick={sendReply}
                  disabled={!reply.trim() || sending}
                  style={{
                    padding: '10px 14px', background: '#1a2e4a', color: '#fff', border: 'none',
                    cursor: reply.trim() && !sending ? 'pointer' : 'not-allowed',
                    opacity: reply.trim() && !sending ? 1 : 0.45,
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: '0.82rem', fontWeight: 600, transition: 'opacity 0.15s', flexShrink: 0,
                  }}
                >
                  {sending ? <RefreshCw style={{ width: 14, height: 14 }} className="spin" /> : <Send style={{ width: 14, height: 14 }} />}
                  {sending ? '' : 'Send'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
