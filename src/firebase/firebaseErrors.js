const ERROR_MAP = {
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Try again.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/popup-blocked': 'Popup was blocked. Please allow popups and try again.',
  'auth/network-request-failed': 'Network error. Check your connection.',
  'auth/requires-recent-login': 'Please sign in again before deleting your account.',
};

export function getFirebaseError(code) {
  return ERROR_MAP[code] || 'Something went wrong. Please try again.';
}
