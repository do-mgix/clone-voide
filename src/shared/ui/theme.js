const THEME_KEY = 'shopstore-theme';

export function applySavedTheme() {
  const saved = window.localStorage.getItem(THEME_KEY);
  // Default to dark when no preference has been saved yet
  if (saved !== 'light') {
    document.documentElement.classList.add('dark');
  }
}

export function bindThemeToggle() {
  const toggle = document.getElementById('dark-toggle');
  if (!toggle) return;

  // Sync icon to current state on mount
  syncToggleIcon(toggle);

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    window.localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    syncToggleIcon(toggle);
  });
}

function syncToggleIcon(_toggle) {
  // Icon visibility is handled entirely by CSS via html.dark class
}
