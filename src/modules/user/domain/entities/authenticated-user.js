export class AuthenticatedUser {
  constructor({ email, accessToken, isAuthenticated = true } = {}) {
    this.email = email;
    this.accessToken = accessToken;
    this.isAuthenticated = Boolean(isAuthenticated);
  }

  static fromJson(value) {
    if (!value?.isAuthenticated) return null;
    return new AuthenticatedUser(value);
  }

  toJSON() {
    return {
      email: this.email,
      accessToken: this.accessToken,
      isAuthenticated: this.isAuthenticated,
    };
  }
}
