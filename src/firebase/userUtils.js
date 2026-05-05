import { doc, setDoc, getDocFromServer, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

export async function createOrFetchUserDoc(firebaseUser) {
  const ref = doc(db, 'users', firebaseUser.uid);
  // Always read from server — never from cache — so we never mistake an
  // existing user (who may have downloadCount > 0) for a new one.
  const snap = await getDocFromServer(ref);
  if (snap.exists()) {
    return snap.data();
  }
  const data = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    photoURL: firebaseUser.photoURL || null,
    isPremium: false,
    downloadCount: 0,
    provider: firebaseUser.providerData?.[0]?.providerId || 'password',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, data);
  return data;
}
