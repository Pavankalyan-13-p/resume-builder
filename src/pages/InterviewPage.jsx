import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import InterviewSimulator from '../components/InterviewSimulator.jsx';
import UpgradeModal from '../components/UpgradeModal.jsx';

function lsGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}

export default function InterviewPage() {
  const { currentUser, userDoc, isPremium, authLoading, upgradeToPremium } = useAuth();
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  const resume = lsGet('rb_resume');

  const isAdminUser = userDoc?.role === 'admin';
  const effectivePremium = isPremium || isAdminUser;

  const user = currentUser && userDoc ? {
    uid:   currentUser.uid,
    email: currentUser.email,
    name:  userDoc.displayName || currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
    ...userDoc,
    plan:  effectivePremium ? 'pro' : (userDoc.plan || 'free'),
  } : null;

  const handleUpgrade = async (paymentId = null, plan = 'monthly') => {
    if (!currentUser) return;
    await upgradeToPremium(paymentId, plan);
    setUpgradeModal(false);
    setUpgradeSuccess(true);
    setTimeout(() => setUpgradeSuccess(false), 4000);
  };

  if (authLoading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#64748b', fontSize: '0.9rem', fontFamily: 'system-ui' }}>Loading…</div>
      </div>
    );
  }

  return (
    <>
      {upgradeSuccess && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, background: '#15803d', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 4px 16px rgba(21,128,61,0.4)' }}>
          You're now Pro! All premium features unlocked.
        </div>
      )}
      <InterviewSimulator
        resume={resume}
        user={user}
        onClose={() => window.close()}
        onUpgrade={(plan) => user ? setUpgradeModal(plan || 'monthly') : (window.location.href = '/')}
      />
      {upgradeModal && (
        <UpgradeModal
          onClose={() => setUpgradeModal(false)}
          onUpgrade={handleUpgrade}
          user={user}
          plan={upgradeModal}
        />
      )}
    </>
  );
}
