let activeFilters = { type: 'all', contributor: 'all', genre: 'all', ambiance: 'all', search: '' };

function initMuse() {
    const allItems = getAllItems();
    populateFilters(allItems);
    renderGrid();
    setupEventListeners();
}

function getAllItems() {
    const userMedia = JSON.parse(localStorage.getItem('pending_contributions') || '[]')
                        .filter(item => item.tool === 'recommendation')
                        .map(item => item.data);
    return [...MEDIA, ...userMedia];
}

function populateFilters(items) {
    // Contributor est toujours global
    const contributors = [...new Set(items.map(i => i.contributor).filter(Boolean))].sort();
    fillSelect('filter-contributor', contributors);

    // Genre et Ambiance dépendent du type sélectionné
    const typeFilteredItems = activeFilters.type === 'all' ? [] : items.filter(i => i.type === activeFilters.type);
    
    if (typeFilteredItems.length > 0) {
        const genres = [...new Set(typeFilteredItems.map(i => i.main_genre).filter(Boolean))].sort();
        const ambiances = [...new Set(typeFilteredItems.map(i => i.ambiance).filter(Boolean))].sort();
        fillSelect('filter-genre', genres);
        fillSelect('filter-ambiance', ambiances);
        document.getElementById('contextual-filters').classList.add('active');
    } else {
        document.getElementById('contextual-filters').classList.remove('active');
        activeFilters.genre = 'all';
        activeFilters.ambiance = 'all';
    }
}

function fillSelect(id, values) {
    const select = document.getElementById(id);
    if (!select) return;
    const current = select.value;
    select.innerHTML = `<option value="all">Tout voir</option>` + 
                      values.map(v => `<option value="${v}">${v}</option>`).join('');
    // On essaie de garder la sélection si elle existe encore
    if (values.includes(current)) select.value = current;
}

function renderGrid() {
    const grid = document.getElementById('main-grid');
    if (!grid) return;

    const filtered = getAllItems().filter(item => {
        const matchType = activeFilters.type === 'all' || item.type === activeFilters.type;
        const matchContributor = activeFilters.contributor === 'all' || item.contributor === activeFilters.contributor;
        const matchGenre = activeFilters.genre === 'all' || item.main_genre === activeFilters.genre;
        const matchAmbiance = activeFilters.ambiance === 'all' || item.ambiance === activeFilters.ambiance;
        const matchSearch = !activeFilters.search || 
                           item.title.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
                           (item.creator && item.creator.toLowerCase().includes(activeFilters.search.toLowerCase()));
        
        return matchType && matchContributor && matchGenre && matchAmbiance && matchSearch;
    });

    grid.innerHTML = filtered.map(item => createCard(item)).join('');
}

function createCard(item) {
    const icons = { movie: '🎬', series: '📺', book: '📖', music: '🎵', videogame: '🎮', boardgame: '🎲' };
    return `
        <div class="media-card" onclick="showDetail('${item.id}')">
            <div class="card-content">
                <div class="card-header">
                    <span class="type-badge">${icons[item.type] || '📦'} ${item.type}</span>
                </div>
                <h2 class="media-title">${item.title}</h2>
                ${item.creator ? `<div class="media-meta">${item.creator}</div>` : ''}
                <div class="media-meta" style="margin-top: 0.25rem; font-weight: 500; color: var(--primary);">
                    ${item.main_genre} • ${item.ambiance}
                </div>
            </div>
            <div class="card-footer">
                <span style="color:var(--muted-foreground)">par ${item.contributor || 'Anonyme'}</span>
            </div>
        </div>
    `;
}

function setupEventListeners() {
    // Type change (Contextual trigger)
    const typeSelect = document.getElementById('filter-type');
    typeSelect.onchange = (e) => {
        activeFilters.type = e.target.value;
        populateFilters(getAllItems());
        renderGrid();
    };


    // Others
    ['contributor', 'genre', 'ambiance'].forEach(key => {
        const el = document.getElementById(`filter-${key}`);
        if (el) el.onchange = (e) => {
            activeFilters[key] = e.target.value;
            renderGrid();
        };
    });

    const search = document.getElementById('media-search');
    search.oninput = (e) => {
        activeFilters.search = e.target.value;
        renderGrid();
    };
}

window.showDetail = function(id) {
    const item = getAllItems().find(m => m.id === id);
    if (!item) return;

    const drawer = document.getElementById('detail-drawer');
    const content = document.getElementById('drawer-content');
    
    content.innerHTML = `
        <div class="section-head">
            <p class="eyebrow">${item.type.toUpperCase()}</p>
            <h2 class="serif" style="font-size: 2.2rem; margin-top:0.5rem;">${item.title}</h2>
        </div>

        <div class="detail-section">
            <h3>Informations</h3>
            ${item.creator ? `<p><strong>Créateur/Artiste :</strong> ${item.creator}</p>` : ''}
            <p><strong>Recommandé par :</strong> ${item.contributor || 'Anonyme'}</p>
        </div>

        <div class="detail-section">
            <h3>Ressenti</h3>
            <p><strong>Émotion :</strong> ${item.main_emotion}</p>
            <p><strong>Ambiance :</strong> ${item.ambiance}</p>
            <p><strong>Public :</strong> ${item.public}</p>
        </div>

        <div class="detail-section">
            <h3>Genres</h3>
            <div class="tag-cloud">
                <span class="tag">${item.main_genre}</span>
                ${(item.sub_genres || []).map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
        </div>

        <div class="detail-section">
            <h3>Synopsis / Pitch</h3>
            <p style="font-style: italic; color: var(--muted-foreground); line-height: 1.6;">${item.pitch || 'Aucun synopsis.'}</p>
        </div>
    `;
    drawer.classList.add('open');
};

window.closeDrawer = () => document.getElementById('detail-drawer').classList.remove('open');

function startApp() { try { initMuse(); } catch (e) { console.error("Muse failed:", e); } }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startApp);
else startApp();
