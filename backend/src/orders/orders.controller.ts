import { Body, Controller, Get, NotFoundException, Param, Post, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthenticatedRequest } from '../auth/guards/firebase-auth.guard';

function formatPrice(priceInCents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    priceInCents / 100,
  );
}

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'PIX',
  credit_card: 'Cartão de crédito',
  boleto: 'Boleto bancário',
};

const PAYMENT_PROVIDER_LABELS: Record<string, string> = {
  mercadopago: 'Mercado Pago',
  stripe: 'Stripe',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Aguardando pagamento',
  confirmed: 'Confirmado',
  processing: 'Em processamento',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Req() req: AuthenticatedRequest, @Body() dto: CreateOrderDto) {
    const { order, checkoutUrl } = await this.ordersService.createOrder(
      req.user!.id,
      req.user!.email,
      dto,
    );
    return { ...this.serialize(order), checkoutUrl };
  }

  @Get()
  async getOrders(@Req() req: AuthenticatedRequest) {
    const orders = await this.ordersService.getOrders(req.user!.id);
    return orders.map((o) => this.serialize(o));
  }

  @Get(':id')
  async getOrder(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const order = await this.ordersService.getOrder(req.user!.id, id);
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return this.serialize(order);
  }

  private serialize(order: any) {
    return {
      id: order.id,
      shortId: order.id.slice(0, 8).toUpperCase(),
      status: order.status,
      statusLabel: STATUS_LABELS[order.status] ?? order.status,
      totalCents: order.totalCents,
      total: formatPrice(order.totalCents),
      paymentProvider: order.paymentProvider,
      paymentProviderLabel: PAYMENT_PROVIDER_LABELS[order.paymentProvider] ?? order.paymentProvider,
      paymentMethod: order.paymentMethod,
      paymentLabel: PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod,
      address: {
        name: order.addressName,
        phone: order.addressPhone,
        street: order.addressStreet,
        number: order.addressNumber,
        complement: order.addressComplement,
        neighborhood: order.addressNeighborhood,
        city: order.addressCity,
        state: order.addressState,
        zip: order.addressZip,
      },
      shipping: order.shippingService ? {
        company: order.shippingCompany,
        service: order.shippingService,
        priceCents: order.shippingPriceCents,
        price: formatPrice(order.shippingPriceCents),
        deadline: order.shippingDeadline,
      } : null,
      createdAt: order.createdAt,
      items: order.items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        productEmoji: item.productEmoji,
        gradientKey: item.gradientKey,
        imageUrl: item.imageUrl ?? null,
        priceInCents: item.priceInCents,
        price: formatPrice(item.priceInCents),
        quantity: item.quantity,
        subtotal: formatPrice(item.priceInCents * item.quantity),
      })),
    };
  }
}
