import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import {
  CreateCheckoutInput,
  CreateCheckoutResult,
  PaymentProvider,
  PaymentWebhookInput,
  PaymentWebhookResult,
} from '../payment-provider.interface';

type StripeSession = {
  id: string;
  url: string | null;
  payment_status?: string;
  metadata?: Record<string, string>;
};

type StripeEvent = {
  id: string;
  type: string;
  data?: {
    object?: any;
  };
};

@Injectable()
export class StripePaymentProvider implements PaymentProvider {
  readonly name = 'stripe' as const;
  readonly supportedPaymentMethods = ['credit_card'] as const;

  private readonly logger = new Logger(StripePaymentProvider.name);

  constructor(private readonly config: ConfigService) {}

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    if (input.paymentMethod !== 'credit_card') {
      throw new BadRequestException('Stripe suporta apenas cartão de crédito nesta integração');
    }

    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new BadRequestException('STRIPE_SECRET_KEY não configurada');
    }

    const appUrl = this.config.get<string>('APP_URL') ?? 'http://localhost:5173';
    const ordersPage = `${appUrl}/src/modules/orders/presentation/orders.html`;
    const form = new URLSearchParams();

    form.set('mode', 'payment');
    form.set('success_url', `${ordersPage}?payment=success&orderId=${input.orderId}&provider=stripe`);
    form.set('cancel_url', `${ordersPage}?payment=failure&orderId=${input.orderId}&provider=stripe`);
    form.set('customer_email', input.payerEmail);
    form.set('locale', 'pt-BR');
    form.set('metadata[orderId]', input.orderId);
    form.set('metadata[paymentProvider]', this.name);
    form.set('metadata[paymentMethod]', input.paymentMethod);
    form.set('payment_intent_data[metadata][orderId]', input.orderId);
    form.set('payment_intent_data[metadata][paymentProvider]', this.name);
    form.set('payment_intent_data[metadata][paymentMethod]', input.paymentMethod);
    form.set('payment_method_types[0]', 'card');

    input.items.forEach((item, index) => {
      form.set(`line_items[${index}][quantity]`, String(item.quantity));
      form.set(`line_items[${index}][price_data][currency]`, 'brl');
      form.set(`line_items[${index}][price_data][unit_amount]`, String(item.priceInCents));
      form.set(
        `line_items[${index}][price_data][product_data][name]`,
        `${item.productEmoji} ${item.productName}`,
      );
    });

    if (input.shipping?.priceCents) {
      const shippingIndex = input.items.length;
      form.set(`line_items[${shippingIndex}][quantity]`, '1');
      form.set(`line_items[${shippingIndex}][price_data][currency]`, 'brl');
      form.set(`line_items[${shippingIndex}][price_data][unit_amount]`, String(input.shipping.priceCents));
      form.set(
        `line_items[${shippingIndex}][price_data][product_data][name]`,
        `Frete ${input.shipping.company} ${input.shipping.service}`,
      );
    }

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Stripe checkout creation failed: ${response.status} ${errorText}`);
      throw new BadRequestException('Falha ao criar checkout no Stripe');
    }

    const session = (await response.json()) as StripeSession;
    if (!session.url) {
      throw new BadRequestException('Stripe não retornou URL de checkout');
    }

    return {
      provider: this.name,
      paymentSessionId: session.id,
      checkoutUrl: session.url,
    };
  }

  async handleWebhook(input: PaymentWebhookInput): Promise<PaymentWebhookResult> {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET não configurada');
    }

    const signature = this.header(input.headers['stripe-signature']);
    const rawBody = input.rawBody;
    if (!signature || !rawBody) {
      throw new UnauthorizedException('Stripe signature missing');
    }

    this.assertValidSignature(rawBody, signature, webhookSecret);

    const event = JSON.parse(rawBody) as StripeEvent;
    const object = event.data?.object ?? {};
    const orderId =
      object.metadata?.orderId ??
      object.client_reference_id ??
      object.payment_intent?.metadata?.orderId;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = object as StripeSession;
        return {
          handled: true,
          orderId,
          orderStatus: session.payment_status === 'paid' ? 'confirmed' : 'pending',
          providerPaymentId: session.id,
          eventType: event.type,
        };
      }
      case 'checkout.session.async_payment_succeeded':
        return {
          handled: true,
          orderId,
          orderStatus: 'confirmed',
          providerPaymentId: String(object.id ?? ''),
          eventType: event.type,
        };
      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired':
        return {
          handled: true,
          orderId,
          orderStatus: 'cancelled',
          providerPaymentId: String(object.id ?? ''),
          eventType: event.type,
        };
      default:
        return {
          handled: false,
          orderId,
          providerPaymentId: String(object.id ?? ''),
          eventType: event.type,
        };
    }
  }

  private header(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
  }

  private assertValidSignature(rawBody: string, signatureHeader: string, webhookSecret: string) {
    const pairs = signatureHeader.split(',').map((part) => part.trim());
    const timestamp = pairs.find((part) => part.startsWith('t='))?.slice(2);
    const signature = pairs.find((part) => part.startsWith('v1='))?.slice(3);

    if (!timestamp || !signature) {
      throw new UnauthorizedException('Stripe signature invalid');
    }

    const signedPayload = `${timestamp}.${rawBody}`;
    const expected = createHmac('sha256', webhookSecret).update(signedPayload).digest('hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    const receivedBuffer = Buffer.from(signature, 'hex');

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      throw new UnauthorizedException('Stripe signature mismatch');
    }
  }
}
