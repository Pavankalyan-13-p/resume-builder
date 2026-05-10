import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, updateDoc, doc, serverTimestamp, deleteField, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Crown, RefreshCw, Search } from 'lucide-react';
import { useAdminToast } from '../useAdminToast.jsx';

function fmt(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

function isExpired(u) {
  if (!u.isPremium || !u.premiumExpiresAt) return false;
  const exp = u.premiumExpiresAt;
  const d   = exp.toDate ? exp.toDate() : new Date((exp.seconds || 0) * 1000);
  return d < new Date();
}

export default function PremiumPage() {
  const { showToast, toastEl } = useAdminToast();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [tab, setTab]         = useState('premium'); // premium | all
  const [busy, setBusy]       = useState('');
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.upgradedAt?.seconds ?? b.createdAt?.seconds ?? 0) - (a.upgradedAt?.seconds ?? a.createdAt?.seconds ?? 0));

      // Backfill premiumExpiresAt for legacy premium users who have none.
      // Uses upgradedAt + plan duration so the date is historically accurate.
      // Real admin accounts are skipped — they get access via role, not expiry.
      const backfills = list.filter(u =>
        u.isPremium && !u.premiumExpiresAt && u.role !== 'admin'
      );
      for (const u of backfills) {
        const base = u.upgradedAt?.toDate
          ? u.upgradedAt.toDate()
          : u.upgradedAt?.seconds
            ? new Date(u.upgradedAt.seconds * 1000)
            : new Date();
        const days = u.plan === 'yearly' ? 365 : 30;
        base.setDate(base.getDate() + days);
        const premiumExpiresAt = Timestamp.fromDate(base);
        updateDoc(doc(db, 'users', u.id), { premiumExpiresAt }).catch(() => {});
        u.premiumExpiresAt = premiumExpiresAt; // update local list immediately
      }

      setUsers(list);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const togglePremium = async (u) => {
    setBusy(u.id);
    try {
      const next = !u.isPremium;
      if (next) {
        // Grant Pro — set 30-day expiry so Expires column always has a real date.
        // Real admin accounts (role==='admin') get permanent access via isAdminUser
        // in App.jsx regardless, so they don't need deleteField here.
        const expiresDate = new Date();
        expiresDate.setDate(expiresDate.getDate() + 30);
        const premiumExpiresAt = Timestamp.fromDate(expiresDate);
        await updateDoc(doc(db, 'users', u.id), {
          isPremium: true,
          plan: u.plan || 'monthly',
          upgradedAt: serverTimestamp(),
          premiumExpiresAt,
        });
        setUsers(prev => prev.map(x => x.id === u.id ? {
          ...x, isPremium: true, plan: x.plan || 'monthly',
          upgradedAt: { seconds: Date.now() / 1000 }, premiumExpiresAt,
        } : x));
      } else {
        // Revoke — clear expiry
        await updateDoc(doc(db, 'users', u.id), {
          isPremium: false,
          plan: 'free',
          downgradedAt: serverTimestamp(),
          premiumExpiresAt: deleteField(),
        });
        setUsers(prev => prev.map(x => x.id === u.id ? {
          ...x, isPremium: false, plan: 'free',
          downgradedAt: { seconds: Date.now() / 1000 }, premiumExpiresAt: null,
        } : x));
      }
    } catch (e) { showToast(e.message || 'Failed to update plan', 'error'); }
    setBusy('');
  };

  const premiumCount = users.filter(u => u.isPremium).length;

  const base = tab === 'premium' ? users.filter(u => u.isPremium) : users;
  const filtered = base.filter(u => {
    const q = search.toLowerCase();
    return !q || u.email?.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q);
  });

  return (
    <div className="a-page">
      {toastEl}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'#0f172a' }}>
            Premium Management
          </h2>
          <p style={{ margin:'2px 0 0', fontSize:'0.78rem', color:'#94a3b8' }}>
            {premiumCount} premium · {users.length - premiumCount} free
          </p>
        </div>
        <button className="a-btn a-btn-ghost" onClick={load} disabled={loading}>
          <RefreshCw style={{ width:13, height:13 }} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stat strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'0.75rem', marginBottom:'1.25rem' }}>
        {[
          { label:'Premium Users', value: premiumCount, color:'#f59e0b', bg:'#fef3c7' },
          { label:'Free Users',    value: users.length - premiumCount, color:'#64748b', bg:'#f1f5f9' },
          { label:'Conversion',   value: users.length ? `${((premiumCount/users.length)*100).toFixed(1)}%` : '0%', color:'#6366f1', bg:'#ede9fe' },
        ].map(s => (
          <div key={s.label} className="a-card" style={{ padding:'0.875rem 1.1rem', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:s.color, flexShrink:0 }} />
            <div>
              <div style={{ fontSize:'1.25rem', fontWeight:800, color:'#0f172a', lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:'0.7rem', color:'#64748b', marginTop:2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + search */}
      <div style={{ display:'flex', gap:8, marginBottom:'1rem', flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', background:'#f1f5f9', borderRadius:6, padding:3, gap:2 }}>
          {['premium','all'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding:'5px 14px', borderRadius:4, border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:600, fontFamily:'inherit',
                background: tab===t ? '#fff' : 'transparent',
                color: tab===t ? '#1e293b' : '#64748b',
                boxShadow: tab===t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              {t === 'premium' ? `Premium (${premiumCount})` : `All (${users.length})`}
            </button>
          ))}
        </div>
        <div style={{ position:'relative', flex:'1 1 180px', maxWidth:300 }}>
          <Search style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', width:14, height:14, color:'#94a3b8', pointerEvents:'none' }} />
          <input className="a-input" style={{ paddingLeft:32, width:'100%' }} placeholder="Search users…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {error && <div style={{ padding:'0.75rem 1rem', background:'#fee2e2', borderRadius:6, color:'#991b1b', fontSize:'0.82rem', marginBottom:'1rem' }}>{error}</div>}

      <div className="a-card">
        <div className="ox">
          <table className="a-tbl">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Upgraded</th>
                <th>Expires</th>
                <th>Downloads</th>
                <th>Action</th>
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
                  {tab === 'premium' ? 'No premium users yet' : 'No users found'}
                </td></tr>
              )}
              {!loading && filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight:600, color:'#1e293b', fontSize:'0.82rem' }}>{u.displayName || '—'}</div>
                    <div style={{ fontSize:'0.72rem', color:'#94a3b8' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className={`bdg ${u.isPremium ? (isExpired(u) ? 'bdg-err' : 'bdg-pro') : 'bdg-free'}`}>
                      {u.isPremium ? (isExpired(u) ? '⚠ Expired' : '★ Pro') : 'Free'}
                    </span>
                    {u.role === 'admin' && (
                      <span style={{ marginLeft: 5, fontSize: '0.65rem', color: '#94a3b8' }}>admin</span>
                    )}
                  </td>
                  <td style={{ fontSize:'0.8rem', color:'#64748b' }}>{fmt(u.upgradedAt)}</td>
                  <td style={{ fontSize:'0.8rem', color: isExpired(u) ? '#dc2626' : '#64748b', fontWeight: isExpired(u) ? 600 : 400 }}>
                    {u.premiumExpiresAt
                      ? fmt(u.premiumExpiresAt)
                      : u.role === 'admin'
                        ? '∞ No expiry'
                        : '—'}
                  </td>
                  <td>
                    <span style={{ fontWeight:600, color:'#1e293b' }}>{u.downloadCount || 0}</span>
                    {!u.isPremium && <span style={{ color:'#94a3b8' }}>/5</span>}
                  </td>
                  <td>
                    <button className={`a-btn ${u.isPremium ? 'a-btn-warn' : 'a-btn-success'}`}
                      style={{ padding:'4px 10px', fontSize:'0.72rem' }}
                      disabled={busy === u.id} onClick={() => togglePremium(u)}>
                      <Crown style={{ width:11, height:11 }} />
                      {busy === u.id ? '…' : u.isPremium ? 'Revoke Pro' : 'Grant Pro'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
