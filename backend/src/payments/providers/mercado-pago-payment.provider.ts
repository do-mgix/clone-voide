import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import {
  CreateCheckoutInput,
  CreateCheckoutResult,
  PaymentProvider,
  PaymentWebhookInput,
  PaymentWebhookResult,
} from '../payment-provider.interface';

const MP_STATUS_TO_ORDER: Record<string, string> = {
  approved: 'confirmed',
  pending: 'pending',
  in_process: 'processing',
  rejected: 'cancelled',
  cancelled: 'cancelled',
  refunded: 'cancelled',
};

@Injectable()
export class MercadoPagoPaymentProvider implements PaymentProvider {
  readonly name = 'mercadopago' as const;
  readonly supportedPaymentMethods = ['pix', 'credit_card', 'boleto'] as const;

  private readonly client: MercadoPagoConfig;
  private readonly logger = new Logger(MercadoPagoPaymentProvider.name);

  constructor(private readonly config: ConfigService) {
    this.client = new MercadoPagoConfig({
      accessToken: this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN') ?? '',
    });
  }

  private get isSandbox() {
    const token = this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN') ?? '';
    return token.startsWith('TEST-');
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const appUrl = this.config.get<string>('APP_URL') ?? 'http://localhost:5173';
    const backendUrl = this.config.get<string>('BACKEND_URL') ?? '';
    const ordersPage = `${appUrl}/src/modules/orders/presentation/orders.html`;

    const preference = new Preference(this.client);
    const response = await preference.create({
      body: {
        external_reference: input.orderId,
        items: input.items.map((item) => ({
          id: item.productName,
          title: `${item.productEmoji} ${item.productName}`,
          quantity: item.quantity,
          unit_price: item.priceInCents / 100,
          currency_id: 'BRL',
        })),
        payer: { email: input.payerEmail },
        back_urls: {
          success: `${ordersPage}?payment=success&orderId=${input.orderId}&provider=mercadopago`,
          pending: `${ordersPage}?payment=pending&orderId=${input.orderId}&provider=mercadopago`,
          failure: `${ordersPage}?payment=failure&orderId=${input.orderId}&provider=mercadopago`,
        },
        auto_return: 'approved',
        ...(backendUrl && {
          notification_url: `${backendUrl}/payments/webhook/mercadopago`,
        }),
      },
    });

    const checkoutUrl = this.isSandbox ? response.sandbox_init_point : response.init_point;

    this.logger.log(`Preference created: ${response.id} → ${checkoutUrl}`);
    return {
      provider: this.name,
      paymentSessionId: response.id!,
      legacyPreferenceId: response.id!,
      checkoutUrl: checkoutUrl!,
    };
  }

  async handleWebhook(input: PaymentWebhookInput): Promise<PaymentWebhookResult> {
    if (input.body?.type !== 'payment') {
      return { handled: false, eventType: input.body?.type };
    }

    const paymentId = input.body?.data?.id;
    if (!paymentId) {
      return { handled: false, eventType: 'payment' };
    }

    const payment = await new Payment(this.client).get({ id: String(paymentId) });
    const mpStatus = payment.status ?? 'pending';

    return {
      handled: true,
      orderId: payment.external_reference ?? undefined,
      orderStatus: MP_STATUS_TO_ORDER[mpStatus] ?? 'pending',
      providerPaymentId: String(payment.id ?? paymentId),
      eventType: input.body?.type,
    };
  }
}
