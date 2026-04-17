import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/auth';
import { IAuthService } from '../domain/auth-service.interface';
import { USER_REPOSITORY } from '../../users/users.constants';
import { UserEntity } from '../../users/domain/entities/user.entity';
import { UserRepository } from '../../users/domain/repositories/user.repository';

@Injectable()
export class FirebaseAuthService implements IAuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async ensureUser(decodedToken: DecodedIdToken): Promise<UserEntity> {
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;

    if (!firebaseUid) {
      throw new UnauthorizedException('Firebase token missing uid');
    }
    if (!email) {
      throw new UnauthorizedException('Firebase token missing email');
    }

    let user = await this.userRepository.findByFirebaseUid(firebaseUid);
    if (!user) {
      user = await this.userRepository.create({
        email,
        firebaseUid,
      });
    }
    if (!user) {
      throw new UnauthorizedException('Unable to resolve authenticated user');
    }

    return user;
  }
}
