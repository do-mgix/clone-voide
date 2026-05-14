import { Body, Controller, Headers, HttpCode, Logger, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentProviderName } from './payment-provider.interface';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('webhook/:provider')
  @HttpCode(200)
  async handleWebhookByProvider(
    @Param('provider') provider: PaymentProviderName,
    @Body() body: any,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() req: Request & { rawBody?: string },
  ) {
    return this.processWebhook(provider, body, headers, req.rawBody);
  }

  @Post('webhook')
  @HttpCode(200)
  async handleLegacyMercadoPagoWebhook(
    @Body() body: any,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() req: Request & { rawBody?: string },
  ) {
    return this.processWebhook('mercadopago', body, headers, req.rawBody);
  }

  private async processWebhook(
    provider: PaymentProviderName,
    body: any,
    headers: Record<string, string | string[] | undefined>,
    rawBody?: string,
  ) {
    this.logger.log(
      `Webhook received: provider=${provider} type=${body?.type ?? 'unknown'} action=${body?.action ?? 'unknown'}`,
    );

    try {
      const result = await this.paymentsService.handleWebhook(provider, {
        body,
        headers,
        rawBody,
      });

      if (result.orderId && result.orderStatus) {
        await this.prisma.order.updateMany({
          where: { id: result.orderId },
          data: { status: result.orderStatus },
        });
        this.logger.log(
          `Order ${result.orderId} status → ${result.orderStatus} (${provider}: ${result.providerPaymentId ?? 'n/a'})`,
        );
      }
    } catch (err) {
      this.logger.error('Webhook processing failed', err);
    }

    return { received: true };
  }
}
