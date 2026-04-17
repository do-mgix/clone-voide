import { Controller, Get, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAdminService } from '../auth/services/firebase-admin.service';

type HealthCheck = {
  name: string;
  status: 'ok' | 'failed';
  detail?: string;
};

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private prisma: PrismaService,
    private firebaseAdmin: FirebaseAdminService,
  ) {}

  @Get()
  async check() {
    const checks: HealthCheck[] = [];

    checks.push({
      name: 'database',
      status: 'failed',
    });

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks[checks.length - 1].status = 'ok';
    } catch (error) {
      checks[checks.length - 1].detail = 'Postgres unavailable';
      const detail = error instanceof Error ? error.stack : String(error);
      this.logger.warn('Database health check failed', detail);
    }

    const firebaseCheck: HealthCheck = {
      name: 'firebase-admin',
      status: 'failed',
    };

    if (this.firebaseAdmin.isInitialized()) {
      firebaseCheck.status = 'ok';
      firebaseCheck.detail = 'Firebase Admin initialized';
    } else {
      firebaseCheck.detail = 'Firebase Admin not initialized';
      this.logger.warn('Firebase admin not initialized');
    }

    checks.push(firebaseCheck);

    const allOk = checks.every((check) => check.status === 'ok');
    const summaryStatus = allOk ? 'ok' : 'error';

    this.logger.debug('Health check result', { summaryStatus, checks });

    if (!allOk) {
      throw new ServiceUnavailableException({
        status: summaryStatus,
        checks,
      });
    }

    return {
      status: summaryStatus,
      checks,
    };
  }
}
