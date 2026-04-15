export function renderCatalogPage() {
  return `
    <div class="products-page">
      <div class="products-hero">
        <div class="products-hero-top">
          <div>
            <div class="section-label" style="color:rgba(255,255,255,0.5)">Store</div>
            <h1 class="products-hero-title">All <em>products</em></h1>
            <p class="products-hero-sub" id="hero-sub">Explore the full collection</p>
          </div>
          <div class="search-bar-wrap">
            <input class="search-bar" id="search-input" type="text" placeholder="Search products..." autocomplete="off">
            <span class="search-bar-icon">🔍</span>
          </div>
        </div>
        <div class="cat-tabs-wrap" id="cat-tabs"></div>
      </div>
      <div class="products-body">
        <div class="products-results-bar">
          <div class="products-results-count" id="results-count">Showing <strong>0</strong> products</div>
          <select class="sort-select" id="sort-select">
            <option value="default">Sort: Relevance</option>
            <option value="price-asc">Lowest price</option>
            <option value="price-desc">Highest price</option>
            <option value="name-asc">A → Z</option>
            <option value="name-desc">Z → A</option>
          </select>
        </div>
        <div class="products-grid-page" id="products-grid"></div>
        <div class="pagination" id="pagination"></div>
      </div>
    </div>
  `;
}
