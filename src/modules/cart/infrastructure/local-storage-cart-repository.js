import { readJson, writeJson } from '../../../shared/kernel/browser-storage.js';
import { CartAggregate } from '../domain/aggregates/cart-aggregate.js';
import { CartRepository } from '../domain/repositories/cart-repository.js';

const CART_KEY = 'shopstore-cart';

export class LocalStorageCartRepository extends CartRepository {
  load() {
    return new CartAggregate(readJson(CART_KEY, []));
  }

  save(cartAggregate) {
    writeJson(CART_KEY, cartAggregate.toPrimitives());
  }
}

export const localStorageCartRepository = new LocalStorageCartRepository();
