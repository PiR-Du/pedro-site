let filters = { mood: 'all', type: 'all', city: 'all', search: '' };
let villeMap = null;
let markersLayer = {};
let activeCardId = null;

// ---------- Initialisation ----------

function initVille() {
  buildTypeFilter();
  initMap();
  renderAll();
  setupEventListeners();
}

function buildTypeFilter() {
  const types = [...new Set(PLACES.map(p => p.type))].sort();
  document.getElementById('type-filter').innerHTML =
    `<button type="button" class="chip" data-type="all" aria-pressed="true">Tous</button>` +
    types.map(t => `<button type="button" class="chip" data-type="${escapeHtml(t)}" aria-pressed="false">${escapeHtml(t)}</button>`).join('');
}

// ---------- Carte ----------

function initMap() {
  villeMap = L.map('ville-map', {
    center: [CITY_CONFIG.lat, CITY_CONFIG.lng],
    zoom: CITY_CONFIG.zoom,
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© contributeurs <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(villeMap);
  villeMap.attributionControl.setPrefix(false);
}

// Marqueur carré : encre par défaut, accent pour un coup de cœur, agrandi quand il est actif.
// La taille vient du CSS (.map-marker), d'où iconSize à null.
function makeMarkerIcon(place, active = false) {
  const classes = ['map-marker'];
  if (place.highlight) classes.push('map-marker--favorite');
  if (active) classes.push('map-marker--active');
  return L.divIcon({ className: classes.join(' '), iconSize: null });
}

function renderMarkers(places) {
  Object.values(markersLayer).forEach(m => villeMap.removeLayer(m));
  markersLayer = {};
  if (places.length === 0) return;

  places.forEach(place => {
    const marker = L.marker([place.lat, place.lng], { icon: makeMarkerIcon(place), title: place.name, alt: `${place.name}, ${place.type}` });
    marker.on('click', () => showDetail(place.id));
    marker.on('mouseover', () => marker.setIcon(makeMarkerIcon(place, true)));
    marker.on('mouseout', () => {
      if (activeCardId !== place.id) marker.setIcon(makeMarkerIcon(place));
    });
    marker.bindTooltip(`${place.name} · ${place.type}`, { direction: 'top', offset: [0, -12], className: 'map-tooltip' });
    marker.addTo(villeMap);
    markersLayer[place.id] = marker;
  });

  // Ajuster la vue
  const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (filters.city !== 'all' && CITIES[filters.city]) {
    const cfg = CITIES[filters.city];
    villeMap.setView([cfg.lat, cfg.lng], cfg.zoom, { animate });
  } else {
    try {
      const group = L.featureGroup(Object.values(markersLayer));
      villeMap.fitBounds(group.getBounds().pad(0.15), { maxZoom: 14, animate });
    } catch (_) { /* aucun marqueur */ }
  }
}

function resetMarkers(activeId) {
  Object.entries(markersLayer).forEach(([pid, marker]) => {
    const place = PLACES.find(x => x.id === pid);
    if (place) marker.setIcon(makeMarkerIcon(place, pid === activeId));
  });
}

// ---------- Liste ----------

function renderCards(places) {
  const grid = document.getElementById('ville-grid');
  if (!grid) return;
  grid.innerHTML = places.length
    ? places.map(createPlaceRow).join('')
    : '<li class="empty">Aucun lieu ne correspond à ces filtres.</li>';
}

function createPlaceRow(place) {
  return `
    <li class="result">
      <span class="tag result__tag${place.highlight ? ' tag--accent' : ''}">${escapeHtml(place.type)}</span>
      <h2 class="result__title"><button type="button" class="entry__link" data-id="${escapeHtml(place.id)}">${escapeHtml(place.name)}</button></h2>
      <p class="result__body">${escapeHtml(place.neighborhood)}, ${escapeHtml(place.city)}${place.highlight ? '<br><strong class="accent">Coup de cœur</strong>' : ''}</p>
      <span class="eyebrow result__meta">${escapeHtml(place.budget)} · ${place.moods.slice(0, 2).map(escapeHtml).join(', ')}</span>
    </li>`;
}

// ---------- Filtres ----------

function getFilteredPlaces() {
  const q = filters.search.toLowerCase();
  return PLACES.filter(p =>
    (filters.mood === 'all' || p.moods.includes(filters.mood)) &&
    (filters.type === 'all' || p.type === filters.type) &&
    (filters.city === 'all' || p.city === filters.city) &&
    (!q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)))
  );
}

