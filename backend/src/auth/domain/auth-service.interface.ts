import { DecodedIdToken } from 'firebase-admin/auth';
import { UserEntity } from '../../users/domain/entities/user.entity';

export interface IAuthService {
  ensureUser(decodedToken: DecodedIdToken): Promise<UserEntity>;
}
