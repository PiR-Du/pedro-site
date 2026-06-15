const TYPE_ICONS = {
  'Restaurant': '🍽️',
  'Bar':        '🍺',
  'Café':       '☕',
  'Cocktail':   '🍹',
  'Club':       '🎵',
  'Musée':      '🏛️',
  'Marché':     '🛒',
  'Magasin':    '🛍️',
  'Spectacle':  '🎭',
  'Parc':       '🌳',
  'Monument':   '🗿',
  'Cinéma':     '🎬',
  'Stade':      '⚽',
};

const TYPE_HEX = {
  'Restaurant': '#e07b35',
  'Bar':        '#3a70e8',
  'Café':       '#b06430',
  'Cocktail':   '#7c3aed',
  'Club':       '#be185d',
  'Musée':      '#0d9488',
  'Marché':     '#059669',
  'Magasin':    '#d97706',
  'Spectacle':  '#8b5cf6',
  'Parc':       '#16a34a',
  'Monument':   '#64748b',
  'Cinéma':     '#9333ea',
  'Stade':      '#dc2626',
};

const MOOD_ICONS = {
  'Entre amis': '🍻',
  'Date':       '🕯️',
  'Festif':     '🎉',
  'Tranquille': '☕',
  'Brunch':     '🥐',
  'Culture':    '🎭',
};

let filters = { mood: 'all', type: 'all', city: 'all', search: '' };
let villeMap = null;
let markersLayer = {};
let activeCardId = null;

// ——— Init ———

function initVille() {
  buildSidebar();
  initMap();
  renderAll();
  setupEventListeners();
}

// ——— Sidebar ———

function buildSidebar() {
  const types = [...new Set(PLACES.map(p => p.type))].sort();
  const typeContainer = document.getElementById('type-filter');
  typeContainer.innerHTML = `<button class="type-pill active" data-type="all">Tous</button>` +
    types.map(t => `<button class="type-pill" data-type="${t}"><span style="font-size:0.9em">${TYPE_ICONS[t] || ''}</span> ${t}</button>`).join('');
}

// ——— Map ———

function initMap() {
  villeMap = L.map('ville-map', {
    center: [CITY_CONFIG.lat, CITY_CONFIG.lng],
    zoom: CITY_CONFIG.zoom,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  }).addTo(villeMap);

  // Légende
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div');
    div.style.cssText = 'background:white;padding:10px 12px;border-radius:10px;border:1px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,0.12);font-size:0.72rem;line-height:1.8;font-family:Inter,sans-serif;max-height:260px;overflow-y:auto;';
    div.innerHTML = Object.entries(TYPE_HEX).map(([type, color]) =>
      `<div style="display:flex;align-items:center;gap:7px;">
        <div style="width:10px;height:10px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.2);flex-shrink:0;"></div>
        <span style="color:#374151;">${TYPE_ICONS[type] || ''} ${type}</span>
      </div>`
    ).join('');
    return div;
  };
  legend.addTo(villeMap);
}

