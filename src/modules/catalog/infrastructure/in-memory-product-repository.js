import { Product } from '../domain/entities/product.js';
import { ProductRepository } from '../domain/repositories/product-repository.js';

export class InMemoryProductRepository extends ProductRepository {
  getAll() {
    return [];
  }

  findById(id) {
    const product = this.getAll().find((item) => item.id === id);
    return product ? new Product(product) : null;
  }
}

export const inMemoryProductRepository = new InMemoryProductRepository();
