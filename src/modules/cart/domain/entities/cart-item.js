export class CartItem {
  constructor({ id, name, price, emoji = '📦', category = '', gradient = 'pib-1', quantity = 1 }) {
    this.id = id;
    this.name = name || 'Produto';
    this.price = price || 'R$ 0,00';
    this.emoji = emoji;
    this.category = category;
    this.gradient = gradient;
    this.quantity = quantity > 0 ? quantity : 1;
  }

  increase(quantity = 1) {
    this.quantity += quantity;
  }

  decrease(quantity = 1) {
    this.quantity -= quantity;
  }

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      emoji: this.emoji,
      cat: this.category,
      pib: this.gradient,
      qty: this.quantity,
    };
  }
}
