import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { UpsertCartItemDto } from './dto/upsert-cart-item.dto';
import { AuthenticatedRequest } from '../auth/guards/firebase-auth.guard';

function formatPrice(priceInCents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    priceInCents / 100,
  );
}

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req: AuthenticatedRequest) {
    const cart = await this.cartService.getCart(req.user!.id);
    return this.serialize(cart);
  }

  @Post('items')
  async upsertItem(@Req() req: AuthenticatedRequest, @Body() dto: UpsertCartItemDto) {
    const cart = await this.cartService.upsertItem(req.user!.id, dto.productId, dto.quantity);
    return this.serialize(cart);
  }

  @Delete('items/:productId')
  async removeItem(@Req() req: AuthenticatedRequest, @Param('productId') productId: string) {
    const cart = await this.cartService.removeItem(req.user!.id, productId);
    return this.serialize(cart);
  }

  @Delete()
  async clearCart(@Req() req: AuthenticatedRequest) {
    const cart = await this.cartService.clearCart(req.user!.id);
    return this.serialize(cart);
  }

  private serialize(cart: { items: any[] }) {
    return {
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: formatPrice(item.product.priceInCents),
          priceInCents: item.product.priceInCents,
          emoji: item.product.emoji,
          category: item.product.category,
          gradientKey: item.product.gradientKey,
          imageUrl: item.product.imageUrl ?? null,
        },
      })),
    };
  }
}
