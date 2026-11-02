// Labo data : exemples interactifs des fiches (visuel de type « interactif »).
// Script classique : expose la globale LaboInteractifs, utilisée par app.js.
// Chaque module lit ses données dans LABO_DONNEES (clé donnees du visuel), dessine avec LaboCharts
// et redessine à chaque réglage. Ajouter un exemple = ajouter une entrée à MODULES.

const LaboInteractifs = (() => {
  const { num, esc } = LaboCharts;
  const chip = (attr, value, label, pressed) => `<button type="button" class="chip" data-${attr}="${esc(value)}" aria-pressed="${pressed}">${esc(label)}</button>`;
  const press = (root, attr, value) => root.querySelectorAll(`[data-${attr}]`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset[attrKey(attr)] === String(value))));
  const attrKey = attr => attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const signe = (v, d = 1) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${num(Math.abs(v), d)}`;
  const stat = (key, label) => `<div class="interactif__stat"><dt>${label}</dt><dd data-${key}></dd></div>`;

  // Quantiles à 97,5 % de la loi de Student, pour 1 à 30 degrés de liberté ; au-delà, 1,96
  const STUDENT = [12.71, 4.30, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.20, 2.18, 2.16, 2.14, 2.13,
    2.12, 2.11, 2.10, 2.09, 2.09, 2.08, 2.07, 2.07, 2.06, 2.06, 2.06, 2.05, 2.05, 2.05, 2.04];
  const student = df => STUDENT[df - 1] ?? 1.96;

  // Pente des moindres carrés, son erreur type et son intervalle de confiance à 95 %
  function regression(xs, ys) {
    const n = xs.length;
    const { a, b } = LaboCharts.stats.droite(xs, ys);
    const mx = LaboCharts.stats.moyenne(xs);
    const sxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
    const rss = ys.reduce((s, y, i) => s + (y - a - b * xs[i]) ** 2, 0);
    const se = n > 2 ? Math.sqrt(rss / (n - 2) / sxx) : NaN;
    const t = student(Math.max(n - 2, 1));
    return { b, se, lo: b - t * se, hi: b + t * se };
  }

  // ═══════════════════════════════
  //  MODULES
  // ═══════════════════════════════
  const MODULES = {};

  // ---------- L'axe qui ne part pas de zéro ----------
  // donnees : { unite, decimales, items: [deux items, avant puis après] }. Options : depart (axe au départ), axeMax.
  MODULES['axe-tronque'] = {
    markup(spec, data, id) {
      const v0 = data.items[0].valeur;
      const presets = spec.reperes || [0, v0 - 1];
      return `<div class="interactif__controls">
          <div class="interactif__field">
            <label class="label" for="${id}-axe">L'axe vertical commence à <output data-out for="${id}-axe"></output></label>
            <input type="range" class="range" id="${id}-axe" min="0" max="${v0 - 0.5}" step="0.5" value="${spec.depart ?? 0}" data-axe>
          </div>
          <div class="chip-group" role="group" aria-label="Positions remarquables de l'axe">${presets.map(p =>
            chip('preset', p.valeur ?? p, p.libelle ?? `${num(p, 1)} ${data.unite || ''}`, false)).join('')}</div>
        </div>
        <div class="viz-host" data-chart></div>
        <dl class="interactif__stats" aria-live="polite">
          ${stat('reel', 'Hausse réelle')}${stat('montre', 'Hausse que l\'œil voit')}${stat('facteur', 'Facteur de mensonge')}
        </dl>`;
    },
    init(root, spec, data) {
      const [before, after] = data.items;
      const real = after.valeur / before.valeur - 1;
      const input = root.querySelector('[data-axe]'), chart = root.querySelector('[data-chart]');
      const out = sel => root.querySelector(`[data-${sel}]`);
      const unite = data.unite ? ` ${data.unite}` : '';
      const draw = () => {
        const a = Number(input.value);
        const shown = (after.valeur - a) / (before.valeur - a) - 1;
        const chartSpec = {
          type: 'colonnes', valeurs: 'toutes', axeMin: a, max: spec.axeMax,
          titre: `${spec.titre || ''}, axe démarrant à ${num(a, 1)}${unite}`,
          alt: `Deux colonnes, ${before.label} et ${after.label}. Avec un axe qui commence à ${num(a, 1)}${unite}, la seconde paraît ${num(shown + 1, 1)} fois plus haute que la première ; en réalité, elle est ${num(real + 1, 2)} fois plus grande.`,
        };
        if (chart._viz) LaboCharts.update(chart, data, chartSpec); else LaboCharts.mount(chart, chartSpec, data);
        out('out').textContent = `${num(a, 1)}${unite}`;
        out('reel').textContent = `${signe(real * 100)} %`;
        out('montre').textContent = `${signe(shown * 100, 0)} %`;
        out('facteur').textContent = num(shown / real, 1);
        press(root, 'preset', a);
      };
      input.addEventListener('input', draw);
      root.addEventListener('click', e => {
        const b = e.target.closest('[data-preset]');
        if (b) { input.value = b.dataset.preset; draw(); }
      });
      draw();
    },
  };

  // ---------- Choisir sa période : la tendance d'une fenêtre ----------
  // donnees : { unite, decimales, points: [{ x: 'année', y }] }. Options : debut, fin (années),
  // presets [{ libelle, debut, fin }] ou [{ libelle, pire: n }] (la fenêtre de n ans à la pente la plus basse), uniteTendance.
  MODULES['fenetre-tendance'] = {
    markup(spec, data, id) {
      const years = data.points.map(p => Number(p.x));
      const lo = years[0], hi = years[years.length - 1];
      const range = (key, label, value) => `<div class="interactif__field">
          <label class="label" for="${id}-${key}">${label} <output data-out-${key} for="${id}-${key}"></output></label>
          <input type="range" class="range" id="${id}-${key}" min="${lo}" max="${hi}" step="1" value="${value}" data-${key}>
        </div>`;
      return `<div class="interactif__controls">
          <div class="chip-group" role="group" aria-label="Périodes toutes faites">${(spec.presets || []).map((p, i) => chip('preset', i, p.libelle, false)).join('')}</div>
          <div class="interactif__fields">${range('debut', 'Début', spec.debut ?? lo)}${range('fin', 'Fin', spec.fin ?? hi)}</div>
        </div>
        <div class="viz-host" data-chart></div>
        <p class="interactif__status" data-status aria-live="polite"></p>
        <dl class="interactif__stats">
          ${stat('pente', 'Tendance sur la période choisie')}${stat('ic', 'Intervalle de confiance à 95 %')}${stat('global', `Tendance ${years[0]}-${years[years.length - 1]}`)}
        </dl>`;
    },
    init(root, spec, data) {
      const years = data.points.map(p => Number(p.x)), ys = data.points.map(p => p.y);
      const perDecade = 10, u = spec.uniteTendance || `${data.unite} par décennie`;
      const start = root.querySelector('[data-debut]'), end = root.querySelector('[data-fin]');
      const chart = root.querySelector('[data-chart]');
      const q = sel => root.querySelector(`[data-${sel}]`);
      const fit = (i0, i1) => regression(years.slice(i0, i1 + 1), ys.slice(i0, i1 + 1));
      const all = fit(0, years.length - 1);
      const minLen = 3;

      // La fenêtre de n ans à la pente la plus basse : ce qu'un cueilleur de cerises choisirait
      const worst = n => {
        let best = 0, bestB = Infinity;
        for (let i = 0; i + n - 1 < years.length; i++) { const { b } = fit(i, i + n - 1); if (b < bestB) { bestB = b; best = i; } }
        return [years[best], years[best + n - 1]];
      };
      const presets = (spec.presets || []).map(p => p.pire ? worst(p.pire) : [p.debut ?? years[0], p.fin ?? years[years.length - 1]]);

      const draw = moved => {
        let a = Number(start.value), b = Number(end.value);
        // Au moins trois années : en dessous, une droite passe par tous les points et ne veut rien dire
        if (b - a < minLen - 1) {
          if (moved === 'fin') a = Math.max(years[0], b - minLen + 1); else b = Math.min(years[years.length - 1], a + minLen - 1);
          if (b - a < minLen - 1) a = b - minLen + 1;
          start.value = a; end.value = b;
        }
        const i0 = years.indexOf(a), i1 = years.indexOf(b);
        const r = fit(i0, i1), n = i1 - i0 + 1;
        const chartSpec = {
          type: 'courbe', tendance: true, fenetre: [i0, i1],
          titre: `${spec.titre || ''}, période ${a}-${b} en surbrillance`,
          alt: `Courbe de ${years[0]} à ${years[years.length - 1]}. La période ${a}-${b} est grisée, avec sa propre droite de tendance : ${signe(r.b * perDecade, 2)} ${u}, contre ${signe(all.b * perDecade, 2)} sur toute la série.`,
        };
        if (chart._viz) LaboCharts.update(chart, data, chartSpec); else LaboCharts.mount(chart, chartSpec, data);
        q('out-debut').textContent = a;
        q('out-fin').textContent = b;
        q('pente').textContent = `${signe(r.b * perDecade, 2)} ${u}`;
        q('ic').textContent = `${signe(r.lo * perDecade, 2)} à ${signe(r.hi * perDecade, 2)}`;
        q('global').textContent = `${signe(all.b * perDecade, 2)} ${u}`;
        const verdict = r.b < 0
          ? `Sur ces ${n} ans, la courbe <strong>descend</strong> : de quoi titrer « la planète se refroidit ».`
          : r.b < all.b / 2
            ? `Sur ces ${n} ans, la hausse paraît <strong>presque arrêtée</strong> : de quoi titrer « le réchauffement a fait une pause ».`
            : r.b > all.b * 1.5
              ? `Sur ces ${n} ans, la tendance <strong>monte plus vite</strong> que sur la série complète : de quoi titrer « le réchauffement s'emballe ».`
              : `Sur ces ${n} ans, la tendance <strong>monte</strong>, dans l'ordre de grandeur de la série complète.`;
        const doute = r.lo < 0 && r.hi > 0
          ? ' Mais l\'intervalle de confiance contient zéro : la période est trop courte pour conclure dans un sens ou dans l\'autre.'
          : r.lo > all.b || r.hi < all.b
            ? ' L\'intervalle exclut la tendance de long terme : la période se distingue vraiment, ou bien elle a été choisie pour ça.'
            : ' La tendance de long terme reste dans l\'intervalle de confiance : rien ne distingue vraiment cette période du reste.';
        q('status').innerHTML = verdict + doute;
        root.querySelectorAll('[data-preset]').forEach((btn, k) => btn.setAttribute('aria-pressed', String(presets[k][0] === a && presets[k][1] === b)));
      };
      start.addEventListener('input', () => draw('debut'));
      end.addEventListener('input', () => draw('fin'));
      root.addEventListener('click', e => {
        const btn = e.target.closest('[data-preset]');
        if (!btn) return;
        [start.value, end.value] = presets[Number(btn.dataset.preset)];
        draw();
      });
      draw();
    },
  };

  // ---------- Sondage : au hasard ou dans un échantillon biaisé ----------
  // donnees : { reel, biaise (part du candidat, en %), tailles: [...], candidat, adversaire, methodes: { hasard, biaise } }.
  // Options : tailles (remplace celles des données), seulement ('hasard' : une seule méthode), min, max, pas (axe),
  // duel : { hasard, biaise } (tailles comparées par un bouton dédié).
  MODULES.sondage = {
    markup(spec, data, id) {
      const sizes = spec.tailles || data.tailles;
      const tailles = sizes.map((n, i) => chip('taille', n, n >= 1e6 ? `${num(n / 1e6, 2)} millions` : num(n), i === 1)).join('');
      const methodes = spec.seulement ? '' : `<div class="interactif__option"><p class="label" id="${id}-methode">Qui interroger ?</p>
              <div class="chip-group" role="group" aria-labelledby="${id}-methode">${chip('methode', 'hasard', data.methodes.hasard, true)}${chip('methode', 'biaise', data.methodes.biaise, false)}</div></div>`;
      return `<div class="interactif__controls">
          <div class="interactif__options">
            ${methodes}
            <div class="interactif__option"><p class="label" id="${id}-taille">Combien de réponses ?</p>
              <div class="chip-group" role="group" aria-labelledby="${id}-taille">${tailles}</div></div>
          </div>
          <div class="btn-group">
            <button type="button" class="btn btn--primary" data-run="1">Faire un sondage</button>
            <button type="button" class="btn" data-run="20">Faire 20 sondages</button>
            ${spec.duel ? '<button type="button" class="btn" data-duel>Lancer le duel</button>' : ''}
            <button type="button" class="btn" data-clear>Effacer</button>
          </div>
        </div>
        <p class="interactif__status" data-status aria-live="polite"></p>
        <div class="viz-host" data-chart></div>`;
    },
    init(root, spec, data) {
      const s = { methode: spec.seulement || 'hasard', taille: (spec.tailles || data.tailles)[1], polls: [] };
      const chart = root.querySelector('[data-chart]'), status = root.querySelector('[data-status]');
      const groupes = [
        { id: 'hasard', libelle: data.methodes.hasard, serie: 3 },
        { id: 'biaise', libelle: data.methodes.biaise, serie: 1 },
      ].filter(g => !spec.seulement || g.id === spec.seulement);
      const lancer = (methode, n, fois) => {
        const p = (methode === 'hasard' ? data.reel : data.biaise) / 100;
        for (let k = 0; k < fois; k++) s.polls.push({ methode, n, v: (100 * binomial(n, p)) / n });
        s.polls = s.polls.slice(-400);   // au-delà, les piles deviennent illisibles
      };

      // Nombre de réponses favorables au candidat parmi n, chacune avec la probabilité p.
      // Exact (n tirages) jusqu'à 20 000 réponses ; au-delà, approximation normale de la loi binomiale.
      function binomial(n, p) {
        if (n <= 20000) { let k = 0; for (let i = 0; i < n; i++) if (Math.random() < p) k++; return k; }
        const z = Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
        return Math.round(n * p + z * Math.sqrt(n * p * (1 - p)));
      }

      const draw = () => {
        const chartSpec = {
          type: 'essais', titre: spec.titre, unite: '%', decimales: 1, min: spec.min ?? 25, max: spec.max ?? 80, pas: spec.pas ?? 1,
          alt: `Un point par sondage simulé : ${s.polls.length} sondage${s.polls.length > 1 ? 's' : ''}. Trait d'accent : le vrai résultat, ${num(data.reel, 1)} %. Trait fin : la majorité, 50 %.`,
        };
        const chartData = {
          groupes, valeurs: s.polls.map(p => ({ v: p.v, groupe: p.methode })),
          references: [{ valeur: data.reel, libelle: `Résultat des urnes : ${num(data.reel, 1)} %`, accent: true }, { valeur: 50, libelle: 'Majorité : 50 %' }],
        };
        if (chart._viz) LaboCharts.update(chart, chartData, chartSpec); else LaboCharts.mount(chart, chartSpec, chartData);

        const last = s.polls[s.polls.length - 1];
        if (!last) { status.innerHTML = `Choisissez qui interroger et combien de personnes, puis lancez un sondage. Le vrai score de ${esc(data.candidat)} est de ${num(data.reel, 1)} %.`; return; }
        // Sous 100 réponses, la part mesurée peut toucher 0 ou 100 % et annuler la formule : on prend le pire cas, 50 %
        const pm = last.n < 100 ? 0.5 : last.v / 100;
        const marge = 1.96 * Math.sqrt(pm * (1 - pm) / last.n) * 100;
        const winner = last.v > 50 ? data.candidat : last.v < 50 ? data.adversaire : 'personne, égalité';
        const same = s.polls.filter(p => p.methode === last.methode && p.n === last.n);
        const right = same.filter(p => p.v > 50).length;
        status.innerHTML = `Dernier sondage, ${num(last.n)} réponses : <strong>${esc(data.candidat)} ${num(last.v, 1)} %</strong>, marge d'erreur annoncée ± ${num(marge, marge < 1 ? 2 : 1)} point${marge >= 2 ? 's' : ''}. ` +
          `Vainqueur prédit : <strong>${esc(winner)}</strong>. Erreur réelle : ${signe(last.v - data.reel)} point${Math.abs(last.v - data.reel) >= 2 ? 's' : ''}. ` +
          `Avec ce réglage, ${right} sondage${right > 1 ? 's' : ''} sur ${same.length} désigne${right > 1 ? 'nt' : ''} le bon vainqueur.`;
      };

      root.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.methode) { s.methode = b.dataset.methode; press(root, 'methode', s.methode); return; }
        if (b.dataset.taille) { s.taille = Number(b.dataset.taille); press(root, 'taille', s.taille); return; }
        if (b.matches('[data-clear]')) { s.polls = []; draw(); return; }
        if (b.dataset.run) { lancer(s.methode, s.taille, Number(b.dataset.run)); draw(); return; }
        if (b.matches('[data-duel]')) {
          const { hasard, biaise } = spec.duel;
          s.polls = [];
          lancer('hasard', hasard, 20);
          lancer('biaise', biaise, 20);
          draw();
          const ecart = id => LaboCharts.stats.moyenne(s.polls.filter(p => p.methode === id).map(p => Math.abs(p.v - data.reel)));
          const justes = id => s.polls.filter(p => p.methode === id && p.v > 50).length;
          status.innerHTML = `<strong>${num(hasard)} réponses au hasard</strong> : ${justes('hasard')} sondages sur 20 désignent ${esc(data.candidat)}, erreur moyenne ${num(ecart('hasard'), 1)} points. ` +
            `<strong>${num(biaise)} réponses biaisées</strong> : ${justes('biaise')} sur 20, erreur moyenne ${num(ecart('biaise'), 1)} points.`;
        }
      });
      draw();
    },
  };

  // ---------- Le pari : choisir un camp avant de voir le résultat ----------
  // donnees : { question, options: [{ id, titre, detail, reponse }], unite, decimales, items } (les barres du verdict).
  MODULES.pari = {
    markup(spec, data, id) {
      const options = data.options.map(o => `<button type="button" class="pari__option" data-choix="${esc(o.id)}" aria-pressed="false">
          <span class="pari__titre">${esc(o.titre)}</span><span class="pari__detail">${esc(o.detail)}</span></button>`).join('');
      return `<p class="title-4" id="${id}-q">${esc(data.question)}</p>
        <div class="pari" role="group" aria-labelledby="${id}-q">${options}</div>
        <div class="stack stack--2" aria-live="polite">
          <p class="interactif__status" data-status></p>
          <div class="viz-host" data-chart hidden></div>
        </div>`;
    },
    init(root, spec, data) {
      const chart = root.querySelector('[data-chart]'), status = root.querySelector('[data-status]');
      status.textContent = 'Choisissez un camp : le résultat s\'affiche ensuite.';
      root.addEventListener('click', e => {
        const b = e.target.closest('[data-choix]');
        if (!b) return;
        press(root, 'choix', b.dataset.choix);
        status.textContent = data.options.find(o => o.id === b.dataset.choix).reponse;
        chart.hidden = false;
        if (!chart._viz) LaboCharts.mount(chart, { type: 'barres', titre: spec.titre, alt: spec.alt, max: 100 }, data);
      });
    },
  };

  // ---------- Les deux filtres : de l'électorat aux bulletins renvoyés ----------
  // Cent jetons, chacun pèse 1 %. Carré : le candidat ; triangle : l'adversaire ; contour vide : ne répond pas.
  // donnees : { reel (part du candidat dans l'électorat), candidat, adversaire, presets: [{ libelle, liste, tauxCandidat, tauxAdversaire }] }.
  const JETONS = (() => {
    // Ordre mélangé mais fixe : bouger un curseur ne change que quelques jetons, le reste ne saute pas
    const order = Array.from({ length: 100 }, (_, i) => i);
    let seed = 1936;
    for (let i = 99; i > 0; i--) {
      seed = (seed * 16807) % 2147483647;
      const j = seed % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  })();

  function jeton(cell, sorte, repond) {
    const x = (cell % 10) * 10 + 5, y = Math.floor(cell / 10) * 10 + 5;
    const cls = `tally__jeton tally__jeton--${sorte}${repond ? '' : ' tally__jeton--vide'}`;
    return sorte === 'a'
      ? `<rect x="${x - 3.6}" y="${y - 3.6}" width="7.2" height="7.2" class="${cls}"/>`
      : `<path d="M${x},${y - 4.4} L${x + 4.4},${y + 3.6} L${x - 4.4},${y + 3.6} Z" class="${cls}"/>`;
  }

  // part : part du candidat en %. Taux de réponse facultatifs : sans eux, tout le monde est plein.
  function jetons(part, tauxA, tauxB) {
    const nA = Math.round(part);
    const pleinsA = tauxA === undefined ? nA : Math.round(nA * tauxA / 100);
    const pleinsB = tauxB === undefined ? 100 - nA : Math.round((100 - nA) * tauxB / 100);
    return JETONS.map((cell, rang) => rang < nA ? jeton(cell, 'a', rang < pleinsA) : jeton(cell, 'b', rang - nA < pleinsB)).join('');
  }

  MODULES.filtres = {
    markup(spec, data, id) {
      const range = (key, label, min, max, value) => `<div class="interactif__field">
          <label class="label" for="${id}-${key}">${label} <output data-out-${key} for="${id}-${key}"></output></label>
          <input type="range" class="range" id="${id}-${key}" min="${min}" max="${max}" step="any" value="${value}" data-${key}>
        </div>`;
      const panel = (key, titre) => `<div class="tally__panel">
          <p class="eyebrow">${titre}</p>
          <svg class="tally__svg" viewBox="0 0 100 100" role="img" data-panel-${key}></svg>
          <p class="tally__caption" data-legende-${key}></p>
        </div>`;
      const p = data.presets[0];
      return `<div class="interactif__controls">
          <div class="chip-group" role="group" aria-label="Scénarios">${data.presets.map((x, i) => chip('preset', i, x.libelle, i === 0)).join('')}</div>
          <div class="interactif__fields">
            ${range('liste', `Part de ${esc(data.candidat)} sur la liste`, 30, 80, p.liste)}
            ${range('ta', `Partisans de ${esc(data.candidat)} qui répondent`, 5, 100, p.tauxCandidat)}
            ${range('tb', `Partisans de ${esc(data.adversaire)} qui répondent`, 5, 100, p.tauxAdversaire)}
          </div>
        </div>
        <div class="tally">
          ${panel('electorat', '1. L\'électorat')}${panel('liste', '2. La liste du sondeur')}${panel('retour', '3. Les bulletins renvoyés')}
        </div>
        <p class="tally__legend"><span class="tally__key"><svg viewBox="0 0 10 10" aria-hidden="true"><rect x="1.4" y="1.4" width="7.2" height="7.2" class="tally__jeton tally__jeton--a"/></svg>${esc(data.candidat)}</span>
          <span class="tally__key"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5,0.6 L9.4,8.6 L0.6,8.6 Z" class="tally__jeton tally__jeton--b"/></svg>${esc(data.adversaire)}</span>
          <span class="tally__key"><svg viewBox="0 0 10 10" aria-hidden="true"><rect x="1.4" y="1.4" width="7.2" height="7.2" class="tally__jeton tally__jeton--a tally__jeton--vide"/></svg>Contour vide : ne répond pas</span></p>
        <p class="interactif__status" data-status aria-live="polite"></p>
        <dl class="interactif__stats">
          ${stat('resultat', `${esc(data.candidat)} dans les bulletins`)}${stat('vainqueur', 'Vainqueur annoncé')}${stat('elist', 'Erreur due à la liste')}${stat('eretour', 'Erreur due aux réponses')}
        </dl>`;
    },
    init(root, spec, data) {
      const q = sel => root.querySelector(`[data-${sel}]`);
      const liste = q('liste'), ta = q('ta'), tb = q('tb');
      const c = data.candidat, a = data.adversaire;
      const draw = () => {
        const part = Number(liste.value), rA = Number(ta.value), rB = Number(tb.value);
        const pA = part * rA / 100, pB = (100 - part) * rB / 100;
        const retour = pA + pB, res = 100 * pA / retour;
        const errListe = part - data.reel, errRetour = res - part, err = res - data.reel;

        q('panel-electorat').innerHTML = jetons(data.reel);
        q('panel-electorat').setAttribute('aria-label', `Électorat : ${num(data.reel, 1)} % pour ${c}.`);
        q('panel-liste').innerHTML = jetons(part);
        q('panel-liste').setAttribute('aria-label', `Liste du sondeur : ${num(part, 1)} % pour ${c}.`);
        q('panel-retour').innerHTML = jetons(part, rA, rB);
        q('panel-retour').setAttribute('aria-label', `Bulletins renvoyés : ${num(retour, 0)} % de la liste répond, dont ${num(res, 1)} % pour ${c}.`);
        q('legende-electorat').textContent = `${c} ${num(data.reel, 1)} %`;
        q('legende-liste').textContent = `${c} ${num(part, 1)} %`;
        q('legende-retour').textContent = `${num(retour, 0)} % répondent, dont ${c} ${num(res, 1)} %`;
        q('out-liste').textContent = `${num(part, 1)} %`;
        q('out-ta').textContent = `${num(rA, rA < 100 ? 1 : 0)} %`;
        q('out-tb').textContent = `${num(rB, rB < 100 ? 1 : 0)} %`;
        q('resultat').textContent = `${num(res, 1)} %`;
        q('vainqueur').textContent = res > 50 ? c : res < 50 ? a : 'Égalité';
        q('elist').textContent = `${signe(errListe)} pts`;
        q('eretour').textContent = `${signe(errRetour)} pts`;

        const verdict = Math.abs(err) < 1
          ? `Le sondage tombe juste${retour < 50 ? `, alors que seuls ${num(retour, 0)} % de la liste répondent` : ''}.`
          : res < 50
            ? `Le sondage annonce <strong>${esc(a)}</strong> vainqueur, à ${num(Math.abs(err), 1)} points du vrai score : il se trompe de gagnant.`
            : `Le bon vainqueur, mais à ${num(Math.abs(err), 1)} points du vrai score.`;
        q('status').innerHTML = verdict;
        root.querySelectorAll('[data-preset]').forEach((b, k) => {
          const x = data.presets[k];
          b.setAttribute('aria-pressed', String(Math.abs(x.liste - part) < 0.05 && Math.abs(x.tauxCandidat - rA) < 0.05 && Math.abs(x.tauxAdversaire - rB) < 0.05));
        });
      };
      [liste, ta, tb].forEach(el => el.addEventListener('input', draw));
      root.addEventListener('click', e => {
        const b = e.target.closest('[data-preset]');
        if (!b) return;
        const x = data.presets[Number(b.dataset.preset)];
        liste.value = x.liste; ta.value = x.tauxCandidat; tb.value = x.tauxAdversaire;
        draw();
      });
      draw();
    },
  };

  // ---------- Que vaut ce sondage ? Taille, biais et tirage au hasard équivalent (Meng, 2018) ----------
  // donnees : { population, part, presets: [{ libelle, n, biais }] }. Le biais et la marge sont en points.
  MODULES.qualite = {
    markup(spec, data, id) {
      const p = data.presets[0];
      return `<div class="interactif__controls">
          <div class="chip-group" role="group" aria-label="Exemples">${data.presets.map((x, i) => chip('preset', i, x.libelle, i === 0)).join('')}</div>
          <div class="interactif__fields">
            <div class="interactif__field">
              <label class="label" for="${id}-n">Nombre de réponses <output data-out-n for="${id}-n"></output></label>
              <input type="range" class="range" id="${id}-n" min="2" max="7" step="any" value="${Math.log10(p.n)}" data-n>
            </div>
            <div class="interactif__field">
              <label class="label" for="${id}-biais">Biais <output data-out-biais for="${id}-biais"></output></label>
              <input type="range" class="range" id="${id}-biais" min="0" max="25" step="any" value="${p.biais}" data-biais>
            </div>
          </div>
        </div>
        <div class="viz-host" data-chart></div>
        <p class="interactif__status" data-status aria-live="polite"></p>
        <dl class="interactif__stats">
          ${stat('rho', 'Corrélation réponse-vote nécessaire')}${stat('equiv', 'Vaut un tirage au hasard de')}
        </dl>`;
    },
    init(root, spec, data) {
      const q = sel => root.querySelector(`[data-${sel}]`);
      const sliderN = q('n'), sliderB = q('biais'), chart = q('chart');
      const variance = data.part * (1 - data.part);
      const rond = n => Number(n.toPrecision(3));
      const draw = () => {
        const n = 10 ** Number(sliderN.value), biais = Number(sliderB.value);
        const marge = 196 * Math.sqrt(variance / n);
        const b = biais / 100;
        const rho = b / (Math.sqrt((data.population - n) / n) * Math.sqrt(variance));
        // Erreur quadratique du sondage = biais² + variance / n ; le tirage équivalent a la même erreur quadratique
        const equiv = variance / (b * b + variance / n);
        const items = [{ label: 'Marge d\'erreur annoncée', valeur: marge }, { label: 'Biais', valeur: biais, accent: true }];
        const chartData = { unite: 'pts', decimales: 2, decimalesAxe: 0, items };
        const chartSpec = {
          type: 'barres', titre: spec.titre, max: Math.max(5, marge, biais),
          alt: `Marge annoncée ${num(marge, 2)} points, biais ${num(biais, 2)} points, pour ${num(rond(n))} réponses.`,
        };
        if (chart._viz) LaboCharts.update(chart, chartData, chartSpec); else LaboCharts.mount(chart, chartSpec, chartData);
        q('out-n').textContent = num(rond(n));
        q('out-biais').textContent = `${num(biais, 1)} point${biais >= 2 ? 's' : ''}`;
        q('rho').textContent = biais === 0 ? '0' : num(rho, rho < 0.01 ? 4 : 3);
        const v = Math.max(1, Math.round(equiv));
        q('equiv').textContent = `${num(rond(v))} personne${v > 1 ? 's' : ''}`;
        q('status').innerHTML = biais < marge
          ? `Le biais reste sous la marge d'erreur : le hasard du tirage domine, et interroger plus de monde aide encore.`
          : `Le biais dépasse la marge d'erreur <strong>${num(Math.min(biais / marge, 9999), biais / marge < 10 ? 1 : 0)} fois</strong> : ajouter des réponses ne sert plus à grand-chose.`;
        root.querySelectorAll('[data-preset]').forEach((btn, k) => {
          const x = data.presets[k];
          btn.setAttribute('aria-pressed', String(Math.abs(Math.log10(x.n) - Number(sliderN.value)) < 0.005 && Math.abs(x.biais - biais) < 0.05));
        });
      };
      [sliderN, sliderB].forEach(el => el.addEventListener('input', draw));
      root.addEventListener('click', e => {
        const b = e.target.closest('[data-preset]');
        if (!b) return;
        const x = data.presets[Number(b.dataset.preset)];
        sliderN.value = Math.log10(x.n);
        sliderB.value = x.biais;
        draw();
      });
      draw();
    },
  };

  // ═══════════════════════════════
  //  Montage
  // ═══════════════════════════════

  function markup(spec, index) {
    const mod = MODULES[spec.module];
    const data = spec.donnees ? LABO_DONNEES[spec.donnees] : null;
    if (!mod) { console.error(`Labo data : module interactif inconnu « ${spec.module} ».`); return ''; }
    return `<div class="interactif" data-interactif="${index}">
        ${mod.markup(spec, data, `interactif-${index}`)}
      </div>`;
  }

  function init(root, mounts) {
    root.querySelectorAll('[data-interactif]').forEach(el => {
      const { spec, data } = mounts[Number(el.dataset.interactif)];
      try { MODULES[spec.module].init(el, spec, data); } catch (err) { console.error('Exemple interactif impossible à lancer', spec, err); }
    });
  }

  return { markup, init, has: name => name in MODULES };
})();
