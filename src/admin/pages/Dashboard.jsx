import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Users, Crown, Download, Headphones, TrendingUp, UserCheck, RefreshCw } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="a-card" style={{ padding:'1.25rem', display:'flex', alignItems:'flex-start', gap:14 }}>
      <div style={{ width:42, height:42, borderRadius:8, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon style={{ width:20, height:20, color }} />
      </div>
      <div>
        <div style={{ fontSize:'1.6rem', fontWeight:800, color:'#0f172a', lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:'0.78rem', fontWeight:600, color:'#475569', marginTop:3 }}>{label}</div>
        {sub && <div style={{ fontSize:'0.7rem', color:'#94a3b8', marginTop:2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const [stats, setStats]     = useState(null);
  const [recent, setRecent]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const snap = await getDocs(collection(db, 'users'));
      const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const total    = users.length;
      const premium  = users.filter(u => u.isPremium).length;
      const free     = total - premium;
      const downloads = users.reduce((s, u) => s + (u.downloadCount || 0), 0);

      // Recent 5 users by join date
      const sorted = [...users].sort((a, b) => {
        const ta = a.createdAt?.seconds ?? 0;
        const tb = b.createdAt?.seconds ?? 0;
        return tb - ta;
      }).slice(0, 5);

      // Support tickets
      let tickets = 0;
      try {
        const tSnap = await getDocs(query(collection(db, 'supportTickets'), where('status', '==', 'open')));
        tickets = tSnap.size;
      } catch (_) {}

      setStats({ total, premium, free, downloads, tickets });
      setRecent(sorted);
    } catch (e) {
      setError('Failed to load stats: ' + e.message);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const fmt = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200 }}>
      <RefreshCw className="spin" style={{ width:24, height:24, color:'#6366f1' }} />
    </div>
  );

  if (error) return (
    <div style={{ padding:'1.5rem', background:'#fee2e2', borderRadius:8, color:'#991b1b', fontSize:'0.85rem' }}>
      {error}
    </div>
  );

  return (
    <div className="a-page">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'#0f172a' }}>Overview</h2>
          <p style={{ margin:'2px 0 0', fontSize:'0.78rem', color:'#94a3b8' }}>Real-time snapshot of your app</p>
        </div>
        <button className="a-btn a-btn-ghost" onClick={load}>
          <RefreshCw style={{ width:13, height:13 }} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        <StatCard icon={Users}     label="Total Users"     value={stats.total}     sub={`${stats.free} free · ${stats.premium} premium`} color="#6366f1" />
        <StatCard icon={Crown}     label="Premium Users"   value={stats.premium}   sub={`${stats.total ? ((stats.premium/stats.total)*100).toFixed(1) : 0}% conversion`} color="#f59e0b" />
        <StatCard icon={Download}  label="Total Downloads" value={stats.downloads} sub="All time" color="#10b981" />
        <StatCard icon={Headphones} label="Open Tickets"  value={stats.tickets}   sub="Awaiting reply" color="#ef4444" />
      </div>

      {/* Quick actions */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        <div className="a-card" style={{ padding:'1.25rem' }}>
          <div style={{ fontSize:'0.8rem', fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.875rem' }}>Quick Actions</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <button className="a-btn a-btn-primary" style={{ justifyContent:'flex-start' }} onClick={() => onNavigate('users')}>
              <Users style={{ width:14, height:14 }} /> Manage Users
            </button>
            <button className="a-btn a-btn-warn" style={{ justifyContent:'flex-start' }} onClick={() => onNavigate('support')}>
              <Headphones style={{ width:14, height:14 }} /> View Support Tickets
            </button>
            <button className="a-btn a-btn-success" style={{ justifyContent:'flex-start' }} onClick={() => onNavigate('premium')}>
              <Crown style={{ width:14, height:14 }} /> Manage Premium
            </button>
          </div>
        </div>

        <div className="a-card" style={{ padding:'1.25rem' }}>
          <div style={{ fontSize:'0.8rem', fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.875rem' }}>Plan Split</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem', marginBottom:4 }}>
                <span style={{ color:'#475569' }}>Free</span>
                <span style={{ fontWeight:700, color:'#475569' }}>{stats.free}</span>
              </div>
              <div style={{ height:6, background:'#f1f5f9', borderRadius:99 }}>
                <div style={{ height:'100%', width:`${stats.total ? (stats.free/stats.total)*100 : 0}%`, background:'#94a3b8', borderRadius:99 }} />
              </div>
            </div>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem', marginBottom:4 }}>
                <span style={{ color:'#92400e' }}>Premium</span>
                <span style={{ fontWeight:700, color:'#92400e' }}>{stats.premium}</span>
              </div>
              <div style={{ height:6, background:'#fef3c7', borderRadius:99 }}>
                <div style={{ height:'100%', width:`${stats.total ? (stats.premium/stats.total)*100 : 0}%`, background:'#f59e0b', borderRadius:99 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="a-card">
        <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:'0.85rem', fontWeight:700, color:'#0f172a' }}>Recently Joined Users</span>
          <button className="a-btn a-btn-ghost" style={{ fontSize:'0.72rem', padding:'4px 10px' }} onClick={() => onNavigate('users')}>
            View All →
          </button>
        </div>
        <div className="ox">
          <table className="a-tbl">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Downloads</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign:'center', color:'#94a3b8', padding:'2rem' }}>No users yet</td></tr>
              )}
              {recent.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight:600, color:'#1e293b' }}>{u.displayName || '—'}</div>
                    <div style={{ fontSize:'0.72rem', color:'#94a3b8' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className={`bdg ${u.isPremium ? 'bdg-pro' : 'bdg-free'}`}>
                      {u.isPremium ? '★ Pro' : 'Free'}
                    </span>
                  </td>
                  <td>{u.downloadCount || 0}</td>
                  <td style={{ color:'#64748b', fontSize:'0.8rem' }}>{fmt(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
