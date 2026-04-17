import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Product as ProductModel, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PRODUCT_SEED_DATA } from './products.seed-data';

type ListProductsOptions = {
  category?: string;
  featured?: boolean;
  limit?: number;
  q?: string;
  sort?: string;
};

function formatPrice(priceInCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(priceInCents / 100);
}

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.prisma.product.createMany({
      data: PRODUCT_SEED_DATA,
      skipDuplicates: true,
    });
  }

  async list(options: ListProductsOptions = {}) {
    const products = await this.prisma.product.findMany({
      where: this.buildWhere(options),
      orderBy: this.buildOrderBy(options.sort),
      take: options.limit,
    });

    return {
      products: products.map(this.serializeProduct),
    };
  }

  async getById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return this.serializeProduct(product);
  }

  async categories() {
    const products = await this.prisma.product.findMany({
      select: { category: true },
      orderBy: { category: 'asc' },
    });

    const counts = products.reduce<Map<string, number>>((accumulator, product) => {
      accumulator.set(product.category, (accumulator.get(product.category) ?? 0) + 1);
      return accumulator;
    }, new Map());

    return {
      categories: Array.from(counts.entries()).map(([name, count]) => ({ name, count })),
    };
  }

  private buildOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput[] {
    switch (sort) {
      case 'price-asc':
        return [{ priceInCents: 'asc' }, { name: 'asc' }];
      case 'price-desc':
        return [{ priceInCents: 'desc' }, { name: 'asc' }];
      case 'name-asc':
        return [{ name: 'asc' }];
      case 'name-desc':
        return [{ name: 'desc' }];
      default:
        return [{ featured: 'desc' }, { createdAt: 'desc' }];
    }
  }

  private buildWhere(options: ListProductsOptions): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};

    if (options.category && options.category !== 'Todos') {
      where.category = options.category;
    }

    if (options.featured) {
      where.featured = true;
    }

    if (options.q) {
      where.OR = [
        {
          name: {
            contains: options.q,
            mode: 'insensitive',
          },
        },
        {
          category: {
            contains: options.q,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  private serializeProduct = (product: ProductModel) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: formatPrice(product.priceInCents),
    priceInCents: product.priceInCents,
    old: product.oldPriceInCents ? formatPrice(product.oldPriceInCents) : null,
    oldPriceInCents: product.oldPriceInCents,
    emoji: product.emoji,
    cat: product.category,
    pib: product.gradientKey,
    badge: product.badge,
    featured: product.featured,
    sizes: product.sizes,
    colors: product.colors,
    rating: product.rating,
    reviews: product.reviews,
    imageUrl: product.imageUrl ?? null,
  });
}
