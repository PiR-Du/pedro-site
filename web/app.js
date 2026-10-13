let activeFilters = { category: 'all', search: '' };

function initWeb() {
    populateCategoryChips(SITES);
    renderGrid();
    setupEventListeners();
}

function populateCategoryChips(items) {
    const categories = [...new Set(items.map(i => i.category).filter(Boolean))].sort();
    document.getElementById('category-filter').innerHTML =
        `<button type="button" class="chip" data-category="all" aria-pressed="true">Tous</button>` +
        categories.map(c => `<button type="button" class="chip" data-category="${escapeHtml(c)}" aria-pressed="false">${escapeHtml(c)}</button>`).join('');
}

function hostOf(url) {
    try { return new URL(url).hostname.replace('www.', ''); } catch (e) { return url || ''; }
}

function renderGrid() {
    const grid = document.getElementById('web-grid');
    if (!grid) return;
    const q = activeFilters.search.toLowerCase();

    const filtered = SITES.filter(item =>
        (activeFilters.category === 'all' || item.category === activeFilters.category) &&
        (!q ||
            item.name.toLowerCase().includes(q) ||
            (item.description && item.description.toLowerCase().includes(q)) ||
            (item.tags && item.tags.join(' ').toLowerCase().includes(q)))
    );

    document.getElementById('web-count').textContent = `${filtered.length} site${filtered.length > 1 ? 's' : ''}`;

    grid.innerHTML = filtered.length
        ? filtered.map(createRow).join('')
        : '<li class="empty">Aucun site ne correspond à ces filtres.</li>';
}

function createRow(item) {
    return `
        <li class="result">
            <span class="tag result__tag">${escapeHtml(item.category || 'Divers')}</span>
            <h2 class="result__title"><button type="button" class="entry__link" data-id="${escapeHtml(item.id)}">${escapeHtml(item.name)}</button></h2>
            <p class="result__body">${escapeHtml(item.description || '')}</p>
            <span class="eyebrow result__meta">${escapeHtml(hostOf(item.url))}</span>
        </li>`;
}

function setupEventListeners() {
    document.getElementById('category-filter').addEventListener('click', e => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        document.querySelectorAll('#category-filter .chip').forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
        activeFilters.category = chip.dataset.category;
        renderGrid();
    });

    document.getElementById('web-search').addEventListener('input', e => {
        activeFilters.search = e.target.value;
        renderGrid();
    });

    document.getElementById('web-grid').addEventListener('click', e => {
        const trigger = e.target.closest('[data-id]');
        if (trigger) showDetail(trigger.dataset.id);
    });
}

function showDetail(id) {
    const item = SITES.find(s => s.id === id);
    if (!item) return;

    openDrawer(`
        <header class="stack stack--1">
            <span class="eyebrow">${escapeHtml(item.category || 'Divers')}</span>
            <h2 class="title-2" id="drawer-title">${escapeHtml(item.name)}</h2>
        </header>
        <p><a class="btn btn--primary" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Ouvrir ${escapeHtml(hostOf(item.url))}<span class="sr-only"> (nouvel onglet)</span></a></p>
        ${item.description ? `
        <div class="drawer__section">
            <h3 class="eyebrow">Pourquoi il vaut le détour</h3>
            <p>${escapeHtml(item.description)}</p>
        </div>` : ''}
        <dl class="spec">
            <dt class="spec__term">Ajouté par</dt><dd class="spec__value">${escapeHtml(item.contributor || 'Anonyme')}</dd>
        </dl>
        ${item.tags && item.tags.length ? `
        <div class="drawer__section">
            <h3 class="eyebrow">Tags</h3>
            <div class="cluster cluster--1">${item.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
        </div>` : ''}`);
}

function startApp() { try { initWeb(); } catch (e) { console.error('Web failed:', e); } }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startApp);
else startApp();
