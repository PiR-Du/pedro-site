// ============================================================
// ÉTAT
// ============================================================
// Chaque joueur porte une série de données (1 à 8), définie dans css/tokens.css.
const SERIES_NAMES = ['Rouge', 'Encre', 'Bleu', 'Vert', 'Ocre', 'Gris', 'Prune', 'Sarcelle'];
// Couleurs des parties enregistrées avant la refonte, converties vers une série.
const LEGACY_COLORS = ['#7c3aed', '#2563eb', '#059669', '#dc2626', '#d97706', '#db2777', '#0891b2', '#65a30d'];

let state = {
  currentGame: null,
  history: JSON.parse(localStorage.getItem('boardnight_history') || '[]'),
  setupPlayers: [],
  avatarEditIdx: null,
  pendingSeries: null,
  activeChart: null,
  chartMode: 'line',
};

// ============================================================
// UTILITAIRES
// ============================================================
function seriesOf(player, fallbackIdx = 0) {
  if (player.series) return player.series;
  const legacy = LEGACY_COLORS.indexOf(player.color);
  return ((legacy >= 0 ? legacy : (player.idx ?? fallbackIdx)) % 8) + 1;
}

function avatarHtml(player, fallbackIdx = 0) {
  const initial = (player.name || '?').trim().charAt(0) || '?';
  return `<span class="avatar swatch--${seriesOf(player, fallbackIdx)}" aria-hidden="true">${escapeHtml(initial)}</span>`;
}

function playerCell(player, fallbackIdx = 0) {
  return `<span class="player-cell">${avatarHtml(player, fallbackIdx)}${escapeHtml(player.name)}</span>`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR');
}

function plural(n, word) {
  return `${n} ${word}${n > 1 ? 's' : ''}`;
}

function showView(v) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('is-active'));
  const view = document.getElementById('view-' + v);
  view.classList.add('is-active');
  if (v === 'welcome') renderWelcome();
  if (v === 'history') renderHistory();
  if (v === 'game') {
    document.getElementById('game-display-name').textContent = state.currentGame.name;
    updateRoundInfo(); renderLeaderboard(); renderScoreInputs(); renderRoundHistory(); renderChart(); renderLiveStats();
  }
  if (v === 'awards') renderAwards();
  window.scrollTo(0, 0);
  // Le titre de la vue reçoit le focus : le changement est annoncé aux lecteurs d'écran
  view.querySelector('.view__title')?.focus({ preventScroll: true });
}

function toast(msg, type = 'default', dur = 2800) {
  showToast(msg, type === 'error' ? 'error' : 'default', dur);
}

function saveHistory() { localStorage.setItem('boardnight_history', JSON.stringify(state.history)); }
function saveCurrentGame() {
  if (state.currentGame) localStorage.setItem('boardnight_current', JSON.stringify(state.currentGame));
  else localStorage.removeItem('boardnight_current');
}

// ============================================================
// CONFIRMATION
// ============================================================
function showConfirm(msg, onConfirm, confirmLabel = 'Confirmer', danger = false) {
  const dialog = document.getElementById('confirm-overlay');
  document.getElementById('confirm-msg').textContent = msg;
  const btn = document.getElementById('confirm-ok');
  btn.textContent = confirmLabel;
  btn.className = 'btn ' + (danger ? 'btn--danger' : 'btn--primary');
  btn.onclick = () => { dialog.close(); onConfirm(); };
  dialog.showModal();
}

// ============================================================
// ACCUEIL
// ============================================================
function gameRow(g, idx) {
  const top3 = (g.finalRanked || []).slice(0, 3);
  return `
    <li class="result">
      <span class="eyebrow">${formatDate(g.date)}</span>
      <h3 class="result__title"><button type="button" class="entry__link" data-action="review" data-index="${idx}">${escapeHtml(g.name)}</button></h3>
      <p class="result__body">${top3.map((p, r) => `${r + 1}. ${escapeHtml(p.name)} ${p.total}`).join(' · ')}</p>
      <span class="eyebrow result__meta">${plural(g.players?.length || 0, 'joueur')} · ${plural(g.rounds?.length || 0, 'manche')}</span>
    </li>`;
}

function renderWelcome() {
  const list = document.getElementById('recent-games-list');
  list.innerHTML = state.history.length
    ? state.history.slice(-5).reverse().map((g, i) => gameRow(g, state.history.length - 1 - i)).join('')
    : '<li class="empty">Aucune partie enregistrée pour le moment.</li>';
}

// ============================================================
// CONFIGURATION
// ============================================================
function initSetup() {
  // Reprend les joueurs de la dernière partie
  const last = state.history[state.history.length - 1];
  if (last && last.players && last.players.length >= 2) {
    state.setupPlayers = last.players.map((p, i) => ({ name: p.name, series: seriesOf(p, i) }));
  } else {
    state.setupPlayers = [{ name: 'Joueur 1', series: 1 }, { name: 'Joueur 2', series: 3 }];
  }
  renderSetupPlayers();
}

function renderSetupPlayers() {
  const list = document.getElementById('player-list');
  list.innerHTML = state.setupPlayers.map((p, i) => `
    <div class="player-row">
      <button type="button" class="avatar swatch--${p.series}" data-action="pick-color" data-index="${i}" aria-label="Changer la couleur de ${escapeHtml(p.name)}, actuellement ${SERIES_NAMES[p.series - 1]}">${escapeHtml(p.name.trim().charAt(0) || '?')}</button>
      <input class="input" type="text" value="${escapeHtml(p.name)}" placeholder="Nom du joueur" aria-label="Nom du joueur ${i + 1}" data-index="${i}">
      <button type="button" class="btn btn--quiet btn--sm" data-action="remove-player" data-index="${i}">Retirer<span class="sr-only"> ${escapeHtml(p.name)}</span></button>
    </div>`).join('');
  document.getElementById('add-player-btn').hidden = state.setupPlayers.length >= 8;
}

