import { GoogleAuthProvider } from 'firebase/auth';

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
// Always show the account chooser so users with multiple Google accounts
// get a picker, and users without a recent session see accounts not an email form.
googleProvider.setCustomParameters({ prompt: 'select_account' });
