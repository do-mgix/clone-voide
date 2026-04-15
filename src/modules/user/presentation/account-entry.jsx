import { createRoot } from 'react-dom/client';
import AccountPage from './AccountPage.jsx';
import { AppReady } from '../../../app/AppReady.jsx';

createRoot(document.getElementById('root')).render(
  <AppReady>
    <AccountPage />
  </AppReady>,
);
