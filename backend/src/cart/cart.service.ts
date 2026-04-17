import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    return cart ?? { items: [] };
  }

  async upsertItem(userId: string, productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produto não encontrado');

    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity },
      create: { cartId: cart.id, productId, quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) return { items: [] };

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { items: [] };
  }
}
