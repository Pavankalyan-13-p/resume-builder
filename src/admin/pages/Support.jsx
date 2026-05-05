import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { RefreshCw, Plus, MessageSquare, Search, Send, X, CheckCircle } from 'lucide-react';

function fmt(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

const CATEGORY_CLASS = { bug:'bdg-err', feature:'bdg-info', billing:'bdg-warn', other:'bdg-free' };

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('open');
  const [error, setError]     = useState('');
  const [selected, setSelected] = useState(null); // ticket for reply panel
  const [reply, setReply]     = useState('');
  const [replyBusy, setReplyBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [form, setForm]       = useState({ email:'', subject:'', message:'', category:'other' });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      let snap;
      try {
        snap = await getDocs(query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc')));
      } catch {
        snap = await getDocs(collection(db, 'support_tickets'));
      }
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setReplyBusy(true);
    try {
      const responses = [...(selected.responses || []), {
        text: reply.trim(),
        from: 'admin',
        at: new Date().toISOString(),
      }];
      await updateDoc(doc(db, 'support_tickets', selected.id), {
        responses,
        status: 'replied',
        lastReplyAt: serverTimestamp(),
      });
      const updated = { ...selected, responses, status: 'replied' };
      setTickets(prev => prev.map(t => t.id === selected.id ? updated : t));
      setSelected(updated);
      setReply('');
    } catch (e) { alert('Error: ' + e.message); }
    setReplyBusy(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'support_tickets', id), { status });
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
    } catch (e) { alert('Error: ' + e.message); }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    setCreateBusy(true);
    try {
      const data = { ...form, status: 'open', responses: [], createdAt: serverTimestamp() };
      const ref = await addDoc(collection(db, 'support_tickets'), data);
      setTickets(prev => [{ id: ref.id, ...data, createdAt: { seconds: Date.now()/1000 } }, ...prev]);
      setShowCreate(false);
      setForm({ email:'', subject:'', message:'', category:'other' });
    } catch (e) { alert('Error: ' + e.message); }
    setCreateBusy(false);
  };

  const openCount   = tickets.filter(t => t.status === 'open').length;
  const repliedCount = tickets.filter(t => t.status === 'replied').length;
  const closedCount = tickets.filter(t => t.status === 'closed').length;

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchQ = !q || t.email?.toLowerCase().includes(q) || t.subject?.toLowerCase().includes(q);
    const matchF = filter === 'all' || t.status === filter;
    return matchQ && matchF;
  });

  return (
    <div className="a-page">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'#0f172a' }}>Support Tickets</h2>
          <p style={{ margin:'2px 0 0', fontSize:'0.78rem', color:'#94a3b8' }}>
            {openCount} open · {repliedCount} replied · {closedCount} closed
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="a-btn a-btn-ghost" onClick={load} disabled={loading}>
            <RefreshCw style={{ width:13, height:13 }} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button className="a-btn a-btn-primary" onClick={() => setShowCreate(true)}>
            <Plus style={{ width:13, height:13 }} /> New Ticket
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:'0.75rem', marginBottom:'1.25rem' }}>
        {[
          { label:'Open',    value: openCount,    color:'#0369a1', bg:'#e0f2fe' },
          { label:'Replied', value: repliedCount, color:'#6366f1', bg:'#ede9fe' },
          { label:'Closed',  value: closedCount,  color:'#64748b', bg:'#f1f5f9' },
          { label:'Total',   value: tickets.length, color:'#0f172a', bg:'#fff' },
        ].map(s => (
          <div key={s.label} className="a-card" style={{ padding:'0.875rem 1.1rem', background:s.bg }}>
            <div style={{ fontSize:'1.25rem', fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:'0.7rem', color:'#64748b', marginTop:3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:'1rem', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 200px', maxWidth:300 }}>
          <Search style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', width:14, height:14, color:'#94a3b8', pointerEvents:'none' }} />
          <input className="a-input" style={{ paddingLeft:32, width:'100%' }} placeholder="Search by email or subject…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="a-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="replied">Replied</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {error && <div style={{ padding:'0.75rem 1rem', background:'#fee2e2', borderRadius:6, color:'#991b1b', fontSize:'0.82rem', marginBottom:'1rem' }}>{error}</div>}

      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap:'1rem' }}>
        {/* Ticket list */}
        <div className="a-card">
          <div className="ox">
            <table className="a-tbl">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} style={{ textAlign:'center', padding:'2.5rem' }}>
                    <RefreshCw className="spin" style={{ width:20, height:20, color:'#6366f1' }} />
                  </td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign:'center', color:'#94a3b8', padding:'2.5rem', fontSize:'0.85rem' }}>
                    {tickets.length === 0 ? 'No support tickets yet' : 'No tickets match your search'}
                  </td></tr>
                )}
                {!loading && filtered.map(t => (
                  <tr key={t.id} style={{ cursor:'pointer', background: selected?.id === t.id ? '#f5f3ff' : undefined }}
                    onClick={() => { setSelected(t); setReply(''); }}>
                    <td style={{ fontSize:'0.82rem', fontWeight:600, color:'#1e293b' }}>{t.email || '—'}</td>
                    <td style={{ fontSize:'0.82rem', color:'#475569', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.subject || '—'}</td>
                    <td>
                      <span className={`bdg ${CATEGORY_CLASS[t.category] || 'bdg-free'}`}>{t.category || 'other'}</span>
                    </td>
                    <td>
                      <span className={`bdg ${t.status === 'open' ? 'bdg-open' : t.status === 'replied' ? 'bdg-info' : 'bdg-closed'}`}>
                        {t.status || 'open'}
                      </span>
                    </td>
                    <td style={{ fontSize:'0.78rem', color:'#64748b' }}>{fmt(t.createdAt)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <select className="a-select" style={{ padding:'3px 7px', fontSize:'0.72rem' }}
                        value={t.status || 'open'} onChange={e => updateStatus(t.id, e.target.value)}>
                        <option value="open">Open</option>
                        <option value="replied">Replied</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reply panel */}
        {selected && (
          <div className="a-card" style={{ display:'flex', flexDirection:'column', maxHeight:600 }}>
            <div style={{ padding:'0.875rem 1rem', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontWeight:700, color:'#0f172a', fontSize:'0.88rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{selected.subject || '(no subject)'}</div>
                <div style={{ fontSize:'0.72rem', color:'#94a3b8', marginTop:2 }}>{selected.email} · {fmt(selected.createdAt)}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', padding:4, flexShrink:0 }}>
                <X style={{ width:15, height:15, color:'#94a3b8' }} />
              </button>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'0.875rem 1rem', display:'flex', flexDirection:'column', gap:10 }}>
              {/* Original message */}
              <div style={{ background:'#f8fafc', borderRadius:6, padding:'0.75rem', fontSize:'0.82rem', color:'#334155', lineHeight:1.6 }}>
                <div style={{ fontSize:'0.7rem', color:'#94a3b8', marginBottom:4, fontWeight:600 }}>USER MESSAGE</div>
                {selected.message || '(no message)'}
              </div>

              {/* Responses */}
              {(selected.responses || []).map((r, i) => (
                <div key={i} style={{
                  background: r.from === 'admin' ? '#ede9fe' : '#f8fafc',
                  borderRadius:6, padding:'0.75rem', fontSize:'0.82rem',
                  color:'#334155', lineHeight:1.6,
                  alignSelf: r.from === 'admin' ? 'flex-end' : 'flex-start',
                  maxWidth:'90%',
                }}>
                  <div style={{ fontSize:'0.68rem', color:'#94a3b8', marginBottom:4, fontWeight:600 }}>
                    {r.from === 'admin' ? '🛡 ADMIN' : '👤 USER'} · {r.at ? new Date(r.at).toLocaleString() : ''}
                  </div>
                  {r.text}
                </div>
              ))}
            </div>

            {/* Reply input */}
            <div style={{ padding:'0.75rem 1rem', borderTop:'1px solid #f1f5f9' }}>
              {selected.status === 'closed' ? (
                <div style={{ display:'flex', alignItems:'center', gap:6, color:'#64748b', fontSize:'0.8rem' }}>
                  <CheckCircle style={{ width:14, height:14, color:'#10b981' }} />
                  Ticket closed.
                  <button className="a-btn a-btn-ghost" style={{ padding:'3px 8px', fontSize:'0.72rem' }} onClick={() => updateStatus(selected.id, 'open')}>Reopen</button>
                </div>
              ) : (
                <div style={{ display:'flex', gap:6 }}>
                  <textarea className="a-textarea" style={{ flex:1, resize:'none', height:60, fontSize:'0.82rem' }}
                    placeholder="Type your reply…" value={reply} onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendReply(); }} />
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    <button className="a-btn a-btn-primary" style={{ padding:'6px 10px' }} disabled={!reply.trim() || replyBusy} onClick={sendReply}>
                      <Send style={{ width:13, height:13 }} />
                    </button>
                    <button className="a-btn a-btn-ghost" style={{ padding:'5px 10px', fontSize:'0.7rem' }} onClick={() => updateStatus(selected.id, 'closed')}>
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create ticket modal */}
      {showCreate && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div className="a-card" style={{ padding:'1.75rem', maxWidth:440, width:'100%' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.25rem' }}>
              <MessageSquare style={{ width:20, height:20, color:'#6366f1' }} />
              <span style={{ fontWeight:700, color:'#0f172a', fontSize:'0.95rem' }}>Create Support Ticket</span>
            </div>
            <form onSubmit={createTicket}>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div>
                  <label style={{ fontSize:'0.75rem', fontWeight:600, color:'#475569', display:'block', marginBottom:4 }}>User Email *</label>
                  <input className="a-input" style={{ width:'100%' }} required value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@example.com" />
                </div>
                <div>
                  <label style={{ fontSize:'0.75rem', fontWeight:600, color:'#475569', display:'block', marginBottom:4 }}>Category</label>
                  <select className="a-select" style={{ width:'100%' }} value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="billing">Billing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:'0.75rem', fontWeight:600, color:'#475569', display:'block', marginBottom:4 }}>Subject *</label>
                  <input className="a-input" style={{ width:'100%' }} required value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Briefly describe the issue" />
                </div>
                <div>
                  <label style={{ fontSize:'0.75rem', fontWeight:600, color:'#475569', display:'block', marginBottom:4 }}>Message *</label>
                  <textarea className="a-textarea" style={{ width:'100%', height:90 }} required value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Full description of the issue…" />
                </div>
              </div>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:'1.25rem' }}>
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
