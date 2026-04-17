import { bindProductCardActions } from '../../cart/presentation/product-card-actions.js';
import { bindRevealOnScroll } from '../../../shared/ui/reveal.js';

export function initHomePage() {
  bindProductCardActions();
  bindRevealOnScroll('.product-card, .cat-card, .test-card');
}
