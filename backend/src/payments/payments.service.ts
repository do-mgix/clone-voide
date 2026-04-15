import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

@Injectable()
export class PaymentsService {
  private readonly client: MercadoPagoConfig;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly config: ConfigService) {
    this.client = new MercadoPagoConfig({
      accessToken: this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN') ?? '',
    });
  }

  private get isSandbox() {
    const token = this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN') ?? '';
    return token.startsWith('TEST-');
  }

  async createPreference(order: {
    id: string;
    items: { productName: string; productEmoji: string; priceInCents: number; quantity: number }[];
    payerEmail: string;
  }) {
    const appUrl = this.config.get<string>('APP_URL') ?? 'http://localhost:5173';
    const backendUrl = this.config.get<string>('BACKEND_URL') ?? '';
    const ordersPage =
      `${appUrl}/src/modules/orders/presentation/orders.html`;

    const preference = new Preference(this.client);
    const response = await preference.create({
      body: {
        external_reference: order.id,
        items: order.items.map((item) => ({
          id: item.productName,
          title: `${item.productEmoji} ${item.productName}`,
          quantity: item.quantity,
          unit_price: item.priceInCents / 100,
          currency_id: 'BRL',
        })),
        payer: { email: order.payerEmail },
        back_urls: {
          success: `${ordersPage}?payment=success&orderId=${order.id}`,
          pending: `${ordersPage}?payment=pending&orderId=${order.id}`,
          failure: `${ordersPage}?payment=failure&orderId=${order.id}`,
        },
        auto_return: 'approved',
        ...(backendUrl && {
          notification_url: `${backendUrl}/payments/webhook`,
        }),
      },
    });

    const checkoutUrl = this.isSandbox
      ? response.sandbox_init_point
      : response.init_point;

    this.logger.log(`Preference created: ${response.id} → ${checkoutUrl}`);
    return { preferenceId: response.id!, checkoutUrl: checkoutUrl! };
  }

  async getPaymentById(paymentId: string) {
    const payment = new Payment(this.client);
    return payment.get({ id: paymentId });
  }
}
