import { AccountProfile } from '../domain/entities/account-profile.js';
import { AccountRepository } from '../domain/repositories/account-repository.js';

export class InMemoryAccountRepository extends AccountRepository {
  getProfile() {
    return new AccountProfile();
  }
}

export const inMemoryAccountRepository = new InMemoryAccountRepository();
