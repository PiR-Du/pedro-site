// <site-footer> : pied de page, sans Shadow DOM. Le HTML de repli porte la mention de copyright.

class SiteFooter extends HTMLElement {
  connectedCallback() {
    const root = (document.body.dataset.root || '.').replace(/\/$/, '');
    this.innerHTML = `
      <footer class="site-footer">
        <div class="container site-footer__inner">
          <p>© 2026 Pierre Duchesne</p>
          <p class="eyebrow">Data · Maths · Code</p>
          <div class="cluster">
            <a href="${root}/styleguide.html">Guide de style</a>
            <button type="button" class="btn btn--quiet" data-theme-toggle>Thème</button>
          </div>
        </div>
      </footer>`;
  }
}

customElements.define('site-footer', SiteFooter);
