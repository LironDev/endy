import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from './config';

/**
 * Ensures the user is signed in (anonymously if no account exists).
 * Called once on app startup before rendering.
 */
export async function ensureAuth() {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth)
          .then((cred) => resolve(cred.user))
          .catch(reject);
      }
    }, reject);
  });
}

export function getCurrentUser() {
  return auth.currentUser;
}

export function getCurrentUid() {
  return auth.currentUser?.uid ?? null;
}