function addPlayerRow() {
  if (state.setupPlayers.length >= 8) return;
  const i = state.setupPlayers.length;
  const used = state.setupPlayers.map(p => p.series);
  const free = [1, 3, 4, 5, 7, 8, 2, 6].find(s => !used.includes(s)) || (i % 8) + 1;
  state.setupPlayers.push({ name: `Joueur ${i + 1}`, series: free });
  renderSetupPlayers();
  document.querySelector(`#player-list .input[data-index="${i}"]`)?.select();
}

function removePlayer(i) {
  if (state.setupPlayers.length <= 2) { toast('Il faut au moins 2 joueurs.', 'error'); return; }
  state.setupPlayers.splice(i, 1);
  renderSetupPlayers();
}

function startGame() {
  const names = state.setupPlayers.map(p => p.name.trim()).filter(Boolean);
  if (names.length < 2) { toast('Ajoutez au moins 2 joueurs.', 'error'); return; }
  const gameName = document.getElementById('game-name-input').value.trim() || 'Soirée Jeux';
  const direction = document.getElementById('score-direction').value;

  state.currentGame = {
    id: Date.now(),
    name: gameName,
    direction,
    date: new Date().toISOString(),
    players: state.setupPlayers.map((p, i) => ({ ...p, name: p.name.trim() || `Joueur ${i + 1}` })),
    rounds: [],
    currentRound: 1,
  };

  saveCurrentGame();
  showView('game');
}

// ============================================================
// COULEUR DU JOUEUR
// ============================================================
function openAvatarModal(i) {
  state.avatarEditIdx = i;
  state.pendingSeries = state.setupPlayers[i].series;
  document.getElementById('color-picker').innerHTML = SERIES_NAMES.map((name, si) => `
    <button type="button" class="color-picker__option" data-action="select-color" data-series="${si + 1}" aria-pressed="${si + 1 === state.pendingSeries}">
      <span class="swatch swatch--${si + 1}"></span>${name}
    </button>`).join('');
  document.getElementById('avatar-modal').showModal();
}

function selectColor(el) {
  state.pendingSeries = Number(el.dataset.series);
  document.querySelectorAll('.color-picker__option').forEach(o => o.setAttribute('aria-pressed', String(o === el)));
}

function confirmAvatar() {
  state.setupPlayers[state.avatarEditIdx].series = state.pendingSeries;
  document.getElementById('avatar-modal').close();
  renderSetupPlayers();
}

// ============================================================
// PARTIE
// ============================================================
function updateRoundInfo() {
  const g = state.currentGame;
  document.getElementById('round-info').textContent = `Manche ${g.currentRound} en cours · ${plural(g.rounds.length, 'manche')} terminée${g.rounds.length > 1 ? 's' : ''}`;
  document.getElementById('current-round-num').textContent = g.currentRound;
}

function renderLeaderboard() {
  const g = state.currentGame; if (!g) return;
  const ranked = getRanked(g);
  const leaderTotal = ranked[0].total;
  document.getElementById('leaderboard').innerHTML = ranked.map((p, rank) => {
    const prev = g.rounds.length > 1 ? getPrevRank(g, p.idx) : rank + 1;
    const delta = prev - (rank + 1);
    const trend = [];
    if (rank > 0 && g.rounds.length > 0) {
      const gap = g.direction === 'high' ? leaderTotal - p.total : p.total - leaderTotal;
      trend.push(`écart ${gap}`);
    }
    if (g.rounds.length > 1 && delta !== 0) trend.push(delta > 0 ? `+${delta} place${delta > 1 ? 's' : ''}` : `−${Math.abs(delta)} place${delta < -1 ? 's' : ''}`);
    return `
      <li class="standing${rank === 0 ? ' standing--leader' : ''}">
        <span class="folio">${rank + 1}</span>
        ${avatarHtml(p)}
        <span class="standing__name">${escapeHtml(p.name)}</span>
        <span class="standing__trend">${trend.join(' · ')}</span>
        <span class="standing__score">${p.total}</span>
      </li>`;
  }).join('');
}

function renderScoreInputs() {
  const g = state.currentGame; if (!g) return;
  document.getElementById('score-inputs').innerHTML = g.players.map((p, i) => `
    <div class="score-row">
      ${avatarHtml(p, i)}
      <label class="score-row__name" for="score-${i}">${escapeHtml(p.name)}</label>
      <div class="stepper">
        <button type="button" class="stepper__btn" data-step="-1" data-index="${i}" aria-label="Retirer 1 point à ${escapeHtml(p.name)}">−</button>
        <button type="button" class="stepper__btn" data-step="1" data-index="${i}" aria-label="Ajouter 1 point à ${escapeHtml(p.name)}">+</button>
      </div>
      <input class="input" type="number" inputmode="numeric" id="score-${i}" value="0" data-index="${i}">
    </div>`).join('');

  document.getElementById('copy-last-round-btn').hidden = g.rounds.length === 0;
}

function copyLastRound() {
  const g = state.currentGame; if (!g || !g.rounds.length) return;
  const last = g.rounds[g.rounds.length - 1];
  g.players.forEach((_, i) => { document.getElementById('score-' + i).value = last[i] ?? 0; });
  toast('Scores copiés depuis la manche précédente.');
}

