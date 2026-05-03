import { getAllProducts, getProductBySlug, getRelatedProducts } from '../application/catalog-service.js';
import { API_BASE_URL } from '../../../shared/api/client.js';
import { PIB_GRADIENTS } from '../domain/product-catalog.js';
import { renderProductCard } from './product-card.js';
import { bindProductCardActions } from '../../cart/presentation/product-card-actions.js';
import { addProductToCart } from '../../cart/application/cart-service.js';
import { buildCatalogPageHref } from '../../../shared/presentation/page-paths.js';

function productSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug') || '';
}

function renderOptionButtons(rootId, values = []) {
  const section = document.getElementById(rootId);
  const row = document.getElementById(`${rootId}-row`);

  if (!section || !row) return;

  if (!values.length) {
    section.style.display = 'none';
    row.innerHTML = '';
    return;
  }

  section.style.display = '';
  row.innerHTML = values
    .map(
      (value, index) =>
        `<button class="option-btn${index === 0 ? ' active' : ''}" type="button">${value}</button>`,
    )
    .join('');
}

export function initProductDetailPage() {
  const detailName = document.getElementById('detail-name');
  if (!detailName) return;

  const productSlug = productSlugFromUrl();
  let quantity = 1;

  if (!productSlug) {
    detailName.textContent = 'Produto não encontrado';
    return;
  }

  Promise.all([getProductBySlug(productSlug), getAllProducts()])
    .then(([product, allProducts]) => {
      detailName.textContent = product.name;
      document.getElementById('detail-cat').textContent = product.cat;
      document.getElementById('detail-price').textContent = product.price;
      document.getElementById('detail-desc').textContent = product.description;
      const detailImg = document.getElementById('detail-img');
      if (product.imageUrl) {
        detailImg.style.background = '';
        detailImg.textContent = '';
        const img = document.createElement('img');
        img.src = product.imageUrl.startsWith('http') ? product.imageUrl : API_BASE_URL + product.imageUrl;
        img.alt = product.name;
        img.className = 'product-detail-photo';
        detailImg.appendChild(img);
      } else {
        detailImg.style.background = PIB_GRADIENTS[product.pib] || PIB_GRADIENTS['pib-1'];
        detailImg.textContent = product.emoji;
      }
      document.getElementById('bc-cat').textContent = product.cat;
      document.getElementById('bc-cat').href = buildCatalogPageHref({ cat: product.cat });
      document.getElementById('bc-name').textContent = product.name;
      document.getElementById('detail-reviews').textContent = `${product.rating.toFixed(1)} · ${product.reviews} avaliações`;
      document.title = `VOIDE — ${product.name}`;

      renderOptionButtons('size-options', product.sizes);
      renderOptionButtons('color-options', product.colors);

      const oldPrice = document.getElementById('detail-old');
      if (product.old) {
        oldPrice.textContent = product.old;
        oldPrice.style.display = '';
      } else {
        oldPrice.style.display = 'none';
      }

      document.getElementById('qty-minus').addEventListener('click', () => {
        if (quantity > 1) {
          quantity -= 1;
          document.getElementById('qty-val').textContent = quantity;
        }
      });

      document.getElementById('qty-plus').addEventListener('click', () => {
        quantity += 1;
        document.getElementById('qty-val').textContent = quantity;
      });

      document.getElementById('btn-add-cart').addEventListener('click', () => {
        addProductToCart({ ...product, qty: quantity });
        const button = document.getElementById('btn-add-cart');
        button.querySelector('span').textContent = '✓ Adicionado!';
        button.style.background = 'var(--green-soft)';
        window.setTimeout(() => {
          button.querySelector('span').textContent = 'Adicionar ao carrinho';
          button.style.background = '';
        }, 1500);
      });

      const wishButton = document.getElementById('btn-wish');
      wishButton.addEventListener('click', () => {
        wishButton.classList.toggle('active');
        wishButton.textContent = wishButton.classList.contains('active') ? '❤️' : '🤍';
      });

      document.querySelectorAll('.options-row').forEach((row) => {
        row.querySelectorAll('.option-btn').forEach((button) => {
          button.addEventListener('click', () => {
            row.querySelectorAll('.option-btn').forEach((option) => option.classList.remove('active'));
            button.classList.add('active');
          });
        });
      });

      const relatedGrid = document.getElementById('related-grid');
      relatedGrid.innerHTML = getRelatedProducts(product.id, 4, allProducts).map(renderProductCard).join('');
      bindProductCardActions(relatedGrid);
    })
    .catch((error) => {
      console.error('Falha ao carregar produto', error);
      detailName.textContent = 'Produto não encontrado';
      document.getElementById('detail-desc').textContent = 'Não foi possível carregar os dados deste produto.';
    });
}
