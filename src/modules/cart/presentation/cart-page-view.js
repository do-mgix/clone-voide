export function renderCartPage() {
  return `
    <div class="cart-page">
      <div class="cart-header"><h1>My Cart</h1><p id="cart-subtitle">Loading...</p></div>
      <div class="cart-layout">
        <div id="cart-items-container"></div>
        <div class="cart-summary">
          <h2>Order summary</h2>
          <div class="summary-row"><span class="label">Subtotal</span><span class="val" id="summary-subtotal">R$ 0,00</span></div>
          <div class="summary-row"><span class="label">Discount</span><span class="val" id="summary-discount">— R$ 0,00</span></div>
          <div class="coupon-row"><input class="coupon-input" id="coupon-input" type="text" placeholder="Discount coupon"><button class="coupon-apply" id="coupon-apply">Apply</button></div>
          <hr class="summary-divider">
          <div class="summary-total"><span class="label">Total</span><span class="val" id="summary-total">R$ 0,00</span></div>
          <button class="btn-checkout" id="btn-checkout"><span>Checkout</span></button>
          <div class="summary-secure">🔒 Secure encrypted payment</div>
        </div>
      </div>
    </div>
  `;
}