function submitRound() {
  const g = state.currentGame; if (!g) return;
  const scores = g.players.map((_, i) => parseInt(document.getElementById('score-' + i).value) || 0);
  g.rounds.push(scores);
  g.currentRound++;
  saveCurrentGame();
  updateRoundInfo();
  renderLeaderboard();
  renderRoundHistory();
  renderChart();
  renderLiveStats();
  g.players.forEach((_, i) => { document.getElementById('score-' + i).value = 0; });
  document.getElementById('copy-last-round-btn').hidden = false;
  // Le premier champ reprend le focus pour enchaîner la manche suivante
  document.getElementById('score-0')?.focus();

  checkDramaticMoments(g);
  toast(`Manche ${g.currentRound - 1} enregistrée.`, 'success');
}

function undoLastRound() {
  const g = state.currentGame;
  if (!g || !g.rounds.length) { toast('Aucune manche à annuler.'); return; }
  showConfirm(
    `Annuler la manche ${g.rounds.length} ? Les scores seront perdus.`,
    () => {
      g.rounds.pop();
      g.currentRound--;
      saveCurrentGame();
      updateRoundInfo();
      renderLeaderboard();
      renderRoundHistory();
      renderChart();
      renderLiveStats();
      document.getElementById('copy-last-round-btn').hidden = g.rounds.length === 0;
      toast('Manche annulée.');
    },
    'Annuler la manche',
    true
  );
}

function renderRoundHistory() {
  const g = state.currentGame; if (!g) return;
  const wrap = document.getElementById('round-history-wrap');
  if (!g.rounds.length) {
    wrap.innerHTML = '<p class="empty">Aucune manche pour le moment.</p>';
    return;
  }
  const totals = getTotals(g);
  // Meilleur score de chaque manche
  const roundBests = g.rounds.map(r => g.direction === 'high' ? Math.max(...r) : Math.min(...r));
  wrap.innerHTML = `<table class="score-table">
    <thead>
      <tr>
        <th scope="col">Joueur</th>
        ${g.rounds.map((_, i) => `<th scope="col">M${i + 1}</th>`).join('')}
        <th scope="col">Total</th>
      </tr>
    </thead>
    <tbody>
      ${g.players.map((p, pi) => `
        <tr>
          <th scope="row">${playerCell(p, pi)}</th>
          ${g.rounds.map((r, ri) => {
            const val = r[pi] ?? 0;
            return `<td><button type="button" class="score-table__cell${val === roundBests[ri] ? ' is-best' : ''}" data-action="edit-cell" data-player="${pi}" data-round="${ri}" aria-label="${escapeHtml(p.name)}, manche ${ri + 1} : ${val}. Corriger">${val}</button></td>`;
          }).join('')}
          <td class="score-table__total">${totals.find(t => t.idx === pi)?.total ?? 0}</td>
        </tr>`).join('')}
    </tbody>
  </table>`;
}

function editCell(playerIdx, roundIdx, trigger) {
  const g = state.currentGame; if (!g) return;
  const cell = trigger.closest('td');
  const cur = g.rounds[roundIdx][playerIdx] ?? 0;
  cell.innerHTML = `<input class="input" type="number" inputmode="numeric" value="${cur}" aria-label="Nouveau score">`;
  const input = cell.querySelector('input');
  let cancelled = false;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') { cancelled = true; input.blur(); }
  });
  input.addEventListener('blur', () => {
    if (!cancelled) g.rounds[roundIdx][playerIdx] = parseInt(input.value) || 0;
    saveCurrentGame();
    renderRoundHistory();
    renderLeaderboard();
    renderChart();
    renderLiveStats();
  });
  input.select();
}