function makeMarkerIcon(type, big = false) {
  const color = TYPE_HEX[type] || '#7c3aed';
  const size = big ? 20 : 12;
  const border = big ? 3 : 2;
  const shadow = big ? '0 3px 12px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.2)';
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:${border}px solid white;border-radius:50%;box-shadow:${shadow};transition:all 0.2s;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function renderMarkers(places) {
  Object.values(markersLayer).forEach(m => villeMap.removeLayer(m));
  markersLayer = {};

  if (places.length === 0) return;

  places.forEach(place => {
    const marker = L.marker([place.lat, place.lng], { icon: makeMarkerIcon(place.type) });
    marker.on('click', () => showDetail(place.id));
    marker.on('mouseover', () => marker.setIcon(makeMarkerIcon(place.type, true)));
    marker.on('mouseout', () => {
      if (activeCardId !== place.id) marker.setIcon(makeMarkerIcon(place.type));
    });
    marker.bindTooltip(place.name, { permanent: false, direction: 'top', offset: [0, -8], className: 'ville-tooltip' });
    marker.addTo(villeMap);
    markersLayer[place.id] = marker;
  });

  // Ajuster la vue
  if (filters.city !== 'all' && CITIES[filters.city]) {
    const cfg = CITIES[filters.city];
    villeMap.flyTo([cfg.lat, cfg.lng], cfg.zoom, { duration: 1 });
  } else {
    try {
      const group = L.featureGroup(Object.values(markersLayer));
      villeMap.fitBounds(group.getBounds().pad(0.15), { maxZoom: 14, duration: 1 });
    } catch (_) {}
  }
}

// ——— Cards ———

function renderCards(places) {
  const grid = document.getElementById('ville-grid');
  if (!grid) return;

  if (places.length === 0) {
    grid.innerHTML = `<div class="ville-empty">
      <p style="font-size:2.5rem;margin-bottom:0.75rem;">🗺️</p>
      <p>Aucun lieu ne correspond à ces filtres.</p>
    </div>`;
    return;
  }

  grid.innerHTML = places.map(p => createPlaceCard(p)).join('');

  grid.querySelectorAll('.place-card').forEach(card => {
    const id = card.dataset.id;
    card.addEventListener('click', () => showDetail(id));
    card.addEventListener('mouseenter', () => {
      const place = PLACES.find(p => p.id === id);
      if (markersLayer[id] && place) markersLayer[id].setIcon(makeMarkerIcon(place.type, true));
    });
    card.addEventListener('mouseleave', () => {
      const place = PLACES.find(p => p.id === id);
      if (markersLayer[id] && place && activeCardId !== id) markersLayer[id].setIcon(makeMarkerIcon(place.type));
    });
  });
}

function createPlaceCard(place) {
  const icon = TYPE_ICONS[place.type] || '';
  const moodTags = place.moods.slice(0, 2).map(m =>
    `<span class="place-mood-tag">${MOOD_ICONS[m] || ''} ${m}</span>`
  ).join('');
  const cityBadge = `<span style="font-size:0.6rem;color:var(--muted-foreground);font-family:var(--font-mono);opacity:0.7;">${place.city}</span>`;

  return `
    <div class="place-card" data-id="${place.id}">
      <div class="place-card-body">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
          <span class="place-type-badge">${icon} ${place.type}</span>
          ${place.highlight ? '<span class="ville-star" title="Coup de cœur">★</span>' : ''}
        </div>
        <div class="place-name">${place.name}</div>
        <div class="place-meta">${place.neighborhood} · ${cityBadge}</div>
        <div class="place-desc">${place.description}</div>
      </div>
      <div class="place-card-footer">
        <span class="place-budget">${place.budget}</span>
        <div class="place-moods">${moodTags}</div>
      </div>
    </div>
  `;
}

// ——— Filters ———

function getFilteredPlaces() {
  return PLACES.filter(p => {
    const matchMood = filters.mood === 'all' || p.moods.includes(filters.mood);
    const matchType = filters.type === 'all' || p.type === filters.type;
    const matchCity = filters.city === 'all' || p.city === filters.city;
    const q = filters.search.toLowerCase();
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q));
    return matchMood && matchType && matchCity && matchSearch;
  });
}

function renderAll() {
  const filtered = getFilteredPlaces();
  renderMarkers(filtered);
  renderCards(filtered);
  const el = document.getElementById('ville-count');
  if (el) el.textContent = `${filtered.length} lieu${filtered.length !== 1 ? 'x' : ''}`;
}

// ——— Event Listeners ———

