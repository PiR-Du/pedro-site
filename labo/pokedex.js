// Labo data : tableau de bord Pokémon (fiche pokemon-stats), module interactif « pokedex ».
// Script classique, chargé après interactifs.js. Les données (labo/datasets/pokemon.js, 360 Ko)
// ne sont téléchargées qu'à l'ouverture de la fiche : le reste du Labo n'en paie pas le poids.
// Spec du visuel : { type: 'interactif', module: 'pokedex', script: 'datasets/pokemon.js', tableau: false }.

(() => {
  const { num, esc, stats } = LaboCharts;

  const SIX = [
    { id: 'pv', libelle: 'PV', court: 'PV' },
    { id: 'attaque', libelle: 'Attaque', court: 'Att.' },
    { id: 'defense', libelle: 'Défense', court: 'Déf.' },
    { id: 'attaqueSpe', libelle: 'Attaque spéciale', court: 'A. Spé.' },
    { id: 'defenseSpe', libelle: 'Défense spéciale', court: 'D. Spé.' },
    { id: 'vitesse', libelle: 'Vitesse', court: 'Vit.' },
  ];
  const STATS = [{ id: 'total', libelle: 'Total des stats', court: 'Total' }, ...SIX];
  const statById = id => STATS.find(s => s.id === id);
  const FORMES = [
    { id: 'base', libelle: 'Formes de base', garde: ['base'] },
    { id: 'mega', libelle: 'Base et Méga-évolutions', garde: ['base', 'mega'] },
    { id: 'regionale', libelle: 'Base et formes régionales', garde: ['base', 'regionale'] },
    { id: 'toutes', libelle: 'Toutes les formes', garde: null },
  ];
  const GROUPES = [
    { id: 'type', libelle: 'Type' },
    { id: 'gen', libelle: 'Génération' },
    { id: 'stade', libelle: 'Stade d\'évolution' },
  ];
  const DEFAUT = { type: '', gen: '', stade: '', evo: '', forme: 'base', stat: 'total', groupe: 'type', modeAttaques: 'repandues', nom: '', tri: 'total', desc: true, lignes: 20 };
  const PAGE = 20;

  // ---------- Chargement et décodage ----------

  let promesse = null;
  function charger(src) {
    if (!promesse) {
      promesse = new Promise((ok, ko) => {
        if (window.LABO_POKEMON) return ok();
        const s = document.createElement('script');
        s.src = src;
        s.onload = ok;
        s.onerror = () => ko(new Error(`Impossible de charger ${src}`));
        document.head.append(s);
      }).then(() => decoder(window.LABO_POKEMON));
    }
    return promesse;
  }

  // Talents et attaques : numéros en base 36 sur 2 caractères (voir datasets/pokemon-prepare.py)
  const b36 = s => { const out = []; for (let i = 0; i < s.length; i += 2) out.push(parseInt(s.slice(i, i + 2), 36)); return out; };
  const sansAccent = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function decoder(raw) {
    const pokemons = raw.pokemons.map(r => {
      const p = Object.fromEntries(raw.colonnes.map((c, i) => [c, r[i]]));
      p.talents = b36(p.talents);
      p.talentCache = p.talentCache ? parseInt(p.talentCache, 36) : null;
      p.attaques = b36(p.attaques);
      p.total = SIX.reduce((s, k) => s + p[k.id], 0);
      p.types = p.type2 ? [p.type1, p.type2] : [p.type1];
      p.cle = sansAccent(`${p.nom} ${p.nomEn}`);
      return p;
    });
    const types = [...new Set(pokemons.flatMap(p => p.types))].sort((a, b) => a.localeCompare(b, 'fr'));
    const gens = [...new Set(pokemons.map(p => p.gen))].sort((a, b) => a - b);
    return { pokemons, types, gens, talents: raw.talents, attaques: raw.attaques, byId: new Map(pokemons.map(p => [p.id, p])) };
  }

  // ---------- Filtres ----------

  // sauf : la dimension comparée garde toutes ses valeurs (la sélection y est mise en avant au lieu d'effacer le reste)
  function filtrer(D, s, sauf) {
    const garde = FORMES.find(f => f.id === s.forme).garde;
    return D.pokemons.filter(p =>
      (!garde || garde.includes(p.forme)) &&
      (sauf === 'type' || !s.type || p.types.includes(s.type)) &&
      (sauf === 'gen' || !s.gen || p.gen === Number(s.gen)) &&
      (sauf === 'stade' || !s.stade || p.stade === Number(s.stade)) &&
      (!s.evo || p.final === (s.evo === 'final' ? 1 : 0)));
  }
  const ensemble = (D, s) => filtrer(D, { ...DEFAUT, forme: s.forme });
  const moyenne = v => stats.moyenne(v);
  const cles = (p, groupe) => groupe === 'type' ? p.types : [p[groupe]];
  const nomGroupe = (groupe, k) => groupe === 'gen' ? `Génération ${k}` : groupe === 'stade' ? `Stade ${k}` : k;

  function parGroupe(D, s) {
    const map = new Map();
    filtrer(D, s, s.groupe).forEach(p => cles(p, s.groupe).forEach(k => {
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(p[s.stat]);
    }));
    const choisi = s[s.groupe];
    const items = [...map].map(([k, v]) => ({ k, n: v.length, label: `${nomGroupe(s.groupe, k)} (${v.length})`, valeur: moyenne(v), accent: choisi !== '' && String(k) === String(choisi) }));
    return s.groupe === 'type' ? items.sort((a, b) => b.valeur - a.valeur) : items.sort((a, b) => a.k - b.k);
  }

  // Part des Pokémon de la liste qui ont chaque talent (normal ou caché), ou qui peuvent apprendre chaque attaque
  function parts(liste, cle, taille) {
    const c = new Array(taille).fill(0);
    liste.forEach(p => {
      const ids = cle === 'talents' ? new Set(p.talentCache == null ? p.talents : [...p.talents, p.talentCache]) : new Set(p.attaques);
      ids.forEach(i => c[i]++);
    });
    return c.map(n => 100 * n / Math.max(liste.length, 1));
  }

  // Histogramme : classes de 25 points pour le total, de 10 pour une stat seule
  function histogramme(valeurs, pas) {
    const lo = Math.floor(Math.min(...valeurs) / pas) * pas, hi = Math.floor(Math.max(...valeurs) / pas) * pas;
    const me = stats.mediane(valeurs);
    const items = [];
    for (let a = lo; a <= hi; a += pas) items.push({ label: String(a), valeur: 0, accent: me >= a && me < a + pas });
    valeurs.forEach(v => items[Math.floor((v - lo) / pas)].valeur++);
    return items;
  }

  // ---------- Gabarits ----------

  const select = (id, key, label, options, value) => `<div class="interactif__field">
      <label class="label" for="${id}-${key}">${label}</label>
      <select class="select" id="${id}-${key}" data-f="${key}">${options.map(([v, l]) =>
        `<option value="${esc(v)}"${String(v) === String(value) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>
    </div>`;
  const chip = (attr, value, label, pressed) => `<button type="button" class="chip" data-${attr}="${esc(value)}" aria-pressed="${pressed}">${esc(label)}</button>`;
  const stat = (key, label) => `<div class="interactif__stat"><dt>${label}</dt><dd data-k-${key}></dd></div>`;
  const panneau = (id, key, extra = '') => `<section class="pokedex__panel" aria-labelledby="${id}-${key}-titre">
      <h3 class="title-4" id="${id}-${key}-titre" data-t-${key}></h3>${extra}
      <div class="viz-host" data-c-${key}></div>
      <p class="hint" data-h-${key}></p>
    </section>`;

  const COLONNES = [
    { id: 'espece', libelle: 'N°' },
    { id: 'nom', libelle: 'Nom', texte: true },
    { id: 'types', libelle: 'Types', texte: true, val: p => p.types.join(' / ') },
    { id: 'gen', libelle: 'Gén.' },
    { id: 'stade', libelle: 'Stade' },
    ...SIX.map(s => ({ id: s.id, libelle: s.court, titre: s.libelle })),
    { id: 'total', libelle: 'Total' },
  ];

  function interface_(D, id, s) {
    const types = [['', 'Tous les types'], ...D.types.map(t => [t, t])];
    const gens = [['', 'Toutes'], ...D.gens.map(g => [g, `Génération ${g}`])];
    const stades = [['', 'Tous'], [1, 'Stade 1 (de base)'], [2, 'Stade 2'], [3, 'Stade 3']];
    const evo = [['', 'Toutes'], ['final', 'Forme finale (n\'évolue plus)'], ['pas-final', 'Peut encore évoluer']];
    const formes = FORMES.map(f => [f.id, f.libelle]);
    const choix = [...D.talents.map(t => `<option value="${esc(t)}">Talent</option>`), ...D.attaques.map(a => `<option value="${esc(a)}">Attaque</option>`)].join('');
    return `<div class="interactif__controls">
        <div class="interactif__fields pokedex__filtres">
          ${select(id, 'type', 'Type', types, s.type)}
          ${select(id, 'gen', 'Génération', gens, s.gen)}
          ${select(id, 'stade', 'Stade d\'évolution', stades, s.stade)}
          ${select(id, 'evo', 'Évolution', evo, s.evo)}
          ${select(id, 'forme', 'Formes', formes, s.forme)}
          ${select(id, 'stat', 'Statistique étudiée', STATS.map(x => [x.id, x.libelle]), s.stat)}
        </div>
        <div class="interactif__options">
          <div class="interactif__option"><p class="label" id="${id}-groupe">Comparer par</p>
            <div class="chip-group" role="group" aria-labelledby="${id}-groupe">${GROUPES.map(g => chip('groupe', g.id, g.libelle, g.id === s.groupe)).join('')}</div></div>
          <div class="interactif__option pokedex__reset"><button type="button" class="btn btn--sm" data-reset>Tout réinitialiser</button></div>
        </div>
      </div>
      <p class="interactif__status" data-status aria-live="polite"></p>
      <dl class="interactif__stats">
        ${stat('n', 'Pokémon retenus')}${stat('moy', 'Moyenne')}${stat('med', 'Médiane')}${stat('max', 'Le plus haut')}${stat('min', 'Le plus bas')}${stat('double', 'Double type')}
      </dl>
      <div class="pokedex__grid" data-grille>
        ${panneau(id, 'groupe')}
        ${panneau(id, 'profil')}
        ${panneau(id, 'distrib')}
        ${panneau(id, 'talents')}
        ${panneau(id, 'attaques', `<div class="chip-group" role="group" aria-label="Classement des attaques">${chip('mode', 'repandues', 'Les plus répandues', s.modeAttaques === 'repandues')}${chip('mode', 'typiques', 'Les plus caractéristiques', s.modeAttaques === 'typiques')}</div>`)}
      </div>
      <section class="pokedex__panel" aria-labelledby="${id}-qui">
        <h3 class="title-4" id="${id}-qui">Qui a ce talent, qui connaît cette attaque ?</h3>
        <div class="interactif__field">
          <label class="label" for="${id}-cherche">Un talent ou une attaque <span class="label__optional">parmi les Pokémon retenus</span></label>
          <input class="input" id="${id}-cherche" list="${id}-liste" autocomplete="off" placeholder="Ex. : Lévitation, Séisme" data-cherche>
          <datalist id="${id}-liste">${choix}</datalist>
        </div>
        <div aria-live="polite" data-qui></div>
      </section>
      <section class="pokedex__panel" aria-labelledby="${id}-liste-titre">
        <h3 class="title-4" id="${id}-liste-titre">Tous les Pokémon retenus</h3>
        <div class="interactif__field">
          <label class="label" for="${id}-nom">Chercher un Pokémon <span class="label__optional">nom français ou anglais</span></label>
          <input class="input" id="${id}-nom" type="search" autocomplete="off" placeholder="Ex. : Pikachu" data-nom>
        </div>
        <div class="pokedex__fiche" data-fiche hidden tabindex="-1"></div>
        <div class="table-scroll"><table class="viz-data__table pokedex__table">
          <caption class="hint" data-legende-table></caption>
          <thead><tr>${COLONNES.map(c => `<th scope="col" data-col="${c.id}"${c.texte ? ' class="pokedex__texte"' : ''}><button type="button" class="pokedex__tri" data-tri="${c.id}"${c.titre ? ` title="${esc(c.titre)}"` : ''}>${esc(c.libelle)}</button></th>`).join('')}</tr></thead>
          <tbody data-lignes></tbody>
        </table></div>
        <div class="btn-group"><button type="button" class="btn btn--sm" data-plus>Afficher ${PAGE} de plus</button></div>
      </section>`;
  }

  // ---------- Montage ----------

  function construire(root, spec, D) {
    const id = `pokedex-${root.dataset.interactif}`;
    const s = { ...DEFAUT };
    root.innerHTML = interface_(D, id, s);
    const q = sel => root.querySelector(`[data-${sel}]`);
    const dessiner = (key, chartSpec, data) => {
      const el = q(`c-${key}`);
      if (el._viz) LaboCharts.update(el, data, chartSpec); else LaboCharts.mount(el, chartSpec, data);
    };

    function tableau(liste) {
      const col = COLONNES.find(c => c.id === s.tri);
      const val = col.val || (p => p[col.id]);
      const cle = sansAccent(s.nom.trim());
      const vus = (cle ? liste.filter(p => p.cle.includes(cle)) : liste).slice().sort((a, b) => {
        const d = col.texte ? String(val(a)).localeCompare(String(val(b)), 'fr') : val(a) - val(b);
        return (s.desc ? -d : d) || a.id - b.id;
      });
      q('lignes').innerHTML = vus.slice(0, s.lignes).map(p => `<tr>
          <td>${p.espece}</td>
          <th scope="row" class="pokedex__texte"><button type="button" class="link pokedex__nom" data-voir="${p.id}">${esc(p.nom)}</button></th>
          <td class="pokedex__texte">${esc(p.types.join(' / '))}</td><td>${p.gen}</td><td>${p.stade}</td>
          ${SIX.map(x => `<td>${p[x.id]}</td>`).join('')}<td><strong>${p.total}</strong></td>
        </tr>`).join('');
      q('legende-table').textContent = vus.length
        ? `${num(Math.min(s.lignes, vus.length))} sur ${num(vus.length)} Pokémon, triés par ${col.titre || col.libelle} ${col.texte ? (s.desc ? 'de Z à A' : 'de A à Z') : (s.desc ? 'décroissant' : 'croissant')}. Cliquez sur un nom pour voir sa fiche, sur un en-tête pour trier.`
        : 'Aucun Pokémon ne correspond à cette recherche.';
      q('plus').hidden = vus.length <= s.lignes;
      root.querySelectorAll('[data-col]').forEach(th => th.setAttribute('aria-sort', th.dataset.col === s.tri ? (s.desc ? 'descending' : 'ascending') : 'none'));
    }

    function qui(liste) {
      const out = q('qui'), texte = q('cherche').value.trim();
      if (!texte) { out.innerHTML = ''; return; }
      const cle = sansAccent(texte);
      const t = D.talents.findIndex(x => sansAccent(x) === cle), a = D.attaques.findIndex(x => sansAccent(x) === cle);
      if (t < 0 && a < 0) { out.innerHTML = '<p class="hint">Choisissez un talent ou une attaque dans la liste proposée.</p>'; return; }
      const estTalent = t >= 0;
      const trouves = liste.filter(p => estTalent ? p.talents.includes(t) || p.talentCache === t : p.attaques.includes(a));
      const nom = estTalent ? D.talents[t] : D.attaques[a];
      const caches = estTalent ? trouves.filter(p => p.talentCache === t).length : 0;
      const pluriel = trouves.length > 1;
      const verbe = estTalent ? (pluriel ? 'ont le talent' : 'a le talent') : (pluriel ? 'peuvent apprendre l\'attaque' : 'peut apprendre l\'attaque');
      const max = 80;
      out.innerHTML = `<p class="interactif__status"><strong>${num(trouves.length)} Pokémon sur ${num(liste.length)}</strong> (${num(100 * trouves.length / Math.max(liste.length, 1), 1)} %) ${verbe} <strong>${esc(nom)}</strong>${caches ? `, dont ${num(caches)} en talent caché` : ''}.</p>` +
        (trouves.length ? `<p class="pokedex__noms">${trouves.slice(0, max).map(p => `<button type="button" class="link pokedex__nom" data-voir="${p.id}">${esc(p.nom)}</button>`).join(', ')}${trouves.length > max ? `, et ${num(trouves.length - max)} autres` : ''}.</p>` : '');
    }

    function fiche(p) {
      const el = q('fiche');
      const talents = p.talents.map(i => esc(D.talents[i]));
      const att = p.attaques.map(i => D.attaques[i]);
      const formes = { base: 'Forme de base', mega: 'Méga-évolution', regionale: 'Forme régionale', gigamax: 'Forme Gigamax', autre: 'Forme alternative' };
      el.innerHTML = `<div class="pokedex__fiche-tete">
          <div><p class="eyebrow">N° ${p.espece} · Génération ${p.gen} · ${formes[p.forme]}</p>
            <h4 class="title-3">${esc(p.nom)}</h4>${p.nomEn !== p.nom ? `<p class="hint">${esc(p.nomEn)} en anglais</p>` : ''}</div>
          <button type="button" class="btn btn--sm" data-fermer>Fermer la fiche</button>
        </div>
        <dl class="interactif__stats">
          <div class="interactif__stat"><dt>Types</dt><dd>${esc(p.types.join(' / '))}</dd></div>
          <div class="interactif__stat"><dt>Stade d'évolution</dt><dd>${p.stade}${p.final ? ', forme finale' : ''}</dd></div>
          <div class="interactif__stat"><dt>Évolue de</dt><dd>${p.evolueDe ? esc(p.evolueDe) : 'Personne'}</dd></div>
          <div class="interactif__stat"><dt>Taille et poids</dt><dd>${num(p.taille, 1)} m · ${num(p.poids, 1)} kg</dd></div>
          <div class="interactif__stat"><dt>Total des stats</dt><dd>${p.total}</dd></div>
        </dl>
        <div class="viz-host" data-c-fiche></div>
        <div class="pokedex__fiche-texte">
          <p><strong>Talents</strong> : ${talents.length ? talents.join(', ') : 'aucun talent recensé'}${p.talentCache != null ? `. Talent caché : ${esc(D.talents[p.talentCache])}` : ''}.</p>
          ${att.length ? `<details class="disclosure"><summary class="disclosure__summary">Les ${att.length} attaques qu'il peut apprendre</summary>
            <div class="disclosure__body"><p class="pokedex__noms">${att.map(esc).join(', ')}.</p></div></details>` : '<p>Aucune attaque recensée pour cette forme dans les données.</p>'}
        </div>`;
      el.hidden = false;
      const host = el.querySelector('[data-c-fiche]');
      LaboCharts.mount(host, {
        type: 'barres', max: 255, titre: `Stats de ${p.nom}`,
        alt: `${p.nom} : ${SIX.map(x => `${x.libelle} ${p[x.id]}`).join(', ')}. Total ${p.total}.`,
      }, { items: SIX.map(x => ({ label: x.libelle, valeur: p[x.id] })) });
      el.focus();
      el.scrollIntoView({ block: 'start' });
    }

    function tout() {
      const st = statById(s.stat);
      const liste = filtrer(D, s), base = ensemble(D, s);
      const n = liste.length;
      q('grille').hidden = n === 0;
      q('k-n').textContent = `${num(n)} sur ${num(base.length)}`;
      const vals = liste.map(p => p[s.stat]);
      if (n) {
        const top = liste.reduce((a, b) => b[s.stat] > a[s.stat] ? b : a), bas = liste.reduce((a, b) => b[s.stat] < a[s.stat] ? b : a);
        q('k-moy').textContent = num(moyenne(vals), 1);
        q('k-med').textContent = num(stats.mediane(vals), 1);
        q('k-max').textContent = `${top.nom}, ${top[s.stat]}`;
        q('k-min').textContent = `${bas.nom}, ${bas[s.stat]}`;
        q('k-double').textContent = `${num(100 * liste.filter(p => p.type2).length / n, 0)} %`;
      } else ['moy', 'med', 'max', 'min', 'double'].forEach(k => { q(`k-${k}`).textContent = '–'; });

      // 1. Moyenne par groupe
      const groupes = parGroupe(D, s);
      const g = GROUPES.find(x => x.id === s.groupe);
      const statut = q('status');
      if (!n || !groupes.length) {
        statut.textContent = 'Aucun Pokémon ne correspond à ces filtres : élargissez la sélection.';
      } else {
        const tri = [...groupes].sort((a, b) => b.valeur - a.valeur), haut = tri[0], basG = tri[tri.length - 1];
        statut.innerHTML = `<strong>${num(n)} Pokémon</strong> retenus. Par ${g.libelle.toLowerCase()}, la meilleure moyenne en ${esc(st.libelle.toLowerCase())} revient à <strong>${esc(nomGroupe(s.groupe, haut.k))}</strong> (${num(haut.valeur, 0)}, ${haut.n} Pokémon), la plus basse à <strong>${esc(nomGroupe(s.groupe, basG.k))}</strong> (${num(basG.valeur, 0)}).`;
      }
      q('t-groupe').textContent = `${st.libelle} moyen par ${g.libelle.toLowerCase()}`;
      q('h-groupe').textContent = (s.groupe === 'type' ? 'Un Pokémon à double type compte dans ses deux types. ' : '') +
        (s[s.groupe] !== '' ? 'La barre foncée est votre sélection ; les autres filtres s\'appliquent à toutes les barres.' : 'Entre parenthèses, le nombre de Pokémon du groupe.');
      if (groupes.length) dessiner('groupe', { type: 'barres', decimales: 0, titre: q('t-groupe').textContent, alt: groupes.map(x => `${x.label} : ${num(x.valeur, 0)}`).join(', ') }, { decimales: 0, items: groupes });

      if (!n) { tableau(liste); qui(liste); return; }

      // 2. Profil des six stats : la sélection (colonnes) face à l'ensemble des Pokémon (trait)
      const profil = SIX.map(x => ({ label: x.court, valeur: moyenne(liste.map(p => p[x.id])), theorie: moyenne(base.map(p => p[x.id])) }));
      q('t-profil').textContent = 'Profil moyen des six stats';
      q('h-profil').textContent = 'Colonnes : la sélection. Trait : la moyenne de tous les Pokémon, toutes catégories confondues, pour comparer.';
      dessiner('profil', { type: 'colonnes', valeurs: 'toutes', titre: 'Profil moyen des six stats', alt: profil.map((x, i) => `${SIX[i].libelle} ${num(x.valeur, 0)} contre ${num(x.theorie, 0)} pour l'ensemble`).join(', ') }, { decimales: 0, items: profil });

      // 3. Répartition de la stat étudiée
      const pas = s.stat === 'total' ? 25 : 10;
      const histo = histogramme(vals, pas);
      q('t-distrib').textContent = `Répartition : ${st.libelle.toLowerCase()}`;
      q('h-distrib').textContent = `Nombre de Pokémon par tranche de ${pas} points. La colonne foncée contient la médiane, ${num(stats.mediane(vals), 1)}.`;
      dessiner('distrib', { type: 'colonnes', titre: q('t-distrib').textContent, alt: `Histogramme de ${n} valeurs, de ${Math.min(...vals)} à ${Math.max(...vals)}, médiane ${num(stats.mediane(vals), 1)}.` }, { items: histo });

      // 4. Talents les plus fréquents
      const pt = parts(liste, 'talents', D.talents.length);
      const topT = pt.map((v, i) => ({ i, v })).sort((a, b) => b.v - a.v).slice(0, 10).filter(x => x.v > 0);
      q('t-talents').textContent = topT.length < 10 ? `Les ${topT.length} talent${topT.length > 1 ? 's' : ''} de la sélection` : 'Les 10 talents les plus fréquents';
      q('h-talents').textContent = `Part des Pokémon retenus qui ont ce talent, normal ou caché. La sélection compte ${num(new Set(liste.flatMap(p => p.talentCache == null ? p.talents : [...p.talents, p.talentCache])).size)} talents différents.`;
      dessiner('talents', { type: 'barres', titre: q('t-talents').textContent, alt: topT.map(x => `${D.talents[x.i]} ${num(x.v, 1)} %`).join(', ') },
        { unite: '%', decimales: 1, items: topT.map(x => ({ label: D.talents[x.i], valeur: x.v })) });

      // 5. Attaques : les plus répandues, ou celles qui distinguent la sélection de l'ensemble
      const pa = parts(liste, 'attaques', D.attaques.length);
      let items, titre, aide;
      if (s.modeAttaques === 'typiques') {
        const pb = parts(base, 'attaques', D.attaques.length);
        items = pa.map((v, i) => ({ i, v, e: v - pb[i] })).sort((a, b) => b.e - a.e).slice(0, 10).filter(x => x.e > 0)
          .map(x => ({ label: D.attaques[x.i], valeur: x.e }));
        titre = 'Les 10 attaques les plus caractéristiques';
        aide = items.length ? 'Écart, en points, entre la part de la sélection qui peut apprendre l\'attaque et la part de l\'ensemble des Pokémon. Les attaques que presque tout le monde apprend disparaissent.' : 'La sélection est l\'ensemble des Pokémon : rien ne la distingue. Choisissez un type ou une génération.';
      } else {
        items = pa.map((v, i) => ({ i, v })).sort((a, b) => b.v - a.v).slice(0, 10).map(x => ({ label: D.attaques[x.i], valeur: x.v }));
        titre = 'Les 10 attaques les plus répandues';
        aide = `Part des Pokémon retenus qui peuvent apprendre l'attaque, par n'importe quel moyen. ${num(moyenne(liste.map(p => p.attaques.length)), 0)} attaques par Pokémon en moyenne.`;
      }
      q('t-attaques').textContent = titre;
      q('h-attaques').textContent = aide;
      const ha = q('c-attaques');
      ha.hidden = !items.length;
      if (items.length) dessiner('attaques', { type: 'barres', titre, alt: items.map(x => `${x.label} ${num(x.valeur, 1)}`).join(', ') },
        { unite: s.modeAttaques === 'typiques' ? 'pts' : '%', decimales: 1, items });

      tableau(liste);
      qui(liste);
    }

    root.addEventListener('change', e => {
      const f = e.target.dataset.f;
      if (f) { s[f] = e.target.value; s.lignes = PAGE; tout(); }
    });
    root.addEventListener('input', e => {
      if (e.target.matches('[data-nom]')) { s.nom = e.target.value; s.lignes = PAGE; tableau(filtrer(D, s)); }
      if (e.target.matches('[data-cherche]')) qui(filtrer(D, s));
    });
    root.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.groupe) { s.groupe = b.dataset.groupe; press('groupe', s.groupe); tout(); }
      else if (b.dataset.mode) { s.modeAttaques = b.dataset.mode; press('mode', s.modeAttaques); tout(); }
      else if (b.dataset.tri) {
        const col = COLONNES.find(c => c.id === b.dataset.tri);
        s.desc = s.tri === col.id ? !s.desc : !col.texte;
        s.tri = col.id;
        tableau(filtrer(D, s));
      } else if (b.matches('[data-plus]')) { s.lignes += PAGE; tableau(filtrer(D, s)); }
      else if (b.dataset.voir) fiche(D.byId.get(Number(b.dataset.voir)));
      else if (b.matches('[data-fermer]')) { q('fiche').hidden = true; q('nom').focus(); }
      else if (b.matches('[data-reset]')) {
        Object.assign(s, DEFAUT);
        root.querySelectorAll('[data-f]').forEach(el => { el.value = s[el.dataset.f]; });
        q('nom').value = ''; q('cherche').value = ''; q('fiche').hidden = true;
        press('groupe', s.groupe); press('mode', s.modeAttaques);
        tout();
      }
    });
    const press = (attr, value) => root.querySelectorAll(`[data-${attr}]`).forEach(x => x.setAttribute('aria-pressed', String(x.dataset[attr] === value)));
    tout();
  }

  LaboInteractifs.register('pokedex', {
    markup() {
      return '<p class="interactif__status" aria-live="polite">Chargement des 1 351 Pokémon…</p>';
    },
    init(root, spec) {
      charger(spec.script || 'datasets/pokemon.js')
        .then(D => construire(root, spec, D))
        .catch(err => {
          console.error(err);
          root.innerHTML = '<p class="empty">Les données Pokémon n\'ont pas pu être chargées. Rechargez la page pour réessayer.</p>';
        });
    },
  });
})();
