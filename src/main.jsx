import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import './index.css';

const isAdmin = window.location.pathname.startsWith('/admin');

// Lazy-load the admin bundle so it doesn't bloat the main app
const AdminApp = isAdmin ? React.lazy(() => import('./admin/AdminApp.jsx')) : null;

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
      ) : (
        <App />
      )}
    </AuthProvider>
  </React.StrictMode>,
);
