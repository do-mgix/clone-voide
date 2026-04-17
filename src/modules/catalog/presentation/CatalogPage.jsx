import { useEffect } from 'react';
import { initCommonPage } from '../../../app/pages/common.js';
import { initCatalogPage } from './catalog-page.js';
import { SiteLayout } from '../../../shared/presentation/SiteLayout.jsx';

export default function CatalogPage() {
  useEffect(() => {
    initCommonPage();
    initCatalogPage();
  }, []);

  return (
    <SiteLayout activeNav="products">
      <div className="products-page">
        <div className="products-hero">
          <div className="products-hero-top">
            <div>
              <div className="section-label" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Loja
              </div>
              <h1 className="products-hero-title">
                Todos os <em>produtos</em>
              </h1>
              <p className="products-hero-sub" id="hero-sub">
                Explore a coleção completa
              </p>
            </div>
            <div className="search-bar-wrap">
              <input className="search-bar" id="search-input" type="text" placeholder="Buscar produtos..." autoComplete="off" />
            </div>
          </div>
          <div className="cat-tabs-wrap" id="cat-tabs"></div>
        </div>
        <div className="products-body">
          <div className="products-results-bar">
            <div className="products-results-count" id="results-count">
              <strong>0</strong> produtos
            </div>
            <select className="sort-select" id="sort-select">
              <option value="default">Ordenar: relevância</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="name-asc">A → Z</option>
              <option value="name-desc">Z → A</option>
            </select>
          </div>
          <div className="products-grid-page" id="products-grid"></div>
          <div className="pagination" id="pagination"></div>
        </div>
      </div>
    </SiteLayout>
  );
}
