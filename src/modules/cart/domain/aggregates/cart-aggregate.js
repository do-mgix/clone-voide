import { formatPrice, parsePrice } from '../../../../shared/kernel/currency.js';
import { CartItem } from '../entities/cart-item.js';

export class CartAggregate {
  constructor(items = []) {
    this.items = items.map((item) => (item instanceof CartItem ? item : new CartItem({
      id: item.id,
      name: item.name,
      price: item.price,
      emoji: item.emoji,
      category: item.cat ?? item.category,
      gradient: item.pib ?? item.gradient,
      quantity: item.qty ?? item.quantity,
    })));
  }

  addProduct(product) {
    const existingItem = this.items.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.increase(product.qty || product.quantity || 1);
      return;
    }

    this.items.push(new CartItem({
      id: product.id,
      name: product.name,
      price: product.price,
      emoji: product.emoji,
      category: product.cat ?? product.category,
      gradient: product.pib ?? product.gradient,
      quantity: product.qty ?? product.quantity,
    }));
  }

  changeItemQuantity(index, delta) {
    const item = this.items[index];
    if (!item) return;

    if (delta > 0) item.increase(delta);
    if (delta < 0) item.decrease(Math.abs(delta));
    if (item.quantity <= 0) this.items.splice(index, 1);
  }

  removeItem(index) {
    this.items.splice(index, 1);
  }

  getTotalQuantity() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  summarize(activeCoupon) {
    const subtotal = this.items.reduce((total, item) => total + parsePrice(item.price) * item.quantity, 0);
    const discount = activeCoupon?.pct ? subtotal * (activeCoupon.pct / 100) : 0;
    const freeShippingThreshold = 299;
    const shipping = subtotal === 0 || subtotal - discount >= freeShippingThreshold ? 0 : 19.9;

    return {
      subtotal,
      discount,
      shipping,
      total: Math.max(0, subtotal - discount + shipping),
      freeShippingThreshold,
      remainingForFreeShipping: Math.max(0, freeShippingThreshold - subtotal),
      formatPrice,
    };
  }

  toPrimitives() {
    return this.items.map((item) => item.toPrimitives());
  }
}
