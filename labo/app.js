// Labo data : rendu du sommaire (filtres par rubrique) et des fiches détaillées.
// Tout le contenu vient de data.js ; ce fichier ne contient que la mise en page.
// Adresses partageables : index.html?rubrique=notions, index.html?fiche=moyenne-vs-mediane

const BLOC_LABELS = {
  definition: 'Définition', exemple: 'Exemple', erreur: 'Erreur fréquente', astuce: 'Astuce', retenir: 'À retenir',
  probleme: 'Problème', formule: 'Formule', question: 'Question', donnees: 'Données', methode: 'Méthode',
  resultat: 'Résultat', limite: 'Limites', maths: 'Les maths', simulation: 'Simulation', interactif: 'À vous de jouer',
};

const laboState = { mounts: [] };

const pad = n => String(n).padStart(2, '0');
const rubriqueById = id => LABO_RUBRIQUES.find(r => r.id === id);
const isPublished = f => f.statut === 'publiee';
const themeById = (rub, id) => (rub.themes || []).find(t => t.id === id);

function laboUrl(params) {
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return 'index.html' + (query ? `?${query}` : '');
}

// Typographie française : espaces insécables dans les nombres, avant les unités et la ponctuation haute
function typo(html) {
  return html
    .replace(/(\d) (?=\d{3}(?!\d))/g, '$1 ')
    .replace(/ (€|%|°C)/g, ' $1')
    .replace(/ ([?!;:»])/g, ' $1')
    .replace(/« /g, '« ');
}