// ============================================================
// STATISTIQUES EN DIRECT
// ============================================================
function renderLiveStats() {
  const g = state.currentGame; if (!g) return;
  const panel = document.getElementById('live-stats-grid');
  if (!panel) return;

  if (!g.rounds.length) {
    panel.innerHTML = '<p class="empty">Jouez une manche pour voir les statistiques.</p>';
    return;
  }

  const totals = getTotals(g);
  const ranked = getRanked(g);
  const n = g.players.length;
  const nRounds = g.rounds.length;

  const leader = ranked[0];
  const second = ranked[1];
  const gap = Math.abs(leader.total - second.total);

  // Manches remportées (meilleur score de la manche)
  const roundWins = Array(n).fill(0);
  g.rounds.forEach(r => {
    const best = g.direction === 'high' ? Math.max(...r) : Math.min(...r);
    r.forEach((v, i) => { if (v === best) roundWins[i]++; });
  });
  const topWinner = totals.reduce((a, b) => roundWins[a.idx] >= roundWins[b.idx] ? a : b);

  // Le plus régulier (variance la plus basse)
  const variances = totals.map(p => ({ ...p, v: variance(p.perRound) }));
  const mostConsistent = variances.reduce((a, b) => a.v <= b.v ? a : b);

  // Élan : 2 dernières manches comparées aux 2 précédentes
  let momentum = null;
  if (nRounds >= 4) {
    const momScores = totals.map(p => {
      const last2 = p.perRound.slice(-2).reduce((a, b) => a + b, 0);
      const prev2 = p.perRound.slice(-4, -2).reduce((a, b) => a + b, 0);
      return { ...p, mom: last2 - prev2 };
    });
    momentum = momScores.reduce((a, b) => (g.direction === 'high' ? a.mom >= b.mom : a.mom <= b.mom) ? a : b);
  }

  // Série de manches gagnées en cours
  let streak = 0; let streakPlayer = null;
  for (let ri = nRounds - 1; ri >= 0; ri--) {
    const r = g.rounds[ri];
    const best = g.direction === 'high' ? Math.max(...r) : Math.min(...r);
    const winnerIdx = r.indexOf(best);
    if (streak === 0) { streak = 1; streakPlayer = winnerIdx; }
    else if (winnerIdx === streakPlayer) streak++;
    else break;
  }

  // Remontée : places gagnées depuis la première manche
  let biggestClimber = null;
  if (nRounds >= 2) {
    const afterR1 = g.players.map((_, i) => g.rounds[0][i]);
    const sortedR1 = [...afterR1].sort((a, b) => g.direction === 'high' ? b - a : a - b);
    const initialRanks = afterR1.map(v => sortedR1.indexOf(v) + 1);
    const climbers = ranked.map((p, currentRank) => ({ ...p, gain: initialRanks[p.idx] - (currentRank + 1) }));
    biggestClimber = climbers.reduce((a, b) => a.gain >= b.gain ? a : b);
  }

  const stats = [
    { label: 'En tête', value: leader.name, sub: leader.total + ' pts' },
    { label: 'Écart avec le 2e', value: gap + ' pts', sub: second.name + ' à ' + second.total },
    { label: 'Manches remportées', value: topWinner.name, sub: roundWins[topWinner.idx] + ' sur ' + nRounds },
    { label: 'Plus régulier', value: mostConsistent.name, sub: 'variance ' + Math.round(mostConsistent.v) },
  ];

  if (streak >= 2 && streakPlayer !== null) {
    stats.push({ label: 'Série en cours', value: g.players[streakPlayer].name, sub: streak + " manches d'affilée" });
  }
  if (momentum && nRounds >= 4) {
    stats.push({ label: 'Élan', value: momentum.name, sub: (momentum.mom > 0 ? '+' : '') + momentum.mom + ' sur les 2 dernières' });
  }
  if (biggestClimber && biggestClimber.gain > 0) {
    stats.push({ label: 'Remontée', value: biggestClimber.name, sub: '+' + plural(biggestClimber.gain, 'place') });
  }

  panel.innerHTML = `<dl class="spec">${stats.map(s => `
    <dt class="spec__term">${s.label}</dt>
    <dd class="spec__value"><strong>${escapeHtml(s.value)}</strong> <span class="muted">${escapeHtml(s.sub)}</span></dd>`).join('')}</dl>`;
}

// ============================================================
// GRAPHIQUE
// ============================================================
function renderChart() {
  const g = state.currentGame; if (!g) return;
  const noData = document.getElementById('chart-no-data');
  const wrap = document.getElementById('chart-wrap');
  const canvas = document.getElementById('main-chart');
  if (state.activeChart) { state.activeChart.destroy(); state.activeChart = null; }
  const hasData = g.rounds.length > 0 && typeof Chart !== 'undefined';
  noData.hidden = hasData;
  wrap.hidden = !hasData;
  if (!hasData) return;

  const labels = g.rounds.map((_, i) => `M${i + 1}`);
  const mode = state.chartMode;
  const colors = g.players.map((p, i) => cssColor(`--color-data-${seriesOf(p, i)}`));
  const partialTotals = ri => g.players.map((_, i) => g.rounds.slice(0, ri + 1).reduce((s, r) => s + (r[i] ?? 0), 0));
  const lineSet = (p, pi, data) => ({
    label: p.name, data,
    borderColor: colors[pi], backgroundColor: colors[pi],
    tension: 0, fill: false, pointStyle: 'rect', pointRadius: 4, borderWidth: 2,
  });

  let type = 'line';
  let datasets;
  let options = chartOptions();

  if (mode === 'line') {
    datasets = g.players.map((p, pi) => {
      let cum = 0;
      return lineSet(p, pi, g.rounds.map(r => { cum += r[pi] ?? 0; return cum; }));
    });
  } else if (mode === 'bar') {
    type = 'bar';
    datasets = g.players.map((p, pi) => ({
      label: p.name, data: g.rounds.map(r => r[pi] ?? 0),
      backgroundColor: colors[pi], borderWidth: 0, borderRadius: 0,
    }));
  } else if (mode === 'rank') {
    datasets = g.players.map((p, pi) => lineSet(p, pi, g.rounds.map((_, ri) => {
      const partial = partialTotals(ri);
      const sorted = [...partial].sort((a, b) => g.direction === 'high' ? b - a : a - b);
      return sorted.indexOf(partial[pi]) + 1;
    })));
    options.scales.y = { ...options.scales.y, reverse: true, min: 1, max: g.players.length, ticks: { ...options.scales.y.ticks, stepSize: 1 } };
  } else {
    datasets = g.players.map((p, pi) => lineSet(p, pi, g.rounds.map((_, ri) => {
      const partial = partialTotals(ri);
      const leader = g.direction === 'high' ? Math.max(...partial) : Math.min(...partial);
      return g.direction === 'high' ? partial[pi] - leader : leader - partial[pi];
    })));
  }

  state.activeChart = new Chart(canvas, { type, data: { labels, datasets }, options });
}

function chartOptions() {
  const text = cssColor('--color-text-muted');
  const grid = cssColor('--color-border');
  const font = { family: "'JetBrains Mono', monospace", size: 12.8 }; // --text-sm
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'start', labels: { font, color: text, usePointStyle: true, pointStyle: 'rect', padding: 16, boxWidth: 8, boxHeight: 8 } },
    },
    scales: {
      x: { grid: { color: grid }, border: { color: text }, ticks: { font, color: text } },
      y: { grid: { color: grid }, border: { color: text }, ticks: { font, color: text } },
    },
    animation: { duration: reduced ? 0 : 400 },
  };
}

function switchChart(mode, el) {
  state.chartMode = mode;
  document.querySelectorAll('[data-action="chart"]').forEach(t => t.setAttribute('aria-pressed', String(t === el)));
  renderChart();
}

