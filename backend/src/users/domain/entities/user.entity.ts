type UserEntityProps = {
  id: string;
  email: string;
  firebaseUid?: string | null;
  displayName?: string | null;
  createdAt: Date;
};

export class UserEntity {
  readonly id: string;
  readonly email: string;
  readonly firebaseUid: string | null;
  readonly displayName: string | null;
  readonly createdAt: Date;

  constructor({ id, email, firebaseUid, displayName, createdAt }: UserEntityProps) {
    this.id = id;
    this.email = email;
    this.firebaseUid = firebaseUid ?? null;
    this.displayName = displayName ?? null;
    this.createdAt = createdAt;
  }

  static fromPersistence(user: UserEntityProps | null) {
    if (!user) return null;
    return new UserEntity(user);
  }
}
