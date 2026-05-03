export const HOME_PAGE_PATH = '/';
export const CATALOG_PAGE_PATH = '/catalogo';
export const PRODUCT_PAGE_BASE_PATH = '/produto';
export const CART_PAGE_PATH = '/carrinho';
export const ACCOUNT_PAGE_PATH = '/conta';
export const ACCOUNT_PAGE_BASE_PATH = '/conta';
export const LOGIN_PAGE_PATH = '/entrar';
export const REGISTER_PAGE_PATH = '/cadastro';
export const GOOGLE_LOGIN_PAGE_PATH = '/entrar/google';
export const COMPLETE_PROFILE_PAGE_PATH = '/cadastro/completar';
export const CHECKOUT_PAGE_PATH = '/checkout';
export const ORDERS_PAGE_PATH = '/pedidos';

export function buildCatalogPageHref(params = {}) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `${CATALOG_PAGE_PATH}${query ? `?${query}` : ''}`;
}

export function buildProductPageHref({ slug } = {}) {
  return slug ? `/produto/${slug}` : '/produto';
}

export function buildAccountPageHref(params = {}) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `${ACCOUNT_PAGE_BASE_PATH}${query ? `?${query}` : ''}`;
}

export function buildLoginPageHref(params = {}) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `${LOGIN_PAGE_PATH}${query ? `?${query}` : ''}`;
}
