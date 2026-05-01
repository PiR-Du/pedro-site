const TEMPLATES = {
  header: `
<header class="site-header">
  <div class="inner">
    <a class="brand" data-nav-link="home" href="{{root}}/index.html">
      <span class="brand-dot" aria-hidden="true"></span>
      <span>Pierre Duchesne</span>
    </a>
    <nav class="nav">
      <a data-nav-link="home" href="{{root}}/index.html">Accueil</a>
      <a data-nav-link="sudoku" href="{{root}}/sudoku/sudoku.html">Sudoku</a>
      <a data-nav-link="score" href="{{root}}/score/index.html">Score</a>
      <a data-nav-link="batch-cooking" href="{{root}}/batch-cooking/index.html">Batch cooking</a>
      <a data-nav-link="recommendations" href="{{root}}/recommendations/index.html">Recommandations</a>
      <a data-nav-link="encyclopedia" href="{{root}}/encyclopedia/index.html">Encyclopedie</a>
      <a data-nav-link="contribute" href="{{root}}/contribute/index.html">Contribuer</a>
    </nav>
  </div>
</header>`,
  footer: `
<footer class="site-footer">
  <div class="inner">
    <p>© 2026 - Pierre Duchesne</p>
    <p class="tag mono">Data · Maths · Code</p>
  </div>
</footer>`
};

function injectPartial(targetId, html, transform) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.outerHTML = transform ? transform(html) : html;
}

document.addEventListener("DOMContentLoaded", () => {
  const root = (document.body.dataset.root || ".").replace(/\/$/, "");
  const page = document.body.dataset.page || "";

  // Inject header
  injectPartial("site-header", TEMPLATES.header, html =>
    html.replace(/{{root}}/g, root)
  );

  // Inject footer
  injectPartial("site-footer", TEMPLATES.footer);

  // Active link
  document
    .querySelectorAll(`[data-nav-link="${page}"]`)
    .forEach(link => link.classList.add("active"));
});
