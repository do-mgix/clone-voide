import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  constructor(private config: ConfigService) {}

  onModuleInit() {
    if (admin.apps.length) {
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.config.get('FIREBASE_PROJECT_ID'),
        clientEmail: this.config.get('FIREBASE_CLIENT_EMAIL'),
        privateKey: this.formatPrivateKey(this.config.get('FIREBASE_PRIVATE_KEY')),
      }),
    });
  }

  private formatPrivateKey(rawKey?: string) {
    if (!rawKey) return undefined;
    return rawKey.replace(/\\n/g, '\n');
  }

  verifyIdToken(token: string) {
    return admin.auth().verifyIdToken(token);
  }

  isInitialized() {
    return admin.apps.length > 0;
  }
}
