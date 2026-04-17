import { useEffect } from 'react';
import { initCommonPage } from '../../../app/pages/common.js';
import { initOrdersPage } from './orders-page.js';
import { SiteLayout } from '../../../shared/presentation/SiteLayout.jsx';

export default function OrdersPage() {
  useEffect(() => {
    initCommonPage();
    initOrdersPage();
  }, []);

  return (
    <SiteLayout>
      <div className="orders-page">
        <div className="orders-header">
          <h1>Meus pedidos</h1>
          <p id="orders-subtitle">Carregando…</p>
        </div>
        <div id="orders-container" className="orders-container"></div>
      </div>
    </SiteLayout>
  );
}
