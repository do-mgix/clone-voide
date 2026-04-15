import { readJson, writeJson } from '../../../shared/kernel/browser-storage.js';
import { AuthenticatedUser } from '../domain/entities/authenticated-user.js';

const STORAGE_KEY = 'shopstore-auth-session';
const subscribers = new Set();
const initSubscribers = new Set();
let isAuthInitializing = true;

let currentSession = AuthenticatedUser.fromJson(readJson(STORAGE_KEY, null));

export function getAuthState() {
  return currentSession;
}

export function subscribeAuthState(listener) {
  listener(currentSession);
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

export function persistAuthState(session) {
  currentSession = session;
  writeJson(STORAGE_KEY, session?.toJSON() ?? null);
  notify();
}

export function clearAuthState() {
  currentSession = null;
  writeJson(STORAGE_KEY, null);
  notify();
}

export function subscribeAuthInitializing(listener) {
  listener(isAuthInitializing);
  initSubscribers.add(listener);
  return () => initSubscribers.delete(listener);
}

export function markAuthInitialized() {
  if (!isAuthInitializing) return;
  isAuthInitializing = false;
  initSubscribers.forEach((listener) => listener(isAuthInitializing));
}

export function getIsAuthInitializing() {
  return isAuthInitializing;
}

function notify() {
  subscribers.forEach((listener) => listener(currentSession));
}
