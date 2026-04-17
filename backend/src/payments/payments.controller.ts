import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';

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
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    if (!signature || !req.rawBody) {
      throw new BadRequestException('Missing Stripe signature or raw body');
    }

    let event: Stripe.Event;
    try {
      event = this.paymentsService.constructEvent(req.rawBody, signature);
    } catch (err) {
      this.logger.error('Stripe webhook signature verification failed', err);
      throw new BadRequestException('Invalid signature');
    }

    this.logger.log(`Stripe webhook: ${event.type}`);

    const handled = new Set([
      'checkout.session.completed',
      'checkout.session.async_payment_succeeded',
      'checkout.session.async_payment_failed',
      'checkout.session.expired',
    ]);

    if (!handled.has(event.type)) return { received: true };

    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.client_reference_id ?? session.metadata?.orderId;
    if (!orderId) {
      this.logger.warn(`Stripe session ${session.id} has no orderId reference`);
      return { received: true };
    }

    const orderStatus = this.resolveOrderStatus(event.type, session.payment_status);
    await this.prisma.order.updateMany({
      where: { id: orderId },
      data: { status: orderStatus },
    });
    this.logger.log(`Order ${orderId} status → ${orderStatus} (${event.type})`);

    return { received: true };
  }

  private resolveOrderStatus(eventType: string, paymentStatus?: string | null) {
    if (
      eventType === 'checkout.session.expired' ||
      eventType === 'checkout.session.async_payment_failed'
    ) {
      return 'cancelled';
    }
    if (paymentStatus === 'paid' || paymentStatus === 'no_payment_required') {
      return 'confirmed';
    }
    return 'pending';
  }
}
