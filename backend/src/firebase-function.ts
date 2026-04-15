import { onRequest } from 'firebase-functions/v2/https';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import express from 'express';
import { AppModule } from './app.module';
import { FirebaseAuthGuard } from './auth/guards/firebase-auth.guard';

const server = express();
let appReady: Promise<void> | null = null;

function initApp() {
  if (!appReady) {
    appReady = NestFactory.create(AppModule, new ExpressAdapter(server)).then(async (app) => {
      app.enableCors({
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          if (
            !origin ||
            origin === 'http://localhost:5173' ||
            origin === 'https://voide.up.railway.app' ||
            origin.endsWith('.web.app') ||
            origin.endsWith('.firebaseapp.com') ||
            origin.endsWith('.railway.app')
          ) {
            callback(null, true);
          } else {
            callback(null, false);
          }
        },
        credentials: true,
      });
      app.use(cookieParser());
      app.use(express.json());
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          exceptionFactory: (errors) => {
            console.dir(errors, { depth: null });
            return new BadRequestException('Validation failed');
          },
        }),
      );
      const firebaseGuard = app.get(FirebaseAuthGuard);
      app.useGlobalGuards(firebaseGuard);
      await app.init();
    });
  }
  return appReady;
}

export const api = onRequest(
  { region: 'southamerica-east1', memory: '512MiB', timeoutSeconds: 60 },
  async (req, res) => {
    await initApp();
    server(req as any, res as any);
  },
);
