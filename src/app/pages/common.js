import {
  bindCartNavigation,
  exposeLegacyCartApi,
  updateCartBadge,
} from '../../modules/cart/application/cart-service.js';
import { bindMobileMenu } from '../../shared/ui/navigation.js';
import { applySavedTheme, bindThemeToggle } from '../../shared/ui/theme.js';

applySavedTheme();
let isSharedPageInitialized = false;

export function initCommonPage() {
  if (isSharedPageInitialized) {
    updateCartBadge();
    return;
  }

  bindThemeToggle();
  bindCartNavigation();
  bindMobileMenu();
  exposeLegacyCartApi();
  updateCartBadge();
  isSharedPageInitialized = true;
}
