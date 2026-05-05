import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { RefreshCw, Lock, Unlock, FileText, Save } from 'lucide-react';

// These must match the template IDs used in the main app
const DEFAULT_TEMPLATES = [
  { id: 'classic',    name: 'Classic',     description: 'Clean single-column professional layout' },
  { id: 'modern',     name: 'Modern',      description: 'Two-column contemporary design' },
  { id: 'minimal',    name: 'Minimal',     description: 'Ultra-clean minimalist style' },
  { id: 'executive',  name: 'Executive',   description: 'Bold header for senior roles' },
  { id: 'creative',   name: 'Creative',    description: 'Color-accented creative layout' },
  { id: 'compact',    name: 'Compact',     description: 'Dense layout, fits more content' },
  { id: 'elegant',    name: 'Elegant',     description: 'Serif fonts, refined spacing' },
  { id: 'bold',       name: 'Bold',        description: 'Strong typography, standout design' },
];

export default function TemplatesPage() {
  const [config, setConfig]   = useState({}); // { [templateId]: { locked: bool } }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [dirty, setDirty]     = useState(false);
  const [error, setError]     = useState('');
  const [saved, setSaved]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const snap = await getDoc(doc(db, 'app_config', 'templates'));
      if (snap.exists()) {
        setConfig(snap.data()?.locked ?? {});
      } else {
        setConfig({});
      }
      setDirty(false);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (id) => {
    setConfig(prev => ({ ...prev, [id]: !prev[id] }));
    setDirty(true);
    setSaved(false);
  };

  const saveAll = async () => {
    setSaving(true); setError('');
    try {
      await setDoc(doc(db, 'app_config', 'templates'), { locked: config }, { merge: true });
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  const lockedCount = Object.values(config).filter(Boolean).length;

  return (
    <div className="a-page">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'#0f172a' }}>Template Management</h2>
          <p style={{ margin:'2px 0 0', fontSize:'0.78rem', color:'#94a3b8' }}>
            {DEFAULT_TEMPLATES.length} templates · {lockedCount} locked (premium only)
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="a-btn a-btn-ghost" onClick={load} disabled={loading}>
            <RefreshCw style={{ width:13, height:13 }} className={loading ? 'spin' : ''} /> Reload
          </button>
          <button className="a-btn a-btn-primary" onClick={saveAll} disabled={saving || !dirty}>
            <Save style={{ width:13, height:13 }} />
            {saving ? 'Saving…' : dirty ? 'Save Changes' : saved ? '✓ Saved' : 'No Changes'}
          </button>
        </div>
      </div>

      {saved && !dirty && (
        <div style={{ padding:'0.75rem 1rem', background:'#d1fae5', borderRadius:6, color:'#065f46', fontSize:'0.82rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:6 }}>
          ✓ Template settings saved successfully
        </div>
      )}

      {error && <div style={{ padding:'0.75rem 1rem', background:'#fee2e2', borderRadius:6, color:'#991b1b', fontSize:'0.82rem', marginBottom:'1rem' }}>{error}</div>}

      <div style={{ background:'#fef9c3', border:'1px solid #fde68a', borderRadius:6, padding:'0.75rem 1rem', fontSize:'0.8rem', color:'#854d0e', marginBottom:'1.25rem', lineHeight:1.5 }}>
        <strong>How it works:</strong> Locked templates are shown to free users but require a premium upgrade to use. Changes take effect immediately after saving. Your app reads this config from Firestore on load.
      </div>

      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200 }}>
          <RefreshCw className="spin" style={{ width:24, height:24, color:'#6366f1' }} />
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'0.875rem' }}>
          {DEFAULT_TEMPLATES.map(t => {
            const locked = !!config[t.id];
            return (
              <div key={t.id} className="a-card" style={{ padding:'1.1rem', display:'flex', alignItems:'center', gap:14, cursor:'pointer', transition:'box-shadow 0.15s', border: locked ? '1.5px solid #fde68a' : '1px solid #e2e8f0' }}
                onClick={() => toggle(t.id)}>
                <div style={{ width:42, height:42, borderRadius:8, background: locked ? '#fef3c7' : '#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {locked
                    ? <Lock style={{ width:18, height:18, color:'#f59e0b' }} />
                    : <Unlock style={{ width:18, height:18, color:'#94a3b8' }} />
                  }
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:2 }}>
                    <span style={{ fontWeight:700, color:'#1e293b', fontSize:'0.88rem' }}>{t.name}</span>
                    {locked && <span className="bdg bdg-pro">Premium</span>}
                    {!locked && <span className="bdg bdg-free">Free</span>}
                  </div>
                  <div style={{ fontSize:'0.74rem', color:'#94a3b8' }}>{t.description}</div>
                </div>
                <div style={{ flexShrink:0 }}>
                  <div style={{
                    width:36, height:20, borderRadius:999, position:'relative', cursor:'pointer',
                    background: locked ? '#f59e0b' : '#e2e8f0', transition:'background 0.2s',
                  }}>
                    <div style={{
                      position:'absolute', top:2, left: locked ? 18 : 2, width:16, height:16,
                      borderRadius:'50%', background:'#fff', transition:'left 0.2s',
                      boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {dirty && (
        <div style={{ position:'fixed', bottom:24, right:24, zIndex:500 }}>
          <button className="a-btn a-btn-primary" onClick={saveAll} disabled={saving}
            style={{ boxShadow:'0 4px 16px rgba(99,102,241,0.4)', padding:'10px 20px' }}>
            <Save style={{ width:14, height:14 }} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