function setupEventListeners() {
  // Mood pills
  document.querySelectorAll('.mood-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.mood-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      filters.mood = pill.dataset.mood;
      renderAll();
    });
  });

  // Type pills (delegated — built dynamically)
  document.getElementById('type-filter').addEventListener('click', e => {
    const pill = e.target.closest('.type-pill');
    if (!pill) return;
    document.querySelectorAll('.type-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    filters.type = pill.dataset.type;
    renderAll();
  });

  // City filter
  document.getElementById('filter-city').addEventListener('change', e => {
    filters.city = e.target.value;
    renderAll();
  });

  // Search
  document.getElementById('ville-search').addEventListener('input', e => {
    filters.search = e.target.value;
    renderAll();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });
}

// ——— View toggle ———

window.setView = function (view) {
  const mapEl = document.getElementById('ville-map');
  const gridEl = document.getElementById('ville-grid');
  const btnMap = document.getElementById('btn-map');
  const btnList = document.getElementById('btn-list');
  if (view === 'map') {
    mapEl.classList.remove('hidden');
    gridEl.classList.add('hidden');
    btnMap.classList.add('active');
    btnList.classList.remove('active');
    setTimeout(() => villeMap && villeMap.invalidateSize(), 50);
  } else {
    mapEl.classList.add('hidden');
    gridEl.classList.remove('hidden');
    btnMap.classList.remove('active');
    btnList.classList.add('active');
  }
};

// ——— Detail drawer ———

window.showDetail = function (id) {
  const place = PLACES.find(p => p.id === id);
  if (!place) return;

  activeCardId = id;

  Object.entries(markersLayer).forEach(([pid, marker]) => {
    const p = PLACES.find(x => x.id === pid);
    if (p) marker.setIcon(makeMarkerIcon(p.type, pid === id));
  });
  if (markersLayer[id]) villeMap.panTo([place.lat, place.lng]);

  const content = document.getElementById('drawer-content');
  const tagsList = place.tags.map(t => `<span class="tag">${t}</span>`).join('');
  const moodsList = place.moods.map(m => `<span class="tag">${MOOD_ICONS[m] || ''} ${m}</span>`).join('');

  content.innerHTML = `
    <div style="margin-bottom:1.75rem;">
      <p style="color:var(--primary);font-family:var(--font-mono);font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.4rem;">
        ${place.type} · ${place.city}
      </p>
      <h2 style="font-family:var(--font-serif);font-size:1.9rem;line-height:1.15;letter-spacing:-0.01em;">${place.name}</h2>
      ${place.highlight ? '<div style="margin-top:0.5rem;"><span style="color:oklch(0.7 0.18 80);font-size:0.85rem;font-weight:600;">★ Coup de cœur</span></div>' : ''}
    </div>

    <div class="detail-section">
      <h3>Infos pratiques</h3>
      <p><strong>Adresse :</strong> ${place.address}</p>
      ${place.hours && place.hours !== '–' ? `<p style="margin-top:0.4rem;"><strong>Horaires :</strong> ${place.hours}</p>` : ''}
      <p style="margin-top:0.4rem;"><strong>Budget :</strong>
        <span style="color:var(--primary);font-weight:700;font-family:var(--font-mono);">${place.budget}</span>
      </p>
    </div>

    <div class="detail-section">
      <h3>Description</h3>
      <p style="color:var(--muted-foreground);line-height:1.7;font-style:italic;">${place.description}</p>
    </div>

    <div class="detail-section">
      <h3>Ambiances</h3>
      <div class="tag-cloud">${moodsList}</div>
    </div>

    <div class="detail-section">
      <h3>À savoir</h3>
      <div class="tag-cloud">${tagsList}</div>
    </div>
  `;

  document.getElementById('detail-drawer').classList.add('open');
};

window.closeDrawer = function () {
  document.getElementById('detail-drawer').classList.remove('open');
  activeCardId = null;
  Object.entries(markersLayer).forEach(([pid, marker]) => {
    const p = PLACES.find(x => x.id === pid);
    if (p) marker.setIcon(makeMarkerIcon(p.type));
  });
};

// ——— Bootstrap ———

function startVille() {
  try { initVille(); } catch (e) { console.error('Ville failed:', e); }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startVille);
else startVille();
