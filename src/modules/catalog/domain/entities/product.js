export class Product {
  constructor({ id, name, price, emoji, cat, pib, badge = null, old = null }) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.emoji = emoji;
    this.category = cat;
    this.gradient = pib;
    this.badge = badge;
    this.oldPrice = old;
  }

  matchesCategory(category) {
    return category === 'Todos' || this.category === category;
  }

  matchesQuery(query) {
    if (!query) return true;
    const normalizedQuery = query.toLowerCase();
    return (
      this.name.toLowerCase().includes(normalizedQuery) ||
      this.category.toLowerCase().includes(normalizedQuery)
    );
  }

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      emoji: this.emoji,
      cat: this.category,
      pib: this.gradient,
      badge: this.badge,
      old: this.oldPrice,
    };
  }
}
