import { getCart, getCartSummary } from '../../cart/application/cart-service.js';
import { calculateShipping, createOrder } from '../application/checkout-service.js';
import { CART_PAGE_PATH, GOOGLE_LOGIN_PAGE_PATH } from '../../../shared/presentation/page-paths.js';
import { getAuthState } from '../../user/application/auth-state.js';
import { showToast } from '../../../shared/ui/toast.js';
import { API_BASE_URL } from '../../../shared/api/client.js';
import { PIB_GRADIENTS } from '../../catalog/domain/product-catalog.js';
import { formatPrice } from '../../../shared/kernel/currency.js';

export function initCheckoutPage() {
  const authState = getAuthState();
  if (!authState?.isAuthenticated) {
    window.location.href = GOOGLE_LOGIN_PAGE_PATH;
    return;
  }

  const summaryItemsEl = document.getElementById('checkout-summary-items');
  const summarySubtotalEl = document.getElementById('checkout-subtotal');
  const summaryShippingEl = document.getElementById('checkout-shipping');
  const summaryTotalEl = document.getElementById('checkout-total');
  const shippingSection = document.getElementById('shipping-section');
  const shippingOptionsEl = document.getElementById('shipping-options');
  const form = document.getElementById('checkout-form');
  const submitBtn = document.getElementById('btn-place-order');
  const zipInput = document.getElementById('zip');

  let selectedPayment = 'pix';
  let selectedShipping = null;
  let cartItems = [];

  // ── Payment selection ────────────────────────────────
  document.querySelectorAll('.payment-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPayment = btn.dataset.method;
    });
  });
  document.querySelector('.payment-option[data-method="pix"]')?.classList.add('active');

  // ── Summary ──────────────────────────────────────────
  function updateSummaryTotals() {
    if (!cartItems.length) return;
    const summary = getCartSummary(cartItems);
    if (summarySubtotalEl) summarySubtotalEl.textContent = formatPrice(summary.subtotal);

    if (selectedShipping) {
      if (summaryShippingEl) {
        summaryShippingEl.textContent = selectedShipping.price;
        summaryShippingEl.style.color = '';
        summaryShippingEl.style.fontWeight = '';
      }
      const total = summary.subtotal + selectedShipping.priceCents / 100;
      if (summaryTotalEl) summaryTotalEl.textContent = formatPrice(total);
    } else {
      if (summaryShippingEl) {
        summaryShippingEl.textContent = '—';
        summaryShippingEl.style.color = '';
      }
      if (summaryTotalEl) summaryTotalEl.textContent = formatPrice(summary.subtotal);
    }
  }

  async function loadSummary() {
    if (!summaryItemsEl) return;
    summaryItemsEl.innerHTML = '<div class="checkout-loading">Carregando…</div>';

    cartItems = await getCart();
    if (!cartItems.length) {
      window.location.href = CART_PAGE_PATH;
      return;
    }

    const summary = getCartSummary(cartItems);
    summaryItemsEl.innerHTML = cartItems.map((item) => {
      const imgHtml = item.imageUrl
        ? `<img class="co-item-img co-item-img--photo" src="${item.imageUrl.startsWith('http') ? item.imageUrl : API_BASE_URL + item.imageUrl}" alt="${item.name}">`
        : `<div class="co-item-img" style="background:${PIB_GRADIENTS[item.pib] || PIB_GRADIENTS['pib-1']}">${item.emoji}</div>`;
      return `
        <div class="co-item">
          ${imgHtml}
          <div class="co-item-info">
            <span class="co-item-name">${item.name}</span>
            <span class="co-item-qty">× ${item.qty}</span>
          </div>
          <span class="co-item-price">${summary.formatPrice(item.priceInCents * item.qty / 100)}</span>
        </div>`;
    }).join('');

    updateSummaryTotals();
  }

  // ── Shipping quotes ──────────────────────────────────
  function renderShippingOption(opt) {
    const isSelected = selectedShipping?.id === opt.id;
    const logoHtml = opt.logo
      ? `<img src="${opt.logo}" alt="${opt.company}" class="shipping-logo">`
      : `<span class="shipping-logo-fallback"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/><circle cx="18.5" cy="15.5" r="2.5"/><path d="M20.27 17.27 22 19"/></svg></span>`;

    return `
      <button type="button" class="shipping-option${isSelected ? ' active' : ''}" data-id="${opt.id}">
        ${logoHtml}
        <div class="shipping-option-info">
          <span class="shipping-option-name">${opt.company} ${opt.name}</span>
          <span class="shipping-option-deadline">Prazo: até ${opt.deadline} dia${opt.deadline !== 1 ? 's' : ''} úteis</span>
        </div>
        <span class="shipping-option-price">${opt.price}</span>
      </button>`;
  }

  async function fetchShippingQuotes(zip) {
    if (!shippingSection || !shippingOptionsEl) return;
    shippingSection.style.display = 'block';
    shippingOptionsEl.innerHTML = '<div class="shipping-loading">Consultando fretes…</div>';
    selectedShipping = null;
    updateSummaryTotals();

    const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);
    const insuranceValueCents = cartItems.reduce((s, i) => s + i.priceInCents * i.qty, 0);

    try {
      const options = await calculateShipping({ toZip: zip, totalItems, insuranceValueCents });

      if (!options.length) {
        shippingOptionsEl.innerHTML = '<p class="shipping-empty">Nenhuma opção disponível para este CEP.</p>';
        return;
      }

      shippingOptionsEl.innerHTML = options.map(renderShippingOption).join('');

      // Auto-select cheapest
      const cheapest = [...options].sort((a, b) => a.priceCents - b.priceCents)[0];
      selectShipping(cheapest, options);

      shippingOptionsEl.querySelectorAll('.shipping-option').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = Number(btn.dataset.id);
          const opt = options.find((o) => o.id === id);
          if (opt) selectShipping(opt, options);
        });
      });
    } catch {
      shippingOptionsEl.innerHTML = '<p class="shipping-empty">Erro ao calcular frete. Verifique o CEP.</p>';
    }
  }

  function selectShipping(opt, allOptions) {
    selectedShipping = opt;
    allOptions.forEach((o) => {
      const btn = shippingOptionsEl.querySelector(`.shipping-option[data-id="${o.id}"]`);
      btn?.classList.toggle('active', o.id === opt.id);
    });
    updateSummaryTotals();
  }

  // Debounce ZIP input (trigger on 8 digits)
  let zipTimer;
  zipInput?.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length === 8) e.target.value = `${val.slice(0, 5)}-${val.slice(5)}`;
    clearTimeout(zipTimer);
    if (val.length === 8) {
      zipTimer = setTimeout(() => fetchShippingQuotes(val), 400);
    }
  });

  // ── Submit ───────────────────────────────────────────
  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedShipping) {
      showToast('Selecione uma opção de frete para continuar.');
      return;
    }

    const data = new FormData(form);
    const address = {
      name:         data.get('name'),
      phone:        data.get('phone'),
      zip:          data.get('zip'),
      street:       data.get('street'),
      number:       data.get('number'),
      complement:   data.get('complement') || undefined,
      neighborhood: data.get('neighborhood'),
      city:         data.get('city'),
      state:        data.get('state'),
    };

    const shipping = {
      serviceId:  selectedShipping.id,
      company:    selectedShipping.company,
      service:    selectedShipping.name,
      priceCents: selectedShipping.priceCents,
      deadline:   selectedShipping.deadline,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Processando…';

    try {
      const { checkoutUrl } = await createOrder(address, selectedPayment, shipping);
      window.location.href = checkoutUrl;
    } catch {
      showToast('Erro ao finalizar pedido. Tente novamente.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirmar pedido';
    }
  }

  form?.addEventListener('submit', handleSubmit);
  loadSummary();
}
