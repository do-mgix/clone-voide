export class AuthRepository {
  async login(email, password) {
    throw new Error('AuthRepository.login must be implemented');
  }

  async logout() {
    throw new Error('AuthRepository.logout must be implemented');
  }

  async register(email, password) {
    throw new Error('AuthRepository.register must be implemented');
  }
}
