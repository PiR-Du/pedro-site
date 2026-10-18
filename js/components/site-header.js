// <site-header> : en-tête et navigation, sans Shadow DOM pour hériter des styles globaux.
// Le HTML placé dans l'élément sert de repli sans JS (marque et lien vers le sommaire).

export const TOOLS = [
  { id: 'mediatheque', href: 'mediatheque/index.html', label: 'Médiathèque', desc: 'Films, séries, livres, musique, jeux' },
  { id: 'ville', href: 'ville/index.html', label: 'Ville', desc: 'Carte de lieux à découvrir' },
  { id: 'encyclopedia', href: 'encyclopedia/index.html', label: 'Encyclopédie', desc: 'Savoirs partagés' },
  { id: 'batch-cooking', href: 'batch-cooking/index.html', label: 'Batch cooking', desc: 'Plan de repas de la semaine' },
  { id: 'score', href: 'score/index.html', label: 'Scores', desc: 'Soirées jeux et trophées' },
  { id: 'sudoku', href: 'sudoku/sudoku.html', label: 'Sudoku', desc: 'Solveur par backtracking' },
  { id: 'web', href: 'web/index.html', label: 'Sites web', desc: 'Sites qui valent le détour' },
  { id: 'labo', href: 'labo/index.html', label: 'Labo data', desc: 'Data, dataviz et Excel vulgarisés' },
];

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const root = (document.body.dataset.root || '.').replace(/\/$/, '');
    const page = document.body.dataset.page || '';

    const links = TOOLS.map((tool, i) => `
          <li>
            <a class="site-nav__link" href="${root}/${tool.href}"${tool.id === page ? ' aria-current="page"' : ''}>
              <span class="folio">${String(i + 1).padStart(2, '0')}</span>
              <span class="site-nav__label">${tool.label}</span>
              <span class="site-nav__desc">${tool.desc}</span>
            </a>
          </li>`).join('');

    this.innerHTML = `
      <header class="site-header">
        <div class="container site-header__inner">
          <a class="site-header__brand" href="${root}/index.html"${page === 'home' ? ' aria-current="page"' : ''}>Pierre Duchesne</a>
          <nav class="site-nav" aria-label="Navigation principale">
            <button type="button" class="btn btn--sm site-nav__toggle" aria-expanded="false" aria-controls="site-nav-list">Menu</button>
            <ul class="site-nav__list" id="site-nav-list">${links}</ul>
          </nav>
        </div>
      </header>`;

    const toggle = this.querySelector('.site-nav__toggle');
    const list = this.querySelector('.site-nav__list');
    const setOpen = open => {
      list.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Fermer' : 'Menu';
    };

    toggle.addEventListener('click', () => setOpen(!list.classList.contains('is-open')));
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || !list.classList.contains('is-open')) return;
      setOpen(false);
      toggle.focus();
    });
    document.addEventListener('click', e => {
      if (!this.contains(e.target)) setOpen(false);
    });
  }
}

customElements.define('site-header', SiteHeader);
