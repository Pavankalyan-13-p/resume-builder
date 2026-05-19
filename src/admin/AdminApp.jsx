import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, Crown, CreditCard, Download, FileText,
  Headphones, Lightbulb, Menu, X, LogOut, Shield, ExternalLink,
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/Users';
import PremiumPage from './pages/Premium';
import PaymentsPage from './pages/Payments';
import DownloadsPage from './pages/Downloads';
import TemplatesPage from './pages/Templates';
import SupportPage from './pages/Support';
import FeedbackPage from './pages/Feedback';


const NAV = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'users',     label: 'Users',      icon: Users },
  { id: 'premium',   label: 'Premium',    icon: Crown },
  { id: 'payments',  label: 'Payments',   icon: CreditCard },
  { id: 'downloads', label: 'Downloads',  icon: Download },
  { id: 'templates', label: 'Templates',  icon: FileText },
  { id: 'support',   label: 'Support',    icon: Headphones },
  { id: 'feedback',  label: 'Feedback',   icon: Lightbulb },
];

const PAGE_MAP = {
  dashboard: Dashboard,
  users:     UsersPage,
  premium:   PremiumPage,
  payments:  PaymentsPage,
  downloads: DownloadsPage,
  templates: TemplatesPage,
  support:   SupportPage,
  feedback:  FeedbackPage,
};