// Mise en forme minimale dans les textes : **gras** et `code`
function inline(value) {
  return typo(escapeHtml(value))
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

function rich(texte) {
  if (!texte) return '';
  return Array.isArray(texte)
    ? `<ul class="lab-list">${texte.map(t => `<li>${inline(t)}</li>`).join('')}</ul>`
    : `<p>${inline(texte)}</p>`;
}

function formatDate(iso) {
  const date = new Date(`${iso}T12:00:00`);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ---------- Visuels ----------

function vizHost(spec, data) {
  const index = laboState.mounts.push({ spec, data }) - 1;
  return `<div class="viz-host" data-viz="${index}"></div>`;
}

function caption(text) {
  return text ? `<figcaption class="lab-figure__caption">${inline(text)}</figcaption>` : '';
}

function visual(spec) {
  if (!spec) return '';
  const data = spec.donnees ? LABO_DONNEES[spec.donnees] : null;
  if (spec.donnees && !data) {
    console.error(`Labo data : la clé de données « ${spec.donnees} » n'existe pas dans LABO_DONNEES.`);
    return `<p class="empty">Données introuvables pour ce visuel.</p>`;
  }

  if (spec.type === 'paire') {
    // Une seule source de données pour les deux graphiques : seule la représentation change.
    // verdict (facultatif) remplace « Trompeur » / « Corrigé » quand le premier graphique est maladroit plutôt que menteur.
    const side = (part, verdict, cls) => `
      <figure class="viz-pair__item viz-pair__item--${cls}">
        <p class="viz-pair__verdict"><span class="tag ${cls === 'bad' ? 'tag--accent' : 'lab-tag--good'}">${escapeHtml(part.verdict || verdict)}</span></p>
        ${vizHost(part, data)}
        ${caption(part.legende)}
      </figure>`;
    return `<div class="viz-pair">${side(spec.mauvais, 'Trompeur', 'bad')}${side(spec.corrige, 'Corrigé', 'good')}</div>
      ${LaboCharts.table({ ...spec.corrige, ...spec }, data)}`;
  }

  if (spec.type === 'image') {
    // Image existante (labo/images/) : crédit obligatoire quand la licence l'exige.
    // schema : SVG recoloré aux tokens (LABO_SCHEMAS), insérée dans la page pour suivre le thème.
    const credit = spec.credit ? `<p class="lab-figure__credit">${spec.creditUrl
      ? `<a class="link" href="${escapeHtml(spec.creditUrl)}" rel="noopener">${escapeHtml(spec.credit)}</a>` : escapeHtml(spec.credit)}</p>` : '';
    const svg = spec.schema && window.LABO_SCHEMAS?.[spec.schema];
    if (spec.schema && !svg) console.error(`Labo data : le schéma « ${spec.schema} » n'est pas chargé (script manquant dans labo/index.html ?).`);
    const size = spec.largeur && spec.hauteur ? ` width="${spec.largeur}" height="${spec.hauteur}"` : '';
    const media = svg
      ? `<div class="lab-schema" role="img" aria-label="${escapeHtml(spec.alt || '')}">${svg}</div>`
      : `<img class="lab-figure__img" src="${escapeHtml(spec.src)}" alt="${escapeHtml(spec.alt || '')}"${size} decoding="async">`;
    return `<figure class="lab-figure">${media}${caption(spec.legende)}${credit}</figure>`;
  }

  if (spec.type === 'selecteur') {
    return `<figure class="lab-figure lab-figure--wide">${chooser()}${caption(spec.legende)}</figure>`;
  }

  if (spec.type === 'simulation') {
    const index = laboState.mounts.push({ spec, data, sim: true }) - 1;
    return `<div class="lab-figure lab-figure--wide" role="group" aria-label="${escapeHtml(spec.alt || '')}">${LaboSim.markup(spec, index)}${caption(spec.legende)}</div>`;
  }

  if (spec.type === 'interactif') {
    // Exemple à manipuler : réglages et graphique redessiné en direct (labo/interactifs.js)
    const index = laboState.mounts.push({ spec, data }) - 1;
    return `<figure class="lab-figure lab-figure--wide" aria-label="${escapeHtml(spec.alt || '')}">${LaboInteractifs.markup(spec, index)}${caption(spec.legende)}${data && spec.tableau !== false ? LaboCharts.table(spec, data) : ''}</figure>`;
  }

  if (!LaboCharts.isSvg(spec.type)) {
    console.error(`Labo data : type de visuel inconnu « ${spec.type} ».`);
    return '';
  }
  return `<figure class="lab-figure">${vizHost(spec, data)}${caption(spec.legende)}${data ? LaboCharts.table(spec, data) : ''}</figure>`;
}

// ---------- Sélecteur « Quel graphique ? » ----------

function chooser() {
  const chips = LABO_GUIDE.map(q =>
    `<button type="button" class="chip" aria-pressed="false" data-question="${escapeHtml(q.id)}">${escapeHtml(q.court || q.question)}</button>`).join('');
  return `<div class="chooser" data-chooser>
      <p class="label" id="chooser-label">Je veux…</p>
      <div class="chip-group" role="group" aria-labelledby="chooser-label">${chips}</div>
      <div class="chooser__answer" aria-live="polite"></div>
    </div>`;
}

function chooserAnswer(q) {
  const items = q.graphiques.map(g => `
    <li class="chooser__item">
      ${LaboCharts.picto(g.picto, `Pictogramme : ${g.nom}`)}
      <div class="chooser__text">
        <h4 class="title-4">${escapeHtml(g.nom)}</h4>
        <dl class="spec">
          <dt class="spec__term">Quand l'utiliser</dt><dd class="spec__value">${inline(g.quand)}</dd>
          <dt class="spec__term">À éviter</dt><dd class="spec__value">${inline(g.eviter)}</dd>
        </dl>
      </div>
    </li>`).join('');
  return `<h3 class="title-3">${inline(q.question)}</h3>
    <p class="muted">${inline(`Par exemple : « ${q.exemple} »`)}</p>
    <ul class="chooser__list">${items}</ul>`;
}

function initChooser(root) {
  const box = root.querySelector('[data-chooser]');
  if (!box) return;
  const answer = box.querySelector('.chooser__answer');
  const select = (id, remember) => {
    const q = LABO_GUIDE.find(g => g.id === id) || LABO_GUIDE[0];
    box.querySelectorAll('[data-question]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.question === q.id)));
    answer.innerHTML = chooserAnswer(q);
    if (remember) {
      const params = new URLSearchParams(location.search);
      params.set('question', q.id);
      history.replaceState(null, '', `index.html?${params}`);
    }
  };
  box.addEventListener('click', e => {
    const btn = e.target.closest('[data-question]');
    if (btn) select(btn.dataset.question, true);
  });
  select(new URLSearchParams(location.search).get('question'), false);
}

// ---------- Sommaire ----------

function entry(fiche, index, rub) {
  if (!isPublished(fiche)) {
    return `<li class="entry entry--compact lab-soon">
        <span class="folio entry__folio">${pad(index)}</span>
        <h3 class="entry__title">${inline(fiche.titre)}</h3>
        <span class="eyebrow entry__meta">À venir</span>
      </li>`;
  }
  const theme = themeById(rub, fiche.theme);
  return `<li class="entry">
      <span class="folio entry__folio">${pad(index)}</span>
      <h3 class="entry__title"><a class="entry__link" href="${laboUrl({ fiche: fiche.id })}" data-nav>${inline(fiche.titre)}</a></h3>
      <p class="entry__body">${inline(fiche.accroche || '')}</p>
      <span class="eyebrow entry__meta">${escapeHtml(theme ? theme.titre : `${(fiche.blocs || []).length + 1} volets`)}</span>
    </li>`;
}

function rubriqueSection(rub, themeFilter) {
  let fiches = LABO_FICHES.filter(f => f.rubrique === rub.id);
  if (themeFilter) fiches = fiches.filter(f => f.theme === themeFilter);
  // Publiées d'abord, à venir ensuite, dans l'ordre du fichier
  fiches = [...fiches.filter(isPublished), ...fiches.filter(f => !isPublished(f))];

  let rows;
  if (rub.themes && !themeFilter) {
    let n = 0;
    rows = rub.themes.map(t => {
      const group = fiches.filter(f => f.theme === t.id);
      if (!group.length) return '';
      return `<li class="lab-group"><h3 class="eyebrow">${escapeHtml(t.titre)}</h3></li>` + group.map(f => entry(f, ++n, rub)).join('');
    }).join('');
  } else {
    rows = fiches.map((f, i) => entry(f, i + 1, rub)).join('');
  }

  return `<section class="grid__band lab-section" aria-labelledby="rubrique-${rub.id}">
      <div class="grid__band grid--baseline">
        <h2 class="title-3 col-1-4 md-col-1-3" id="rubrique-${rub.id}">${escapeHtml(rub.titre)}</h2>
        <p class="muted col-5-12 md-col-4-8">${escapeHtml(rub.description)}</p>
      </div>
      ${rows ? `<ol class="grid__band grid--flush entry-list">${rows}</ol>` : '<p class="empty col-1-12">Aucune fiche pour ce thème, pour l\'instant.</p>'}
    </section>`;
}

function hubView(params, notFound) {
  const active = rubriqueById(params.get('rubrique'));
  const theme = active && themeById(active, params.get('theme')) ? params.get('theme') : '';
  const rubs = active ? [active] : LABO_RUBRIQUES;

  const count = id => LABO_FICHES.filter(f => (!id || f.rubrique === id) && isPublished(f)).length;
  const chip = (id, label, n) =>
    `<button type="button" class="chip" aria-pressed="${String((active ? active.id : '') === id)}" data-rubrique="${id}">${escapeHtml(label)}<span class="lab-chip__count">${n}</span></button>`;
  const chips = chip('', 'Tout', count()) + LABO_RUBRIQUES.map(r => chip(r.id, r.titre, count(r.id))).join('');

  const themeChips = active && active.themes ? `
    <div class="chip-group" role="group" aria-label="Thèmes ${escapeHtml(active.titre)}">
      <button type="button" class="chip" aria-pressed="${String(!theme)}" data-theme-filter="">Tous les thèmes</button>
      ${active.themes.map(t => `<button type="button" class="chip" aria-pressed="${String(theme === t.id)}" data-theme-filter="${t.id}">${escapeHtml(t.titre)}</button>`).join('')}
    </div>` : '';

  const visible = LABO_FICHES.filter(f => rubs.includes(rubriqueById(f.rubrique)) && (!theme || f.theme === theme));
  const pub = visible.filter(isPublished).length;
  const soon = visible.length - pub;

  return `
    <header class="page-head">
      <div class="container grid">
        <div class="grid__band grid--baseline">
          <span class="folio sm-col-1-2 md-col-1-2 col-1-2">08</span>
          <span class="eyebrow sm-col-3-4 md-col-5-8 col-10-12 align-end">Apprendre</span>
        </div>
        <hr class="rule rule--strong col-1-12">
        <h1 class="title-1 col-1-7 md-col-1-6" tabindex="-1">Labo data</h1>
        <p class="lead col-8-12 md-col-1-6">Data et dataviz, expliqués simplement. Une fiche, une idée, un visuel.</p>
      </div>
    </header>
    <div class="tool">
      <div class="container grid lab-hub">
        ${notFound ? '<p class="notice col-1-12" role="alert">Cette fiche n\'existe pas ou n\'est pas encore publiée. Voici toutes les autres.</p>' : ''}
        <nav class="stack stack--2 col-1-12" aria-label="Filtrer par rubrique">
          <div class="chip-group" role="group" aria-label="Rubriques">${chips}</div>
          ${themeChips}
        </nav>
        <p class="eyebrow col-1-12" role="status">${pub} fiche${pub > 1 ? 's' : ''} publiée${pub > 1 ? 's' : ''}${soon ? `, ${soon} à venir` : ''}</p>
        ${rubs.map(r => rubriqueSection(r, theme)).join('')}
      </div>
    </div>`;
}

// ---------- Fiche détaillée ----------

// Équations affichées en bloc : [{ eq: 'P(S = 7) = 6/36', note: 'ce que dit la formule' }]
function equations(list) {
  if (!list || !list.length) return '';
  return `<dl class="lab-math">${list.map(e => `
      <dt class="lab-math__eq">${inline(e.eq)}</dt>
      <dd class="lab-math__note">${e.note ? inline(e.note) : ''}</dd>`).join('')}</dl>`;
}

function slide(bloc, n, total) {
  return `<li class="lab-slide">
      <span class="folio lab-slide__num">${pad(n)}<span class="muted"> / ${pad(total)}</span></span>
      <p class="eyebrow lab-slide__type">${escapeHtml(BLOC_LABELS[bloc.type] || bloc.type)}</p>
      <h3 class="title-3 lab-slide__title">${inline(bloc.titre || '')}</h3>
      <div class="lab-slide__body stack stack--2">
        ${bloc.formule ? `<p class="lab-formula"><code>${escapeHtml(bloc.formule)}</code></p>` : ''}
        ${rich(bloc.texte)}
        ${equations(bloc.equations)}
        ${bloc.suite ? rich(bloc.suite) : ''}
        ${visual(bloc.visuel)}
      </div>
    </li>`;
}

function ficheView(fiche) {
  const rub = rubriqueById(fiche.rubrique);
  const theme = rub && themeById(rub, fiche.theme);
  const blocs = fiche.blocs || [];
  const total = blocs.length + 1;
  const published = LABO_FICHES.filter(isPublished);
  const i = published.indexOf(fiche);
  const prev = published[i - 1], next = published[i + 1];
  const pager = (f, label, cls) => f
    ? `<a class="lab-pager__link ${cls}" href="${laboUrl({ fiche: f.id })}" data-nav><span class="eyebrow">${label}</span><span class="lab-pager__title">${escapeHtml(f.titre)}</span></a>`
    : '<span></span>';
  const sources = (fiche.sources || []).length ? `
      <div class="col-1-12 stack stack--1">
        <h2 class="eyebrow">Sources</h2>
        <ul class="lab-list">${fiche.sources.map(s => `<li>${s.url ? `<a class="link" href="${escapeHtml(s.url)}" rel="noopener">${escapeHtml(s.titre)}</a>` : escapeHtml(s.titre)}</li>`).join('')}</ul>
      </div>` : '';

  return `
    <article class="lab-fiche" aria-labelledby="fiche-titre">
      <header class="page-head">
        <div class="container grid">
          <div class="grid__band grid--baseline">
            <a class="link text-sm sm-col-1-2 md-col-1-4 col-1-4" href="${laboUrl({ rubrique: fiche.rubrique })}" data-nav>Labo data, ${escapeHtml(rub ? rub.titre : '')}</a>
            <span class="eyebrow sm-col-3-4 md-col-5-8 col-10-12 align-end">${pad(1)} / ${pad(total)}${theme ? ` · ${escapeHtml(theme.titre)}` : ''}</span>
          </div>
          <hr class="rule rule--strong col-1-12">
          <h1 class="title-2 col-1-9" id="fiche-titre" tabindex="-1">${inline(fiche.titre)}</h1>
          <p class="lead col-7-12 md-col-4-8">${inline(fiche.accroche || '')}</p>
        </div>
      </header>

      <section class="section section--ruled section--tight" aria-label="Visuel principal">
        <div class="container grid">
          <div class="col-1-12">${visual(fiche.visuel)}</div>
        </div>
      </section>

      <section class="section section--ruled section--tight" aria-labelledby="fiche-points">
        <div class="container grid">
          <h2 class="eyebrow col-1-12" id="fiche-points">L'essentiel en ${blocs.length} points</h2>
          <ol class="grid__band grid--flush lab-slides">${blocs.map((b, k) => slide(b, k + 2, total)).join('')}</ol>
        </div>
      </section>

      <footer class="section section--ruled section--tight">
        <div class="container grid">
          <div class="col-1-12 tool__bar">
            <div class="btn-group">
              <button type="button" class="btn btn--primary" data-share>Partager la fiche</button>
              <a class="btn" href="${laboUrl({ rubrique: fiche.rubrique })}" data-nav>Toutes les fiches</a>
            </div>
            ${fiche.date ? `<p class="eyebrow">Publiée le ${formatDate(fiche.date)}</p>` : ''}
          </div>
          ${sources}
          <nav class="col-1-12 lab-pager" aria-label="Fiches voisines">
            ${pager(prev, 'Fiche précédente', 'lab-pager__link--prev')}
            ${pager(next, 'Fiche suivante', 'lab-pager__link--next')}
          </nav>
        </div>
      </footer>
    </article>`;
}

// ---------- Routage ----------

function renderLabo({ focus = null, scroll = false } = {}) {
  const view = document.getElementById('labo-view');
  if (!view) return;
  LaboCharts.reset();
  LaboSim.reset();
  laboState.mounts = [];

  const params = new URLSearchParams(location.search);
  const id = params.get('fiche');
  const fiche = id ? LABO_FICHES.find(f => f.id === id && isPublished(f)) : null;

  view.innerHTML = fiche ? ficheView(fiche) : hubView(params, Boolean(id));
  view.querySelectorAll('[data-viz]').forEach(el => {
    const { spec, data } = laboState.mounts[Number(el.dataset.viz)];
    LaboCharts.mount(el, spec, data);
  });
  initChooser(view);
  LaboSim.init(view, laboState.mounts);
  LaboInteractifs.init(view, laboState.mounts);

  const rub = rubriqueById(params.get('rubrique'));
  document.title = fiche ? `${fiche.titre}, Labo data` : `Labo data${rub ? `, ${rub.titre}` : ''}, Pierre Duchesne`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', fiche ? (fiche.accroche || fiche.titre) : laboState.description);

  if (scroll) window.scrollTo(0, 0);
  const target = focus && view.querySelector(focus);
  if (target) target.focus({ preventScroll: !scroll });
}

function navigate(href, options) {
  history.pushState(null, '', href);
  renderLabo(options);
}

async function shareFiche() {
  const data = { title: document.title, url: location.href };
  if (navigator.share) {
    try { await navigator.share(data); } catch (err) { /* partage annulé */ }
    return;
  }
  try {
    await navigator.clipboard.writeText(location.href);
    showToast('Lien de la fiche copié.');
  } catch (err) {
    showToast(`Copiez ce lien : ${location.href}`, 'default', 6000);
  }
}

function initLabo() {
  laboState.description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  renderLabo();

  document.addEventListener('click', e => {
    const link = e.target.closest('a[data-nav]');
    if (link && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
      e.preventDefault();
      navigate(link.getAttribute('href'), { focus: 'h1', scroll: true });
      return;
    }
    const rubBtn = e.target.closest('[data-rubrique]');
    if (rubBtn) {
      navigate(laboUrl({ rubrique: rubBtn.dataset.rubrique }), { focus: `[data-rubrique="${rubBtn.dataset.rubrique}"]` });
      return;
    }
    const themeBtn = e.target.closest('[data-theme-filter]');
    if (themeBtn) {
      const rubrique = new URLSearchParams(location.search).get('rubrique');
      navigate(laboUrl({ rubrique, theme: themeBtn.dataset.themeFilter }), { focus: `[data-theme-filter="${themeBtn.dataset.themeFilter}"]` });
      return;
    }
    if (e.target.closest('[data-share]')) shareFiche();
  });

  window.addEventListener('popstate', () => renderLabo({ scroll: true }));
}

function startLabo() { try { initLabo(); } catch (e) { console.error('Labo data failed:', e); } }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startLabo);
else startLabo();