// ============================================================
// FIN DE PARTIE
// ============================================================
function endGame() {
  const g = state.currentGame;
  if (!g) return;
  if (!g.rounds.length) { toast("Jouez au moins une manche d'abord.", 'error'); return; }
  showConfirm(
    `Terminer la partie « ${g.name} » ?`,
    () => {
      const ranked = getRanked(g);
      g.winner = ranked[0].name;
      g.finalRanked = ranked;
      g.stats = computeStats(g);
      state.history.push({ ...g });
      saveHistory();
      saveCurrentGame();
      showView('awards');
    },
    'Terminer la partie'
  );
}

function abandonGame() {
  showConfirm(
    'Abandonner la partie ? La progression sera perdue.',
    () => {
      state.currentGame = null;
      saveCurrentGame();
      document.getElementById('resume-banner').hidden = true;
      showView('welcome');
    },
    'Abandonner',
    true
  );
}

// ============================================================
// RÉSULTATS
// ============================================================
function statHtml(value, label) {
  return `<p class="stat"><span class="numeral numeral--sm">${escapeHtml(value)}</span><span class="eyebrow">${label}</span></p>`;
}

function renderAwards() {
  const g = state.currentGame;
  if (!g || !g.finalRanked) return;

  document.getElementById('awards-game-name').textContent = g.name + ', ' + formatDate(g.date);
  document.getElementById('awards-winner').textContent = g.finalRanked[0].name;

  document.getElementById('podium').innerHTML = g.finalRanked.slice(0, 3).map((p, i) => `
    <li class="podium__place">
      <span class="podium__rank" aria-hidden="true">${i + 1}</span>
      <span class="podium__name"><span class="sr-only">Rang ${i + 1} : </span>${playerCell(p)}</span>
      <span class="podium__score">${p.total} pts</span>
    </li>`).join('');

  document.getElementById('awards-grid').innerHTML = generateAwards(g).map(a => `
    <li class="ledger__row">
      <span class="eyebrow">${escapeHtml(a.player)}</span>
      <h4 class="ledger__title">${a.title}</h4>
      <p class="ledger__text">${escapeHtml(a.desc)}</p>
    </li>`).join('');

  const allScores = g.rounds.flatMap(r => r);
  const gap = Math.abs(g.finalRanked[0].total - (g.finalRanked[1]?.total ?? 0));
  document.getElementById('awards-summary').innerHTML =
    statHtml(g.rounds.length, 'Manches') +
    statHtml(g.players.length, 'Joueurs') +
    statHtml(Math.max(...allScores), 'Record de manche') +
    statHtml(gap, "Points d'écart final");
}

// ============================================================
// HISTORIQUE
// ============================================================
function renderHistory() {
  const allPlayers = {};
  state.history.forEach(g => {
    g.players?.forEach(p => {
      if (!allPlayers[p.name]) allPlayers[p.name] = { wins: 0, games: 0 };
      allPlayers[p.name].games++;
    });
    if (g.winner) {
      if (!allPlayers[g.winner]) allPlayers[g.winner] = { wins: 0, games: 0 };
      allPlayers[g.winner].wins++;
    }
  });
  const topPlayer = Object.entries(allPlayers).sort((a, b) => b[1].wins - a[1].wins)[0];
  const totalRounds = state.history.reduce((s, g) => s + (g.rounds?.length || 0), 0);

  document.getElementById('global-stats').innerHTML =
    statHtml(state.history.length, 'Parties jouées') +
    statHtml(totalRounds, 'Manches au total') +
    statHtml(Object.keys(allPlayers).length, 'Joueurs') +
    (topPlayer ? statHtml(topPlayer[1].wins, `Victoires de ${escapeHtml(topPlayer[0])}`) : '');

  document.getElementById('history-games-list').innerHTML = state.history.length
    ? state.history.slice().reverse().map((g, i) => gameRow(g, state.history.length - 1 - i)).join('')
    : '<li class="empty">Aucune partie jouée. Lancez votre première partie.</li>';
}

function reviewGame(idx) {
  const g = state.history[idx];
  if (!g) return;
  state.currentGame = { ...g, _readonly: true };
  state.currentGame.finalRanked = state.currentGame.finalRanked || getRanked(g);
  state.currentGame.stats = state.currentGame.stats || computeStats(g);
  showView('awards');
}

function discardCurrentGame() {
  state.currentGame = null;
  localStorage.removeItem('boardnight_current');
  document.getElementById('resume-banner').hidden = true;
}

// ============================================================
// ÉVÉNEMENTS
// ============================================================
const ACTIONS = {
  'new-game': () => { showView('setup'); initSetup(); },
  'history': () => showView('history'),
  'welcome': () => showView('welcome'),
  'resume': () => showView('game'),
  'discard': discardCurrentGame,
  'add-player': addPlayerRow,
  'remove-player': el => removePlayer(Number(el.dataset.index)),
  'pick-color': el => openAvatarModal(Number(el.dataset.index)),
  'select-color': selectColor,
  'confirm-color': confirmAvatar,
  'undo': undoLastRound,
  'end': endGame,
  'abandon': abandonGame,
  'copy-round': copyLastRound,
  'chart': el => switchChart(el.dataset.mode, el),
  'review': el => reviewGame(Number(el.dataset.index)),
  'edit-cell': el => editCell(Number(el.dataset.player), Number(el.dataset.round), el),
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (el && ACTIONS[el.dataset.action]) ACTIONS[el.dataset.action](el);
});

document.getElementById('setup-form').addEventListener('submit', e => { e.preventDefault(); startGame(); });
document.getElementById('round-form').addEventListener('submit', e => { e.preventDefault(); submitRound(); });

