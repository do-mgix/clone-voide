import { useEffect } from 'react';
import { initCommonPage } from '../../../app/pages/common.js';
import { initCheckoutPage } from './checkout-page.js';
import { SiteLayout } from '../../../shared/presentation/SiteLayout.jsx';

export default function CheckoutPage() {
  useEffect(() => {
    initCommonPage();
    initCheckoutPage();
  }, []);

  return (
    <SiteLayout>
      <div className="checkout-page">
        <div className="checkout-header">
          <h1>Finalizar compra</h1>
          <p>Preencha seus dados de entrega e escolha a forma de pagamento</p>
        </div>

        <div className="checkout-layout">
          <form id="checkout-form" className="checkout-form" noValidate>

            {/* ── Address ── */}
            <section className="checkout-section">
              <h2>Endereço de entrega</h2>

              <div className="form-row form-row--2">
                <div className="form-field">
                  <label htmlFor="name">Nome completo</label>
                  <input id="name" name="name" type="text" placeholder="Seu nome" required />
                </div>
                <div className="form-field">
                  <label htmlFor="phone">Telefone</label>
                  <input id="phone" name="phone" type="tel" placeholder="(11) 99999-9999" required />
                </div>
              </div>

              <div className="form-row form-row--3">
                <div className="form-field">
                  <label htmlFor="zip">CEP</label>
                  <input id="zip" name="zip" type="text" placeholder="00000-000" required maxLength={9} />
                </div>
                <div className="form-field form-field--grow">
                  <label htmlFor="street">Rua / Avenida</label>
                  <input id="street" name="street" type="text" placeholder="Nome da rua" required />
                </div>
                <div className="form-field form-field--sm">
                  <label htmlFor="number">Número</label>
                  <input id="number" name="number" type="text" placeholder="123" required />
                </div>
              </div>

              <div className="form-row form-row--2">
                <div className="form-field">
                  <label htmlFor="complement">Complemento <span className="optional">(opcional)</span></label>
                  <input id="complement" name="complement" type="text" placeholder="Apto, bloco…" />
                </div>
                <div className="form-field">
                  <label htmlFor="neighborhood">Bairro</label>
                  <input id="neighborhood" name="neighborhood" type="text" placeholder="Seu bairro" required />
                </div>
              </div>

              <div className="form-row form-row--2">
                <div className="form-field form-field--grow">
                  <label htmlFor="city">Cidade</label>
                  <input id="city" name="city" type="text" placeholder="Sua cidade" required />
                </div>
                <div className="form-field form-field--sm">
                  <label htmlFor="state">Estado</label>
                  <select id="state" name="state" required>
                    <option value="">UF</option>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* ── Shipping options (revealed after ZIP) ── */}
            <section className="checkout-section" id="shipping-section" style={{ display: 'none' }}>
              <h2>Opções de frete</h2>
              <div id="shipping-options" className="shipping-options"></div>
            </section>

            {/* ── Payment ── */}
            <section className="checkout-section">
              <h2>Gateway de pagamento</h2>
              <div className="payment-options payment-options--providers">
                <button type="button" className="payment-option payment-provider-option" data-provider="stripe">
                  <span className="payment-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7.5C4 5.57 5.57 4 7.5 4h9A3.5 3.5 0 0 1 20 7.5v9a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 16.5z"/><path d="M8 10.5c0-1.1.9-2 2-2h4"/><path d="M8 13.5c0 1.1.9 2 2 2h6"/><path d="M14 8.5c1.1 0 2 .9 2 2"/></svg>
                  </span>
                  <div>
                    <span className="payment-name">Stripe</span>
                    <span className="payment-desc">Checkout hospedado para cartão</span>
                  </div>
                </button>
                <button type="button" className="payment-option payment-provider-option" data-provider="mercadopago">
                  <span className="payment-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9c1.2-1.5 2.8-2.2 4.7-2.2 2 0 3.6.8 5 2.2"/><path d="M4 12.5c1.2-1.5 2.8-2.2 4.7-2.2 2 0 3.6.8 5 2.2"/><path d="M14 12.5c.9-1.2 2-1.8 3.5-1.8 1 0 1.8.3 2.5.9"/><path d="M3 15.5c1.1 1.7 2.8 2.5 5 2.5 2.1 0 3.8-.8 5-2.5"/><path d="M13 15.5c1 1.2 2.2 1.8 3.8 1.8 1.7 0 3-.7 4.2-2"/></svg>
                  </span>
                  <div>
                    <span className="payment-name">Mercado Pago</span>
                    <span className="payment-desc">PIX, boleto e cartão</span>
                  </div>
                </button>
              </div>

              <h2>Forma de pagamento</h2>
              <div className="payment-options">
                <button type="button" className="payment-option" data-method="pix">
                  <span className="payment-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-2 2.5h3L12 7"/><path d="M10 14c.8.8 1.8 1.3 3 1.3s2.3-.5 3-1.3"/><circle cx="12" cy="12" r="10"/><path d="M8 12h.01M16 12h.01"/></svg>
                  </span>
                  <div>
                    <span className="payment-name">PIX</span>
                    <span className="payment-desc">Aprovação imediata</span>
                  </div>
                </button>
                <button type="button" className="payment-option" data-method="credit_card">
                  <span className="payment-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
                  </span>
                  <div>
                    <span className="payment-name">Cartão de crédito</span>
                    <span className="payment-desc">Disponível em Stripe e Mercado Pago</span>
                  </div>
                </button>
                <button type="button" className="payment-option" data-method="boleto">
                  <span className="payment-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                  </span>
                  <div>
                    <span className="payment-name">Boleto bancário</span>
                    <span className="payment-desc">Vencimento em 3 dias</span>
                  </div>
                </button>
              </div>
            </section>

            <button id="btn-place-order" type="submit" className="btn-place-order">
              Confirmar pedido
            </button>
            <p className="checkout-secure">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Seus dados estão protegidos e criptografados
            </p>
          </form>

          {/* ── Order summary ── */}
          <aside className="checkout-summary">
            <h2>Resumo do pedido</h2>
            <div id="checkout-summary-items" className="checkout-summary-items"></div>
            <hr className="summary-divider" />
            <div className="summary-row">
              <span className="label">Subtotal</span>
              <span className="val" id="checkout-subtotal">R$ 0,00</span>
            </div>
            <div className="summary-row">
              <span className="label">Frete</span>
              <span className="val" id="checkout-shipping" style={{ color: 'var(--text-light)' }}>—</span>
            </div>
            <hr className="summary-divider" />
            <div className="summary-total">
              <span className="label">Total</span>
              <span className="val" id="checkout-total">R$ 0,00</span>
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
