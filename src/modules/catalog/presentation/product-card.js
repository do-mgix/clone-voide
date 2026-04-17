import { buildProductPageHref } from '../../../shared/presentation/page-paths.js';
import { API_BASE_URL } from '../../../shared/api/client.js';

function productDataset(product) {
  return [
    `data-id="${product.id}"`,
    `data-name="${product.name}"`,
    `data-price="${product.price}"`,
    `data-emoji="${product.emoji}"`,
    `data-cat="${product.cat}"`,
    `data-pib="${product.pib}"`,
    `data-badge="${product.badge ?? ''}"`,
    `data-old="${product.old ?? ''}"`,
    `data-rating="${product.rating ?? 0}"`,
    `data-reviews="${product.reviews ?? 0}"`,
  ].join(' ');
}

export function productBadge(product) {
  if (product.badge === 'sale') return '<span class="product-badge sale">Oferta</span>';
  if (product.badge === 'new') return '<span class="product-badge new">Novo</span>';
  if (product.badge === 'popular') return '<span class="product-badge">Popular</span>';
  return '';
}

export function renderProductCard(product) {
  return `
    <div class="product-card" ${productDataset(product)} style="opacity:1;transform:none">
      <div class="product-img">
        ${product.imageUrl
          ? `<img class="product-img-photo" src="${product.imageUrl.startsWith('http') ? product.imageUrl : API_BASE_URL + product.imageUrl}" alt="${product.name}" loading="lazy">`
          : `<div class="product-img-bg ${product.pib}"></div>`
        }
        ${productBadge(product)}
        <button class="product-fav" aria-label="Favoritar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
      </div>
      <div class="product-info">
        <div class="product-category">${product.cat}</div>
        <a class="product-name" href="${buildProductPageHref({ id: product.id })}" target="_blank" rel="noopener noreferrer">${product.name}</a>
        <div class="product-bottom">
          <div>
            <span class="product-price">${product.price}</span>
            ${product.old ? `<span class="product-price-old">${product.old}</span>` : ''}
            <div class="product-stars">★★★★★ <span style="color:var(--text-light)">(${product.reviews ?? 0})</span></div>
          </div>
          <button class="product-add">+</button>
        </div>
      </div>
    </div>
  `;
}
