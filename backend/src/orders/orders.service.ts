import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentsService,
  ) {}

  async createOrder(userId: string, userEmail: string, dto: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('O carrinho está vazio');
    }

    const subtotalCents = cart.items.reduce(
      (sum, item) => sum + item.product.priceInCents * item.quantity,
      0,
    );
    const shippingCents = dto.shipping?.priceCents ?? 0;
    const totalCents = subtotalCents + shippingCents;

    const { address, paymentMethod, shipping } = dto;

    const order = await this.prisma.order.create({
      data: {
        userId,
        totalCents,
        paymentMethod,
        status: 'pending',
        shippingServiceId: shipping?.serviceId ?? null,
        shippingCompany: shipping?.company ?? null,
        shippingService: shipping?.service ?? null,
        shippingPriceCents: shippingCents,
        shippingDeadline: shipping?.deadline ?? null,
        addressName: address.name,
        addressPhone: address.phone,
        addressStreet: address.street,
        addressNumber: address.number,
        addressComplement: address.complement ?? null,
        addressNeighborhood: address.neighborhood,
        addressCity: address.city,
        addressState: address.state,
        addressZip: address.zip,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productEmoji: item.product.emoji,
            gradientKey: item.product.gradientKey,
            imageUrl: item.product.imageUrl ?? null,
            priceInCents: item.product.priceInCents,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    const { preferenceId, checkoutUrl } = await this.payments.createPreference({
      id: order.id,
      items: order.items,
      payerEmail: userEmail,
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { preferenceId },
    });

    return { order, checkoutUrl };
  }

  async getOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrder(userId: string, orderId: string) {
    return this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });
  }
}
