export class AccountProfile {
  constructor({ name = 'Visitante', email = 'usuario@email.com', memberSince = '2024' } = {}) {
    this.name = name;
    this.email = email;
    this.memberSince = memberSince;
  }
}
