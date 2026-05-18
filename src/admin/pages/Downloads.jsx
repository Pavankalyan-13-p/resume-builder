import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { RefreshCw, Search, RotateCcw, Download } from 'lucide-react';
import { useAdminToast } from '../useAdminToast.jsx';

function fmt(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

export default function DownloadsPage() {
  const { showToast, toastEl } = useAdminToast();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all'); // all | limit | premium
  const [busy, setBusy]       = useState('');
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
      setUsers(list);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetDownloads = async (u) => {
    if (!window.confirm(`Reset download count for ${u.email}?`)) return;
    setBusy(u.id);
    try {
      await updateDoc(doc(db, 'users', u.id), { downloadCount: 0 });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, downloadCount: 0 } : x));
    } catch (e) { showToast(e.message || 'Failed to reset downloads', 'error'); }
    setBusy('');
  };

  const totalDownloads = users.reduce((s, u) => s + (u.downloadCount || 0), 0);
  const FREE_LIMIT = 3;
  const PRO_LIMIT  = 10;
  const userLimit  = (u) => u.role === 'admin' ? Infinity : u.isPremium ? PRO_LIMIT : FREE_LIMIT;
  const atLimit = users.filter(u => !u.isPremium && u.role !== 'admin' && (u.downloadCount || 0) >= FREE_LIMIT).length;

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || u.email?.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q);
    const matchF = filter === 'all'
      || (filter === 'limit' ? !u.isPremium && u.role !== 'admin' && (u.downloadCount || 0) >= FREE_LIMIT
      : filter === 'premium' ? u.isPremium
      : true);
    return matchQ && matchF;
  });

  const pct = (count, max) => Math.min(100, ((count || 0) / max) * 100);

  return (
    <div className="a-page">
      {toastEl}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'#0f172a' }}>Download Tracking</h2>
          <p style={{ margin:'2px 0 0', fontSize:'0.78rem', color:'#94a3b8' }}>
            {totalDownloads} total downloads · {atLimit} users at free limit
          </p>
        </div>
        <button className="a-btn a-btn-ghost" onClick={load} disabled={loading}>
          <RefreshCw style={{ width:13, height:13 }} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'0.75rem', marginBottom:'1.25rem' }}>
        {[
          { label:'Total Downloads', value: totalDownloads, color:'#6366f1' },
          { label:'At Free Limit (3/3)', value: atLimit, color:'#dc2626' },
          { label:'Pro Users (10/day)',  value: users.filter(u=>u.isPremium).length, color:'#f59e0b' },
          { label:'Avg Downloads/User', value: users.length ? (totalDownloads/users.length).toFixed(1) : '0', color:'#10b981' },
        ].map(s => (
          <div key={s.label} className="a-card" style={{ padding:'0.875rem 1.1rem' }}>
            <div style={{ fontSize:'1.25rem', fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:'0.7rem', color:'#64748b', marginTop:3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:'1rem', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 200px', maxWidth:300 }}>
          <Search style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', width:14, height:14, color:'#94a3b8', pointerEvents:'none' }} />
          <input className="a-input" style={{ paddingLeft:32, width:'100%' }} placeholder="Search users…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="a-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Users</option>
          <option value="limit">At Free Limit (3/3)</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {error && <div style={{ padding:'0.75rem 1rem', background:'#fee2e2', borderRadius:6, color:'#991b1b', fontSize:'0.82rem', marginBottom:'1rem' }}>{error}</div>}

      <div className="a-card">
        <div className="ox">
          <table className="a-tbl">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Downloads</th>
                <th>Usage Bar</th>
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
              {!loading && filtered.map(u => {
                const count = u.downloadCount || 0;
                const lim = userLimit(u);
                const isAtLimit = lim !== Infinity && count >= lim;
                const p = lim === Infinity ? 0 : pct(count, lim);
                const barColor = u.isPremium ? '#f59e0b' : isAtLimit ? '#dc2626' : p > 60 ? '#f59e0b' : '#10b981';
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight:600, color:'#1e293b', fontSize:'0.82rem' }}>{u.displayName || '—'}</div>
                      <div style={{ fontSize:'0.72rem', color:'#94a3b8' }}>{u.email}</div>
                    </td>
                    <td>
                      <span className={`bdg ${u.isPremium ? 'bdg-pro' : 'bdg-free'}`}>
                        {u.isPremium ? '★ Pro' : 'Free'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight:700, color: isAtLimit ? '#dc2626' : '#1e293b' }}>{count}</span>
                      {lim !== Infinity && <span style={{ color:'#94a3b8', fontSize:'0.78rem' }}>/{lim}</span>}
                      {lim === Infinity && <span style={{ color:'#94a3b8', fontSize:'0.78rem' }}> (∞)</span>}
                      {isAtLimit && <span className="bdg bdg-err" style={{ marginLeft:6 }}>Limit</span>}
                    </td>
                    <td style={{ minWidth:120 }}>
                      {lim === Infinity ? (
                        <div style={{ fontSize:'0.72rem', color:'#94a3b8', fontWeight:600 }}>Admin — no limit</div>
                      ) : (
                        <div>
                          <div style={{ height:6, background:'#f1f5f9', borderRadius:99, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${p}%`, background:barColor, borderRadius:99, transition:'width 0.3s' }} />
                          </div>
                          <div style={{ fontSize:'0.65rem', color:'#94a3b8', marginTop:2 }}>{count}/{lim} used</div>
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize:'0.8rem', color:'#64748b' }}>{fmt(u.createdAt)}</td>
                    <td>
                      <button className="a-btn a-btn-ghost" style={{ padding:'4px 9px', fontSize:'0.72rem' }}
                        disabled={busy === u.id || count === 0} onClick={() => resetDownloads(u)}>
                        <RotateCcw style={{ width:11, height:11 }} />
                        {busy === u.id ? '…' : 'Reset'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top downloaders chart */}
      {!loading && users.length > 0 && (
        <div className="a-card" style={{ marginTop:'1.25rem', padding:'1.25rem' }}>
          <div style={{ fontSize:'0.8rem', fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.875rem', display:'flex', alignItems:'center', gap:6 }}>
            <Download style={{ width:13, height:13 }} /> Top 5 Downloaders
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[...users].sort((a,b) => (b.downloadCount||0)-(a.downloadCount||0)).slice(0,5).map((u,i) => (
              <div key={u.id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:20, fontWeight:700, fontSize:'0.75rem', color:'#94a3b8', textAlign:'right', flexShrink:0 }}>#{i+1}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                    <span style={{ fontSize:'0.78rem', fontWeight:600, color:'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</span>
                    <span style={{ fontSize:'0.78rem', fontWeight:700, color:'#6366f1', flexShrink:0, marginLeft:8 }}>{u.downloadCount||0}</span>
                  </div>
                  <div style={{ height:5, background:'#f1f5f9', borderRadius:99 }}>
                    <div style={{ height:'100%', width:`${Math.min(100, ((u.downloadCount||0) / Math.max(1, users[0]?.downloadCount||1)) * 100)}%`, background:'#6366f1', borderRadius:99 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
