import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(
    @Query('category') category?: string,
    @Query('featured') featured?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('sort') sort?: string,
  ) {
    return this.productsService.list({
      category,
      featured: featured === 'true',
      limit: limit ? Number(limit) : undefined,
      q,
      sort,
    });
  }

  @Get('categories')
  categories() {
    return this.productsService.categories();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.productsService.getById(id);
  }
}
