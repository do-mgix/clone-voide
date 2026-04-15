import { useEffect } from 'react';
import { initCommonPage } from '../../../app/pages/common.js';
import { initProductDetailPage } from './product-detail-page.js';
import { SiteLayout } from '../../../shared/presentation/SiteLayout.jsx';
import { buildCatalogPageHref } from '../../../shared/presentation/page-paths.js';

export default function ProductPage() {
  useEffect(() => {
    initCommonPage();
    initProductDetailPage();
  }, []);

  return (
    <SiteLayout activeNav="products">
      <div className="product-page">
        <div className="breadcrumb">
          <a href={buildCatalogPageHref()}>Início</a>
          <span>›</span>
          <a href={buildCatalogPageHref()} id="bc-cat">
            Categoria
          </a>
          <span>›</span>
          <span id="bc-name">Produto</span>
        </div>
        <div className="product-detail">
          <div className="product-detail-img" id="detail-img">
            📦
          </div>
          <div className="product-detail-info">
            <div className="product-detail-category" id="detail-cat">
              Categoria
            </div>
            <h1 className="product-detail-name" id="detail-name">
              Carregando produto
            </h1>
            <div className="product-detail-stars">
              <span className="stars-val">★★★★★</span>
              <span className="stars-count" id="detail-reviews">0 avaliações</span>
            </div>
            <div className="product-detail-price">
              <span className="price-current" id="detail-price">
                R$ 0,00
              </span>
              <span className="price-old" id="detail-old" style={{ display: 'none' }}></span>
            </div>
            <p className="product-detail-desc" id="detail-desc">Carregando descrição do produto...</p>
            <div className="product-options" id="size-options">
              <div className="options-label">Tamanho</div>
              <div className="options-row" id="size-options-row"></div>
            </div>
            <div className="product-options" id="color-options">
              <div className="options-label">Cor</div>
              <div className="options-row" id="color-options-row"></div>
            </div>
            <div className="product-qty-row">
              <div className="options-label" style={{ margin: 0 }}>
                Quantidade
              </div>
              <div className="qty-control">
                <button className="qty-btn" id="qty-minus">
                  −
                </button>
                <span className="qty-val" id="qty-val">
                  1
                </span>
                <button className="qty-btn" id="qty-plus">
                  +
                </button>
              </div>
            </div>
            <div className="product-actions">
              <button className="btn-add-cart" id="btn-add-cart">
                <span>Adicionar ao carrinho</span>
              </button>
              <button className="btn-wish" id="btn-wish">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>
            <div className="product-perks">
              <div className="perk">
                <span className="perk-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                </span> Entrega em até 2 dias
              </div>
              <div className="perk">
                <span className="perk-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v5"/><path d="M11 11V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v9a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4a3 3 0 0 0-3-3 3 3 0 0 0-3 3"/></svg>
                </span> Troca facilitada em 30 dias
              </div>
              <div className="perk">
                <span className="perk-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span> Pagamento seguro
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="related">
        <div className="related-header">
          <div>
            <div className="section-label">Relacionados</div>
            <h2 className="section-title">
              Você também pode <em>gostar</em>
            </h2>
          </div>
          <a href={buildCatalogPageHref()} className="btn-secondary">
            Ver mais
          </a>
        </div>
        <div className="products-grid" id="related-grid"></div>
      </section>
    </SiteLayout>
  );
}
