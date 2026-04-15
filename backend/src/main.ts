import express from 'express';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { FirebaseAuthGuard } from './auth/guards/firebase-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (
        !origin ||
        origin === 'http://localhost:5173' ||
        origin === 'https://voide.up.railway.app' ||
        origin.endsWith('.web.app') ||
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
  // Serve static product images from the shared public/ folder (mounted at /static to avoid
  // conflicting with the /products API route — express.static would redirect /products to /products/)
  app.use('/static', express.static(path.join(process.cwd(), '..', 'public')));
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log('Incoming request', {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
    });
    next();
  });
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

  await app.listen(process.env.PORT ?? 3333);
}

bootstrap();
