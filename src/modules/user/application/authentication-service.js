import { FirebaseAuthRepository } from '../infrastructure/firebase-auth-repository.js';
import { AuthenticatedUser } from '../domain/entities/authenticated-user.js';
import { persistAuthState, clearAuthState } from './auth-state.js';

function normalizeEmail(email) {
  return email?.trim().toLowerCase();
}

export class AuthenticationService {
  constructor(repository) {
    this.repository = repository;
  }

  async login({ email, password }) {
    const normalizedEmail = normalizeEmail(email);
    const { accessToken, user } = await this.repository.login(normalizedEmail, password);
    const session = new AuthenticatedUser({
      email: user?.email ?? normalizedEmail,
      accessToken,
    });
    persistAuthState(session);
    return session;
  }

  async register({ email, password }) {
    const normalizedEmail = normalizeEmail(email);
    const { accessToken, user } = await this.repository.register(normalizedEmail, password);
    const session = new AuthenticatedUser({
      email: user?.email ?? normalizedEmail,
      accessToken,
    });
    persistAuthState(session);
    return session;
  }

  async logout() {
    await this.repository.logout();
    clearAuthState();
    window.sessionStorage.removeItem('pendingGoogleProfile');
  }

  async loginWithGoogle() {
    const { accessToken, user } = await this.repository.loginWithGoogle();
    const session = new AuthenticatedUser({ email: user?.email, accessToken, isAuthenticated: true });
    persistAuthState(session);
    return { session, user };
  }
}

export const authenticationService = new AuthenticationService(new FirebaseAuthRepository());
