import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaModule } from '../prisma/prisma.module';
//import { MercadoPagoPaymentProvider } from './providers/mercado-pago-payment.provider';
import { StripePaymentProvider } from './providers/stripe-payment.provider';
import { PAYMENT_PROVIDERS } from './payment.constants';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
 //   MercadoPagoPaymentProvider,
    StripePaymentProvider,
    {
      provide: PAYMENT_PROVIDERS,
      useFactory: (
 //       mercadoPago: MercadoPagoPaymentProvider,
        stripe: StripePaymentProvider,
      ) => [ stripe],
      inject: [ StripePaymentProvider],
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
