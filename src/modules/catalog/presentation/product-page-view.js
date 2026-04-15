import { buildCatalogPageHref, HOME_PAGE_PATH } from '../../../shared/presentation/page-paths.js';

export function renderProductPage() {
  return `
    <div class="product-page">
      <div class="breadcrumb">
        <a href="${HOME_PAGE_PATH}">Home</a><span>›</span><a href="${buildCatalogPageHref()}" id="bc-cat">Category</a><span>›</span><span id="bc-name">Product</span>
      </div>
      <div class="product-detail">
        <div class="product-detail-img" id="detail-img">📦</div>
        <div class="product-detail-info">
          <div class="product-detail-category" id="detail-cat">Category</div>
          <h1 class="product-detail-name" id="detail-name">Product Name</h1>
          <div class="product-detail-stars"><span class="stars-val">★★★★★</span><span class="stars-count">4.9 · 68 reviews</span></div>
          <div class="product-detail-price"><span class="price-current" id="detail-price">R$ 0,00</span><span class="price-old" id="detail-old" style="display:none"></span></div>
          <p class="product-detail-desc">Detailed product description with key benefits, materials, dimensions and technical information.</p>
          <div class="product-options"><div class="options-label">Size</div><div class="options-row"><button class="option-btn active">S</button><button class="option-btn">M</button><button class="option-btn">L</button><button class="option-btn">XL</button></div></div>
          <div class="product-options"><div class="options-label">Color</div><div class="options-row"><button class="option-btn active">Green</button><button class="option-btn">White</button><button class="option-btn">Black</button></div></div>
          <div class="product-qty-row"><div class="options-label" style="margin:0">Quantity</div><div class="qty-control"><button class="qty-btn" id="qty-minus">−</button><span class="qty-val" id="qty-val">1</span><button class="qty-btn" id="qty-plus">+</button></div></div>
          <div class="product-actions"><button class="btn-add-cart" id="btn-add-cart"><span>Add to cart</span></button><button class="btn-wish" id="btn-wish"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button></div>
          <div class="product-perks"><div class="perk"><span class="perk-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span> Delivery in up to 2 days</div><div class="perk"><span class="perk-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v5"/><path d="M11 11V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v9a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4a3 3 0 0 0-3-3 3 3 0 0 0-3 3"/></svg></span> 30-day free exchanges</div><div class="perk"><span class="perk-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span> Secure checkout</div></div>
        </div>
      </div>
    </div>
    <section class="related">
      <div class="related-header"><div><div class="section-label">Related</div><h2 class="section-title">You may also <em>like</em></h2></div><a href="${buildCatalogPageHref()}" class="btn-secondary">View more</a></div>
      <div class="products-grid" id="related-grid"></div>
    </section>
  `;
}
