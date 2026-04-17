import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { FirebaseAdminService } from './services/firebase-admin.service';
import { FirebaseAuthService } from './services/firebase-auth.service';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { AUTH_SERVICE } from './auth.constants';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    FirebaseAdminService,
    {
      provide: AUTH_SERVICE,
      useClass: FirebaseAuthService,
    },
    FirebaseAuthGuard,
  ],
  exports: [FirebaseAuthGuard, FirebaseAdminService],
})
export class AuthModule {}
