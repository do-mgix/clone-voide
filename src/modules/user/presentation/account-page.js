import { buildAccountPageHref } from '../../../shared/presentation/page-paths.js';

export function initAccountPage() {
  const userPage = document.querySelector('.user-page');
  if (!userPage) return;

  const activeNavIcon = document.querySelector('.nav-icon.active');
  if (activeNavIcon) {
    activeNavIcon.style.background = 'var(--green-foam)';
    activeNavIcon.style.borderColor = 'var(--green-soft)';
    activeNavIcon.style.color = 'var(--green-deep)';
  }

  function switchSection(target) {
    document.querySelectorAll('[id^="section-"]').forEach((section) => {
      section.style.display = 'none';
    });

    const nextSection = document.getElementById(`section-${target}`);
    if (nextSection) nextSection.style.display = '';

    document.querySelectorAll('.user-sidebar-nav a[data-section]').forEach((link) => {
      link.classList.toggle('active', link.dataset.section === target);
    });

    document.querySelector('.user-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.querySelectorAll('.user-sidebar-nav a[data-section]').forEach((link) => {
    link.addEventListener('click', () => {
      switchSection(link.dataset.section);
    });
  });

  document.querySelectorAll('[data-section-trigger]').forEach((button) => {
    button.addEventListener('click', () => {
      window.location.href = buildAccountPageHref({ section: button.dataset.sectionTrigger });
    });
  });

  document.querySelectorAll('.btn-primary').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (button.closest('.user-section')) {
        event.preventDefault();
        window.ShopStore.showToast('Alterações salvas com sucesso!');
      }
    });
  });

  document.querySelector('.address-add')?.addEventListener('click', () => {
    window.ShopStore.showToast('Funcionalidade em breve!');
  });

  const searchParams = new URLSearchParams(window.location.search);
  const section = searchParams.get('section');
  if (section) switchSection(section);
}
