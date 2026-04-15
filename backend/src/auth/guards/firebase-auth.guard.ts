import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseAdminService } from '../services/firebase-admin.service';
import { IAuthService } from '../domain/auth-service.interface';
import { AUTH_SERVICE } from '../auth.constants';
import { Request } from 'express';

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email: string;
    firebaseUid: string | null;
    displayName: string | null;
    createdAt: Date;
  };
};

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseAdmin: FirebaseAdminService,
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (
      request.method === 'OPTIONS' ||
      request.path.startsWith('/health') ||
      request.path.startsWith('/payments/webhook') ||
      request.path.startsWith('/shipping/calculate') ||
      (request.method === 'GET' && request.path.startsWith('/products'))
    ) {
      return true;
    }

    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const idToken = authorization.replace('Bearer ', '').trim();
    const decoded = await this.firebaseAdmin.verifyIdToken(idToken);
    console.log('Firebase token decoded', {
      uid: decoded.uid,
      email: decoded.email,
      issuedAt: decoded.iat,
    });
    const user = await this.authService.ensureUser(decoded);
    request.user = {
      id: user.id,
      email: user.email,
      firebaseUid: user.firebaseUid,
      displayName: user.displayName,
      createdAt: user.createdAt,
    };

    return true;
  }
}
