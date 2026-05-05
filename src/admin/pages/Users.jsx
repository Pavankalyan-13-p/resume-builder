import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Search, RefreshCw, Crown, Trash2, UserX } from 'lucide-react';

const PROVIDER_LABEL = { 'google.com': 'Google', 'password': 'Email' };

function fmt(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

export default function UsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all'); // all | free | premium
  const [busy, setBusy]       = useState('');    // uid of user being mutated
  const [error, setError]     = useState('');
  const [confirm, setConfirm] = useState(null);  // { uid, email, action }

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setUsers(list);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const togglePremium = async (u) => {
    setBusy(u.id);
    try {
      const next = !u.isPremium;
      await updateDoc(doc(db, 'users', u.id), {
        isPremium: next,
        ...(next ? { upgradedAt: serverTimestamp() } : { downgradedAt: serverTimestamp() }),
      });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isPremium: next } : x));
    } catch (e) { alert('Error: ' + e.message); }
    setBusy('');
  };

  const deleteUser = async (uid) => {
    setBusy(uid);
    try {
      await deleteDoc(doc(db, 'users', uid));
      setUsers(prev => prev.filter(u => u.id !== uid));
    } catch (e) { alert('Error: ' + e.message); }
    setBusy(''); setConfirm(null);
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || u.email?.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q);
    const matchF = filter === 'all' || (filter === 'premium' ? u.isPremium : !u.isPremium);
    return matchQ && matchF;
  });

  return (
    <div className="a-page">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'#0f172a' }}>Users <span style={{ fontWeight:400, fontSize:'0.85rem', color:'#94a3b8' }}>({users.length})</span></h2>
          <p style={{ margin:'2px 0 0', fontSize:'0.78rem', color:'#94a3b8' }}>Manage all registered users</p>
        </div>
        <button className="a-btn a-btn-ghost" onClick={load} disabled={loading}>
          <RefreshCw style={{ width:13, height:13 }} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:'1rem', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 200px', maxWidth:340 }}>
          <Search style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', width:14, height:14, color:'#94a3b8', pointerEvents:'none' }} />
          <input className="a-input" style={{ paddingLeft:32, width:'100%' }} placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="a-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {error && <div style={{ padding:'0.75rem 1rem', background:'#fee2e2', borderRadius:6, color:'#991b1b', fontSize:'0.82rem', marginBottom:'1rem' }}>{error}</div>}

      {/* Table */}
      <div className="a-card">
        <div className="ox">
          <table className="a-tbl">
            <thead>
              <tr>
                <th>User</th>
                <th>Auth</th>
                <th>Plan</th>
                <th>Downloads</th>
                <th>Joined</th>
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
                <tr><td colSpan={6} style={{ textAlign:'center', color:'#94a3b8', padding:'2.5rem', fontSize:'0.85rem' }}>No users found</td></tr>
              )}
              {!loading && filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                      <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'0.7rem', fontWeight:700, flexShrink:0 }}>
                        {(u.displayName || u.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight:600, color:'#1e293b', fontSize:'0.82rem' }}>{u.displayName || '—'}</div>
                        <div style={{ fontSize:'0.72rem', color:'#94a3b8' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`bdg ${u.provider === 'google.com' ? 'bdg-info' : 'bdg-free'}`}>
                      {PROVIDER_LABEL[u.provider] || u.provider || 'Email'}
                    </span>
                  </td>
                  <td>
                    <span className={`bdg ${u.isPremium ? 'bdg-pro' : 'bdg-free'}`}>
                      {u.isPremium ? '★ Pro' : 'Free'}
                    </span>
                  </td>
                  <td style={{ fontWeight:600, color:'#1e293b' }}>{u.downloadCount || 0}<span style={{ color:'#94a3b8', fontWeight:400 }}>/5</span></td>
                  <td style={{ color:'#64748b', fontSize:'0.8rem' }}>{fmt(u.createdAt)}</td>
                  <td>
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      <button className={`a-btn ${u.isPremium ? 'a-btn-warn' : 'a-btn-success'}`}
                        style={{ padding:'4px 9px', fontSize:'0.72rem' }}
                        disabled={busy === u.id} onClick={() => togglePremium(u)}>
                        <Crown style={{ width:11, height:11 }} />
                        {busy === u.id ? '…' : u.isPremium ? 'Revoke' : 'Upgrade'}
                      </button>
                      <button className="a-btn a-btn-danger" style={{ padding:'4px 9px', fontSize:'0.72rem' }}
                        disabled={busy === u.id}
                        onClick={() => setConfirm({ uid: u.id, email: u.email, action: 'delete' })}>
                        <Trash2 style={{ width:11, height:11 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm dialog */}
      {confirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
          <div className="a-card" style={{ padding:'1.75rem', maxWidth:380, width:'100%' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1rem' }}>
              <UserX style={{ width:22, height:22, color:'#dc2626' }} />
              <span style={{ fontWeight:700, color:'#0f172a', fontSize:'0.95rem' }}>Delete User?</span>
            </div>
            <p style={{ margin:'0 0 1.25rem', fontSize:'0.85rem', color:'#475569', lineHeight:1.6 }}>
              This will permanently delete <strong>{confirm.email}</strong>'s Firestore record. Their Firebase Auth account is unaffected.
            </p>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button className="a-btn a-btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="a-btn a-btn-danger" onClick={() => deleteUser(confirm.uid)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
