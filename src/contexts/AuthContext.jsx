import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, getDocFromServer, updateDoc, deleteDoc, serverTimestamp,
  collection, addDoc, getDocs, query, orderBy, Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { googleProvider } from '../firebase/providers';
import { createOrFetchUserDoc } from '../firebase/userUtils';

const AuthContext = createContext(null);

// ─── Premium expiry helpers ───────────────────────────────────────────────────

// Returns true only when the user is premium AND their subscription has not lapsed.
// Legacy docs that have isPremium=true but no premiumExpiresAt field keep their
// access (migration grace) — they will get an expiry on their next payment.
export function isActivePremium(userDoc) {
  if (!userDoc?.isPremium) return false;
  const exp = userDoc.premiumExpiresAt;
  if (!exp) return true; // no expiry stored → legacy user, keep active
  const expDate = exp.toDate ? exp.toDate() : new Date((exp.seconds || 0) * 1000);
  return expDate > new Date();
}

// Called once on login. If the stored doc shows premium but the expiry has
// passed, writes the downgrade to Firestore and returns the corrected data.
async function autoDowngradeIfExpired(data, uid) {
  if (!data?.isPremium || !data?.premiumExpiresAt) return data;
  const exp = data.premiumExpiresAt;
  const expDate = exp.toDate ? exp.toDate() : new Date((exp.seconds || 0) * 1000);
  if (expDate > new Date()) return data; // still valid
  try {
    await updateDoc(doc(db, 'users', uid), {
      isPremium: false,
      plan:      'free',
      downgradedAt: serverTimestamp(),
    });
  } catch (_) {} // fire-and-forget; local state is revoked regardless
  return { ...data, isPremium: false, plan: 'free' };
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Auth operations ────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    // Don't wait for Firestore — onAuthStateChanged handles doc creation/fetch
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user };
  }, []);

  const signInWithEmail = useCallback(async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user };
  }, []);

  const signUpWithEmail = useCallback(async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(result.user, { displayName });
    return { user: result.user };
  }, []);

  const sendForgotPassword = useCallback(async (email) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserDoc(null);
  }, []);

  // ── Profile operations ─────────────────────────────────────────────────
  const updateUserProfile = useCallback(async (patch) => {
    if (!currentUser) return;
    setUserDoc(prev => ({ ...prev, ...patch })); // optimistic update — instant UI
    if (patch.displayName) updateProfile(currentUser, { displayName: patch.displayName });
    const ref = doc(db, 'users', currentUser.uid);
    updateDoc(ref, { ...patch, updatedAt: serverTimestamp() }).catch(() => {});
  }, [currentUser]);

  const upgradeToPremium = useCallback(async (paymentId = null, plan = 'monthly') => {
    if (!currentUser) return;
    const ref = doc(db, 'users', currentUser.uid);
    const daysToAdd       = plan === 'yearly' ? 365 : 30;
    const expiresDate     = new Date();
    expiresDate.setDate(expiresDate.getDate() + daysToAdd);
    const premiumExpiresAt = Timestamp.fromDate(expiresDate);
    await updateDoc(ref, {
      isPremium:         true,
      plan,
      upgradedAt:        serverTimestamp(),
      premiumExpiresAt,
      ...(paymentId && { lastPaymentId: paymentId }),
    });
    setUserDoc(prev => ({ ...prev, isPremium: true, plan, premiumExpiresAt }));
  }, [currentUser]);

  const deleteAccount = useCallback(async () => {
    if (!currentUser) return;
    // Auth user deleted first — if this fails, Firestore data is still intact
    // and the user can retry. Reversing the order risks orphaned auth accounts
    // with no Firestore doc, which can't be cleaned up without admin SDK access.
    await deleteUser(currentUser);
    // Firestore cleanup after auth is gone — failure here leaves an orphaned doc
    // but the account itself is deleted and the user is logged out.
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid));
    } catch (_) {}
    setCurrentUser(null);
    setUserDoc(null);
  }, [currentUser]);

  // ── Resume sync ────────────────────────────────────────────────────────
  const saveResumeToCloud = useCallback(async (resumeData, templateId) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        resumeData,
        templateId,
        resumeUpdatedAt: serverTimestamp(),
      });
    } catch (e) {
      // Silently fail — localStorage is the fallback
    }
  }, [currentUser]);

  const loadResumeFromCloud = useCallback(async (uid) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const d = snap.data();
        return { resumeData: d.resumeData || null, templateId: d.templateId || null };
      }
    } catch (e) {}
    return { resumeData: null, templateId: null };
  }, []);

  // ── Multi-resume subcollection ─────────────────────────────────────────
  const loadUserResumes = useCallback(async () => {
    if (!currentUser) return [];
    try {
      const q = query(collection(db, 'users', currentUser.uid, 'resumes'), orderBy('updatedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch { return []; }
  }, [currentUser]);

  const saveResumeToSubcollection = useCallback(async (resumeId, resumeData, templateId, title) => {
    if (!currentUser) return null;
    try {
      const name = title || resumeData?.personal?.name || 'My Resume';
      if (resumeId) {
        await setDoc(doc(db, 'users', currentUser.uid, 'resumes', resumeId),
          { resumeData, templateId, title: name, updatedAt: serverTimestamp() }, { merge: true });
        return resumeId;
      }
      const ref = await addDoc(collection(db, 'users', currentUser.uid, 'resumes'),
        { title: name, resumeData, templateId, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      return ref.id;
    } catch { return null; }
  }, [currentUser]);

  const deleteResumeDoc = useCallback(async (resumeId) => {
    if (!currentUser || !resumeId) return;
    await deleteDoc(doc(db, 'users', currentUser.uid, 'resumes', resumeId));
  }, [currentUser]);

  const DAILY_LIMIT_FREE = 3;
  const DAILY_LIMIT_PRO  = 10;

  // Tracks PDF-only quota. Word exports are unlimited and never call this.
  // Free: 3 PDF/day. Pro: 10 PDF/day (silent abuse cap — not shown in UI).
  const trackPdfDownload = useCallback(async () => {
    if (!currentUser) return { allowed: true, remaining: Infinity };
    if (userDoc?.role === "admin") return { allowed: true, remaining: Infinity };

    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const lastDate = userDoc?.lastDownloadDate || "";
    // Reset count when the calendar date changes
    const dailyCount = lastDate === today ? (userDoc?.downloadCount || 0) : 0;

    const isPro = isActivePremium(userDoc);
    const limit = isPro ? DAILY_LIMIT_PRO : DAILY_LIMIT_FREE;

    if (dailyCount >= limit) return { allowed: false, remaining: 0 };

    const newCount = dailyCount + 1;
    // Optimistic local update so the UI counter reflects immediately
    setUserDoc(prev => ({ ...prev, downloadCount: newCount, lastDownloadDate: today }));
    try {
      const ref = doc(db, 'users', currentUser.uid);
      // Write exact value (not increment) so a day-reset is persisted correctly
      await setDoc(ref, { downloadCount: newCount, lastDownloadDate: today }, { merge: true });
    } catch (e) {}
    return { allowed: true, remaining: limit - newCount };
  }, [currentUser, userDoc]);

  // ── Auth state listener ────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Use getDocFromServer to bypass persistent cache and always get the
          // real saved downloadCount from Firestore on every login
          const snap = await getDocFromServer(doc(db, 'users', user.uid));
          if (snap.exists()) {
            const data = await autoDowngradeIfExpired(snap.data(), user.uid);
            setUserDoc(data);
          } else {
            const data = await createOrFetchUserDoc(user);
            setUserDoc(data);
          }
        } catch {
          // Offline — fall back to local cache; never overwrite with defaults
          try {
            const cached = await getDoc(doc(db, 'users', user.uid));
            if (cached.exists()) { setUserDoc(cached.data()); }
          } catch (_) {
            // Cache also unavailable — keep whatever userDoc is already in state
            // so an existing session's count is not lost
          }
        }
      } else {
        setUserDoc(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Checks expiry on every render — immediately reflects a lapsed subscription
  // without needing a Firestore round-trip (Firestore write-back happens on next login).
  const isPremium = isActivePremium(userDoc);

  const value = {
    currentUser,
    userDoc,
    isPremium,
    authLoading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendForgotPassword,
    logout,
    updateUserProfile,
    upgradeToPremium,
    deleteAccount,
    saveResumeToCloud,
    loadResumeFromCloud,
    trackPdfDownload,
    loadUserResumes,
    saveResumeToSubcollection,
    deleteResumeDoc,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
