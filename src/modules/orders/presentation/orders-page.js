import { getOrders } from '../application/orders-service.js';
import { CATALOG_PAGE_PATH, CHECKOUT_PAGE_PATH } from '../../../shared/presentation/page-paths.js';
import { getAuthState } from '../../user/application/auth-state.js';
import { GOOGLE_LOGIN_PAGE_PATH } from '../../../shared/presentation/page-paths.js';
import { showToast } from '../../../shared/ui/toast.js';
import { API_BASE_URL } from '../../../shared/api/client.js';
import { PIB_GRADIENTS } from '../../catalog/domain/product-catalog.js';

const STATUS_COLOR = {
  confirmed: 'status--confirmed',
  processing: 'status--processing',
  shipped: 'status--shipped',
  delivered: 'status--delivered',
  cancelled: 'status--cancelled',
};

function formatDate(iso) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(iso));
}

export function initOrdersPage() {
  const authState = getAuthState();
  if (!authState?.isAuthenticated) {
    window.location.href = GOOGLE_LOGIN_PAGE_PATH;
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const payment = params.get('payment');
  if (payment === 'success') {
    showToast('Pagamento aprovado! Pedido confirmado.');
  } else if (payment === 'pending') {
    showToast('Pagamento em processamento. Avisaremos quando confirmar.');
  } else if (payment === 'failure') {
    showToast('Pagamento não aprovado. Tente novamente.');
  } else if (params.get('success') === '1') {
    showToast('Pedido realizado!');
  }
  if (payment || params.get('success')) {
    history.replaceState(null, '', window.location.pathname);
  }

  const container = document.getElementById('orders-container');
  const subtitleEl = document.getElementById('orders-subtitle');

  async function render() {
    if (!container) return;
    container.innerHTML = '<div class="orders-loading">Carregando pedidos…</div>';

    let orders;
    try {
      orders = await getOrders();
    } catch {
      container.innerHTML = '<div class="orders-empty"><p>Não foi possível carregar seus pedidos.</p></div>';
      return;
    }

    if (subtitleEl) {
      subtitleEl.textContent = orders.length
        ? `${orders.length} ${orders.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'}`
        : 'Você ainda não fez nenhum pedido.';
    }

    if (!orders.length) {
      container.innerHTML = `
        <div class="orders-empty">
          <h3>Nenhum pedido ainda</h3>
          <p>Quando você finalizar uma compra, seus pedidos aparecerão aqui.</p>
          <a href="${CATALOG_PAGE_PATH}" class="btn-primary" style="margin-top:12px">
            <span>Ir às compras</span>
          </a>
        </div>`;
      return;
    }

    container.innerHTML = orders.map((order) => {
      const previewItems = order.items.slice(0, 3);
      const extra = order.items.length - 3;

      const itemsHtml = previewItems.map((item) => {
        if (item.imageUrl) {
          const src = item.imageUrl.startsWith('http') ? item.imageUrl : API_BASE_URL + item.imageUrl;
          return `<img class="order-item-thumb order-item-thumb--photo" src="${src}" alt="${item.productName}" title="${item.productName}">`;
        }
        const grad = PIB_GRADIENTS[item.gradientKey] || PIB_GRADIENTS['pib-1'];
        return `<div class="order-item-thumb" style="background:${grad}" title="${item.productName}">${item.productEmoji}</div>`;
      }).join('');

      const extraHtml = extra > 0 ? `<div class="order-item-thumb order-item-extra">+${extra}</div>` : '';

      return `
        <div class="order-card">
          <div class="order-card-header">
            <div class="order-card-id">
              <span class="order-label">Pedido</span>
              <span class="order-num">#${order.shortId}</span>
            </div>
            <span class="order-status ${STATUS_COLOR[order.status] ?? ''}">${order.statusLabel}</span>
          </div>
          <div class="order-card-body">
            <div class="order-thumbs">${itemsHtml}${extraHtml}</div>
            <div class="order-meta">
              <span class="order-date">${formatDate(order.createdAt)}</span>
              <span class="order-payment">${order.paymentLabel}</span>
            </div>
          </div>
          <div class="order-card-footer">
            <span class="order-items-count">${order.items.length} ${order.items.length === 1 ? 'item' : 'itens'}</span>
            <span class="order-total">${order.total}</span>
          </div>
        </div>`;
    }).join('');
  }

  render();
}
