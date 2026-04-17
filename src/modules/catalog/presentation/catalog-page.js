import {
  countProductsByCategory,
  filterProducts,
  getAllProducts,
  getCategories,
} from '../application/catalog-service.js';
import { renderProductCard } from './product-card.js';
import { bindProductCardActions } from '../../cart/presentation/product-card-actions.js';

export function initCatalogPage() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const perPage = 8;
  const params = new URLSearchParams(window.location.search);
  let activeCategory = 'Todos';
  let searchQuery = params.get('q') || '';
  let sortMode = 'default';
  let currentPage = Math.max(1, parseInt(params.get('page') || '1', 10));
  let allProducts = [];

  function buildPageUrl(page) {
    const p = new URLSearchParams(window.location.search);
    if (page > 1) p.set('page', page);
    else p.delete('page');
    return `${window.location.pathname}?${p.toString()}`;
  }

  function pushPageUrl(page) {
    window.history.pushState({}, '', buildPageUrl(page));
  }

  const urlCategory = params.get('cat');
  if (urlCategory) {
    const matched = getCategories(allProducts).find(
      (category) => category.toLowerCase() === decodeURIComponent(urlCategory).toLowerCase()
    );
    if (matched) activeCategory = matched;
  }

  function scrollToGrid() {
    document.querySelector('.products-body').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderTabs() {
    const tabs = document.getElementById('cat-tabs');
    tabs.innerHTML = getCategories(allProducts)
      .map(
        (category) => `
          <button class="cat-tab${category === activeCategory ? ' active' : ''}" data-cat="${category}">
            ${category}
            <span class="cat-tab-count">${countProductsByCategory(category, allProducts)}</span>
          </button>
        `
      )
      .join('');

    tabs.querySelectorAll('.cat-tab').forEach((button) => {
      button.addEventListener('click', () => {
        activeCategory = button.dataset.cat;
        currentPage = 1;
        render();
      });
    });
  }

  function renderPagination(total) {
    const totalPages = Math.ceil(total / perPage);
    const wrap = document.getElementById('pagination');

    if (totalPages <= 1) {
      wrap.innerHTML = '';
      return;
    }

    const chevronLeft = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/></svg>';
    const chevronRight = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/></svg>';
    const chevronLast = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.146 3.646a.5.5 0 0 0 0 .708L7.793 8l-3.647 3.646a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708 0M11.5 1a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-1 0v-13a.5.5 0 0 1 .5-.5"/></svg>';
    const chevronFirst = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M11.854 3.646a.5.5 0 0 1 0 .708L8.207 8l3.647 3.646a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708 0M4.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 1 0v-13a.5.5 0 0 0-.5-.5"/></svg>';

    let pages = [];
    if (totalPages <= 7) {
      pages = Array.from({ length: totalPages }, (_, index) => index + 1);
    } else {
      pages = [1];
      if (currentPage > 3) pages.push('…');
      for (let page = Math.max(2, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page += 1) {
        pages.push(page);
      }
      if (currentPage < totalPages - 2) pages.push('…');
      pages.push(totalPages);
    }

    wrap.innerHTML = `
      <a class="page-btn${currentPage === 1 ? ' disabled' : ''}" href="${buildPageUrl(1)}" title="Primeira" id="pg-first">${chevronFirst}</a>
      <a class="page-btn${currentPage === 1 ? ' disabled' : ''}" href="${buildPageUrl(currentPage - 1)}" title="Anterior" id="pg-prev">${chevronLeft}</a>
      ${pages
        .map((page) =>
          page === '…'
            ? '<span class="page-ellipsis">…</span>'
            : `<a class="page-btn${page === currentPage ? ' active' : ''}" href="${buildPageUrl(page)}" data-page="${page}">${page}</a>`
        )
        .join('')}
      <a class="page-btn${currentPage === totalPages ? ' disabled' : ''}" href="${buildPageUrl(currentPage + 1)}" title="Próxima" id="pg-next">${chevronRight}</a>
      <a class="page-btn${currentPage === totalPages ? ' disabled' : ''}" href="${buildPageUrl(totalPages)}" title="Última" id="pg-last">${chevronLast}</a>
    `;

    wrap.querySelectorAll('.page-btn[data-page]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        currentPage = Number(link.dataset.page);
        pushPageUrl(currentPage);
        render();
        scrollToGrid();
      });
    });

    wrap.querySelector('#pg-first').addEventListener('click', (event) => {
      event.preventDefault();
      if (currentPage === 1) return;
      currentPage = 1;
      pushPageUrl(currentPage);
      render();
      scrollToGrid();
    });
    wrap.querySelector('#pg-prev').addEventListener('click', (event) => {
      event.preventDefault();
      if (currentPage === 1) return;
      currentPage -= 1;
      pushPageUrl(currentPage);
      render();
      scrollToGrid();
    });
    wrap.querySelector('#pg-next').addEventListener('click', (event) => {
      event.preventDefault();
      if (currentPage === totalPages) return;
      currentPage += 1;
      pushPageUrl(currentPage);
      render();
      scrollToGrid();
    });
    wrap.querySelector('#pg-last').addEventListener('click', (event) => {
      event.preventDefault();
      if (currentPage === totalPages) return;
      currentPage = totalPages;
      pushPageUrl(currentPage);
      render();
      scrollToGrid();
    });
  }

  function render() {
    renderTabs();

    const filtered = filterProducts({
      category: activeCategory,
      query: searchQuery,
      sort: sortMode,
    }, allProducts);
    const total = filtered.length;
    const start = (currentPage - 1) * perPage;
    const pageItems = filtered.slice(start, start + perPage);

    const heroSub = document.getElementById('hero-sub');
    if (activeCategory !== 'Todos') heroSub.textContent = `Categoria: ${activeCategory}`;
    else if (searchQuery) heroSub.textContent = `Buscando por "${searchQuery}"`;
    else heroSub.textContent = 'Explore nossa coleção completa';

    document.getElementById('results-count').innerHTML =
      `Mostrando <strong>${total}</strong> produto${total !== 1 ? 's' : ''}` +
      (activeCategory !== 'Todos' ? ` em <strong>${activeCategory}</strong>` : '') +
      (searchQuery ? ` para "<strong>${searchQuery}</strong>"` : '');

    grid.innerHTML = !pageItems.length
      ? `
        <div class="products-empty">
          <div class="products-empty-icon">🔍</div>
          <h3>Nenhum produto encontrado</h3>
          <p>Tente outro termo ou categoria.</p>
        </div>
      `
      : pageItems.map(renderProductCard).join('');

    bindProductCardActions(grid);
    renderPagination(total);
  }

  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  searchInput.value = searchQuery;

  let timerId;
  searchInput.addEventListener('input', (event) => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => {
      searchQuery = event.target.value.trim();
      currentPage = 1;
      render();
    }, 260);
  });

  sortSelect.addEventListener('change', (event) => {
    sortMode = event.target.value;
    currentPage = 1;
    render();
  });

  grid.innerHTML = '';

  getAllProducts()
    .then((products) => {
      allProducts = products;

      if (urlCategory) {
        const matched = getCategories(allProducts).find(
          (category) => category.toLowerCase() === decodeURIComponent(urlCategory).toLowerCase()
        );
        if (matched) activeCategory = matched;
      }

      render();
    })
    .catch((error) => {
      console.error('Falha ao carregar catálogo', error);
      document.getElementById('hero-sub').textContent = 'Não foi possível carregar os produtos agora.';
      document.getElementById('results-count').innerHTML = 'Não foi possível carregar os produtos';
      grid.innerHTML = `
        <div class="products-empty">
          <div class="products-empty-icon">⚠️</div>
          <h3>Falha ao carregar produtos</h3>
          <p>Verifique a API e tente novamente.</p>
        </div>
      `;
      document.getElementById('pagination').innerHTML = '';
    });
}
