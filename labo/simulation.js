// Labo data : simulation de plusieurs parties de Monopoly jouées en même temps.
// Script classique : expose la globale LaboSim, utilisée par app.js (visuel de type « simulation »).
// Les règles sont celles de la chaîne de Markov décrite dans la fiche (labo/datasets/monopoly-markov.js) :
// une observation = un lancer de dés, la case où le pion finit après ce lancer.

const LaboSim = (() => {
  const CHANCE = [7, 22, 36], CAISSE = [2, 17, 33], JAIL = -1;
  const SPEEDS = { lente: { label: 'Lente', every: 450, rolls: 1 }, rapide: { label: 'Rapide', every: 0, rolls: 1 }, turbo: { label: 'Turbo', every: 0, rolls: 200 } };
  const POLICIES = { payer: 'Payer pour sortir', attendre: 'Tenter les doubles' };
  const SIZES = [1, 4, 9, 16];
  // Paliers du suivi de l'écart : régulièrement espacés sur une échelle logarithmique
  const CHECKPOINTS = [100, 200, 500, 1e3, 2e3, 5e3, 1e4, 2e4, 5e4, 1e5, 2e5, 5e5, 1e6, 2e6, 5e6, 1e7];
  const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const instances = [];

  const die = () => 1 + Math.floor(Math.random() * 6);
  const card = () => Math.floor(Math.random() * 16);

  // Case d'arrivée après les effets de la case : « Allez en prison », cartes Chance et Caisse de communauté
  function resolve(sq) {
    if (sq === 30) return JAIL;
    if (CHANCE.includes(sq)) {
      const c = card();
      return [0, 39, 11, 24, 15, JAIL][c] ?? (c === 6 ? resolve((sq + 37) % 40) : sq);
    }
    if (CAISSE.includes(sq)) return [0, 1, JAIL][card()] ?? sq;
    return sq;
  }

  function newGame() {
    return { pos: 0, doubles: 0, jail: -1, n: 0, counts: new Float64Array(40), dice: null };
  }

  // Un lancer de dés pour une partie, selon la stratégie de sortie de prison
  function roll(g, policy) {
    const a = die(), b = die(), sum = a + b, dbl = a === b;
    g.dice = [a, b];
    const move = (from, nextDoubles) => {
      const dest = resolve((from + sum) % 40);
      if (dest === JAIL) { g.pos = 10; g.jail = 0; g.doubles = 0; } else { g.pos = dest; g.doubles = nextDoubles; }
    };
    if (g.jail >= 0) {
      if (policy === 'payer') { g.jail = -1; move(10, dbl ? 1 : 0); }
      else if (dbl || g.jail === 2) { g.jail = -1; move(10, 0); }   // un double libère, sans rejouer ; au 3e échec on paie
      else g.jail++;
    } else if (dbl && g.doubles === 2) {
      g.pos = 10; g.jail = 0; g.doubles = 0;                        // troisième double : prison
    } else {
      move(g.pos, dbl ? g.doubles + 1 : 0);
    }
    g.counts[g.pos]++;
    g.n++;
  }

  // ---------- Balisage ----------

  const DICE = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  const chip = (attr, value, label, pressed) => `<button type="button" class="chip" data-${attr}="${value}" aria-pressed="${pressed}">${label}</button>`;

  function boardSvg(k) {
    const c = 10;
    const cells = Array.from({ length: 40 }, (_, i) => {
      const [col, row] = cell(i);
      return `<rect x="${col * c + 0.5}" y="${row * c + 0.5}" width="${c - 1}" height="${c - 1}" class="viz__cell" data-cell="${i}"/>`;
    }).join('');
    const [pc, pr] = cell(0);
    return `<svg class="viz sim__board" viewBox="0 0 110 110" role="img" aria-label="Plateau de la partie ${k + 1}">
      ${cells}
      <text x="55" y="50" class="sim__dice" text-anchor="middle" dominant-baseline="middle"></text>
      <text x="55" y="68" class="sim__count" text-anchor="middle" dominant-baseline="middle">0</text>
      <circle cx="${pc * c + c / 2}" cy="${pr * c + c / 2}" r="3.2" class="sim__pawn"/>
    </svg>`;
  }

  function cell(i) {
    if (i <= 10) return [10 - i, 10];
    if (i <= 20) return [0, 10 - (i - 10)];
    if (i <= 30) return [i - 20, 0];
    return [10, i - 30];
  }

  function markup(spec, index) {
    const games = spec.parties || 9;
    return `<div class="sim" data-sim data-sim-index="${index}">
      <div class="sim__controls">
        <div class="btn-group">
          <button type="button" class="btn btn--primary" data-sim-play>Lancer les dés</button>
          <button type="button" class="btn" data-sim-step>Un lancer</button>
          <button type="button" class="btn" data-sim-reset>Remettre à zéro</button>
        </div>
        <div class="sim__options">
          <div class="sim__option"><p class="label" id="sim-vitesse">Vitesse</p>
            <div class="chip-group" role="group" aria-labelledby="sim-vitesse">${Object.entries(SPEEDS).map(([id, s]) => chip('speed', id, s.label, id === 'rapide')).join('')}</div></div>
          <div class="sim__option"><p class="label" id="sim-parties">Parties</p>
            <div class="chip-group" role="group" aria-labelledby="sim-parties">${SIZES.map(n => chip('games', n, n, n === games)).join('')}</div></div>
          <div class="sim__option"><p class="label" id="sim-prison">En prison</p>
            <div class="chip-group" role="group" aria-labelledby="sim-prison">${Object.entries(POLICIES).map(([id, l]) => chip('policy', id, l, id === 'payer')).join('')}</div></div>
        </div>
      </div>
      <p class="sim__status" data-sim-status></p>
      <ol class="sim__boards" data-sim-boards></ol>
      <figure class="lab-figure lab-figure--wide sim__figure">
        <p class="eyebrow">Toutes les parties réunies, case par case</p>
        <div class="viz-host" data-sim-total></div>
        <figcaption class="lab-figure__caption">Colonnes : fréquence observée. Trait horizontal : la probabilité exacte calculée par la chaîne de Markov. Plus on lance, plus les colonnes collent aux traits.</figcaption>
      </figure>
      <figure class="lab-figure sim__figure">
        <p class="eyebrow">Écart moyen entre la simulation et la théorie</p>
        <div class="viz-host" data-sim-gap></div>
        <figcaption class="lab-figure__caption">Écart absolu moyen sur les 40 cases, en points de pourcentage, selon le nombre total de lancers. Chaque fois que l'on multiplie les lancers par 100, l'écart est divisé par 10 environ : c'est la loi en 1/√n.</figcaption>
      </figure>
    </div>`;
  }

  // ---------- Comportement ----------

  function create(root, spec, theory) {
    const s = {
      root, spec, theory, policy: 'payer', speed: 'rapide', size: spec.parties || 9,
      games: [], playing: false, raf: 0, timer: 0, gap: [], lastDraw: 0, n: 0, nextCp: 0,
      boardsEl: root.querySelector('[data-sim-boards]'), statusEl: root.querySelector('[data-sim-status]'),
      totalEl: root.querySelector('[data-sim-total]'), gapEl: root.querySelector('[data-sim-gap]'),
      playBtn: root.querySelector('[data-sim-play]'),
    };
    const labels = theory.payer.items.map(i => i.label);

    function buildBoards() {
      s.games = Array.from({ length: s.size }, newGame);
      s.gap = [];
      s.n = 0;
      s.nextCp = 0;
      // Plateaux en carré : 3 × 3 pour 9 parties, 4 × 4 pour 16
      s.boardsEl.style.setProperty('--sim-cols', Math.ceil(Math.sqrt(s.size)));
      s.boardsEl.innerHTML = s.games.map((_, k) => `<li class="sim__game">${boardSvg(k)}<p class="sim__caption"><span class="folio">${String(k + 1).padStart(2, '0')}</span> <span data-sim-top>Pas encore lancé</span></p></li>`).join('');
      s.boardEls = [...s.boardsEl.querySelectorAll('.sim__game')].map(li => ({
        cells: [...li.querySelectorAll('[data-cell]')], pawn: li.querySelector('.sim__pawn'),
        dice: li.querySelector('.sim__dice'), count: li.querySelector('.sim__count'), top: li.querySelector('[data-sim-top]'),
      }));
      render(true);
    }

    const total = () => s.n;

    function aggregate() {
      const counts = new Float64Array(40);
      s.games.forEach(g => g.counts.forEach((v, i) => { counts[i] += v; }));
      return counts;
    }

    const gapOf = (freq, exp) => freq.reduce((acc, f, i) => acc + Math.abs(f - exp[i].valeur), 0) / 40;

    // Un lancer pour chaque partie. L'écart est relevé au lancer près où le total franchit un palier,
    // même en turbo où des milliers de lancers passent entre deux images.
    function rollAll() {
      s.games.forEach(g => roll(g, s.policy));
      s.n += s.size;
      const cp = CHECKPOINTS[s.nextCp];
      if (cp && s.n >= cp) {
        s.nextCp++;
        const counts = aggregate();
        const freq = Array.from(counts, v => (100 * v) / s.n);
        s.gap.push({ x: cp >= 1e6 ? `${cp / 1e6} M` : cp >= 1e3 ? `${cp / 1e3} k` : String(cp), y: gapOf(freq, theory[s.policy].items) });
      }
    }

    function render(force) {
      const now = performance.now();
      if (!force && now - s.lastDraw < 120) return;
      s.lastDraw = now;
      const n = total();
      const counts = aggregate();
      const freq = Array.from(counts, v => (n ? (100 * v) / n : 0));

      s.games.forEach((g, k) => {
        const el = s.boardEls[k];
        // Intensité relative à la case la plus visitée hors prison : la prison sature, les autres restent lisibles
        const ref = Math.max(1, ...Array.from(g.counts).filter((_, i) => i !== 10));
        el.cells.forEach((rect, i) => {
          const t = Math.min(g.counts[i] / ref, 1);
          rect.style.fill = i === 10 && g.counts[10] > ref
            ? 'var(--color-data-1)'
            : `color-mix(in oklab, var(--color-data-3) ${Math.round(6 + t * 84)}%, var(--color-bg))`;
        });
        const [col, row] = cell(g.pos);
        el.pawn.setAttribute('cx', col * 10 + 5);
        el.pawn.setAttribute('cy', row * 10 + 5);
        el.dice.textContent = g.dice ? `${DICE[g.dice[0]]}${DICE[g.dice[1]]}` : '';
        el.count.textContent = LaboCharts.num(g.n);
        if (g.n) {
          let best = 0;
          g.counts.forEach((v, i) => { if (v > g.counts[best]) best = i; });
          el.top.textContent = `Plus visitée : ${labels[best]} (${LaboCharts.num((100 * g.counts[best]) / g.n, 1)} %)`;
        } else el.top.textContent = 'Pas encore lancé';
      });

      const exp = theory[s.policy];
      const items = exp.items.map((it, i) => ({ label: it.label, valeur: freq[i], theorie: it.valeur, accent: i === 10 }));
      LaboCharts.update(s.totalEl, { unite: '%', decimales: 2, decimalesAxe: 0, items }, { ...s.totalSpec, max: s.policy === 'payer' ? 8 : 14 });
      if (s.gap.length) {
        const gapData = { unite: 'pt', decimales: 2, points: s.gap };
        if (s.gapEl._viz) LaboCharts.update(s.gapEl, gapData, s.gapSpec); else LaboCharts.mount(s.gapEl, s.gapSpec, gapData);
      } else if (s.gapEl._viz || !s.gapEl.firstChild) {
        s.gapEl._viz = null;
        s.gapEl.innerHTML = '<p class="empty">La courbe apparaît après 100 lancers.</p>';
      }

      const gapNow = n ? gapOf(freq, exp.items) : 0;
      s.statusEl.innerHTML = n
        ? `<strong>${LaboCharts.num(n)}</strong> lancers sur ${s.size} partie${s.size > 1 ? 's' : ''} · prison : <strong>${LaboCharts.num(freq[10], 2)} %</strong> (théorie ${LaboCharts.num(exp.items[10].valeur, 2)} %) · écart moyen à la théorie : <strong>${LaboCharts.num(gapNow, 2)} point</strong>`
        : `${s.size} partie${s.size > 1 ? 's' : ''} prête${s.size > 1 ? 's' : ''}, tous les pions sur Départ. Lancez les dés.`;
    }

    function tick() {
      const sp = SPEEDS[s.speed];
      for (let r = 0; r < sp.rolls; r++) rollAll();
      render(sp.every > 0);
    }

    function loop() {
      if (!s.playing) return;
      tick();
      const sp = SPEEDS[s.speed];
      if (sp.every) s.timer = setTimeout(() => { s.raf = requestAnimationFrame(loop); }, sp.every);
      else s.raf = requestAnimationFrame(loop);
    }

    function stop() {
      s.playing = false;
      cancelAnimationFrame(s.raf);
      clearTimeout(s.timer);
      s.playBtn.textContent = total() ? 'Reprendre' : 'Lancer les dés';
      s.playBtn.setAttribute('aria-pressed', 'false');
      render(true);
    }

    function play() {
      s.playing = true;
      s.playBtn.textContent = 'Pause';
      s.playBtn.setAttribute('aria-pressed', 'true');
      loop();
    }

    s.totalSpec = { type: 'colonnes', titre: 'Fréquence observée de chaque case, toutes parties réunies', alt: 'Colonnes pour les 40 cases, avec un trait pour la probabilité exacte de chaque case.' };
    s.gapSpec = { type: 'courbe', titre: 'Écart moyen à la théorie selon le nombre de lancers', alt: 'Courbe décroissante : l\'écart entre la simulation et la théorie diminue quand le nombre de lancers augmente.' };
    LaboCharts.mount(s.totalEl, s.totalSpec, { unite: '%', items: theory.payer.items.map(i => ({ label: i.label, valeur: 0 })) });

    const press = (attr, value) => root.querySelectorAll(`[data-${attr}]`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset[attr] === String(value))));

    root.addEventListener('click', e => {
      const t = e.target.closest('button');
      if (!t) return;
      if (t.matches('[data-sim-play]')) { s.playing ? stop() : play(); return; }
      if (t.matches('[data-sim-step]')) { if (s.playing) stop(); rollAll(); render(true); return; }
      if (t.matches('[data-sim-reset]')) { const was = s.playing; stop(); buildBoards(); if (was) play(); else stop(); return; }
      if (t.dataset.speed) { s.speed = t.dataset.speed; press('speed', s.speed); if (s.playing) { stop(); play(); } return; }
      if (t.dataset.games) {
        s.size = Number(t.dataset.games); press('games', s.size);
        const was = s.playing; stop(); buildBoards(); if (was) play(); else stop();
        return;
      }
      if (t.dataset.policy) {
        // Changer de règle invalide les compteurs : on repart de zéro pour comparer à la bonne théorie
        s.policy = t.dataset.policy; press('policy', s.policy);
        const was = s.playing; stop(); buildBoards(); if (was) play(); else stop();
      }
    });

    buildBoards();
    stop();
    // Mouvement réduit : pas de démarrage automatique, l'animation se lance seulement à la demande
    if (spec.autoplay && !reduceMotion()) play();
    return { stop };
  }

  function init(root, mounts) {
    root.querySelectorAll('[data-sim]').forEach(el => {
      const { spec } = mounts[Number(el.dataset.simIndex)];
      const theory = { payer: LABO_DONNEES[spec.donnees], attendre: LABO_DONNEES[spec.attendre] };
      if (!theory.payer || !theory.attendre) { console.error('Labo data : données de simulation introuvables', spec); return; }
      instances.push(create(el, spec, theory));
    });
  }

  function reset() {
    instances.splice(0).forEach(i => i.stop());
  }

  return { markup, init, reset };
})();
