// Accueil : compteurs et dernière entrée de chaque outil, calculés à partir des fichiers de données.
// S'exécute avant js/main.js, qui anime les compteurs via l'attribut data-count.
(function () {
  function setCount(id, value) {
    const el = document.getElementById(id);
    if (!el || !value) return;
    el.textContent = value;
    el.dataset.count = value;
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el && text) el.textContent = text;
  }

  const media = typeof MEDIA !== 'undefined' ? MEDIA : [];
  const places = typeof PLACES !== 'undefined' ? PLACES : [];
  const meals = typeof MEALS !== 'undefined' ? MEALS : [];
  const nodes = typeof INITIAL_DATA !== 'undefined' ? (INITIAL_DATA.infos || []) : [];
  const sites = typeof SITES !== 'undefined' ? SITES : [];

  setCount('stat-media', media.length);
  setCount('stat-places', places.length);
  setCount('stat-meals', meals.length);
  setCount('stat-nodes', nodes.length);
  setCount('stat-web', sites.length);

  if (media.length) setText('last-media', 'Dernier ajout : ' + media[media.length - 1].title);

  if (places.length) {
    const cities = {};
    places.forEach(p => { cities[p.city || '?'] = (cities[p.city || '?'] || 0) + 1; });
    setText('last-place', Object.keys(cities).map(c => `${c} ${cities[c]}`).join(' · '));
  }

  if (nodes.length) setText('last-node', 'Dernier ajout : ' + nodes[nodes.length - 1].title);
  if (meals.length) setText('last-meal', 'Dernier ajout : ' + meals[meals.length - 1].title);
  if (sites.length) setText('last-web', 'Dernier ajout : ' + sites[sites.length - 1].name);
})();
