import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { RefreshCw, Lock, Unlock, Save } from 'lucide-react';

// Single source of truth — must stay in sync with TEMPLATES in src/data/resumeData.js.
// id          → must match exactly the id used in the main app
// defaultLocked → mirrors the app's `premium` flag; used as the display fallback when
//                 Firestore has no override for that template yet
const APP_TEMPLATES = [
  // ── Free (5) ──────────────────────────────────────────────────────────────
  { id: 'classic',       name: 'Basic Professional', description: 'Traditional serif, single column',      defaultLocked: false },
  { id: 'modern',        name: 'Modern Clean',        description: 'Two-column with accent header',         defaultLocked: false },
  { id: 'minimal',       name: 'Simple ATS',          description: 'Maximum whitespace, top ATS score',     defaultLocked: false },
  { id: 'sleek',         name: 'Sleek',               description: 'Split header, teal accent, clean',      defaultLocked: false },
  { id: 'canvas',        name: 'Canvas',              description: 'Light sidebar, warm two-column',        defaultLocked: false },
  // ── Premium (10) ──────────────────────────────────────────────────────────
  { id: 'executive',     name: 'Executive',           description: 'Bold navy leadership style',            defaultLocked: true  },
  { id: 'creative',      name: 'Creative Designer',   description: 'Editorial sidebar layout',              defaultLocked: true  },
  { id: 'technical',     name: 'Tech Pro',            description: 'Monospace developer layout',            defaultLocked: true  },
  { id: 'elegant',       name: 'Minimal Elegant',     description: 'Refined serif with gold accents',       defaultLocked: true  },
  { id: 'corporate',     name: 'Corporate Pro',       description: 'Clean structured corporate design',     defaultLocked: true  },
  { id: 'fresher',       name: 'Fresher / Student',   description: 'Education-first for new grads',         defaultLocked: true  },
  { id: 'international', name: 'International',       description: 'EU / global standard format',           defaultLocked: true  },
  { id: 'twocolumn',     name: 'Two Column',          description: 'Balanced dual-column layout',           defaultLocked: true  },
  { id: 'apex',          name: 'Apex',                description: 'Refined serif, gradient accents',       defaultLocked: true  },
  { id: 'meridian',      name: 'Meridian',            description: 'Light sidebar, sky-blue two-column',    defaultLocked: true  },
];

// Resolve whether a template is locked, preferring the Firestore override and
// falling back to the app-code default when no override has been saved yet.
function isLocked(config, template) {
  return template.id in config ? !!config[template.id] : template.defaultLocked;
}

export default function TemplatesPage() {
  const [config, setConfig] = useState({});   // { [templateId]: bool }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [dirty, setDirty]     = useState(false);
  const [error, setError]     = useState('');
  const [saved, setSaved]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const snap = await getDoc(doc(db, 'app_config', 'templates'));
      setConfig(snap.exists() ? (snap.data()?.locked ?? {}) : {});
      setDirty(false);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (id) => {
    const current = isLocked(config, APP_TEMPLATES.find(t => t.id === id));
    setConfig(prev => ({ ...prev, [id]: !current }));
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

  const freeCount   = APP_TEMPLATES.filter(t => !isLocked(config, t)).length;
  const lockedCount = APP_TEMPLATES.filter(t =>  isLocked(config, t)).length;

  return (
    <div className="a-page">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'#0f172a' }}>Template Management</h2>
          <p style={{ margin:'2px 0 0', fontSize:'0.78rem', color:'#94a3b8' }}>
            {APP_TEMPLATES.length} templates · {freeCount} free · {lockedCount} premium
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
          ✓ Template settings saved to Firestore
        </div>
      )}

      {error && (
        <div style={{ padding:'0.75rem 1rem', background:'#fee2e2', borderRadius:6, color:'#991b1b', fontSize:'0.82rem', marginBottom:'1rem' }}>
          {error}
        </div>
      )}

      <div style={{ background:'#fef9c3', border:'1px solid #fde68a', borderRadius:6, padding:'0.75rem 1rem', fontSize:'0.8rem', color:'#854d0e', marginBottom:'1.25rem', lineHeight:1.5 }}>
        <strong>How it works:</strong> Toggle sets the Firestore override for each template. When no override is saved, the template uses its app-code default (shown below). Free users can use unlocked templates; locked templates require a Pro upgrade.
      </div>

      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200 }}>
          <RefreshCw className="spin" style={{ width:24, height:24, color:'#6366f1' }} />
        </div>
      ) : (
        <>
          {/* Free section */}
          <p style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#94a3b8', marginBottom:'0.5rem' }}>
            Free Templates ({APP_TEMPLATES.filter(t => !isLocked(config, t)).length})
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'0.875rem', marginBottom:'1.5rem' }}>
            {APP_TEMPLATES.filter(t => !isLocked(config, t)).map(t => (
              <TemplateCard key={t.id} t={t} locked={false} onToggle={() => toggle(t.id)} />
            ))}
          </div>

          {/* Premium section */}
          <p style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#94a3b8', marginBottom:'0.5rem' }}>
            Premium Templates ({APP_TEMPLATES.filter(t => isLocked(config, t)).length})
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'0.875rem' }}>
            {APP_TEMPLATES.filter(t => isLocked(config, t)).map(t => (
              <TemplateCard key={t.id} t={t} locked={true} onToggle={() => toggle(t.id)} />
            ))}
          </div>
        </>
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

function TemplateCard({ t, locked, onToggle }) {
  return (
    <div
      className="a-card"
      style={{ padding:'1.1rem', display:'flex', alignItems:'center', gap:14, cursor:'pointer', transition:'box-shadow 0.15s', border: locked ? '1.5px solid #fde68a' : '1px solid #e2e8f0' }}
      onClick={onToggle}
    >
      <div style={{ width:42, height:42, borderRadius:8, background: locked ? '#fef3c7' : '#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {locked
          ? <Lock   style={{ width:18, height:18, color:'#f59e0b' }} />
          : <Unlock style={{ width:18, height:18, color:'#94a3b8' }} />
        }
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:2 }}>
          <span style={{ fontWeight:700, color:'#1e293b', fontSize:'0.88rem' }}>{t.name}</span>
          {locked
            ? <span className="bdg bdg-pro">Premium</span>
            : <span className="bdg bdg-free">Free</span>
          }
        </div>
        <div style={{ fontSize:'0.74rem', color:'#94a3b8' }}>{t.description}</div>
        <div style={{ fontSize:'0.68rem', color:'#cbd5e1', marginTop:2, fontFamily:'monospace' }}>{t.id}</div>
      </div>
      <div style={{ flexShrink:0 }}>
        <div style={{
          width:36, height:20, borderRadius:999, position:'relative',
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
}
