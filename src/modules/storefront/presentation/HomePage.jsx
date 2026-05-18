import { useEffect, useMemo, useRef, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';
import { initCommonPage } from '../../../app/pages/common.js';
import { initHomePage } from './home-page.js';
import { SiteLayout } from '../../../shared/presentation/SiteLayout.jsx';
import { buildCatalogPageHref, buildProductPageHref } from '../../../shared/presentation/page-paths.js';
import { toSlug } from '../../../shared/kernel/slug.js';
import {
  getAllProducts,
  getFeaturedProducts,
  primeProductsCache,
} from '../../catalog/application/catalog-service.js';

export default function HomePage() {
  const categoriesRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    document.body.classList.add('hero-full-active');
    initCommonPage();

    return () => {
      document.body.classList.remove('hero-full-active');
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    getAllProducts()
      .then((loadedProducts) => {
        if (!cancelled) {
          primeProductsCache(loadedProducts);
          setProducts(loadedProducts);
        }
      })
      .catch((error) => {
        console.error('Falha ao carregar produtos da home', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleBannerClick() {
    document.body.classList.remove('hero-full-active');
    categoriesRef.current?.scrollIntoView({ behavior: 'smooth' });
    window.dispatchEvent(new Event('showNav'));
  }

  // Derive category data from products
  const categoryData = useMemo(() => {
    const byCategory = {};
    for (const product of products) {
      if (!product.cat) continue;
      if (!byCategory[product.cat]) {
        byCategory[product.cat] = { name: product.cat, emoji: product.emoji, count: 0 };
      }
      byCategory[product.cat].count++;
    }
    return Object.values(byCategory).sort((a, b) => b.count - a.count);
  }, [products]);

  useEffect(() => {
    if (!selectedCategory && categoryData.length > 0) {
      setSelectedCategory(categoryData[0].name);
    }
  }, [selectedCategory, categoryData]);

  const featuredProducts = useMemo(
    () => getFeaturedProducts({ filter: 'Todos', limit: 12 }, products),
    [products],
  );

  const highlightedCategory = selectedCategory || categoryData[0]?.name || '';
  const highlightedProducts = useMemo(
    () => products.filter((product) => product.cat === highlightedCategory).slice(0, 6),
    [products, highlightedCategory],
  );

  useEffect(() => {
    initHomePage();
  }, [products, highlightedProducts]);

  return (
    <SiteLayout activeNav="home">
      <section className="promo-banner-wrap">
        <div className="promo-banner">
          <div className="promo-copy">
            <div className="promo-kicker">Voide Store</div>
            <h1 className="promo-title">
              30% off
              <span>voide store</span>
            </h1>
            <div className="promo-actions">
              <a href={buildCatalogPageHref()} className="btn-primary">
                Ver catalogo
              </a>
              <button type="button" className="btn-outline promo-outline" onClick={handleBannerClick}>
                Explorar categorias
              </button>
            </div>
          </div>
          <div className="promo-panel">
            <div className="promo-badge">30% off</div>
            <div className="promo-metrics">
              <div>
                <strong>{products.length}</strong>
                <span>produtos no ar</span>
              </div>
              <div>
                <strong>{categoryData.length}</strong>
                <span>categorias ativas</span>
              </div>
              <div>
                <strong>{highlightedProducts.length || 6}</strong>
                <span>itens por vitrine</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="categories" ref={categoriesRef}>
        <div className="cats-header">
          <div>
            <div className="section-label">Categorias</div>
            <h2 className="section-title">
              Navegue por <em>colecoes</em>
            </h2>
          </div>
          <a href={buildCatalogPageHref()} className="btn-secondary">
            Ver tudo
          </a>
        </div>
        <div className="category-switcher">
          <div className="category-tabs" role="tablist" aria-label="Categorias em destaque">
            {categoryData.map((category) => (
              <button
                key={category.name}
                type="button"
                className={`category-tab${highlightedCategory === category.name ? ' active' : ''}`}
                onClick={() => setSelectedCategory(category.name)}
              >
                <span>{category.name}</span>
                <small>{category.count} itens</small>
              </button>
            ))}
          </div>
          <div className="category-showcase">
            <div className="category-showcase-head">
              <div>
                <div className="section-label">Categoria em foco</div>
                <h3>{highlightedCategory}</h3>
              </div>
              <a href={buildCatalogPageHref({ cat: highlightedCategory })} className="btn-secondary">
                Abrir categoria
              </a>
            </div>
            <div className="products-grid products-grid-compact">
              {highlightedProducts.map((product) => (
                <div
                  className="product-card product-card-compact"
                  data-id={product.id}
                  data-slug={toSlug(product.name)}
                  data-name={product.name}
                  data-price={product.price}
                  data-emoji={product.emoji}
                  data-cat={product.cat}
                  data-pib={product.pib}
                  data-badge={product.badge ?? ''}
                  data-old={product.old ?? ''}
                  data-rating={product.rating ?? 0}
                  data-reviews={product.reviews ?? 0}
                  key={product.id}
                >
                  <div className="product-img">
                    {product.imageUrl ? (
                      <img
                        className="product-img-photo"
                        src={product.imageUrl.startsWith('http') ? product.imageUrl : API_BASE_URL + product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className={`product-img-bg ${product.pib}`}></div>
                    )}
                    <button className="product-fav" aria-label="Favoritar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                  </div>
                  <div className="product-info">
                    <div className="product-category">{product.cat}</div>
                    <a className="product-name" href={buildProductPageHref({ slug: toSlug(product.name) })}>
                      {product.name}
                    </a>
                    <div className="product-bottom">
                      <div>
                        <span className="product-price">{product.price}</span>
                        <div className="product-stars">
                          ★★★★★ <span style={{ color: 'var(--text-light)' }}>({product.reviews ?? 0})</span>
                        </div>
                      </div>
                      <button className="product-add">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="products">
        <div className="products-header">
          <div>
            <div className="section-label">Mais produtos</div>
            <h2 className="section-title">
              Continue explorando <em>a vitrine</em>
            </h2>
          </div>
        </div>
        <div className="products-grid">
          {featuredProducts.map((product) => (
            <div
              className="product-card"
              data-id={product.id}
              data-slug={toSlug(product.name)}
              data-name={product.name}
              data-price={product.price}
              data-emoji={product.emoji}
              data-cat={product.cat}
              data-pib={product.pib}
              data-badge={product.badge ?? ''}
              data-old={product.old ?? ''}
              data-rating={product.rating ?? 0}
              data-reviews={product.reviews ?? 0}
              key={product.id}
            >
              <div className="product-img">
                {product.imageUrl ? (
                  <img
                    className="product-img-photo"
                    src={product.imageUrl.startsWith('http') ? product.imageUrl : API_BASE_URL + product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                  />
                ) : (
                  <div className={`product-img-bg ${product.pib}`}></div>
                )}
                <button className="product-fav" aria-label="Favoritar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <div className="product-info">
                <div className="product-category">{product.cat}</div>
                <a className="product-name" href={buildProductPageHref({ slug: toSlug(product.name) })}>
                  {product.name}
                </a>
                <div className="product-bottom">
                  <div>
                    <span className="product-price">{product.price}</span>
                    <div className="product-stars">
                      ★★★★★ <span style={{ color: 'var(--text-light)' }}>({product.reviews ?? 0})</span>
                    </div>
                  </div>
                  <button className="product-add">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
