import { useMemo, useState, useEffect } from 'react';
import {
  ACCOUNT_PAGE_PATH,
  buildCatalogPageHref,
  buildProductPageHref,
  CATALOG_PAGE_PATH,
  CART_PAGE_PATH,
  HOME_PAGE_PATH,
  LOGIN_PAGE_PATH,
  ORDERS_PAGE_PATH,
} from './page-paths.js';
import { getAllProducts } from '../../modules/catalog/application/catalog-service.js';
const MAX_SEARCH_RESULTS = 6;

function FooterMascot() {
  const [phase, setPhase] = useState('idle'); // idle | hover | clicked | blinking
  const [lookRight, setLookRight] = useState(true);
  const [blinkOpen, setBlinkOpen] = useState(true);
  const busy = phase === 'clicked' || phase === 'blinking';

  useEffect(() => {
    function onMove(e) {
      setLookRight(e.clientX >= window.innerWidth / 2);
    }
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  function handleClick() {
    if (busy) return;
    setPhase('clicked');
    setTimeout(() => {
      setPhase('blinking');
      let tick = 0;
      const id = setInterval(() => {
        tick++;
        setBlinkOpen(tick % 2 !== 0);
        if (tick >= 12) {
          clearInterval(id);
          setBlinkOpen(true);
          setPhase('idle');
        }
      }, 80);
    }, 320);
  }

  let face;
  if (phase === 'hover')         face = '--';
  else if (phase === 'clicked')  face = '><';
  else if (phase === 'blinking') face = blinkOpen ? (lookRight ? '0o' : 'o0') : '--';
  else                           face = lookRight ? '0o' : 'o0';

  return (
    <div
      className="footer-mascot-wrap"
      onMouseEnter={() => !busy && setPhase('hover')}
      onMouseLeave={() => !busy && setPhase('idle')}
      onClick={handleClick}
    >
      <span className="footer-mascot" role="img" aria-label="mascote">
        {face}
      </span>
    </div>
  );
}

export function SiteLayout({ children, activeNav = '' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchItems, setSearchItems] = useState([]);
  const filteredResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];
    return searchItems.filter((item) =>
      item.name.toLowerCase().includes(query) || item.cat.toLowerCase().includes(query)
    );
  }, [searchItems, searchTerm]);
  const visibleResults = filteredResults.slice(0, MAX_SEARCH_RESULTS);
  const showResults = searchTerm.trim().length > 0;

  function handleSelectResult(item) {
    const href = buildProductPageHref({ id: item.id });
    window.location.href = href;
  }

  useEffect(() => {
    let cancelled = false;

    getAllProducts()
      .then((products) => {
        if (!cancelled) {
          setSearchItems(products);
        }
      })
      .catch((error) => {
        console.error('Falha ao carregar busca global', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <nav className="nav">
        <a href={HOME_PAGE_PATH} className="nav-logo tomorrow-bold">
          VOIDE
        </a>
        <div className="nav-search">
          <input
            className="nav-search-input"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar produtos e coleções"
            aria-label="Pesquisar produtos"
          />
          {showResults && (
            <div className="nav-search-results">
              {visibleResults.length > 0 ? (
                visibleResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelectResult(item)}
                  >
                    {item.name}
                  </button>
                ))
              ) : (
                <div className="nav-search-empty">Sem resultados para “{searchTerm}”</div>
              )}
            </div>
          )}
        </div>
        <div className="nav-actions">
          <a
            href={ACCOUNT_PAGE_PATH}
            className={`nav-icon${activeNav === 'account' ? ' active' : ''}`}
            title="Minha conta"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
            </svg>
          </a>
          <a id="cart-icon-btn" href={CART_PAGE_PATH} title="Abrir carrinho">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
            </svg>
            <span id="cart-count" style={{ display: 'none' }}>
              0
            </span>
          </a>
        </div>
      </nav>

      {children}

      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <a href={HOME_PAGE_PATH} className="nav-logo tomorrow-bold">
              VOIDE
            </a>
            <p className="footer-desc">
              Produtos selecionados com curadoria, entrega confiável e uma experiência direta do início ao fim.
            </p>
            <div className="footer-social">
              <a href="#" className="social-btn" aria-label="Facebook">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="social-btn" aria-label="Instagram">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="social-btn" aria-label="X / Twitter">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="social-btn" aria-label="YouTube">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="black"/></svg>
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Loja</h4>
            <ul>
              <li>
                <a href={CATALOG_PAGE_PATH}>Novidades</a>
              </li>
              <li>
                <a href={CATALOG_PAGE_PATH}>Mais vendidos</a>
              </li>
              <li>
                <a href={CATALOG_PAGE_PATH}>Ofertas</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Informações</h4>
            <ul>
              <li>
                <a href="#">Sobre nós</a>
              </li>
              <li>
                <a href="#">Blog e guias</a>
              </li>
              <li>
                <a href="#">Parcerias</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Suporte</h4>
            <ul>
              <li>
                <a href="#">Central de ajuda</a>
              </li>
              <li>
                <a href={ORDERS_PAGE_PATH}>Meus pedidos</a>
              </li>
              <li>
                <a href="#">Fale conosco</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 VOIDE. Todos os direitos reservados. <FooterMascot /></span>
          <div className="footer-payments">
            <span style={{ marginRight: '8px' }}>Pagamentos:</span>
            <span className="pay-badge">PIX</span>
            <span className="pay-badge">Visa</span>
            <span className="pay-badge">Mastercard</span>
            <span className="pay-badge">Boleto</span>
          </div>
          <button id="dark-toggle" title="Alternar tema">
            <span className="toggle-icon icon-sun">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            </span>
            <span className="toggle-icon icon-moon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </span>
          </button>
        </div>
      </footer>
    </>
  );
}
