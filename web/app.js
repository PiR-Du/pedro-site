let activeFilters = { category: 'all', search: '' };

function initWeb() {
    const allItems = getAllItems();
    populateCategoryPills(allItems);
    renderGrid();
    setupEventListeners();
}

function getAllItems() {
    const userSites = JSON.parse(localStorage.getItem('pending_contributions') || '[]')
        .filter(item => item.tool === 'cool-web')
        .map(item => item.data);
    return [...SITES, ...userSites];
}

function populateCategoryPills(items) {
    const categories = [...new Set(items.map(i => i.category).filter(Boolean))].sort();
    const container = document.getElementById('category-filter');
    container.innerHTML = `<button class="type-pill active" data-category="all">Tous</button>` +
        categories.map(c => `<button class="type-pill" data-category="${c}">${c}</button>`).join('');
}

function renderGrid() {
    const grid = document.getElementById('web-grid');
    if (!grid) return;

    const items = getAllItems();
    const filtered = items.filter(item => {
        const matchCategory = activeFilters.category === 'all' || item.category === activeFilters.category;
        const q = activeFilters.search.toLowerCase();
        const matchSearch = !q ||
            item.name.toLowerCase().includes(q) ||
            (item.description && item.description.toLowerCase().includes(q)) ||
            (item.tags && item.tags.join(' ').toLowerCase().includes(q));
        return matchCategory && matchSearch;
    });

    document.getElementById('web-count').textContent = filtered.length + (filtered.length > 1 ? ' sites' : ' site');

    grid.innerHTML = filtered.length
        ? filtered.map(item => createCard(item)).join('')
        : `<p style="color:var(--muted-foreground);grid-column:1/-1;">Aucun site pour l'instant.</p>`;
}

function createCard(item) {
    let host = '';
    try { host = new URL(item.url).hostname.replace('www.', ''); } catch (e) { host = item.url || ''; }

    return `
        <div class="media-card" role="button" tabindex="0" onclick="showDetail('${item.id}', this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();showDetail('${item.id}',this)}">
            <div class="card-content">
                <div class="card-header">
                    <span class="type-badge">${item.category || 'Divers'}</span>
                </div>
                <h2 class="media-title">${item.name}</h2>
                <div class="media-meta">${host}</div>
                ${item.description ? `<div class="media-meta" style="margin-top:0.25rem;">${item.description}</div>` : ''}
            </div>
            <div class="card-footer">
                <span style="color:var(--muted-foreground)">ajouté par ${item.contributor || 'Anonyme'}</span>
            </div>
        </div>
    `;
}

function setupEventListeners() {
    document.getElementById('category-filter').addEventListener('click', e => {
        const pill = e.target.closest('.type-pill');
        if (!pill) return;
        document.querySelectorAll('#category-filter .type-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeFilters.category = pill.dataset.category;
        renderGrid();
    });

    document.getElementById('web-search').oninput = (e) => {
        activeFilters.search = e.target.value;
        renderGrid();
    };
}

let _drawerTrigger = null;

window.showDetail = function (id, triggerEl) {
    const item = getAllItems().find(s => s.id === id);
    if (!item) return;

    const drawer = document.getElementById('detail-drawer');
    const content = document.getElementById('drawer-content');

    _drawerTrigger = triggerEl || document.activeElement;

    content.innerHTML = `
        <div class="section-head">
            <p class="eyebrow">${(item.category || 'Divers').toUpperCase()}</p>
            <h2 class="serif" style="font-size: 2.2rem; margin-top:0.5rem;">${item.name}</h2>
        </div>

        <div class="detail-section">
            <h3>Lien</h3>
            <p><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.url} ↗</a></p>
            <p><strong>Ajouté par :</strong> ${item.contributor || 'Anonyme'}</p>
        </div>

        ${item.description ? `
        <div class="detail-section">
            <h3>Pourquoi c'est cool</h3>
            <p style="font-style: italic; color: var(--muted-foreground); line-height: 1.6;">${item.description}</p>
        </div>` : ''}

        ${item.tags && item.tags.length ? `
        <div class="detail-section">
            <h3>Tags</h3>
            <div class="tag-cloud">
                ${item.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
        </div>` : ''}
    `;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
        const closeBtn = drawer.querySelector('.close-drawer');
        if (closeBtn) closeBtn.focus();
    }, 50);
};

window.closeDrawer = function () {
    const drawer = document.getElementById('detail-drawer');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    if (_drawerTrigger) { _drawerTrigger.focus(); _drawerTrigger = null; }
};

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const drawer = document.getElementById('detail-drawer');
        if (drawer && drawer.getAttribute('aria-hidden') === 'false') closeDrawer();
    }
});

document.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const drawer = document.getElementById('detail-drawer');
    if (!drawer || drawer.getAttribute('aria-hidden') !== 'false') return;
    const focusable = Array.from(drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
    }
});

function startApp() { try { initWeb(); } catch (e) { console.error("Web failed:", e); } }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startApp);
else startApp();
