import { createRoot } from 'react-dom/client';
import LoginPage from './LoginPage.jsx';
import { AppReady } from '../../../app/AppReady.jsx';

createRoot(document.getElementById('root')).render(
  <AppReady>
    <LoginPage />
  </AppReady>,
);
