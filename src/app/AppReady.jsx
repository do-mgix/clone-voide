import { useEffect } from 'react';
import { useFirebaseAuthSync } from '../modules/user/application/useFirebaseAuthSync.js';
import { showToast } from '../shared/ui/toast.js';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

const TOAST_MESSAGES = {
  network: 'Backend inacessível: verifique a conectividade.',
  backend: 'Servidor retornou um erro inesperado.',
  db: 'Banco de dados indisponível.',
};

function getToastText(type, detail) {
  const base = TOAST_MESSAGES[type] ?? TOAST_MESSAGES.backend;
  return detail ? `${base} (${detail})` : base;
}

export function AppReady({ children }) {
  useFirebaseAuthSync();

  useEffect(() => {
    let lastToast = '';

    async function checkHealth() {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          credentials: 'include',
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          const type = response.status === 503 ? 'db' : 'backend';
          const toastText = getToastText(type, payload ?? response.statusText);
          if (toastText !== lastToast) {
            lastToast = toastText;
            showToast(toastText);
          }
          return;
        }

        // backend ok — nothing to show
      } catch (error) {
        const toastText = getToastText('network', error?.message);
        if (toastText !== lastToast) {
          lastToast = toastText;
          showToast(toastText);
        }
      }
    }

    checkHealth();
  }, []);

  return <>{children}</>;
}

