const TEMPLATES = {
  header: `
<header class="site-header">
  <div class="inner">
    <a class="brand" data-nav-link="home" href="{{root}}/index.html">
      <span class="brand-dot" aria-hidden="true"></span>
      <span>Pierre Duchesne</span>
    </a>
    <nav class="nav" aria-label="Navigation principale">

      <div class="nav-group" id="nav-group-explorer">
        <button class="nav-group-btn" onclick="toggleNavGroup('nav-group-explorer')" aria-expanded="false" aria-haspopup="true">
          Explorer
          <span class="nav-arrow" aria-hidden="true">▾</span>
        </button>
        <div class="nav-dropdown" role="menu" aria-label="Espaces Explorer">
          <a href="{{root}}/mediatheque/index.html" data-nav-link="mediatheque" role="menuitem">
            <span class="nav-dd-text">
              <strong>Médiathèque</strong>
              <small>Films, séries, livres, musique</small>
            </span>
          </a>
          <a href="{{root}}/ville/index.html" data-nav-link="ville" role="menuitem">
            <span class="nav-dd-text">
              <strong>Ville</strong>
              <small>Bonnes adresses sur la carte</small>
            </span>
          </a>
          <a href="{{root}}/encyclopedia/index.html" data-nav-link="encyclopedia" role="menuitem">
            <span class="nav-dd-text">
              <strong>Encyclopédie</strong>
              <small>Savoirs partagés</small>
            </span>
          </a>
          <a href="{{root}}/batch-cooking/index.html" data-nav-link="batch-cooking" role="menuitem">
            <span class="nav-dd-text">
              <strong>Batch Cooking</strong>
              <small>Plan de repas de la semaine</small>
            </span>
          </a>
          <a href="{{root}}/web/index.html" data-nav-link="web" role="menuitem">
            <span class="nav-dd-text">
              <strong>Cool Web</strong>
              <small>Sites qui valent le détour</small>
            </span>
          </a>
        </div>
      </div>

      <div class="nav-group" id="nav-group-jeux">
        <button class="nav-group-btn" onclick="toggleNavGroup('nav-group-jeux')" aria-expanded="false" aria-haspopup="true">
          Jeux
          <span class="nav-arrow" aria-hidden="true">▾</span>
        </button>
        <div class="nav-dropdown" role="menu" aria-label="Espaces Jeux">
          <a href="{{root}}/score/index.html" data-nav-link="score" role="menuitem">
            <span class="nav-dd-text">
              <strong>Suivi de Scores</strong>
              <small>Soirées jeux et trophées</small>
            </span>
          </a>
          <a href="{{root}}/sudoku/sudoku.html" data-nav-link="sudoku" role="menuitem">
            <span class="nav-dd-text">
              <strong>Solveur de Sudoku</strong>
              <small>Backtracking Python</small>
            </span>
          </a>
        </div>
      </div>

    </nav>
  </div>
</header>`,
  footer: `
<footer class="site-footer">
  <div class="inner">
    <p>© 2026 — Pierre Duchesne</p>
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

  injectPartial("site-header", TEMPLATES.header, html =>
    html.replace(/{{root}}/g, root)
  );
  injectPartial("site-footer", TEMPLATES.footer);

  document.querySelectorAll("[data-nav-link]").forEach(el => {
    if (el.dataset.navLink === page) {
      el.classList.add("active");
      el.closest(".nav-group")?.classList.add("active-group");
    }
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".nav-group")) closeAllNavGroups();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAllNavGroups();
  });
});

function closeAllNavGroups() {
  document.querySelectorAll(".nav-group").forEach(g => {
    g.classList.remove("open");
    const btn = g.querySelector(".nav-group-btn");
    if (btn) btn.setAttribute("aria-expanded", "false");
  });
}

function toggleNavGroup(id) {
  const group = document.getElementById(id);
  if (!group) return;
  const isOpen = group.classList.contains("open");
  closeAllNavGroups();
  if (!isOpen) {
    group.classList.add("open");
    const btn = group.querySelector(".nav-group-btn");
    if (btn) btn.setAttribute("aria-expanded", "true");
  }
}

function toggleContributePanel(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  const trigger = document.querySelector(`[aria-controls="${id}"]`);
  const isOpen = panel.classList.contains("open");
  panel.classList.toggle("open");
  if (trigger) trigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
}

function showToast(msg, type = "default") {
  let container = document.getElementById("global-toasts");
  if (!container) {
    container = document.createElement("div");
    container.id = "global-toasts";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast" + (type === "success" ? " toast-success" : type === "error" ? " toast-event" : "");
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("out");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
