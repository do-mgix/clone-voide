import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { AuthRepository } from '../domain/repositories/auth-repository.js';
import { auth } from './firebase-config.js';
import { apiClient } from '../../../shared/api/client.js';

export async function ensureServerSession(idToken) {
  if (!idToken) {
    console.error('Missing ID token before syncing with backend');
    throw new Error('Token Firebase não disponível');
  }

  console.log('Syncing Firebase session to backend', { hasToken: Boolean(idToken) });

  const response = await apiClient.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  console.log('Backend sync response', { status: response.status });
  return response.data;
}

function buildUserData(user) {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

function mapFirebaseError(code) {
  const map = {
    'auth/wrong-password': 'Senha incorreta.',
    'auth/user-not-found': 'Email não cadastrado.',
    'auth/invalid-credential': 'Email ou senha incorretos.',
    'auth/email-already-in-use': 'Este email já está cadastrado.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/user-disabled': 'Conta desativada.',
    'auth/popup-closed-by-user': 'Login cancelado.',
    'auth/cancelled-popup-request': 'Login cancelado.',
  };
  return map[code] ?? 'Erro de autenticação. Tente novamente.';
}

export class FirebaseAuthRepository extends AuthRepository {
  async login(email, password) {
    let credential;
    try {
      credential = await signInWithEmailAndPassword(auth, email, password);
    } catch (firebaseError) {
      throw { type: 'AUTH_ERROR', message: mapFirebaseError(firebaseError.code) };
    }

    const idToken = await credential.user.getIdToken(true);

    try {
      await ensureServerSession(idToken);
    } catch (backendError) {
      console.warn('Backend sync failed — continuing with Firebase session only', backendError);
    }

    return { accessToken: idToken, user: buildUserData(credential.user) };
  }

  async register(email, password) {
    let credential;
    try {
      credential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (firebaseError) {
      throw { type: 'AUTH_ERROR', message: mapFirebaseError(firebaseError.code) };
    }

    const idToken = await credential.user.getIdToken(true);

    try {
      await ensureServerSession(idToken);
    } catch (backendError) {
      console.warn('Backend sync failed — continuing with Firebase session only', backendError);
    }

    return { accessToken: idToken, user: buildUserData(credential.user) };
  }

  async logout() {
    await signOut(auth);
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    let credential;
    try {
      credential = await signInWithPopup(auth, provider);
    } catch (firebaseError) {
      throw { type: 'AUTH_ERROR', message: mapFirebaseError(firebaseError.code) };
    }

    const idToken = await credential.user.getIdToken(true);

    try {
      await ensureServerSession(idToken);
    } catch (backendError) {
      console.warn('Backend sync failed — continuing with Firebase session only', backendError);
    }

    return { accessToken: idToken, user: buildUserData(credential.user) };
  }
}
