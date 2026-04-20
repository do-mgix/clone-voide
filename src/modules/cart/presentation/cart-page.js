import { PIB_GRADIENTS } from '../../catalog/domain/product-catalog.js';
import { API_BASE_URL } from '../../../shared/api/client.js';
import {
  getCart,
  getCartSummary,
  removeFromCart,
  setItemQuantity,
  updateCartBadge,
} from '../application/cart-service.js';
import { HOME_PAGE_PATH, CHECKOUT_PAGE_PATH } from '../../../shared/presentation/page-paths.js';

export function initCartPage() {
  const container = document.getElementById('cart-items-container');
  if (!container) return;

  const summaryEl = document.querySelector('.cart-summary');

  function renderSummary(items) {
    if (summaryEl) summaryEl.hidden = !items.length;
    if (!items.length) return;

    const summary = getCartSummary(items);
    document.getElementById('summary-subtotal').textContent = summary.formatPrice(summary.subtotal);
    document.getElementById('summary-total').textContent = summary.formatPrice(summary.total);

    const shippingEl = document.getElementById('summary-shipping');
    if (shippingEl) {
      shippingEl.textContent = 'Grátis';
      shippingEl.style.color = 'var(--green-soft)';
      shippingEl.style.fontWeight = '600';
    }
  }

  async function renderCart() {
    container.innerHTML = '<div class="cart-empty"><h3>Carregando…</h3></div>';

    const cart = await getCart();
    const subtitle = document.getElementById('cart-subtitle');

    if (!cart.length) {
      subtitle.textContent = 'Seu carrinho está vazio.';
      container.innerHTML = `
        <div class="cart-empty">
          <h3>Carrinho vazio</h3>
          <p>Adicione produtos para continuar comprando.</p>
          <a href="${HOME_PAGE_PATH}" class="btn-primary" style="margin-top:12px">
            <span>Ver produtos</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>`;
      renderSummary(cart);
      return;
    }

    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    subtitle.textContent = `${totalQty} ${totalQty === 1 ? 'item' : 'itens'} no seu carrinho`;

    container.innerHTML = cart.map((item) => {
      const imgHtml = item.imageUrl
        ? `<img class="cart-item-img-photo" src="${item.imageUrl.startsWith('http') ? item.imageUrl : API_BASE_URL + item.imageUrl}" alt="${item.name}">`
        : `<div class="cart-item-img" style="background:${PIB_GRADIENTS[item.pib] || PIB_GRADIENTS['pib-1']}">${item.emoji}</div>`;

      return `
        <div class="cart-item" data-product-id="${item.id}">
          ${imgHtml}
          <div class="cart-item-info">
            <div class="cart-item-cat">${item.cat || 'Produto'}</div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price-row">
              <span class="cart-item-unit-price">${item.price} / un.</span>
              <div class="cart-qty-control">
                <button class="cart-qty-btn" data-action="minus">−</button>
                <span class="cart-qty-val">${item.qty}</span>
                <button class="cart-qty-btn" data-action="plus">+</button>
              </div>
            </div>
          </div>
          <div class="cart-item-right">
            <button class="cart-remove" title="Remover">✕</button>
            <span class="cart-item-total">${getCartSummary([item]).formatPrice(item.priceInCents * item.qty / 100)}</span>
          </div>
        </div>`;
    }).join('');

    container.querySelectorAll('.cart-qty-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const row = button.closest('.cart-item');
        const productId = row.dataset.productId;
        const currentQty = cart.find((i) => i.id === productId)?.qty ?? 1;
        const delta = button.dataset.action === 'plus' ? 1 : -1;
        await setItemQuantity(productId, currentQty + delta);
        await updateCartBadge();
        renderCart();
      });
    });

    container.querySelectorAll('.cart-remove').forEach((button) => {
      button.addEventListener('click', async () => {
        const productId = button.closest('.cart-item').dataset.productId;
        await removeFromCart(productId);
        await updateCartBadge();
        renderCart();
      });
    });

    renderSummary(cart);
  }

  document.getElementById('btn-checkout').addEventListener('click', () => {
    window.location.href = CHECKOUT_PAGE_PATH;
  });

  renderCart();
}
