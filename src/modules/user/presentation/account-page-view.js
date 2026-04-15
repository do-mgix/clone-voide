import { buildAccountPageHref } from '../../../shared/presentation/page-paths.js';

export function renderAccountPage() {
  return `
    <div class="user-page">
      <div class="user-cover"></div>
      <div class="user-profile-row">
        <div class="user-avatar">👤</div>
        <div class="user-profile-info"><div class="user-name">Hello, Visitor!</div><div class="user-email">user@email.com</div><div class="user-since">✦ Customer since 2024</div></div>
      </div>
      <div class="user-layout">
        <aside class="user-sidebar">
          <ul class="user-sidebar-nav">
            <li><a href="${buildAccountPageHref({ section: 'overview' })}" class="active" data-section="overview">Overview</a></li>
            <li><a href="${buildAccountPageHref({ section: 'orders' })}" data-section="orders">Orders</a></li>
            <li><a href="${buildAccountPageHref({ section: 'wishlist' })}" data-section="wishlist">Wishlist</a></li>
            <li><a href="${buildAccountPageHref({ section: 'addresses' })}" data-section="addresses">Addresses</a></li>
            <li><a href="${buildAccountPageHref({ section: 'profile' })}" data-section="profile">Profile</a></li>
            <div class="user-sidebar-divider"></div>
            <li><button class="user-logout-btn">Sign out</button></li>
          </ul>
        </aside>
        <main class="user-content">
          <div id="section-overview">
            <div class="user-stats-row">
              <div class="user-stat-card"><div class="user-stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div><div><div class="user-stat-num">8</div><div class="user-stat-label">Orders</div></div></div>
              <div class="user-stat-card"><div class="user-stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div><div class="user-stat-num">12</div><div class="user-stat-label">Wishlist</div></div></div>
              <div class="user-stat-card"><div class="user-stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div><div><div class="user-stat-num">5</div><div class="user-stat-label">Reviews</div></div></div>
            </div>
            <div class="user-section"><div class="user-section-header"><div class="user-section-title">Recent orders</div><button class="btn-secondary" data-section-trigger="orders">View all</button></div><div class="order-list"><div class="order-item"><div class="order-emoji">📦</div><div class="order-info"><div class="order-name">Bluetooth Headphones Pro</div><div class="order-date">Order #4521 · Mar 18, 2025</div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px"><span class="order-status status-delivered">✓ Delivered</span><span class="order-price">R$ 89,90</span></div></div></div></div>
          </div>
          <div id="section-orders" style="display:none"><div class="user-section"><div class="user-section-title">Orders</div></div></div>
          <div id="section-wishlist" style="display:none"><div class="user-section"><div class="user-section-header"><div class="user-section-title">Wishlist</div></div><div class="wish-grid"><div class="wish-card"><div class="wish-emoji">📦</div><div class="wish-name">Leather Wallet</div><div class="wish-price">R$ 34,90</div></div></div></div></div>
          <div id="section-addresses" style="display:none"><div class="user-section"><div class="user-section-header"><div class="user-section-title">Addresses</div></div><div class="address-grid"><div class="address-card default"><div class="address-default-badge">✦ Main</div><div class="address-name">Home</div><div class="address-text">123 Flowers Street<br>Belo Horizonte, MG</div><div class="address-actions"><button class="address-btn">Edit</button></div></div><div class="address-add"><div class="address-add-icon">＋</div><span>Add new address</span></div></div></div></div>
          <div id="section-profile" style="display:none"><div class="user-section"><div class="user-section-header"><div class="user-section-title">Personal information</div></div><div class="user-form"><div class="user-form-group"><label class="user-form-label">Name</label><input class="user-form-input" type="text" value="Visitor"></div><div class="user-form-group"><label class="user-form-label">Email</label><input class="user-form-input" type="email" value="user@email.com"></div><div class="user-form-group full user-form-actions"><button class="btn-primary"><span>Save changes</span></button></div></div></div></div>
        </main>
      </div>
    </div>
  `;
}
