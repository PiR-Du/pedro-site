// Bascule de thème : [data-theme-toggle] alterne clair et sombre et mémorise le choix.
// Le clair est le thème par défaut : la préférence système n'est pas suivie.
const root = document.documentElement;

function currentTheme() {
  return root.dataset.theme === 'dark' ? 'dark' : 'light';
}

function syncToggles() {
  const next = currentTheme() === 'dark' ? 'clair' : 'sombre';
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.textContent = `Thème ${next}`;
    btn.setAttribute('aria-label', `Passer au thème ${next}`);
  });
}

export function initTheme() {
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-theme-toggle]')) return;
    const theme = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch (err) { /* choix non mémorisé */ }
    syncToggles();
  });
  syncToggles();
}

initTheme();