export const ADMIN_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }
  @keyframes adminSpin { to { transform: rotate(360deg); } }
  @keyframes adminFadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .a-page { animation: adminFadeIn 0.2s ease-out; }
  .a-nav-item { display:flex; align-items:center; gap:10px; padding:9px 12px; cursor:pointer;
    border-radius:6px; font-size:0.85rem; font-weight:500; color:#94a3b8;
    transition:all 0.15s; border:none; background:none; width:100%; text-align:left; white-space:nowrap; }
  .a-nav-item:hover { background:rgba(255,255,255,0.07); color:#e2e8f0; }
  .a-nav-item.on { background:rgba(99,102,241,0.2); color:#a5b4fc; }
  .a-tbl { width:100%; border-collapse:collapse; font-size:0.83rem; }
  .a-tbl th { padding:10px 12px; text-align:left; font-size:0.68rem; text-transform:uppercase;
    letter-spacing:0.08em; font-weight:700; color:#64748b; background:#f8fafc;
    border-bottom:2px solid #e2e8f0; white-space:nowrap; }
  .a-tbl td { padding:11px 12px; border-bottom:1px solid #f1f5f9; color:#334155; vertical-align:middle; }
  .a-tbl tr:last-child td { border-bottom:none; }
  .a-tbl tr:hover td { background:#fafcff; }
  .bdg { display:inline-flex; align-items:center; gap:3px; padding:2px 8px; border-radius:999px;
    font-size:0.67rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; white-space:nowrap; }
  .bdg-pro  { background:#fef3c7; color:#92400e; }
  .bdg-free { background:#f1f5f9; color:#475569; }
  .bdg-ok   { background:#d1fae5; color:#065f46; }
  .bdg-err  { background:#fee2e2; color:#991b1b; }
  .bdg-warn { background:#fef9c3; color:#854d0e; }
  .bdg-info { background:#dbeafe; color:#1e40af; }
  .bdg-open { background:#e0f2fe; color:#0369a1; }
  .bdg-closed { background:#f1f5f9; color:#475569; }
  .a-btn { display:inline-flex; align-items:center; gap:5px; padding:6px 12px; border-radius:5px;
    font-size:0.78rem; font-weight:600; cursor:pointer; border:none; transition:all 0.15s; white-space:nowrap;
    font-family:inherit; }
  .a-btn-primary { background:#4f46e5; color:#fff; }
  .a-btn-primary:hover { background:#4338ca; }
  .a-btn-success { background:#16a34a; color:#fff; }
  .a-btn-success:hover { background:#15803d; }
  .a-btn-danger  { background:#dc2626; color:#fff; }
  .a-btn-danger:hover  { background:#b91c1c; }
  .a-btn-ghost   { background:transparent; color:#64748b; border:1px solid #e2e8f0; }
  .a-btn-ghost:hover   { background:#f8fafc; color:#1e293b; }
  .a-btn-warn    { background:#d97706; color:#fff; }
  .a-btn-warn:hover    { background:#b45309; }
  .a-card { background:#fff; border-radius:8px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.05); }
  .a-input { padding:8px 12px; border:1.5px solid #e2e8f0; border-radius:6px; font-size:0.85rem;
    background:#fff; color:#1e293b; font-family:inherit; outline:none; }
  .a-input:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.12); }
  .a-select { padding:8px 12px; border:1.5px solid #e2e8f0; border-radius:6px; font-size:0.85rem;
    background:#fff; color:#1e293b; font-family:inherit; outline:none; cursor:pointer; }
  .a-select:focus { border-color:#6366f1; }
  .a-textarea { padding:8px 12px; border:1.5px solid #e2e8f0; border-radius:6px; font-size:0.85rem;
    background:#fff; color:#1e293b; font-family:inherit; outline:none; resize:vertical; }
  .a-textarea:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.12); }
  .ox { overflow-x:auto; -webkit-overflow-scrolling:touch; }
  .spin { animation:adminSpin 0.8s linear infinite; }
  @media (max-width: 768px) {
    .a-sidebar { position:fixed !important; left:0; top:0; bottom:0; z-index:1000;
      transform:translateX(-100%); transition:transform 0.25s ease; }
    .a-sidebar.open { transform:translateX(0); }
    .a-content { margin-left:0 !important; }
    .a-topbar-menu { display:flex !important; }
  }
  @media (min-width: 769px) {
    .a-topbar-menu { display:none !important; }
  }
`;

export default function AdminApp() {
  const { currentUser, userDoc, authLoading, logout } = useAuth();
  const [page, setPage]           = useState('dashboard');
  const [sidebarOpen, setSidebar] = useState(false);

  if (authLoading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f172a' }}>
        <div style={{ color:'#64748b', fontFamily:'system-ui', fontSize:'0.9rem' }}>Verifying access…</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f172a', padding:'1rem' }}>
        <div style={{ background:'#1e293b', padding:'2.5rem', maxWidth:'360px', width:'100%', textAlign:'center', borderRadius:'10px', border:'1px solid #334155' }}>
          <Shield style={{ width:40, height:40, color:'#6366f1', margin:'0 auto 1rem' }} />
          <h1 style={{ color:'#f1f5f9', fontFamily:'system-ui', fontSize:'1.35rem', fontWeight:700, margin:'0 0 0.5rem' }}>Admin Access</h1>
          <p style={{ color:'#94a3b8', fontSize:'0.875rem', margin:'0 0 1.5rem', lineHeight:1.6 }}>Sign in with your admin account at the main app, then return to this URL.</p>
          <a href="/" style={{ display:'inline-block', padding:'10px 24px', background:'#6366f1', color:'#fff', textDecoration:'none', fontSize:'0.875rem', fontWeight:600, borderRadius:'5px' }}>← Back to App</a>
        </div>
      </div>
    );
  }

  const isAdmin = userDoc?.role === "admin";
  if (!isAdmin) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f172a', padding:'1rem' }}>
        <div style={{ background:'#1e293b', padding:'2.5rem', maxWidth:'420px', width:'100%', textAlign:'center', borderRadius:'10px', border:'1px solid #334155' }}>
          <div style={{ width:56, height:56, background:'rgba(239,68,68,0.15)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
            <X style={{ width:28, height:28, color:'#f87171' }} />
          </div>
          <h1 style={{ color:'#f1f5f9', fontFamily:'system-ui', fontSize:'1.35rem', fontWeight:700, margin:'0 0 0.5rem' }}>Access Denied</h1>
          <p style={{ color:'#94a3b8', fontSize:'0.875rem', lineHeight:1.6, margin:'0 0 0.25rem' }}>
            <strong style={{ color:'#f1f5f9' }}>{currentUser.email}</strong>
          </p>
          <p style={{ color:'#64748b', fontSize:'0.8rem', margin:'0 0 1.75rem' }}>This account is not authorized to access the admin panel.</p>
          <div style={{ display:'flex', gap:'8px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href="/" style={{ padding:'9px 20px', background:'#6366f1', color:'#fff', textDecoration:'none', fontSize:'0.875rem', fontWeight:600, borderRadius:'5px' }}>← Back to App</a>
            <button onClick={logout} style={{ padding:'9px 20px', background:'transparent', border:'1px solid #475569', color:'#94a3b8', cursor:'pointer', fontSize:'0.875rem', borderRadius:'5px', fontFamily:'inherit' }}>Sign Out</button>
          </div>
        </div>
      </div>
    );
  }

  const PageComp = PAGE_MAP[page] || Dashboard;

  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div style={{ minHeight:'100vh', display:'flex', fontFamily:"'Inter', system-ui, sans-serif", background:'#f1f5f9' }}>

        <aside className={`a-sidebar${sidebarOpen ? ' open' : ''}`} style={{ width:240, minWidth:240, background:'#1e293b', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh', flexShrink:0, zIndex:50 }}>
          <div style={{ padding:'1.1rem 1rem 0.9rem', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <img src="/icon-circle.png" alt="Foliant AI" style={{ width:32, height:32, borderRadius:7, flexShrink:0 }} />
              <div>
                <img src="/logo.png" alt="Foliant AI" style={{ height:18, width:'auto', filter:'brightness(0) invert(1)', opacity:0.9 }} />
                <div style={{ color:'#475569', fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:2 }}>Admin Panel</div>
              </div>
            </div>
            <button onClick={() => setSidebar(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b', padding:4 }}>
              <X style={{ width:17, height:17 }} />
            </button>
          </div>

          <nav style={{ flex:1, padding:'0.625rem', overflowY:'auto' }}>
            {NAV.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`a-nav-item${page === id ? ' on' : ''}`}
                onClick={() => { setPage(id); setSidebar(false); }}>
                <Icon style={{ width:15, height:15, flexShrink:0 }} /> {label}
              </button>
            ))}
          </nav>

          <div style={{ padding:'0.625rem', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'rgba(255,255,255,0.04)', borderRadius:6, marginBottom:6, overflow:'hidden' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'0.72rem', fontWeight:700, flexShrink:0 }}>
                {(currentUser.email?.[0] ?? 'A').toUpperCase()}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ color:'#e2e8f0', fontSize:'0.75rem', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{currentUser.email}</div>
                <div style={{ color:'#475569', fontSize:'0.62rem' }}>Administrator</div>
              </div>
            </div>
            <a href="/" className="a-nav-item" style={{ color:'#64748b', textDecoration:'none', display:'flex', marginBottom:2 }}>
              <ExternalLink style={{ width:14, height:14 }} /> Back to App
            </a>
            <button onClick={logout} className="a-nav-item" style={{ color:'#f87171' }}>
              <LogOut style={{ width:14, height:14 }} /> Sign out
            </button>
          </div>
        </aside>

        {sidebarOpen && <div onClick={() => setSidebar(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:999 }} />}

        <div className="a-content" style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'0 1.25rem', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:40, flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button className="a-topbar-menu" onClick={() => setSidebar(true)} style={{ display:'none', background:'none', border:'1px solid #e2e8f0', cursor:'pointer', padding:'6px 8px', borderRadius:5 }}>
                <Menu style={{ width:17, height:17, color:'#64748b' }} />
              </button>
              <span style={{ fontSize:'0.875rem', fontWeight:700, color:'#1e293b' }}>
                {NAV.find(n => n.id === page)?.label ?? 'Dashboard'}
              </span>
            </div>
            <div style={{ fontSize:'0.72rem', color:'#94a3b8' }}>
              Foliant AI Admin · <span style={{ color:'#6366f1', fontWeight:600 }}>{currentUser.email}</span>
            </div>
          </div>

          <div style={{ flex:1, padding:'1.25rem', overflowY:'auto' }} key={page}>
            <PageComp onNavigate={setPage} />
          </div>
        </div>
      </div>
    </>
  );
}
