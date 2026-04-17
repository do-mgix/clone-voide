import { apiClient } from '../../../shared/api/client.js';
import { parsePrice } from '../../../shared/kernel/currency.js';

let productsCache = null;

function mergeIntoCache(products) {
  if (!Array.isArray(products)) {
    return productsCache ?? [];
  }

  const merged = new Map((productsCache ?? []).map((product) => [product.id, product]));
  products.forEach((product) => {
    if (product?.id) {
      merged.set(product.id, { ...merged.get(product.id), ...product });
    }
  });
  productsCache = Array.from(merged.values());
  return productsCache;
}

export async function getAllProducts(force = false) {
  if (productsCache && !force) {
    return productsCache;
  }

  const response = await apiClient.get('/products');
  productsCache = response.data?.products ?? [];
  return productsCache;
}

export function getCachedProducts() {
  return productsCache ?? [];
}

export function primeProductsCache(products) {
  mergeIntoCache(products);
}

export function getCategories(products = getCachedProducts()) {
  const categories = new Set(products.map((product) => product.cat).filter(Boolean));
  return ['Todos', ...Array.from(categories).sort((a, b) => a.localeCompare(b, 'pt-BR'))];
}

export async function getProductById(id) {
  const cachedProduct = getCachedProducts().find((product) => product.id === id);
  if (cachedProduct?.description) {
    return cachedProduct;
  }

  const response = await apiClient.get(`/products/${id}`);
  const product = response.data;
  mergeIntoCache([product]);
  return product;
}

export function countProductsByCategory(category, products = getCachedProducts()) {
  return category === 'Todos'
    ? products.length
    : products.filter((product) => product.cat === category).length;
}

export function filterProducts(
  { category = 'Todos', query = '', sort = 'default' },
  products = getCachedProducts(),
) {
  const normalizedQuery = query.trim().toLowerCase();

  let filtered = products.filter((product) => {
    const matchesCategory = category === 'Todos' || product.cat === category;
    const matchesQuery =
      !normalizedQuery ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.cat.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  if (sort === 'price-asc') {
    filtered = [...filtered].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  }
  if (sort === 'price-desc') {
    filtered = [...filtered].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  }
  if (sort === 'name-asc') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }
  if (sort === 'name-desc') {
    filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'));
  }

  return filtered;
}

export function getRelatedProducts(currentProductId, limit = 4, products = getCachedProducts()) {
  return products
    .filter((product) => product.id !== currentProductId)
    .slice(0, limit);
}

export function getFeaturedProducts(
  { filter = 'Todos', limit = 8 },
  products = getCachedProducts(),
) {
  const applyBadgeFilter = (list) => {
    if (filter === 'Todos') return list;
    return list.filter((product) => {
      if (filter === 'Novidades') return product.badge === 'new';
      if (filter === 'Ofertas') return product.badge === 'sale';
      if (filter === 'Populares') return product.badge === 'popular';
      return true;
    });
  };

  const featured = applyBadgeFilter(products.filter((p) => p.featured));
  const rest = applyBadgeFilter(products.filter((p) => !p.featured));

  const merged = [...featured, ...rest];
  return (merged.length ? merged : products).slice(0, limit);
}
