import { Body, Controller, Headers, HttpCode, Logger, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';

const MP_STATUS_TO_ORDER: Record<string, string> = {
  approved: 'confirmed',
  pending: 'pending',
  in_process: 'processing',
  rejected: 'cancelled',
  cancelled: 'cancelled',
  refunded: 'cancelled',
};

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Body() body: any,
    @Headers('x-signature') signature?: string,
    @Headers('x-request-id') requestId?: string,
  ) {
    this.logger.log(`Webhook received: type=${body?.type} action=${body?.action}`);

    if (body?.type !== 'payment') return { received: true };

    const paymentId = body?.data?.id;
    if (!paymentId) return { received: true };

    try {
      const payment = await this.paymentsService.getPaymentById(String(paymentId));
      const orderId = payment.external_reference;
      const mpStatus = payment.status ?? 'pending';
      const orderStatus = MP_STATUS_TO_ORDER[mpStatus] ?? 'pending';

      if (orderId) {
        await this.prisma.order.updateMany({
          where: { id: orderId },
          data: { status: orderStatus },
        });
        this.logger.log(`Order ${orderId} status → ${orderStatus} (mp: ${mpStatus})`);
      }
    } catch (err) {
      this.logger.error('Webhook processing failed', err);
    }

    return { received: true };
  }
}
