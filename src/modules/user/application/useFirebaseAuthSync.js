import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../infrastructure/firebase-config.js';
import { ensureServerSession } from '../infrastructure/firebase-auth-repository.js';
import { markAuthInitialized } from './auth-state.js';

export function useFirebaseAuthSync() {
  useEffect(() => {
    console.log('Firebase Auth sync hook registering');
    let hasInitialized = false;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth State Changed:', user);
      if (!hasInitialized) {
        markAuthInitialized();
        hasInitialized = true;
      }
      if (!user) {
        return;
      }

      try {
        const token = await user.getIdToken(true);
        console.log('Token acquired in hook', Boolean(token));
        await ensureServerSession(token);
      } catch (error) {
        console.error('Failed to sync Firebase token within hook', error);
      }
    });

    return unsubscribe;
  }, []);
}
