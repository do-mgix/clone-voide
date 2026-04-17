import { Injectable } from '@nestjs/common';
import { UserRepository } from '../domain/repositories/user.repository';
import { UserEntity } from '../domain/entities/user.entity';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrismaUserRepository extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return UserEntity.fromPersistence(user);
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return UserEntity.fromPersistence(user);
  }

  async findByFirebaseUid(firebaseUid: string) {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
    });
    return UserEntity.fromPersistence(user);
  }

  async create({ email, firebaseUid }: { email: string; firebaseUid: string }) {
    const user = await this.prisma.user.create({
      data: { email, firebaseUid },
    });
    return UserEntity.fromPersistence(user);
  }

  async update(id: string, data: { displayName?: string }) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    return UserEntity.fromPersistence(user);
  }
}
