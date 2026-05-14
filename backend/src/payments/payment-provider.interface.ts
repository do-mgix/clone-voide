export type PaymentProviderName = 'mercadopago' | 'stripe';
export type PaymentMethodName = 'pix' | 'credit_card' | 'boleto';

export type CheckoutItem = {
  productName: string;
  productEmoji: string;
  priceInCents: number;
  quantity: number;
};

export type ShippingInfo = {
  company: string;
  service: string;
  priceCents: number;
};

export type CreateCheckoutInput = {
  orderId: string;
  paymentMethod: PaymentMethodName;
  payerEmail: string;
  items: CheckoutItem[];
  shipping?: ShippingInfo | null;
};

export type CreateCheckoutResult = {
  provider: PaymentProviderName;
  paymentSessionId: string;
  checkoutUrl: string;
  legacyPreferenceId?: string;
};

export type PaymentWebhookInput = {
  body: any;
  headers: Record<string, string | string[] | undefined>;
  rawBody?: string;
};

export type PaymentWebhookResult = {
  handled: boolean;
  orderId?: string;
  orderStatus?: string;
  providerPaymentId?: string;
  eventType?: string;
};

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  readonly supportedPaymentMethods: readonly PaymentMethodName[];

  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;
  handleWebhook(input: PaymentWebhookInput): Promise<PaymentWebhookResult>;
}
