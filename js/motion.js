// Mouvement : apparitions au scroll, révélation de texte, compteurs.
// Amélioration progressive : sans ce module, tout le contenu est visible.
// Avec prefers-reduced-motion, rien n'est masqué et les compteurs affichent leur valeur finale.

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

function countUp(el, duration = 600) {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target)) return;
  if (reduced.matches) { el.textContent = target; return; }
  const start = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - p) ** 3;
    el.textContent = Math.round(eased * target);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function reveal(el) {
  el.classList.add('is-revealed');
  if (el.matches('[data-count]')) countUp(el);
  el.querySelectorAll('[data-count]').forEach(n => countUp(n));
}

export function initMotion(scope = document) {
  const targets = scope.querySelectorAll('[data-reveal], [data-count]:not([data-reveal] [data-count])');
  if (!targets.length) return;

  if (reduced.matches || !('IntersectionObserver' in window)) {
    targets.forEach(reveal);
    return;
  }

  document.documentElement.classList.add('has-motion');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      reveal(entry.target);
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  targets.forEach(el => observer.observe(el));
}

// Calque de contrôle de la grille : touche G (hors champs de saisie) ou [data-grid-toggle]
export function initGridOverlay() {
  const overlay = document.querySelector('.grid-overlay');
  if (!overlay) return;
  const toggle = () => overlay.classList.toggle('is-visible');
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() !== 'g' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    toggle();
  });
  document.addEventListener('click', e => {
    if (e.target.closest('[data-grid-toggle]')) toggle();
  });
}

initMotion();
initGridOverlay();
