import { addProductToCart } from '../application/cart-service.js';
import { buildProductPageHref } from '../../../shared/presentation/page-paths.js';

function readProductFromCard(card) {
  if (!card?.dataset?.id) {
    return null;
  }

  return {
    id: card.dataset.id,
    name: card.dataset.name,
    price: card.dataset.price,
    emoji: card.dataset.emoji,
    cat: card.dataset.cat,
    pib: card.dataset.pib,
    badge: card.dataset.badge || null,
    old: card.dataset.old || null,
    reviews: card.dataset.reviews ? Number(card.dataset.reviews) : 0,
    rating: card.dataset.rating ? Number(card.dataset.rating) : 0,
  };
}

export function bindProductCardActions(root = document) {
  root.querySelectorAll('.product-add').forEach((button) => {
    if (button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const card = button.closest('.product-card');
      const product = readProductFromCard(card);
      if (!product) return;

      addProductToCart(product);
      button.textContent = '✓';
      button.style.background = 'var(--green-soft)';
      window.setTimeout(() => {
        button.textContent = '+';
        button.style.background = '';
      }, 1200);
    });
  });

  root.querySelectorAll('.product-fav').forEach((button) => {
    if (button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      button.classList.toggle('active');
      button.innerHTML = button.classList.contains('active')
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    });
  });

  root.querySelectorAll('.product-card').forEach((card) => {
    if (card.dataset.bound === 'true') return;
    card.dataset.bound = 'true';

    card.style.cursor = 'pointer';
    card.addEventListener('click', (event) => {
      if (event.target.closest('.product-add') || event.target.closest('.product-fav')) return;
      if (event.target.closest('.product-name')) return;

      const product = readProductFromCard(card);
      if (!product) return;
      window.location.href = buildProductPageHref({ slug: card.dataset.slug || product.id });
    });
  });
}
