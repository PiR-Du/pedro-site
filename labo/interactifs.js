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
  MODULES.sondage = {
    markup(spec, data) {
      const tailles = data.tailles.map((n, i) => chip('taille', n, n >= 1e6 ? `${num(n / 1e6, 2)} millions` : num(n), i === 1)).join('');
      return `<div class="interactif__controls">
          <div class="interactif__options">
            <div class="interactif__option"><p class="label" id="sondage-methode">Qui interroger ?</p>
              <div class="chip-group" role="group" aria-labelledby="sondage-methode">${chip('methode', 'hasard', data.methodes.hasard, true)}${chip('methode', 'biaise', data.methodes.biaise, false)}</div></div>
            <div class="interactif__option"><p class="label" id="sondage-taille">Combien de réponses ?</p>
              <div class="chip-group" role="group" aria-labelledby="sondage-taille">${tailles}</div></div>
          </div>
          <div class="btn-group">
            <button type="button" class="btn btn--primary" data-run="1">Faire un sondage</button>
            <button type="button" class="btn" data-run="20">Faire 20 sondages</button>
            <button type="button" class="btn" data-clear>Effacer</button>
          </div>
        </div>
        <p class="interactif__status" data-status aria-live="polite"></p>
        <div class="viz-host" data-chart></div>`;
    },
    init(root, spec, data) {
      const s = { methode: 'hasard', taille: data.tailles[1], polls: [] };
      const chart = root.querySelector('[data-chart]'), status = root.querySelector('[data-status]');
      const groupes = [
        { id: 'hasard', libelle: data.methodes.hasard, serie: 3 },
        { id: 'biaise', libelle: data.methodes.biaise, serie: 1 },
      ];

      // Nombre de réponses favorables au candidat parmi n, chacune avec la probabilité p.
      // Exact (n tirages) jusqu'à 20 000 réponses ; au-delà, approximation normale de la loi binomiale.
      function binomial(n, p) {
        if (n <= 20000) { let k = 0; for (let i = 0; i < n; i++) if (Math.random() < p) k++; return k; }
        const z = Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
        return Math.round(n * p + z * Math.sqrt(n * p * (1 - p)));
      }

      const draw = () => {
        const chartSpec = {
          type: 'essais', titre: spec.titre, unite: '%', decimales: 1, min: 25, max: 80, pas: 1,
          alt: `Un point par sondage simulé : ${s.polls.length} sondage${s.polls.length > 1 ? 's' : ''}. Trait d'accent : le vrai résultat, ${num(data.reel, 1)} %. Trait fin : la majorité, 50 %.`,
        };
        const chartData = {
          groupes, valeurs: s.polls.map(p => ({ v: p.v, groupe: p.methode })),
          references: [{ valeur: data.reel, libelle: `Résultat des urnes : ${num(data.reel, 1)} %`, accent: true }, { valeur: 50, libelle: 'Majorité : 50 %' }],
        };
        if (chart._viz) LaboCharts.update(chart, chartData, chartSpec); else LaboCharts.mount(chart, chartSpec, chartData);

        const last = s.polls[s.polls.length - 1];
        if (!last) { status.innerHTML = `Choisissez qui interroger et combien de personnes, puis lancez un sondage. Le vrai score de ${esc(data.candidat)} est de ${num(data.reel, 1)} %.`; return; }
        const marge = 1.96 * Math.sqrt((last.v / 100) * (1 - last.v / 100) / last.n) * 100;
        const winner = last.v > 50 ? data.candidat : data.adversaire;
        const same = s.polls.filter(p => p.methode === last.methode && p.n === last.n);
        const right = same.filter(p => p.v > 50).length;
        status.innerHTML = `Dernier sondage, ${num(last.n)} réponses : <strong>${esc(data.candidat)} ${num(last.v, 1)} %</strong>, marge d'erreur annoncée ± ${num(marge, marge < 1 ? 2 : 1)} point. ` +
          `Vainqueur prédit : <strong>${esc(winner)}</strong>. Erreur réelle : ${signe(last.v - data.reel)} point${Math.abs(last.v - data.reel) >= 2 ? 's' : ''}. ` +
          `Avec ce réglage, ${right} sondage${right > 1 ? 's' : ''} sur ${same.length} désigne${right > 1 ? 'nt' : ''} le bon vainqueur.`;
      };

      root.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.methode) { s.methode = b.dataset.methode; press(root, 'methode', s.methode); return; }
        if (b.dataset.taille) { s.taille = Number(b.dataset.taille); press(root, 'taille', s.taille); return; }
        if (b.matches('[data-clear]')) { s.polls = []; draw(); return; }
        if (b.dataset.run) {
          const p = (s.methode === 'hasard' ? data.reel : data.biaise) / 100;
          for (let k = 0; k < Number(b.dataset.run); k++) s.polls.push({ methode: s.methode, n: s.taille, v: (100 * binomial(s.taille, p)) / s.taille });
          s.polls = s.polls.slice(-400);   // au-delà, les piles deviennent illisibles
          draw();
        }
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
