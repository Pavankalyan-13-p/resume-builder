import React, { useState } from 'react';
import { X, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function SupportModal({ user, onClose, onViewTickets }) {
  const [subject, setSubject]     = useState('');
  const [message, setMessage]     = useState('');
  const [email, setEmail]         = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  const canSubmit = subject.trim() && message.trim() && email.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      await addDoc(collection(db, 'supportTickets'), {
        userId:       user?.uid || null,
        email:        email.trim(),
        subject:      subject.trim(),
        status:       'open',
        messages:     [{
          sender:    'user',
          text:      message.trim(),
          createdAt: new Date().toISOString(),
          senderName: user?.name || email.trim(),
        }],
        unreadByAdmin: true,
        unreadByUser:  false,
        createdAt:    serverTimestamp(),
        updatedAt:    serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('[support] Firestore write failed:', err.code, err.message);
      setError(
        err.code === 'permission-denied'
          ? 'Permission denied — please refresh and try again.'
          : 'Failed to submit ticket. Please try again.'
      );
    }
    setSubmitting(false);
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #e0e0e0',
    background: '#faf7f2', fontSize: '0.9rem', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  };
  const labelStyle = {
    fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em',
    color: '#888', display: 'block', marginBottom: 6,
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(26,46,74,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', width: '100%', maxWidth: 480,
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #ebebeb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageCircle style={{ width: 20, height: 20, color: '#1a2e4a' }} />
            <div>
            <h2 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: '1.35rem', fontWeight: 700, color: '#1a2e4a', margin: 0 }}>
              Contact Support
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
              to:{' '}
              <a href="mailto:foliantai@gmail.com" style={{ color: '#1a2e4a', textDecoration: 'none', fontWeight: 600 }}>
                foliantai@gmail.com
              </a>
            </div>
          </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X style={{ width: 18, height: 18, color: '#888' }} />
          </button>
        </div>

        <div style={{ padding: '1.75rem' }}>
          {submitted ? (
            /* ── Success state ── */
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle style={{ width: 28, height: 28, color: '#15803d' }} />
              </div>
              <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: '1.2rem', fontWeight: 700, color: '#1a2e4a', marginBottom: 8 }}>
                Ticket Submitted!
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.7, margin: '0 0 1.75rem' }}>
                We've received your message and will get back to you at{' '}
                <strong style={{ color: '#1a2e4a' }}>{email}</strong> as soon as possible.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {user && onViewTickets && (
                  <button
                    onClick={() => { onClose(); onViewTickets(); }}
                    style={{ padding: '10px 20px', background: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                  >
                    View My Tickets
                  </button>
                )}
                <button
                  onClick={onClose}
                  style={{ padding: '10px 32px', background: '#1a2e4a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* ── Form ── */
            <form onSubmit={handleSubmit}>
              {/* From email */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={labelStyle}>From</label>
                {user ? (
                  <div style={{ padding: '9px 12px', background: '#f5f5f5', color: '#888', fontSize: '0.875rem', border: '1px solid #e8e8e8' }}>
                    {user.email}
                  </div>
                ) : (
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#1a2e4a'; }}
                    onBlur={e  => { e.target.style.borderColor = '#e0e0e0'; }}
                  />
                )}
              </div>

              {/* Subject */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={labelStyle}>Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                  maxLength={120}
                  placeholder="Briefly describe your issue or question"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#1a2e4a'; }}
                  onBlur={e  => { e.target.style.borderColor = '#e0e0e0'; }}
                />
              </div>

              {/* Message */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Message *</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  maxLength={2000}
                  rows={5}
                  placeholder="Describe your issue in detail — steps to reproduce, what you expected, what happened…"
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={e => { e.target.style.borderColor = '#1a2e4a'; }}
                  onBlur={e  => { e.target.style.borderColor = '#e0e0e0'; }}
                />
                <div style={{ fontSize: '0.68rem', color: '#bbb', marginTop: 4, textAlign: 'right' }}>
                  {message.length}/2000
                </div>
              </div>

              {error && (
                <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', fontSize: '0.82rem', color: '#b91c1c', marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ padding: '10px 18px', background: '#f5f5f5', color: '#333', border: '1px solid #e0e0e0', cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !canSubmit}
                  style={{ padding: '10px 20px', background: '#1a2e4a', color: '#fff', border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7, opacity: canSubmit ? 1 : 0.5, transition: 'opacity 0.15s' }}
                >
                  {submitting ? 'Sending…' : <><Send style={{ width: 14, height: 14 }} /> Send Message</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
