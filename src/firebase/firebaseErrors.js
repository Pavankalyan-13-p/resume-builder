const ERROR_MAP = {
  // ── Credential errors ──────────────────────────────────────────────────────
  'auth/user-not-found':    'No account found with this email.',
  'auth/wrong-password':    'Incorrect password. Try again.',
  // Firebase v9+ merges wrong-password and user-not-found into invalid-credential
  'auth/invalid-credential': 'Incorrect email or password. If you signed up with Google, use "Continue with Google" instead.',

  // ── Registration errors ────────────────────────────────────────────────────
  'auth/email-already-in-use':
    'An account already exists with this email.',
  // User registered with Google then tries email/password (or vice-versa)
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using a different sign-in method. Try "Continue with Google" instead.',

  // ── Password / email format ────────────────────────────────────────────────
  'auth/weak-password':     'Password must be at least 6 characters.',
  'auth/invalid-email':     'Please enter a valid email address.',

  // ── Rate limiting / account state ─────────────────────────────────────────
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/user-disabled':     'This account has been disabled. Contact support.',

  // ── Popup / redirect flow ──────────────────────────────────────────────────
  'auth/popup-closed-by-user':    'Sign-in was cancelled.',
  'auth/popup-blocked':           'Popup was blocked by your browser. Please allow popups for this site and try again.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',

  // ── Network / config ───────────────────────────────────────────────────────
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/operation-not-allowed':  'This sign-in method is not enabled. Please contact support.',
  'auth/internal-error':         'An internal error occurred. Please try again.',

  // ── Re-authentication ──────────────────────────────────────────────────────
  'auth/requires-recent-login':  'Please sign in again before performing this action.',
};

export function getFirebaseError(code) {
  return ERROR_MAP[code] ?? 'Something went wrong. Please try again.';
}
