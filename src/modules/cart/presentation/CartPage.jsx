import { useEffect } from 'react';
import { initCommonPage } from '../../../app/pages/common.js';
import { initCartPage } from './cart-page.js';
import { SiteLayout } from '../../../shared/presentation/SiteLayout.jsx';

export default function CartPage() {
  useEffect(() => {
    initCommonPage();
    initCartPage();
  }, []);

  return (
    <SiteLayout>
      <div className="cart-page">
        <div className="cart-header">
          <h1>Meu carrinho</h1>
          <p id="cart-subtitle">Carregando...</p>
        </div>
        <div className="cart-layout">
          <div id="cart-items-container"></div>
          <div className="cart-summary">
            <h2>Resumo do pedido</h2>
            <div className="summary-row">
              <span className="label">Subtotal</span>
              <span className="val" id="summary-subtotal">R$ 0,00</span>
            </div>
            <div className="summary-row">
              <span className="label">Frete</span>
              <span className="val" id="summary-shipping" style={{ color: 'var(--green-soft)', fontWeight: 600 }}>Grátis</span>
            </div>
            <hr className="summary-divider" />
            <div className="summary-total">
              <span className="label">Total</span>
              <span className="val" id="summary-total">R$ 0,00</span>
            </div>
            <button className="btn-checkout" id="btn-checkout">
              <span>Finalizar compra</span>
            </button>
            <div className="summary-secure">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Pagamento criptografado e seguro
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