document.getElementById('player-list').addEventListener('input', e => {
  if (e.target.matches('.input')) state.setupPlayers[Number(e.target.dataset.index)].name = e.target.value;
});

// Pas-à-pas : appui long à la souris ou au doigt, activation simple au clavier
const scoreInputs = document.getElementById('score-inputs');
scoreInputs.addEventListener('pointerdown', e => {
  const btn = e.target.closest('[data-step]');
  if (btn) startStep(Number(btn.dataset.index), Number(btn.dataset.step));
});
scoreInputs.addEventListener('click', e => {
  const btn = e.target.closest('[data-step]');
  if (btn && e.detail === 0) stepScore(Number(btn.dataset.index), Number(btn.dataset.step));
});
['pointerup', 'pointercancel', 'pointerleave'].forEach(type => scoreInputs.addEventListener(type, stopStep, true));
scoreInputs.addEventListener('keydown', e => {
  if (e.target.matches('.input')) scoreKeyNav(e, Number(e.target.dataset.index), state.currentGame.players.length);
});

// Le graphique reprend les couleurs du thème quand celui-ci change
document.addEventListener('click', e => {
  if (e.target.closest('[data-theme-toggle]') && state.currentGame) setTimeout(renderChart, 0);
});

// ============================================================
// DÉMARRAGE
// ============================================================
// Reprise d'une partie en cours
(function restoreSession() {
  const saved = localStorage.getItem('boardnight_current');
  if (!saved) return;
  try {
    const g = JSON.parse(saved);
    if (g && g.id && !g._readonly && !g.winner && g.rounds) {
      state.currentGame = g;
      const banner = document.getElementById('resume-banner');
      banner.hidden = false;
      banner.querySelector('.resume-game-name').textContent = g.name;
      banner.querySelector('.resume-round').textContent = `Manche ${g.currentRound}, ${plural(g.rounds.length, 'manche')} terminée${g.rounds.length > 1 ? 's' : ''}`;
    }
  } catch (e) { localStorage.removeItem('boardnight_current'); }
})();

initSetup();
renderWelcome();

// ============================================================
// CALCULS (classement, statistiques, trophées)
// ============================================================
function variance(arr) {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a,b)=>a+b,0)/arr.length;
  return arr.reduce((s,x)=>s+(x-mean)**2,0)/arr.length;
}

function getTotals(g) {
  return g.players.map((p,i) => ({
    ...p, idx: i,
    total: g.rounds.reduce((s,r) => s + (r[i] ?? 0), 0),
    perRound: g.rounds.map(r => r[i] ?? 0),
  }));
}

function getRanked(g) {
  const totals = getTotals(g);
  return totals.sort((a,b) => {
    const diff = g.direction === 'high' ? b.total - a.total : a.total - b.total;
    if (diff !== 0) return diff;
    // Tie-break: player index (stable)
    return a.idx - b.idx;
  });
}

// Fixed: stable sort + compare by value not reference
function getPrevRank(g, playerIdx) {
  if (g.rounds.length < 2) return 0;
  const prevRounds = g.rounds.slice(0, -1);
  const totals = g.players.map((_,i) => prevRounds.reduce((s,r)=>s+(r[i]??0),0));
  const sorted = g.players.map((_,i) => ({i, v: totals[i]}))
    .sort((a,b) => g.direction==='high' ? b.v-a.v || a.i-b.i : a.v-b.v || a.i-b.i);
  return sorted.findIndex(x => x.i === playerIdx) + 1;
}

// Stepper with long-press acceleration
let _stepInterval = null;
let _stepCount = 0;
function startStep(i, d) {
  stepScore(i, d);
  _stepCount = 0;
  _stepInterval = setInterval(() => {
    _stepCount++;
    const step = _stepCount > 15 ? 10 : _stepCount > 8 ? 5 : 1;
    stepScore(i, d * step);
  }, 120);
}
function stopStep() { clearInterval(_stepInterval); _stepInterval = null; }

function stepScore(i, d) {
  const input = document.getElementById('score-'+i);
  input.value = parseInt(input.value||0) + d;
}

function scoreKeyNav(e, i, total) {
  if (e.key === 'Enter' || e.key === 'ArrowDown') {
    e.preventDefault();
    if (i < total - 1) document.getElementById('score-'+(i+1))?.focus();
    else submitRound();
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (i > 0) document.getElementById('score-'+(i-1))?.focus();
  }
}

function checkDramaticMoments(g) {
  if (g.rounds.length < 2) return;
  const ranked = getRanked(g);
  const prev = getPrevRank(g, ranked[0].idx);
  if (prev > 1) toast(`${ranked[0].name} prend la tête.`, 'default', 3500);
  const lastRound = g.rounds[g.rounds.length-1];
  const maxScore = Math.max(...lastRound);
  if (maxScore > 0) {
    const allPrev = g.rounds.slice(0,-1).flatMap(r => r);
    const prevMax = allPrev.length ? Math.max(...allPrev) : 0;
    if (maxScore > prevMax * 1.5 && maxScore > 20) {
      const hero = g.players[lastRound.indexOf(maxScore)];
      setTimeout(() => toast(`${hero.name} bat le record de manche.`, 'default', 3500), 1200);
    }
  }
}

