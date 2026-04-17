import { mountStyles } from './styled.js';

const TOAST_STYLES = `
  .toast {
    position: fixed;
    bottom: 32px;
    right: 32px;
    z-index: 9999;
    background: #000;
    color: white;
    padding: 14px 22px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.88rem;
    font-weight: 500;
    box-shadow: 0 12px 40px rgba(26, 58, 42, 0.25);
    transform: translateY(20px);
    opacity: 0;
    transition: transform 0.3s ease, opacity 0.3s ease;
    pointer-events: none;
  }

  .toast.show {
    transform: translateY(0);
    opacity: 1;
  }

  .toast-icon {
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    .toast {
      bottom: 16px;
      right: 16px;
      left: 16px;
      font-size: 0.82rem;
    }
  }
`;

export function showToast(message) {
  mountStyles('shopstore-toast-styles', TOAST_STYLES);

  let toast = document.getElementById('toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.innerHTML = '<span class="toast-icon">🛒</span><span class="toast-msg"></span>';
    document.body.appendChild(toast);
  }

  toast.querySelector('.toast-msg').textContent = message;
  toast.classList.add('show');

  window.clearTimeout(toast._timeoutId);
  toast._timeoutId = window.setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}
