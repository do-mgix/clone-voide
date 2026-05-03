export const HOME_PAGE_PATH = '/';
export const CATALOG_PAGE_PATH = '/src/modules/catalog/presentation/catalog.html';
export const PRODUCT_PAGE_BASE_PATH = '/src/modules/catalog/presentation/product.html';
export const CART_PAGE_PATH = '/src/modules/cart/presentation/cart.html';
export const ACCOUNT_PAGE_PATH = '/src/modules/user/presentation/account.html';
export const ACCOUNT_PAGE_BASE_PATH = ACCOUNT_PAGE_PATH;
export const LOGIN_PAGE_PATH = '/src/modules/user/presentation/login.html';
export const REGISTER_PAGE_PATH = '/src/modules/user/presentation/register.html';
export const GOOGLE_LOGIN_PAGE_PATH = '/src/modules/user/presentation/google-login.html';
export const COMPLETE_PROFILE_PAGE_PATH = '/src/modules/user/presentation/complete-profile.html';
export const CHECKOUT_PAGE_PATH = '/src/modules/checkout/presentation/checkout.html';
export const ORDERS_PAGE_PATH = '/src/modules/orders/presentation/orders.html';

export function buildCatalogPageHref(params = {}) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `${CATALOG_PAGE_PATH}${query ? `?${query}` : ''}`;
}

export function buildProductPageHref(params = {}) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `${PRODUCT_PAGE_BASE_PATH}${query ? `?${query}` : ''}`;
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