function computeStats(g) {
  const totals = getTotals(g);
  const ranked = getRanked(g);
  const n = g.players.length;

  // Comeback: biggest rank gain from first half to second half
  let comeback = {gain: -Infinity, player: null};
  if (g.rounds.length > 2) {
    const half = Math.ceil(g.rounds.length / 2);
    totals.forEach(p => {
      const firstHalfTotal = g.rounds.slice(0, half).reduce((s,r) => s+(r[p.idx]??0), 0);
      const secondHalfTotal = g.rounds.slice(half).reduce((s,r) => s+(r[p.idx]??0), 0);
      const gain = g.direction === 'high' ? secondHalfTotal - firstHalfTotal : firstHalfTotal - secondHalfTotal;
      if (gain > comeback.gain) { comeback.gain = gain; comeback.player = p; }
    });
  }

  // Lead dominance: who was #1 most often
  const leadCounts = {};
  g.players.forEach(p => leadCounts[p.name] = 0);
  g.rounds.forEach((_,ri) => {
    const partial = g.players.map((p,pi) => ({
      name: p.name,
      total: g.rounds.slice(0,ri+1).reduce((s,r)=>s+(r[pi]??0),0)
    }));
    partial.sort((a,b) => g.direction==='high'?b.total-a.total:a.total-b.total);
    leadCounts[partial[0].name] = (leadCounts[partial[0].name]||0) + 1;
  });
  const tyrant = Object.entries(leadCounts).sort((a,b)=>b[1]-a[1])[0];

  // Variance per player
  const vars = totals.map(p => ({...p, var: variance(p.perRound)}));
  vars.sort((a,b) => b.var - a.var);
  const gambler = vars[0]; // highest variance
  const wall = vars[vars.length-1]; // lowest variance

  // Round wins
  const roundWins = Array(n).fill(0);
  g.rounds.forEach(r => {
    const best = g.direction === 'high' ? Math.max(...r) : Math.min(...r);
    r.forEach((v,i) => { if(v === best) roundWins[i]++; });
  });

  // Sniper: winner who scored best in last round
  let sniper = null;
  if (g.rounds.length > 1) {
    const lastRound = g.rounds[g.rounds.length-1];
    const best = g.direction==='high' ? Math.max(...lastRound) : Math.min(...lastRound);
    const sniperIdx = lastRound.indexOf(best);
    if (ranked[0].idx === sniperIdx) sniper = g.players[sniperIdx];
  }

  // Sleeper: low first half, high second half
  let sleeper = null;
  totals.forEach(p => {
    const half = Math.floor(p.perRound.length / 2);
    if (half < 1) return;
    const first = p.perRound.slice(0, half).reduce((a,b)=>a+b, 0) / half;
    const second = p.perRound.slice(half).reduce((a,b)=>a+b, 0) / (p.perRound.length - half);
    if (g.direction === 'high' && second > first * 1.5 && first > 0) sleeper = p;
    if (g.direction === 'low' && second < first * 0.67 && first > 0) sleeper = p;
  });

  // Biggest single round score
  let bigBang = {val: g.direction==='high'?-Infinity:Infinity, player: null};
  totals.forEach(p => {
    p.perRound.forEach(score => {
      if ((g.direction==='high' && score > bigBang.val) || (g.direction==='low' && score < bigBang.val)) {
        bigBang.val = score;
        bigBang.player = p;
      }
    });
  });

  // Biggest score drop
  let collapse = {val: -Infinity, player: null};
  totals.forEach(p => {
    for (let i=1; i < p.perRound.length; i++) {
      const drop = g.direction==='high' ? p.perRound[i-1] - p.perRound[i] : p.perRound[i] - p.perRound[i-1];
      if (drop > collapse.val) { collapse.val = drop; collapse.player = p; }
    }
  });

  // Reversal: was behind most of the game but won
  let reversal = null;
  totals.forEach(p => {
    let behindCount = 0;
    g.rounds.forEach((_,ri) => {
      const partial = g.players.map((_2,i2) => g.rounds.slice(0,ri+1).reduce((s,r)=>s+(r[i2]??0),0));
      const leaderVal = g.direction==='high' ? Math.max(...partial) : Math.min(...partial);
      if (partial[p.idx] !== leaderVal) behindCount++;
    });
    if (behindCount > g.rounds.length * 0.6 && ranked[0].name === p.name) reversal = p;
  });

  // Tourist: always in the bottom half, every single round
  let tourist = null;
  if (n >= 3) {
    totals.forEach(p => {
      const alwaysBottom = g.rounds.every((_,ri) => {
        const partial = g.players.map((_2,i2) => g.rounds.slice(0,ri+1).reduce((s,r)=>s+(r[i2]??0),0));
        const sorted = [...partial].sort((a,b) => g.direction==='high'?b-a:a-b);
        const myRank = sorted.indexOf(partial[p.idx]);
        return myRank >= Math.floor(n/2);
      });
      if (alwaysBottom) tourist = p;
    });
  }

  // Clutch: best last 2 rounds combined
  let clutch = {val: g.direction==='high'?-Infinity:Infinity, player: null};
  totals.forEach(p => {
    const last2 = p.perRound.slice(-2).reduce((a,b)=>a+b,0);
    if ((g.direction==='high' && last2 > clutch.val) || (g.direction==='low' && last2 < clutch.val)) {
      clutch.val = last2; clutch.player = p;
    }
  });

  // Phoenix: last place at halfway, won final
  let phoenix = null;
  if (g.rounds.length >= 4) {
    const half = Math.ceil(g.rounds.length / 2);
    const halfTotals = g.players.map((_,i) => g.rounds.slice(0,half).reduce((s,r)=>s+(r[i]??0),0));
    const worstHalf = g.direction==='high' ? Math.min(...halfTotals) : Math.max(...halfTotals);
    if (halfTotals[ranked[0].idx] === worstHalf) phoenix = ranked[0];
  }

  return {
    comeback: comeback.player,
    tyrant: tyrant?.[0],
    gambler,
    wall,
    sniper,
    sleeper,
    bigBang: bigBang.player,
    collapse: collapse.player,
    reversal,
    tourist,
    clutch: clutch.player,
    phoenix,
    ranked,
    leadCounts,
    roundWins,
  };
}

