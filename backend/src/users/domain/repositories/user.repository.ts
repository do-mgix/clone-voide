import { UserEntity } from '../entities/user.entity';

export class UserRepository {
  async findByEmail(_email: string): Promise<UserEntity | null> {
    throw new Error('UserRepository.findByEmail must be implemented');
  }

  async findByFirebaseUid(_firebaseUid: string): Promise<UserEntity | null> {
    throw new Error('UserRepository.findByFirebaseUid must be implemented');
  }

  async findById(_id: string): Promise<UserEntity | null> {
    throw new Error('UserRepository.findById must be implemented');
  }

  async create(_data: { email: string; firebaseUid: string }): Promise<UserEntity | null> {
    throw new Error('UserRepository.create must be implemented');
  }

  async update(_id: string, _data: { displayName?: string }): Promise<UserEntity | null> {
    throw new Error('UserRepository.update must be implemented');
  }
}
