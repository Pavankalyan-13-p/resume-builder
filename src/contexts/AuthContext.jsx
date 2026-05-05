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
  doc, setDoc, getDoc, getDocFromServer, updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { googleProvider } from '../firebase/providers';
import { createOrFetchUserDoc } from '../firebase/userUtils';

const AuthContext = createContext(null);

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

  const upgradeToPremium = useCallback(async () => {
    if (!currentUser) return;
    // In production: verify Stripe payment via webhook before this call
    const ref = doc(db, 'users', currentUser.uid);
    await updateDoc(ref, { isPremium: true, upgradedAt: serverTimestamp() });
    setUserDoc(prev => ({ ...prev, isPremium: true }));
  }, [currentUser]);

  const deleteAccount = useCallback(async () => {
    if (!currentUser) return;
    // Delete Firestore document
    await deleteDoc(doc(db, 'users', currentUser.uid));
    // Delete Firebase Auth user
    await deleteUser(currentUser);
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

  const trackDownload = useCallback(async () => {
    if (!currentUser) return { allowed: true, remaining: Infinity };
    if (userDoc?.isPremium === true || userDoc?.role === "admin") return { allowed: true, remaining: Infinity };

    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const lastDate = userDoc?.lastDownloadDate || "";
    // Reset count when the calendar date changes
    const dailyCount = lastDate === today ? (userDoc?.downloadCount || 0) : 0;

    if (dailyCount >= 5) return { allowed: false, remaining: 0 };

    const newCount = dailyCount + 1;
    // Optimistic local update so the UI counter reflects immediately
    setUserDoc(prev => ({ ...prev, downloadCount: newCount, lastDownloadDate: today }));
    try {
      const ref = doc(db, 'users', currentUser.uid);
      // Write exact value (not increment) so a day-reset is persisted correctly
      await setDoc(ref, { downloadCount: newCount, lastDownloadDate: today }, { merge: true });
    } catch (e) {}
    return { allowed: true, remaining: 5 - newCount };
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
            setUserDoc(snap.data());
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

  const isPremium = userDoc?.isPremium === true;

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
    trackDownload,
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