function generateAwards(g) {
  const ranked = g.finalRanked;
  const stats = g.stats;
  const totals = getTotals(g);
  const awards = [];

  // Champion (always first, always displayed)
  awards.push({ priority: 0, title:'Le Champion', player: ranked[0].name, desc: `Vainqueur incontesté avec ${ranked[0].total} pts. À la prochaine.` });

  // Last place
  if (ranked.length > 1) {
    const snail = ranked[ranked.length-1];
    awards.push({ priority: 1, title:'L\'Escargot', player: snail.name, desc: `Dernière place avec ${snail.total} pts. L'important c'est le voyage.` });
  }

  // Tyrant : led the most rounds
  if (stats.tyrant) {
    const tyrantCount = stats.leadCounts[stats.tyrant];
    awards.push({ priority: 2, title:'Le Tyran', player: stats.tyrant, desc: `En tête pendant ${tyrantCount} manche${tyrantCount>1?'s':''}. Le pouvoir est addictif.` });
  }

  // Gambler : highest variance (distinct from wall)
  if (stats.gambler && stats.gambler.name !== stats.wall?.name) {
    awards.push({ priority: 3, title:'Le Flambeur', player: stats.gambler.name, desc: `Scores imprévisibles sur chaque manche. Vit pour le chaos.` });
  }

  // Wall : most consistent (distinct from gambler)
  if (stats.wall && stats.wall.name !== stats.gambler?.name) {
    const wallIsWinner = ranked[0].name === stats.wall.name;
    awards.push({ priority: 4, title:'Le Mur', player: stats.wall.name, desc: wallIsWinner ? `Régularité absolue ET victoire. Le combo parfait.` : `Scores ultra-réguliers. Pas premier, mais imperturbable.` });
  }

  // Comeback
  if (stats.comeback && g.rounds.length > 2) {
    awards.push({ priority: 5, title:'La Fusée', player: stats.comeback.name, desc: `La plus grosse remontée en seconde moitié de partie. Pas de panique, juste du talent.` });
  }

  // Sniper
  if (stats.sniper) {
    awards.push({ priority: 6, title:'Le Sniper', player: stats.sniper.name, desc: `Meilleur score lors de la toute dernière manche. Le timing, c'est tout.` });
  }

  // Big Bang
  if (stats.bigBang) {
    awards.push({ priority: 7, title:'Le Big Bang', player: stats.bigBang.name, desc: `Le plus haut score sur une seule manche. Un tour légendaire.` });
  }

  // Collapse
  if (stats.collapse && g.rounds.length > 2) {
    awards.push({ priority: 8, title:'L\'Effondrement', player: stats.collapse.name, desc: `La plus grosse chute entre deux manches. Ce qui monte doit redescendre.` });
  }

  // Reversal
  if (stats.reversal) {
    awards.push({ priority: 9, title:'Le Retournement', player: stats.reversal.name, desc: `Derrière pendant la majorité de la partie, vainqueur à la fin. Magistral.` });
  }

  // Clutch
  if (stats.clutch) {
    awards.push({ priority: 10, title:'Le Sang-Froid', player: stats.clutch.name, desc: `Meilleures deux dernières manches combinées. La pression fait les diamants.` });
  }

  // Tourist : fixed condition: always in bottom half every round
  if (stats.tourist) {
    awards.push({ priority: 11, title:'Le Touriste', player: stats.tourist.name, desc: `Jamais sorti du bas du classement. Juste content d'être là.` });
  }

  // Sleeper
  if (stats.sleeper) {
    awards.push({ priority: 12, title:'La Menace Fantôme', player: stats.sleeper.name, desc: `Discret en première moitié, explosif en seconde. On n'aurait pas dû les ignorer.` });
  }

  // Phoenix
  if (stats.phoenix) {
    awards.push({ priority: 13, title:'Le Phoenix', player: stats.phoenix.name, desc: `Dernier à mi-partie, champion à la fin. Renaître des cendres, c'est un art.` });
  }

  // Low-score direction bonus
  if (g.direction === 'low') {
    awards.push({ priority: 14, title:'Le Minimaliste', player: ranked[0].name, desc: `Moins c'est mieux. Le plus bas score remporte la mise.` });
  }

  // Champion du presque : 2nd place within 5%
  if (ranked.length >= 2) {
    const winner = ranked[0]; const runnerUp = ranked[1];
    const pct = Math.abs(winner.total - runnerUp.total) / Math.max(1, Math.abs(winner.total));
    if (pct < 0.05) {
      awards.push({ priority: 15, title:'Champion du Presque', player: runnerUp.name, desc: `${Math.abs(winner.total - runnerUp.total)} point(s) d'écart. La victoire vous frôlait.` });
    }
  }

  // Round wins trophy
  const roundWinLeader = g.players.reduce((a,b) => stats.roundWins[a.idx] >= stats.roundWins[b.idx] ? a : b,
    {...g.players[0], idx: 0});
  if (stats.roundWins[roundWinLeader.idx] >= Math.ceil(g.rounds.length * 0.5)) {
    awards.push({ priority: 16, title:'Le Dominateur', player: roundWinLeader.name, desc: `A remporté ${stats.roundWins[roundWinLeader.idx]} manche${stats.roundWins[roundWinLeader.idx]>1?'s':''} sur ${g.rounds.length}. Une présence écrasante.` });
  }

  // Sort by priority and return all
  return awards.sort((a,b) => a.priority - b.priority);
}