function renderAll() {
  const filtered = getFilteredPlaces();
  renderMarkers(filtered);
  renderCards(filtered);
  document.getElementById('ville-count').textContent = `${filtered.length} lieu${filtered.length > 1 ? 'x' : ''}`;
}

// ---------- Événements ----------

function bindChipGroup(groupId, key, attr) {
  const group = document.getElementById(groupId);
  group.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    group.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
    filters[key] = chip.dataset[attr];
    renderAll();
  });
}

function setupEventListeners() {
  bindChipGroup('mood-filter', 'mood', 'mood');
  bindChipGroup('type-filter', 'type', 'type');

  document.getElementById('filter-city').addEventListener('change', e => {
    filters.city = e.target.value;
    renderAll();
  });

  document.getElementById('ville-search').addEventListener('input', e => {
    filters.search = e.target.value;
    renderAll();
  });

  document.getElementById('btn-map').addEventListener('click', () => setView('map'));
  document.getElementById('btn-list').addEventListener('click', () => setView('list'));

  document.getElementById('ville-grid').addEventListener('click', e => {
    const trigger = e.target.closest('[data-id]');
    if (trigger) showDetail(trigger.dataset.id);
  });

  // À la fermeture du tiroir, plus aucun marqueur n'est actif
  document.getElementById('detail-drawer').addEventListener('close', () => {
    activeCardId = null;
    resetMarkers(null);
  });
}

// ---------- Bascule carte / liste ----------

function setView(view) {
  const showMap = view === 'map';
  document.getElementById('ville-map').hidden = !showMap;
  document.getElementById('ville-grid').hidden = showMap;
  document.getElementById('btn-map').setAttribute('aria-pressed', String(showMap));
  document.getElementById('btn-list').setAttribute('aria-pressed', String(!showMap));
  if (showMap) setTimeout(() => villeMap && villeMap.invalidateSize(), 50);
}

// ---------- Fiche de lieu ----------

function showDetail(id) {
  const place = PLACES.find(p => p.id === id);
  if (!place) return;

  activeCardId = id;
  resetMarkers(id);
  if (markersLayer[id]) villeMap.panTo([place.lat, place.lng]);

  const rows = [
    ['Adresse', place.address],
    ['Horaires', place.hours && place.hours !== '–' && place.hours !== '-' ? place.hours : ''],
    ['Budget', place.budget],
  ].filter(([, value]) => value);

  openDrawer(`
    <header class="stack stack--1">
      <span class="eyebrow">${escapeHtml(place.type)} · ${escapeHtml(place.city)}</span>
      <h2 class="title-2" id="drawer-title">${escapeHtml(place.name)}</h2>
      ${place.highlight ? '<p><span class="tag tag--accent">Coup de cœur</span></p>' : ''}
    </header>
    <p>${escapeHtml(place.description)}</p>
    <dl class="spec">
      ${rows.map(([term, value]) => `<dt class="spec__term">${term}</dt><dd class="spec__value">${escapeHtml(value)}</dd>`).join('')}
    </dl>
    <div class="drawer__section">
      <h3 class="eyebrow">Ambiances</h3>
      <div class="cluster cluster--1">${place.moods.map(m => `<span class="tag">${escapeHtml(m)}</span>`).join('')}</div>
    </div>
    <div class="drawer__section">
      <h3 class="eyebrow">À savoir</h3>
      <div class="cluster cluster--1">${place.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
    </div>`);
}

// ---------- Démarrage ----------

function startVille() {
  try { initVille(); } catch (e) { console.error('Ville failed:', e); }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startVille);
else startVille();
