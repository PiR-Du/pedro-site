// État global et initialisation
let data = { infos: [] };
let sources = [];

// Série de données (1 à 8) attribuée à un contributeur, dans l'ordre alphabétique
function seriesOf(source) {
    return (Math.max(sources.indexOf(source), 0) % 8) + 1;
}

function initApp() {
    data = typeof INITIAL_DATA !== 'undefined' ? JSON.parse(JSON.stringify(INITIAL_DATA)) : { infos: [] };
    sources = Array.from(new Set(data.infos.map(i => i.source))).sort();
    renderGraph();
    renderSachants();
}

document.addEventListener('DOMContentLoaded', initApp);

let resizeTimer = null;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderGraph, 200);
});

// Liste des profils
function renderSachants() {
    const container = document.getElementById('sachants-container');
    if (!container) return;
    container.innerHTML = sources.map(s => {
        const count = data.infos.filter(i => i.source === s).length;
        return `
        <li>
            <button type="button" class="source" data-source="${escapeHtml(s)}">
                <span class="swatch swatch--${seriesOf(s)}"></span>
                <span class="source__name">${escapeHtml(s)}</span>
                <span class="eyebrow">${count} note${count > 1 ? 's' : ''}</span>
            </button>
        </li>`;
    }).join('');

    container.addEventListener('click', e => {
        const btn = e.target.closest('[data-source]');
        if (btn) showProfile(btn.dataset.source);
    });
}

function noteHtml(n) {
    return `
        <div class="drawer__section">
            <span class="eyebrow">${escapeHtml(n.category)}</span>
            <h3 class="title-4">${escapeHtml(n.title)}</h3>
            <p>${escapeHtml(n.text)}</p>
        </div>`;
}

function showProfile(name) {
    const notes = data.infos.filter(i => i.source === name);
    openDrawer(`
        <header class="stack stack--1">
            <span class="cluster cluster--1"><span class="swatch swatch--${seriesOf(name)}"></span><span class="eyebrow">${notes.length} note${notes.length > 1 ? 's' : ''}</span></span>
            <h2 class="title-2" id="drawer-title">Profil de ${escapeHtml(name)}</h2>
        </header>
        ${notes.map(noteHtml).join('<hr class="rule">')}`);
    highlightSource(name);
}

function showNodeDetail(d) {
    openDrawer(`
        <header class="stack stack--1">
            <span class="eyebrow">${escapeHtml(d.category)}</span>
            <h2 class="title-2" id="drawer-title">${escapeHtml(d.title)}</h2>
        </header>
        <p>${escapeHtml(d.text)}</p>
        <dl class="spec">
            <dt class="spec__term">Source</dt>
            <dd class="spec__value"><span class="cluster cluster--1"><span class="swatch swatch--${seriesOf(d.source)}"></span>${escapeHtml(d.source)}</span></dd>
        </dl>`);
    highlightSource(d.source);
}

// À la fermeture du tiroir, tous les nœuds retrouvent leur opacité
document.getElementById('detail-drawer').addEventListener('close', () => highlightSource(null));
