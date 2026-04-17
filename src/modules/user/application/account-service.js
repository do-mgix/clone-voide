import { inMemoryAccountRepository } from '../infrastructure/in-memory-account-repository.js';

export function getAccountProfile() {
  return inMemoryAccountRepository.getProfile();
}
