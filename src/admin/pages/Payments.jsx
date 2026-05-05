import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { RefreshCw, Plus, CreditCard, Search } from 'lucide-react';

function fmt(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

const STATUS_CLASS = { completed:'bdg-ok', pending:'bdg-warn', failed:'bdg-err', refunded:'bdg-info' };

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [error, setError]       = useState('');
  const [showAdd, setShowAdd]   = useState(false);
  const [addBusy, setAddBusy]   = useState(false);
  const [form, setForm]         = useState({ email:'', amount:'', currency:'USD', status:'completed', transactionId:'', note:'' });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      let snap;
      try {
        snap = await getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc')));
      } catch {
        snap = await getDocs(collection(db, 'payments'));
      }
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addPayment = async (e) => {
    e.preventDefault();
    setAddBusy(true);
    try {
      const ref = await addDoc(collection(db, 'payments'), {
        ...form,
        amount: parseFloat(form.amount) || 0,
        createdAt: serverTimestamp(),
      });
      setPayments(prev => [{ id: ref.id, ...form, amount: parseFloat(form.amount)||0, createdAt: { seconds: Date.now()/1000 } }, ...prev]);
      setShowAdd(false);
      setForm({ email:'', amount:'', currency:'USD', status:'completed', transactionId:'', note:'' });
    } catch (e) { alert('Error: ' + e.message); }
    setAddBusy(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'payments', id), { status });
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch (e) { alert('Error: ' + e.message); }
  };

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.email?.toLowerCase().includes(q) || p.transactionId?.toLowerCase().includes(q);
    const matchF = filter === 'all' || p.status === filter;
    return matchQ && matchF;
  });

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);

  return (
    <div className="a-page">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'#0f172a' }}>Payments</h2>
          <p style={{ margin:'2px 0 0', fontSize:'0.78rem', color:'#94a3b8' }}>
            {payments.length} transactions · ${totalRevenue.toFixed(2)} total revenue
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="a-btn a-btn-ghost" onClick={load} disabled={loading}>
            <RefreshCw style={{ width:13, height:13 }} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button className="a-btn a-btn-primary" onClick={() => setShowAdd(true)}>
            <Plus style={{ width:13, height:13 }} /> Add Payment
          </button>
        </div>
      </div>

      {/* Revenue cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'0.75rem', marginBottom:'1.25rem' }}>
        {[
          { label:'Total Revenue',  value:`$${totalRevenue.toFixed(2)}`, color:'#10b981' },
          { label:'Completed',      value: payments.filter(p=>p.status==='completed').length, color:'#16a34a' },
          { label:'Pending',        value: payments.filter(p=>p.status==='pending').length, color:'#d97706' },
          { label:'Failed/Refunded',value: payments.filter(p=>['failed','refunded'].includes(p.status)).length, color:'#dc2626' },
        ].map(s => (
          <div key={s.label} className="a-card" style={{ padding:'0.875rem 1.1rem' }}>
            <div style={{ fontSize:'1.2rem', fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:'0.7rem', color:'#64748b', marginTop:3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:'1rem', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 200px', maxWidth:320 }}>
          <Search style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', width:14, height:14, color:'#94a3b8', pointerEvents:'none' }} />
          <input className="a-input" style={{ paddingLeft:32, width:'100%' }} placeholder="Search by email or transaction ID…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="a-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {error && <div style={{ padding:'0.75rem 1rem', background:'#fee2e2', borderRadius:6, color:'#991b1b', fontSize:'0.82rem', marginBottom:'1rem' }}>{error}</div>}

      <div className="a-card">
        <div className="ox">
          <table className="a-tbl">
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:'2.5rem' }}>
                  <RefreshCw className="spin" style={{ width:20, height:20, color:'#6366f1' }} />
                </td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign:'center', color:'#94a3b8', padding:'2.5rem', fontSize:'0.85rem' }}>
                  {payments.length === 0 ? 'No payments yet. Add your first payment record.' : 'No payments match your search.'}
                </td></tr>
              )}
              {!loading && filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontSize:'0.82rem' }}>
                    <div style={{ fontWeight:600, color:'#1e293b' }}>{p.email || '—'}</div>
                  </td>
                  <td style={{ fontWeight:700, color:'#1e293b' }}>${parseFloat(p.amount||0).toFixed(2)} <span style={{ fontWeight:400, fontSize:'0.72rem', color:'#94a3b8' }}>{p.currency||'USD'}</span></td>
                  <td>
                    <span className={`bdg ${STATUS_CLASS[p.status] || 'bdg-free'}`}>{p.status || 'unknown'}</span>
                  </td>
                  <td style={{ fontFamily:'monospace', fontSize:'0.75rem', color:'#475569' }}>{p.transactionId || '—'}</td>
                  <td style={{ fontSize:'0.78rem', color:'#64748b' }}>{fmt(p.createdAt)}</td>
                  <td style={{ fontSize:'0.78rem', color:'#64748b', maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.note || '—'}</td>
                  <td>
                    <select className="a-select" style={{ padding:'3px 7px', fontSize:'0.72rem' }}
                      value={p.status} onChange={e => updateStatus(p.id, e.target.value)}>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add payment modal */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div className="a-card" style={{ padding:'1.75rem', maxWidth:440, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.25rem' }}>
              <CreditCard style={{ width:20, height:20, color:'#6366f1' }} />
              <span style={{ fontWeight:700, color:'#0f172a', fontSize:'0.95rem' }}>Add Payment Record</span>
            </div>
            <form onSubmit={addPayment}>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div>
                  <label style={{ fontSize:'0.75rem', fontWeight:600, color:'#475569', display:'block', marginBottom:4 }}>User Email *</label>
                  <input className="a-input" style={{ width:'100%' }} required value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@example.com" />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 120px', gap:8 }}>
                  <div>
                    <label style={{ fontSize:'0.75rem', fontWeight:600, color:'#475569', display:'block', marginBottom:4 }}>Amount *</label>
                    <input className="a-input" style={{ width:'100%' }} required type="number" min="0" step="0.01"
                      value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="9.99" />
                  </div>
                  <div>
                    <label style={{ fontSize:'0.75rem', fontWeight:600, color:'#475569', display:'block', marginBottom:4 }}>Currency</label>
                    <select className="a-select" style={{ width:'100%' }} value={form.currency}
                      onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                      <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize:'0.75rem', fontWeight:600, color:'#475569', display:'block', marginBottom:4 }}>Status</label>
                  <select className="a-select" style={{ width:'100%' }} value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:'0.75rem', fontWeight:600, color:'#475569', display:'block', marginBottom:4 }}>Transaction ID</label>
                  <input className="a-input" style={{ width:'100%' }} value={form.transactionId}
                    onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))} placeholder="txn_abc123…" />
                </div>
                <div>
                  <label style={{ fontSize:'0.75rem', fontWeight:600, color:'#475569', display:'block', marginBottom:4 }}>Note</label>
                  <input className="a-input" style={{ width:'100%' }} value={form.note}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional note…" />
                </div>
              </div>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:'1.25rem' }}>
                <button type="button" className="a-btn a-btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="a-btn a-btn-primary" disabled={addBusy}>
                  {addBusy ? 'Saving…' : 'Add Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
