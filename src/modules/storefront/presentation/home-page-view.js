import { buildCatalogPageHref, buildProductPageHref } from '../../../shared/presentation/page-paths.js';

export function renderHomePage() {
  return `
    <div class="marquee-wrap"><div class="marquee-track"><div class="marquee-item"><span>New Arrivals</span><div class="marquee-dot"></div></div><div class="marquee-item"><span>Best Sellers</span><div class="marquee-dot"></div></div><div class="marquee-item"><span>Special Offers</span><div class="marquee-dot"></div></div><div class="marquee-item"><span>Free Shipping</span><div class="marquee-dot"></div></div></div></div>
    <section class="categories">
      <div class="cats-header">
        <div><div class="section-label">Categories</div><h2 class="section-title">Explore our <em>categories</em></h2></div>
        <a href="${buildCatalogPageHref()}" class="btn-secondary">View all</a>
      </div>
      <div class="cats-grid">
        <a class="cat-card large" href="${buildCatalogPageHref({ cat: 'Moda' })}" style="cursor:pointer;text-decoration:none"><div class="cat-bg cat-bg-1">👗</div><div class="cat-overlay"></div><div class="cat-info"><div><div class="cat-name">Fashion</div><div class="cat-count">342 products</div></div><div class="cat-arrow">↗</div></div></a>
        <a class="cat-card" href="${buildCatalogPageHref({ cat: 'Eletrônicos' })}" style="cursor:pointer;text-decoration:none"><div class="cat-bg cat-bg-2">📱</div><div class="cat-overlay"></div><div class="cat-info"><div><div class="cat-name">Electronics</div><div class="cat-count">218 products</div></div><div class="cat-arrow">↗</div></div></a>
        <a class="cat-card" href="${buildCatalogPageHref({ cat: 'Casa & Deco' })}" style="cursor:pointer;text-decoration:none"><div class="cat-bg cat-bg-3">🏠</div><div class="cat-overlay"></div><div class="cat-info"><div><div class="cat-name">Home & Deco</div><div class="cat-count">156 products</div></div><div class="cat-arrow">↗</div></div></a>
        <a class="cat-card" href="${buildCatalogPageHref({ cat: 'Esportes' })}" style="cursor:pointer;text-decoration:none"><div class="cat-bg cat-bg-4">⚽</div><div class="cat-overlay"></div><div class="cat-info"><div><div class="cat-name">Sports</div><div class="cat-count">189 products</div></div><div class="cat-arrow">↗</div></div></a>
        <a class="cat-card" href="${buildCatalogPageHref({ cat: 'Livros' })}" style="cursor:pointer;text-decoration:none"><div class="cat-bg cat-bg-5">📚</div><div class="cat-overlay"></div><div class="cat-info"><div><div class="cat-name">Books</div><div class="cat-count">94 products</div></div><div class="cat-arrow">↗</div></div></a>
      </div>
    </section>
    <section class="products">
      <div class="products-header">
        <div><div class="section-label">Featured</div><h2 class="section-title">Featured <em>products</em></h2></div>
        <div class="filter-tabs"><button class="filter-tab active">All</button><button class="filter-tab">New</button><button class="filter-tab">Offers</button><button class="filter-tab">Popular</button></div>
      </div>
      <div class="products-grid">
        ${[
          ['prod-01', 'Eletrônicos', 'Fone Bluetooth Pro', 'R$ 89,90', '🎧', 'pib-1'],
          ['prod-02', 'Acessórios', 'Carteira de Couro', 'R$ 34,90', '👜', 'pib-2'],
          ['prod-03', 'Casa & Deco', 'Luminária de Mesa LED', 'R$ 59,90', '💡', 'pib-3'],
          ['prod-04', 'Moda', 'Camiseta Premium Pima', 'R$ 129,00', '👕', 'pib-4'],
        ].map(([id, category, name, price, emoji, pib]) => `
          <div class="product-card" data-id="${id}">
            <div class="product-img"><div class="product-img-bg ${pib}"></div><div class="product-emoji">${emoji}</div><button class="product-fav">🤍</button></div>
            <div class="product-info">
              <div class="product-category">${category}</div>
              <a class="product-name" href="${buildProductPageHref({ id })}">${name}</a>
              <div class="product-bottom"><div><span class="product-price">${price}</span><div class="product-stars">★★★★★ <span style="color:var(--text-light)">(42)</span></div></div><button class="product-add">+</button></div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}
