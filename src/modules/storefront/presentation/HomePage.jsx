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

const CATEGORY_HERO_META = {
  'Moda': {
    lines: ['DEFININDO', 'SEU ESTILO'],
    italic: 'ÚNICO',
    desc: 'Peças exclusivas que expressam quem você é. Qualidade, forma e essência.',
  },
  'Eletrônicos': {
    lines: ['CONECTADO', 'AO FUTURO'],
    italic: 'AGORA',
    desc: 'Os melhores dispositivos para o seu cotidiano. Performance sem compromisso.',
  },
  'Casa & Deco': {
    lines: ['AMBIENTES', 'QUE INSPIRAM'],
    italic: 'VOCÊ',
    desc: 'Transforme seus espaços com design e personalidade. Seu lar, sua identidade.',
  },
  'Esportes': {
    lines: ['DESEMPENHO', 'SEM LIMITES'],
    italic: 'AGORA',
    desc: 'Equipamentos para você ir além dos seus limites.',
  },
  'Livros': {
    lines: ['EXPANDINDO', 'HORIZONTES'],
    italic: 'SEMPRE',
    desc: 'Os melhores títulos para cada jornada.',
  },
};

function getCategoryHeroMeta(catName) {
  return CATEGORY_HERO_META[catName] ?? {
    lines: [catName.toUpperCase()],
    italic: 'EXPLORE',
    desc: `Descubra nossa seleção de ${catName.toLowerCase()}.`,
  };
}


export default function HomePage() {
  const categoriesRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideTimerRef = useRef(null);
  const slidesCountRef = useRef(1);

  useEffect(() => {
    document.body.classList.add('hero-full-active');
    initCommonPage();

    return () => {
      document.body.classList.remove('hero-full-active');
    };
  }, []);

  useEffect(() => {
    function advance() {
      setCurrentSlide((s) => (s + 1) % slidesCountRef.current);
    }
    slideTimerRef.current = setInterval(advance, 5000);
    return () => clearInterval(slideTimerRef.current);
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

  useEffect(() => {
    initHomePage();
  }, [products]);

  function handleHeroClick() {
    document.body.classList.remove('hero-full-active');
    categoriesRef.current?.scrollIntoView({ behavior: 'smooth' });
    window.dispatchEvent(new Event('showNav'));
  }

  function goToSlide(index) {
    clearInterval(slideTimerRef.current);
    setCurrentSlide(index);
    slideTimerRef.current = setInterval(
      () => setCurrentSlide((s) => (s + 1) % slidesCountRef.current),
      5000,
    );
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

  // Top categories become hero slides (max 5)
  const heroSlides = useMemo(() => {
    const slides = categoryData.slice(0, 5).map(({ name, emoji }) => ({
      ...getCategoryHeroMeta(name),
      label: name,
      emoji,
      tagName: name,
      cat: name,
    }));
    slidesCountRef.current = slides.length || 1;
    return slides;
  }, [categoryData]);

  const featuredProducts = useMemo(
    () => getFeaturedProducts({ filter: 'Todos', limit: 8 }, products),
    [products],
  );

  const slideCount = heroSlides.length;
  const safeSlide = slideCount > 0 ? currentSlide % slideCount : 0;

  return (
    <SiteLayout activeNav="home">
      <section className="hero hero-full">
        <div className="hero-carousel">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.cat}
              className={`hero-slide${safeSlide === index ? ' active' : ''}`}
            >
              <div className="hero-content">
                <div className="hero-eyebrow">{slide.label}</div>
                <h1 className="hero-title">
                  {slide.lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                  <em>{slide.italic}</em>
                </h1>
                <p className="hero-sub">{slide.desc}</p>
                <div className="hero-actions">
                  <a href={buildCatalogPageHref()} className="btn-outline">
                    Ver tudo
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="hero-visual">
                <div className="hero-product-frame">
                  <div className="hero-product-bg" />
                  <div className="hero-product-tag">
                    <span className="hero-product-tag-name">{slide.tagName}</span>
                    <span className="hero-product-tag-dot" />
                  </div>
                </div>
                <div className="hero-line" />
              </div>
            </div>
          ))}
        </div>

        {slideCount > 1 && (
          <>
            <div className="hero-counter">
              <span className="hero-counter-current">0{safeSlide + 1}</span>
              &nbsp;/&nbsp;0{slideCount}
            </div>

            <div className="hero-dots">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.cat}
                  className={`hero-dot${safeSlide === index ? ' active' : ''}`}
                  type="button"
                  aria-label={`Slide ${index + 1}`}
                  onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                />
              ))}
            </div>

            <div className="hero-progress" key={safeSlide} />
          </>
        )}

        <button className="hero-touch" type="button" onClick={handleHeroClick} aria-label="Descer página" />
      </section>

      <section className="categories" ref={categoriesRef}>
        <div className="cats-header">
          <div>
            <div className="section-label">Categorias</div>
            <h2 className="section-title">
              Explore nossas <em>categorias</em>
            </h2>
          </div>
          <a href={buildCatalogPageHref()} className="btn-secondary">
            Ver tudo
          </a>
        </div>
        <div className="cats-grid">
          {categoryData.map((category, index) => (
            <a
              href={buildCatalogPageHref({ cat: category.name })}
              className={`cat-card${index === 0 ? ' large' : ''}`}
              key={category.name}
              style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              <div className={`cat-bg cat-bg-${Math.min(index + 1, 5)}`}></div>
              <div className="cat-overlay"></div>
              <div className="cat-info">
                <div>
                  <div className="cat-name">{category.name}</div>
                  <div className="cat-count">{category.count} produtos</div>
                </div>
                <div className="cat-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="products">
        <div className="products-header">
          <div>
            <div className="section-label">Destaques</div>
            <h2 className="section-title">
              Produtos em <em>destaque</em>
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
