import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import './index.css';

const path = window.location.pathname;
const isAdmin   = path.startsWith('/admin');
const isPrivacy = path.startsWith('/privacy');
const isTerms   = path.startsWith('/terms');
const isRefund  = path.startsWith('/refund');

// Lazy-load the admin bundle so it doesn't bloat the main app
const AdminApp = isAdmin ? React.lazy(() => import('./admin/AdminApp.jsx')) : null;

// Legal pages are small — import directly (no need for lazy loading)
let LegalPage = null;
if (isPrivacy) LegalPage = React.lazy(() => import('./pages/PrivacyPolicy.jsx'));
else if (isTerms)  LegalPage = React.lazy(() => import('./pages/TermsAndConditions.jsx'));
else if (isRefund) LegalPage = React.lazy(() => import('./pages/RefundPolicy.jsx'));

const isLegal = isPrivacy || isTerms || isRefund;

const legalFallback = (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf9' }}>
    <div style={{ color: '#9ca3af', fontFamily: 'system-ui', fontSize: '0.875rem' }}>Loading…</div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      {isAdmin ? (
        <React.Suspense fallback={
          <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f172a' }}>
            <div style={{ color:'#64748b', fontFamily:'system-ui', fontSize:'0.9rem' }}>Loading admin…</div>
          </div>
        }>
          <AdminApp />
        </React.Suspense>
      ) : isLegal ? (
        <React.Suspense fallback={legalFallback}>
          <LegalPage />
        </React.Suspense>
      ) : (
        <App />
      )}
    </AuthProvider>
  </React.StrictMode>,
);
