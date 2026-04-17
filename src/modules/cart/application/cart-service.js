import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../user/infrastructure/firebase-config.js';
import { apiClient } from '../../../shared/api/client.js';
import { showToast } from '../../../shared/ui/toast.js';
import { CART_PAGE_PATH, GOOGLE_LOGIN_PAGE_PATH } from '../../../shared/presentation/page-paths.js';
import { getAuthState } from '../../user/application/auth-state.js';
import { formatPrice } from '../../../shared/kernel/currency.js';

let cartCache = null;

// Resolves once Firebase has confirmed the auth state (user or null)
let authReadyPromise = null;
function waitForAuth() {
  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, (user) => {
        unsub();
        resolve(user);
      });
    });
  }
  return authReadyPromise;
}

function buildItems(rawItems) {
  return (rawItems ?? []).map(({ productId, quantity, product }) => ({
    id: productId,
    name: product.name,
    price: product.price,
    priceInCents: product.priceInCents,
    emoji: product.emoji,
    cat: product.category,
    pib: product.gradientKey,
    imageUrl: product.imageUrl ?? null,
    qty: quantity,
  }));
}

export async function getCart() {
  if (cartCache !== null) return cartCache;
  const user = await waitForAuth();
  if (!user) {
    cartCache = [];
    return cartCache;
  }
  try {
    const response = await apiClient.get('/cart');
    cartCache = buildItems(response.data.items);
  } catch {
    cartCache = [];
  }
  return cartCache;
}

function invalidate() {
  cartCache = null;
}

export async function addProductToCart(product) {
  const authState = getAuthState();
  if (!authState?.isAuthenticated) {
    showToast('Faça login antes de adicionar ao carrinho');
    window.location.href = GOOGLE_LOGIN_PAGE_PATH;
    return null;
  }
  try {
    const existing = (await getCart()).find((i) => i.id === product.id);
    const newQty = (existing?.qty ?? 0) + 1;
    invalidate();
    await apiClient.post('/cart/items', { productId: product.id, quantity: newQty });
    invalidate();
    updateCartBadge();
    bumpCartBadge();
    showToast(`${product.name} adicionado ao carrinho!`);
  } catch {
    showToast('Não foi possível adicionar ao carrinho.');
  }
}

export async function setItemQuantity(productId, quantity) {
  if (quantity <= 0) {
    await apiClient.delete(`/cart/items/${productId}`);
  } else {
    await apiClient.post('/cart/items', { productId, quantity });
  }
  invalidate();
}

export async function removeFromCart(productId) {
  await apiClient.delete(`/cart/items/${productId}`);
  invalidate();
}

export function getCartSummary(items) {
  const subtotal = items.reduce((total, item) => total + item.priceInCents * item.qty, 0) / 100;
  return {
    subtotal,
    shipping: 0,
    total: subtotal,
    formatPrice,
  };
}

export async function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  const items = await getCart();
  const total = items.reduce((s, i) => s + i.qty, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? 'grid' : 'none';
}

export function bumpCartBadge() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  badge.classList.add('bump');
  window.setTimeout(() => badge.classList.remove('bump'), 300);
}

export function bindCartNavigation() {
  const cartButton = document.getElementById('cart-icon-btn');
  if (!cartButton) return;
  cartButton.addEventListener('click', () => {
    window.location.href = CART_PAGE_PATH;
  });
}

export function exposeLegacyCartApi() {
  window.ShopStore = {
    addToCart: addProductToCart,
    getCart,
    showToast,
    updateCartBadge,
  };
}
