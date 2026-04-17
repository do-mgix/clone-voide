import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

type CheckoutItem = {
  productName: string;
  productEmoji: string;
  priceInCents: number;
  quantity: number;
};

type CreateCheckoutSessionInput = {
  orderId: string;
  items: CheckoutItem[];
  payerEmail: string;
  paymentMethod: 'pix' | 'credit_card' | 'boleto';
  shippingPriceCents?: number;
};

const PAYMENT_METHOD_MAP: Record<
  CreateCheckoutSessionInput['paymentMethod'],
  Stripe.Checkout.SessionCreateParams.PaymentMethodType[]
> = {
  credit_card: ['card'],
  pix: ['pix' as Stripe.Checkout.SessionCreateParams.PaymentMethodType],
  boleto: ['boleto' as Stripe.Checkout.SessionCreateParams.PaymentMethodType],
};

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly config: ConfigService) {
    this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY') ?? '');
  }

  async createCheckoutSession(input: CreateCheckoutSessionInput) {
    const appUrl = this.config.get<string>('APP_URL') ?? 'http://localhost:5173';
    const ordersPage = `${appUrl}/src/modules/orders/presentation/orders.html`;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = input.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: 'brl',
        unit_amount: item.priceInCents,
        product_data: {
          name: `${item.productEmoji} ${item.productName}`.trim(),
        },
      },
    }));

    if (input.shippingPriceCents && input.shippingPriceCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'brl',
          unit_amount: input.shippingPriceCents,
          product_data: { name: 'Frete' },
        },
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: PAYMENT_METHOD_MAP[input.paymentMethod] ?? ['card'],
      line_items: lineItems,
      client_reference_id: input.orderId,
      customer_email: input.payerEmail,
      success_url: `${ordersPage}?payment=success&orderId=${input.orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${ordersPage}?payment=failure&orderId=${input.orderId}`,
      metadata: { orderId: input.orderId },
    });

    this.logger.log(`Stripe Checkout Session created: ${session.id} → ${session.url}`);
    return { sessionId: session.id, checkoutUrl: session.url ?? '' };
  }

  constructEvent(payload: Buffer, signature: string) {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET') ?? '';
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
