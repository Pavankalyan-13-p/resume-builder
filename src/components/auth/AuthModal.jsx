import React, { useState, useRef, useEffect } from 'react';
import { X, Eye, EyeOff, ArrowLeft, Mail, Lock, User as UserIcon, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getFirebaseError } from '../../firebase/firebaseErrors';

// ─── Google logo SVG ────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.121 17.64 11.812 17.64 9.2Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

// ─── Input component ─────────────────────────────────────────────────────────
function AuthInput({ icon: Icon, type, placeholder, value, onChange, onToggle, showToggle, autoComplete, autoFocus }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }}>
        <Icon style={{ width: 16, height: 16 }} />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        style={{
          width: '100%',
          padding: '11px 40px 11px 40px',
          border: '1.5px solid #e5e5e5',
          background: '#fafaf9',
          fontSize: '0.9rem',
          color: '#1a1a1a',
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#1a2e4a'; }}
        onBlur={e => { e.currentTarget.style.borderColor = '#e5e5e5'; }}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0 }}
        >
          {type === 'password' ? <Eye style={{ width: 16, height: 16 }} /> : <EyeOff style={{ width: 16, height: 16 }} />}
        </button>
      )}
    </div>
  );
}

// ─── Main Modal ──────────────────────────────────────────────────────────────
export default function AuthModal({ mode = 'login', onClose, onSwitch, onSuccess }) {
  const [tab, setTab] = useState(mode); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { signInWithGoogle, signInWithEmail, signUpWithEmail, sendForgotPassword } = useAuth();

  // Sync tab if parent changes mode
  useEffect(() => { setTab(mode); setError(''); setSuccess(''); }, [mode]);

  const switchTab = (t) => {
    setTab(t);
    setError('');
    setSuccess('');
    if (onSwitch) onSwitch(t);
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess('Welcome back! Signed in with Google.');
      onClose();
    } catch (e) {
      setError(getFirebaseError(e.code));
    }
    setGoogleLoading(false);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (tab === 'login') {
        if (!email || !password) { setError('Email and password are required.'); setLoading(false); return; }
        await signInWithEmail(email.trim().toLowerCase(), password);
        if (onSuccess) onSuccess('Welcome back! You are now signed in.');
        onClose();
      } else if (tab === 'signup') {
        if (!email || !password) { setError('All fields are required.'); setLoading(false); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
        await signUpWithEmail(email.trim().toLowerCase(), password, name.trim() || undefined);
        if (onSuccess) onSuccess('Account created! You get 3 PDF and 10 Word exports per day for free.');
        onClose();
      } else if (tab === 'forgot') {
        if (!email) { setError('Enter your email address.'); setLoading(false); return; }
        await sendForgotPassword(email.trim().toLowerCase());
        setSuccess('Password reset email sent! Check your inbox (and spam folder).');
      }
    } catch (e) {
      setError(getFirebaseError(e.code));
    }
    setLoading(false);
  };

  const titles = {
    login: 'Welcome back',
    signup: 'Create your account',
    forgot: 'Reset your password',
  };
  const subtitles = {
    login: 'Sign in to sync your resume across devices.',
    signup: 'Free forever. No credit card required.',
    forgot: "We'll email you a link to reset your password.",
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,20,35,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', width: '100%', maxWidth: '420px', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden', animation: 'slideUp 0.22s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        `}</style>

        {/* Header */}
        <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <img src="/logo.png" alt="Foliant AI" style={{ height: 32, width: 'auto' }} />
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#aaa', flexShrink: 0 }}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            {tab === 'forgot' && (
              <button onClick={() => switchTab('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#888' }}>
                <ArrowLeft style={{ width: 16, height: 16 }} />
              </button>
            )}
            <h2 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: '1.4rem', fontWeight: 700, color: '#1a2e4a', margin: 0 }}>
              {titles[tab]}
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#888', margin: 0 }}>{subtitles[tab]}</p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem 1.5rem' }}>

          {/* Google button — not shown on forgot */}
          {tab !== 'forgot' && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading || loading}
                style={{
                  width: '100%', padding: '11px 16px', border: '1.5px solid #e5e5e5', background: '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  fontSize: '0.875rem', fontWeight: 600, color: '#333', marginBottom: '16px',
                  transition: 'border-color 0.15s, background 0.15s',
                  opacity: googleLoading ? 0.7 : 1,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#4285F4'; e.currentTarget.style.background = '#f8f9ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.background = '#fff'; }}
              >
                <GoogleIcon />
                {googleLoading ? 'Connecting…' : 'Continue with Google'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1, height: '1px', background: '#eee' }} />
                <span style={{ fontSize: '0.72rem', color: '#bbb', letterSpacing: '0.05em' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: '#eee' }} />
              </div>
            </>
          )}

          {/* Form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            {tab === 'signup' && (
              <AuthInput
                icon={UserIcon}
                type="text"
                placeholder="Full name (optional)"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
            )}
            <AuthInput
              icon={Mail}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
            {tab !== 'forgot' && (
              <AuthInput
                icon={Lock}
                type={showPass ? 'text' : 'password'}
                placeholder={tab === 'signup' ? 'Password (min. 6 characters)' : 'Password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                showToggle
                onToggle={() => setShowPass(p => !p)}
                autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
              />
            )}
          </div>

          {/* Forgot password link */}
          {tab === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: '14px', marginTop: '-4px' }}>
              <button type="button" onClick={() => switchTab('forgot')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: '#888', textDecoration: 'underline', padding: 0 }}>
                Forgot password?
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.8rem', marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0, marginTop: '1px' }}>⚠</span> {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{ padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '0.8rem', marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <CheckCircle style={{ width: 14, height: 14, flexShrink: 0, marginTop: '1px' }} /> {success}
            </div>
          )}

          {/* Submit */}
          {!success && (
            <button
              type="submit"
              disabled={loading || googleLoading}
              style={{
                width: '100%', padding: '12px', background: '#1a2e4a', color: '#fff', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.9rem',
                letterSpacing: '0.01em', opacity: loading ? 0.75 : 1, transition: 'background 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#243d60'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1a2e4a'; }}
            >
              {loading
                ? tab === 'forgot' ? 'Sending…' : tab === 'signup' ? 'Creating account…' : 'Signing in…'
                : tab === 'forgot' ? 'Send reset email'
                : tab === 'signup' ? 'Create account'
                : 'Sign in'}
            </button>
          )}

          {/* Switch tab */}
          <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.82rem', color: '#888' }}>
            {tab === 'login' ? (
              <>Don't have an account?{' '}
                <button type="button" onClick={() => switchTab('signup')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b84a2e', fontWeight: 600, padding: 0, textDecoration: 'underline' }}>Sign up free</button>
              </>
            ) : tab === 'signup' ? (
              <>Already have an account?{' '}
                <button type="button" onClick={() => switchTab('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b84a2e', fontWeight: 600, padding: 0, textDecoration: 'underline' }}>Sign in</button>
              </>
            ) : (
              <>Remember your password?{' '}
                <button type="button" onClick={() => switchTab('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b84a2e', fontWeight: 600, padding: 0, textDecoration: 'underline' }}>Sign in</button>
              </>
            )}
          </div>

          {/* Legal note for signup */}
          {tab === 'signup' && (
            <p style={{ fontSize: '0.7rem', color: '#bbb', textAlign: 'center', marginTop: '10px', lineHeight: 1.5 }}>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
