// Firebase Google OAuth wrapper keeping the project's lovable.auth.signInWithOAuth interface intact.
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleAuthProvider, handleFirestoreError, OperationType } from '@/lib/firebase';

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (_provider: 'google' | 'apple', _opts?: SignInOptions) => {
      try {
        const credential = await signInWithPopup(auth, googleAuthProvider);
        const fbUser = credential.user;
        if (fbUser && fbUser.email) {
          const profilePath = `profiles/${fbUser.uid}`;
          try {
            await setDoc(
              doc(db, 'profiles', fbUser.uid),
              {
                id: fbUser.uid,
                email: fbUser.email,
                full_name: fbUser.displayName || fbUser.email.split('@')[0],
                avatar_url: fbUser.photoURL || '',
                updated_at: new Date().toISOString(),
              },
              { merge: true }
            );
          } catch (err) {
            if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
              handleFirestoreError(err, OperationType.WRITE, profilePath);
            }
          }
        }
        return { redirected: false, url: window.location.origin };
      } catch (error: any) {
        return { error };
      }
    },
  },
};
