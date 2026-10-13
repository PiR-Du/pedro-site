let activeFilters = { type: 'all', contributor: 'all', genre: 'all', ambiance: 'all', platform: 'all', search: '' };

function initMuse() {
    populateFilters(MEDIA);
    renderGrid();
    setupEventListeners();
}

function populateFilters(items) {
    // Le contributeur est toujours global
    const contributors = [...new Set(items.map(i => i.contributor).filter(Boolean))].sort();
    fillSelect('filter-contributor', contributors, 'Tout le monde');

    // Genre, ambiance et plateforme dépendent du type sélectionné
    const typed = activeFilters.type === 'all' ? [] : items.filter(i => i.type === activeFilters.type);
    const contextual = document.getElementById('contextual-filters');
    const platformGroup = document.getElementById('filter-group-platform');

    if (typed.length > 0) {
        fillSelect('filter-genre', [...new Set(typed.map(i => i.main_genre).filter(Boolean))].sort(), 'Tous les genres');
        fillSelect('filter-ambiance', [...new Set(typed.map(i => i.ambiance).filter(Boolean))].sort(), 'Toutes les ambiances');
        contextual.hidden = false;

        const hasPlatform = activeFilters.type === 'Film' || activeFilters.type === 'Série';
        if (hasPlatform) {
            fillSelect('filter-platform', [...new Set(typed.map(i => i.platform).filter(Boolean))].sort(), 'Toutes les plateformes');
        } else {
            activeFilters.platform = 'all';
        }
        platformGroup.hidden = !hasPlatform;
    } else {
        contextual.hidden = true;
        platformGroup.hidden = true;
        activeFilters.genre = 'all';
        activeFilters.ambiance = 'all';
        activeFilters.platform = 'all';
    }
}

function fillSelect(id, values, allLabel) {
    const select = document.getElementById(id);
    if (!select) return;
    const current = select.value;
    select.innerHTML = `<option value="all">${allLabel}</option>` +
        values.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
    // On garde la sélection si elle existe encore
    if (values.includes(current)) select.value = current;
}

function renderGrid() {
    const grid = document.getElementById('main-grid');
    if (!grid) return;
    const q = activeFilters.search.toLowerCase();

    const filtered = MEDIA.filter(item =>
        (activeFilters.type === 'all' || item.type === activeFilters.type) &&
        (activeFilters.contributor === 'all' || item.contributor === activeFilters.contributor) &&
        (activeFilters.genre === 'all' || item.main_genre === activeFilters.genre) &&
        (activeFilters.ambiance === 'all' || item.ambiance === activeFilters.ambiance) &&
        (activeFilters.platform === 'all' || item.platform === activeFilters.platform) &&
        (!q || item.title.toLowerCase().includes(q) || (item.creator && item.creator.toLowerCase().includes(q)))
    );

    document.getElementById('media-count').textContent =
        `${filtered.length} référence${filtered.length > 1 ? 's' : ''}`;

    grid.innerHTML = filtered.length
        ? filtered.map(createRow).join('')
        : '<li class="empty">Aucune recommandation ne correspond à ces filtres.</li>';
}

function createRow(item) {
    const details = [item.main_genre, item.ambiance].filter(Boolean).join(', ');
    return `
        <li class="result">
            <span class="tag result__tag">${escapeHtml(item.type)}</span>
            <h2 class="result__title"><button type="button" class="entry__link" data-id="${escapeHtml(item.id)}">${escapeHtml(item.title)}</button></h2>
            <p class="result__body">${escapeHtml(details)}${item.creator ? `<br>${escapeHtml(item.creator)}` : ''}</p>
            <span class="eyebrow result__meta">Par ${escapeHtml(item.contributor || 'Anonyme')}</span>
        </li>`;
}

function setupEventListeners() {
    // Le type déclenche les filtres contextuels
    document.getElementById('filter-type').addEventListener('change', e => {
        activeFilters.type = e.target.value;
        populateFilters(MEDIA);
        renderGrid();
    });

    ['contributor', 'genre', 'ambiance', 'platform'].forEach(key => {
        document.getElementById(`filter-${key}`).addEventListener('change', e => {
            activeFilters[key] = e.target.value;
            renderGrid();
        });
    });

    document.getElementById('media-search').addEventListener('input', e => {
        activeFilters.search = e.target.value;
        renderGrid();
    });

    document.getElementById('main-grid').addEventListener('click', e => {
        const trigger = e.target.closest('[data-id]');
        if (trigger) showDetail(trigger.dataset.id);
    });
}

function showDetail(id) {
    const item = MEDIA.find(m => m.id === id);
    if (!item) return;

    const rows = [
        ['Créateur', item.creator],
        ['Plateforme', item.platform],
        ['Recommandé par', item.contributor || 'Anonyme'],
        ['Émotion', item.main_emotion],
        ['Ambiance', item.ambiance],
        ['Public', item.public],
    ].filter(([, value]) => value);

    const genres = [item.main_genre, ...(item.sub_genres || [])].filter(Boolean);

    openDrawer(`
        <header class="stack stack--1">
            <span class="eyebrow">${escapeHtml(item.type)}</span>
            <h2 class="title-2" id="drawer-title">${escapeHtml(item.title)}</h2>
        </header>
        <dl class="spec">
            ${rows.map(([term, value]) => `<dt class="spec__term">${term}</dt><dd class="spec__value">${escapeHtml(value)}</dd>`).join('')}
        </dl>
        <div class="drawer__section">
            <h3 class="eyebrow">Genres</h3>
            <div class="cluster cluster--1">${genres.map(g => `<span class="tag">${escapeHtml(g)}</span>`).join('')}</div>
        </div>
        <div class="drawer__section">
            <h3 class="eyebrow">Synopsis</h3>
            <p>${escapeHtml(item.pitch || 'Aucun synopsis.')}</p>
        </div>`);
}

function startApp() { try { initMuse(); } catch (e) { console.error('Muse failed:', e); } }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startApp);
else startApp();
