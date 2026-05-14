import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PAYMENT_PROVIDERS } from './payment.constants';
import {
  CreateCheckoutInput,
  PaymentProvider,
  PaymentProviderName,
  PaymentWebhookInput,
} from './payment-provider.interface';

@Injectable()
export class PaymentsService {
  private readonly providerMap: Map<PaymentProviderName, PaymentProvider>;

  constructor(
    @Inject(PAYMENT_PROVIDERS)
    providers: PaymentProvider[],
    private readonly config: ConfigService,
  ) {
    this.providerMap = new Map(providers.map((provider) => [provider.name, provider]));
  }

  async createCheckout(
    providerName: PaymentProviderName | undefined,
    input: CreateCheckoutInput,
  ) {
    const provider = this.resolveProvider(providerName);
    if (!provider.supportedPaymentMethods.includes(input.paymentMethod)) {
      throw new BadRequestException(
        `Forma de pagamento ${input.paymentMethod} não suportada por ${provider.name}`,
      );
    }

    return provider.createCheckout(input);
  }

  async handleWebhook(providerName: PaymentProviderName, input: PaymentWebhookInput) {
    const provider = this.resolveProvider(providerName);
    return provider.handleWebhook(input);
  }

  getSupportedMethods(providerName?: PaymentProviderName) {
    return this.resolveProvider(providerName).supportedPaymentMethods;
  }

  resolveProvider(providerName?: PaymentProviderName) {
    const resolvedName = providerName ?? this.getDefaultProviderName();
    const provider = this.providerMap.get(resolvedName);
    if (!provider) {
      throw new BadRequestException(`Gateway de pagamento inválido: ${resolvedName}`);
    }
    return provider;
  }

  private getDefaultProviderName(): PaymentProviderName {
    const configured =
      (this.config.get<string>('DEFAULT_PAYMENT_PROVIDER') as PaymentProviderName | undefined) ??
      undefined;

    if (configured && this.providerMap.has(configured)) {
      return configured;
    }

    if (this.config.get<string>('STRIPE_SECRET_KEY') && this.providerMap.has('stripe')) {
      return 'stripe';
    }

    return 'mercadopago';
  }
}
