// ============================================================
// STATE
// ============================================================
const AVATARS = ['🦊','🐻','🦁','🐼','🐯','🦄','🐸','🐙','🦋','🦖','🤖','👾','🎩','🎭','🔥','⭐','🌊','🍄','🎪','🎲'];
const COLORS = ['#7c3aed','#2563eb','#059669','#dc2626','#d97706','#db2777','#0891b2','#65a30d'];
const COLOR_NAMES = ['Violet','Bleu','Vert','Rouge','Ambre','Rose','Cyan','Citron'];

let state = {
  currentGame: null,
  history: JSON.parse(localStorage.getItem('boardnight_history') || '[]'),
  setupPlayers: [],
  avatarEditIdx: null,
  pendingAvatar: null,
  pendingColor: null,
  activeChart: null,
  chartMode: 'line',
};

// ============================================================
// UTILITY
// ============================================================
function showView(v) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.getElementById('view-' + v).classList.add('active');
  const statusBadge = document.getElementById('game-status-badge');
  if (statusBadge) statusBadge.style.display = state.currentGame ? '' : 'none';
  if (v === 'welcome') renderWelcome();
  if (v === 'history') renderHistory();
  if (v === 'game') { renderLeaderboard(); renderScoreInputs(); renderRoundHistory(); renderChart(); renderLiveStats(); }
  if (v === 'awards') renderAwards();
  window.scrollTo(0,0);
}

function toast(msg, type='default', dur=2800) {
  const c = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = 'toast' + (type !== 'default' ? ' toast-'+type : '');
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, dur);
}

function saveHistory() { localStorage.setItem('boardnight_history', JSON.stringify(state.history)); }
function saveCurrentGame() {
  if (state.currentGame) localStorage.setItem('boardnight_current', JSON.stringify(state.currentGame));
  else localStorage.removeItem('boardnight_current');
}

function variance(arr) {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a,b)=>a+b,0)/arr.length;
  return arr.reduce((s,x)=>s+(x-mean)**2,0)/arr.length;
}

// ============================================================
// STYLED CONFIRM DIALOG
// ============================================================
function showConfirm(msg, onConfirm, confirmLabel='Confirmer', danger=false) {
  const overlay = document.getElementById('confirm-overlay');
  state._confirmTrigger = document.activeElement;
  document.getElementById('confirm-msg').textContent = msg;
  const btn = document.getElementById('confirm-ok');
  btn.textContent = confirmLabel;
  btn.className = 'btn ' + (danger ? 'btn-danger-solid' : 'btn-primary');
  overlay.classList.add('open');
  trapFocus('confirm-overlay');
  btn.onclick = () => {
    overlay.classList.remove('open');
    releaseFocus('confirm-overlay', state._confirmTrigger);
    onConfirm();
  };
  document.getElementById('confirm-cancel').onclick = () => {
    overlay.classList.remove('open');
    releaseFocus('confirm-overlay', state._confirmTrigger);
  };
}

// ============================================================
// WELCOME
// ============================================================
function renderWelcome() {
  const list = document.getElementById('recent-games-list');
  if (!state.history.length) { list.innerHTML = ''; return; }
  list.innerHTML = `<div class="eyebrow recent-title">Parties Récentes</div>` +
    state.history.slice(-5).reverse().map((g,i) => {
      const realIdx = state.history.length - 1 - i;
      const top3 = (g.finalRanked || []).slice(0,3);
      return `
      <div class="history-item" onclick="reviewGame(${realIdx})">
        <div class="history-mini-podium">${top3.map((p,r)=>`<span class="mini-pod-avatar" title="${p.name}">${p.avatar||'?'}</span>`).join('')}</div>
        <div class="history-item-info">
          <strong>${g.name}</strong>
          <span>${g.players.length} joueurs · ${g.rounds.length} manches · ${new Date(g.date).toLocaleDateString('fr-FR')}</span>
        </div>
        <span class="history-item-badge">${g.winner}</span>
      </div>`;
    }).join('');
}

// ============================================================
// SETUP
// ============================================================
function initSetup() {
  // Suggest last used players
  const last = state.history[state.history.length - 1];
  if (last && last.players && last.players.length >= 2) {
    state.setupPlayers = last.players.map(p => ({...p}));
  } else {
    state.setupPlayers = [
      {name:'Joueur 1', avatar: AVATARS[0], color: COLORS[0]},
      {name:'Joueur 2', avatar: AVATARS[1], color: COLORS[1]},
    ];
  }
  renderSetupPlayers();
}

function renderSetupPlayers() {
  const list = document.getElementById('player-list');
  list.innerHTML = state.setupPlayers.map((p,i) => `
    <div class="player-row" id="player-row-${i}">
      <div class="player-avatar-btn" onclick="openAvatarModal(${i})" title="Changer l'avatar">${p.avatar}</div>
      <div class="player-color-dot" style="background:${p.color}"></div>
      <input class="player-name-input" type="text" value="${p.name}" placeholder="Nom du joueur"
        oninput="state.setupPlayers[${i}].name=this.value">
      <button class="btn btn-icon btn-danger" onclick="removePlayer(${i})" title="Supprimer">✕</button>
    </div>`).join('');
  document.getElementById('add-player-btn').style.display = state.setupPlayers.length >= 8 ? 'none' : '';
}

function addPlayerRow() {
  if (state.setupPlayers.length >= 8) return;
  const i = state.setupPlayers.length;
  state.setupPlayers.push({name:`Joueur ${i+1}`, avatar: AVATARS[i % AVATARS.length], color: COLORS[i % COLORS.length]});
  renderSetupPlayers();
}

function removePlayer(i) {
  if (state.setupPlayers.length <= 2) { toast('Il faut au moins 2 joueurs'); return; }
  state.setupPlayers.splice(i, 1);
  renderSetupPlayers();
}

function startGame() {
  const names = state.setupPlayers.map(p => p.name.trim()).filter(Boolean);
  if (names.length < 2) { toast('Ajoutez au moins 2 joueurs'); return; }
  const gameName = document.getElementById('game-name-input').value.trim() || 'Soirée Jeux';
  const direction = document.getElementById('score-direction').value;

  state.currentGame = {
    id: Date.now(),
    name: gameName,
    direction,
    date: new Date().toISOString(),
    players: state.setupPlayers.map(p => ({...p, name: p.name.trim()||p.avatar})),
    rounds: [],
    currentRound: 1,
  };

  saveCurrentGame();
  showView('game');
  document.getElementById('game-display-name').textContent = gameName;
  updateRoundInfo();
}

// ============================================================
// AVATAR MODAL
// ============================================================
// ============================================================
// FOCUS TRAP UTILITY
// ============================================================
function trapFocus(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;
  const focusable = Array.from(overlay.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  ));
  if (!focusable.length) return;
  focusable[0].focus();

  overlay._trapHandler = (e) => {
    if (e.key !== 'Tab') return;
    if (!overlay.classList.contains('open')) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  };
  document.addEventListener('keydown', overlay._trapHandler);
}

function releaseFocus(overlayId, returnTo) {
  const overlay = document.getElementById(overlayId);
  if (overlay && overlay._trapHandler) {
    document.removeEventListener('keydown', overlay._trapHandler);
    overlay._trapHandler = null;
  }
  if (returnTo) returnTo.focus();
}

// ============================================================
// AVATAR MODAL
// ============================================================
function openAvatarModal(i) {
  state.avatarEditIdx = i;
  state.pendingAvatar = state.setupPlayers[i].avatar;
  state.pendingColor = state.setupPlayers[i].color;
  state._modalTrigger = document.activeElement;

  const grid = document.getElementById('avatar-grid');
  grid.innerHTML = AVATARS.map(a => `
    <button class="avatar-option${a===state.pendingAvatar?' selected':''}" role="option" aria-selected="${a===state.pendingAvatar}"
      onclick="selectAvatar('${a}',this)">${a}</button>`).join('');
  const cp = document.getElementById('color-picker');
  cp.innerHTML = COLORS.map((c,ci) => `
    <button class="color-swatch${c===state.pendingColor?' selected':''}" style="background:${c}"
      role="option" aria-selected="${c===state.pendingColor}" aria-label="${COLOR_NAMES[ci]}"
      onclick="selectColor('${c}',this)"></button>`).join('');

  const overlay = document.getElementById('avatar-modal');
  overlay.classList.add('open');
  trapFocus('avatar-modal');
}

function selectAvatar(a, el) {
  state.pendingAvatar = a;
  document.querySelectorAll('.avatar-option').forEach(e => { e.classList.remove('selected'); e.setAttribute('aria-selected', 'false'); });
  el.classList.add('selected'); el.setAttribute('aria-selected', 'true');
}

function selectColor(c, el) {
  state.pendingColor = c;
  document.querySelectorAll('.color-swatch').forEach(e => { e.classList.remove('selected'); e.setAttribute('aria-selected', 'false'); });
  el.classList.add('selected'); el.setAttribute('aria-selected', 'true');
}

function confirmAvatar() {
  const i = state.avatarEditIdx;
  state.setupPlayers[i].avatar = state.pendingAvatar;
  state.setupPlayers[i].color = state.pendingColor;
  closeModal();
  renderSetupPlayers();
}

function closeModal() {
  releaseFocus('avatar-modal', state._modalTrigger);
  document.getElementById('avatar-modal').classList.remove('open');
}

document.getElementById('avatar-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// Close modals on Escape
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (document.getElementById('avatar-modal').classList.contains('open')) { closeModal(); return; }
  if (document.getElementById('confirm-overlay').classList.contains('open')) {
    document.getElementById('confirm-overlay').classList.remove('open');
    releaseFocus('confirm-overlay', state._confirmTrigger);
  }
});

// ============================================================
// GAME VIEW
// ============================================================
function updateRoundInfo() {
  const g = state.currentGame;
  document.getElementById('round-info').textContent = `Manche ${g.currentRound} en cours · ${g.rounds.length} manches terminées`;
  document.getElementById('current-round-num').textContent = g.currentRound;
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

function renderLeaderboard() {
  const g = state.currentGame; if(!g) return;
  const ranked = getRanked(g);
  const leader = document.getElementById('leaderboard');
  const leaderTotal = ranked[0].total;
  leader.innerHTML = ranked.map((p,rank) => {
    const prev = g.rounds.length > 1 ? getPrevRank(g, p.idx) : rank+1;
    const delta = prev - (rank+1);
    let deltaHtml = '';
    if (g.rounds.length > 0) {
      if (delta > 0) deltaHtml = `<span class="standing-delta delta-up">▲${delta}</span>`;
      else if (delta < 0) deltaHtml = `<span class="standing-delta delta-down">▼${Math.abs(delta)}</span>`;
      else deltaHtml = `<span class="standing-delta delta-same">—</span>`;
    }
    const gap = rank > 0 ? (g.direction === 'high' ? leaderTotal - p.total : p.total - leaderTotal) : 0;
    const gapHtml = rank > 0 && g.rounds.length > 0 ? `<span class="standing-gap">-${gap}</span>` : '';
    return `
      <div class="player-standing${rank===0?' rank-1':''}">
        <div class="rank-number">${rank===0?'':''}${rank+1}</div>
        <div class="standing-avatar">${p.avatar}</div>
        <div class="standing-name" style="color:${p.color}">${p.name}</div>
        ${gapHtml}
        ${deltaHtml}
        <div class="standing-score">${p.total}</div>
      </div>`;
  }).join('');
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

function renderScoreInputs() {
  const g = state.currentGame; if(!g) return;
  const container = document.getElementById('score-inputs');
  const prevRound = g.rounds.length > 0 ? g.rounds[g.rounds.length-1] : null;
  container.innerHTML = g.players.map((p,i) => `
    <div class="score-row">
      <div class="score-player-name">
        <span>${p.avatar}</span>
        <span style="color:${p.color}">${p.name}</span>
      </div>
      <div class="score-stepper">
        <button class="stepper-btn" onpointerdown="startStep(${i},-1)" onpointerup="stopStep()" onpointerleave="stopStep()">−</button>
        <button class="stepper-btn" onpointerdown="startStep(${i},1)" onpointerup="stopStep()" onpointerleave="stopStep()">+</button>
      </div>
      <input class="score-input-field" type="number" inputmode="numeric" id="score-${i}" value="0" placeholder="0"
        onkeydown="scoreKeyNav(event,${i},${g.players.length})">
    </div>`).join('');

  // Show "copy last round" button if available
  const copyBtn = document.getElementById('copy-last-round-btn');
  if (copyBtn) copyBtn.style.display = prevRound ? 'flex' : 'none';
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

function copyLastRound() {
  const g = state.currentGame; if(!g || !g.rounds.length) return;
  const last = g.rounds[g.rounds.length-1];
  g.players.forEach((_,i) => { document.getElementById('score-'+i).value = last[i] ?? 0; });
  toast('Scores copiés depuis la manche précédente');
}

function submitRound() {
  const g = state.currentGame; if(!g) return;
  const scores = g.players.map((_,i) => parseInt(document.getElementById('score-'+i).value) || 0);
  g.rounds.push(scores);
  g.currentRound++;
  saveCurrentGame();
  updateRoundInfo();
  renderLeaderboard();
  renderRoundHistory();
  renderChart();
  renderLiveStats();
  g.players.forEach((_,i) => { document.getElementById('score-'+i).value = 0; });
  // Focus first input for fast next-round entry
  document.getElementById('score-0')?.focus();

  // Dramatic moment detection
  checkDramaticMoments(g);
  toast(`Manche ${g.currentRound-1} enregistrée ✓`, 'success');
}

function checkDramaticMoments(g) {
  if (g.rounds.length < 2) return;
  const ranked = getRanked(g);
  const prev = getPrevRank(g, ranked[0].idx);
  if (prev > 1) toast(`${ranked[0].name} prend la tête !`, 'event', 3500);
  const lastRound = g.rounds[g.rounds.length-1];
  const maxScore = Math.max(...lastRound);
  if (maxScore > 0) {
    const allPrev = g.rounds.slice(0,-1).flatMap(r => r);
    const prevMax = allPrev.length ? Math.max(...allPrev) : 0;
    if (maxScore > prevMax * 1.5 && maxScore > 20) {
      const hero = g.players[lastRound.indexOf(maxScore)];
      setTimeout(() => toast(`${hero.name} explose le record de manche !`, 'event', 3500), 1200);
    }
  }
}

function undoLastRound() {
  const g = state.currentGame; if(!g || !g.rounds.length) return;
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
      toast('Manche annulée');
    },
    'Annuler la manche',
    true
  );
}

function renderRoundHistory() {
  const g = state.currentGame; if(!g) return;
  const wrap = document.getElementById('round-history-wrap');
  if (!g.rounds.length) {
    wrap.innerHTML = '<p class="empty-message">Aucune manche pour le moment</p>';
    return;
  }
  const totals = getTotals(g);
  // Highlight best score per round
  const roundBests = g.rounds.map(r => g.direction === 'high' ? Math.max(...r) : Math.min(...r));
  wrap.innerHTML = `<table class="history-table">
    <thead>
      <tr>
        <th>Joueur</th>
        ${g.rounds.map((_,i)=>`<th>M${i+1}</th>`).join('')}
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${g.players.map((p,pi)=>`
        <tr>
          <td><span style="color:${p.color}">${p.avatar} ${p.name}</span></td>
          ${g.rounds.map((r,ri)=>{
            const val = r[pi]??0;
            const isBest = val === roundBests[ri];
            return `<td class="editable-cell mono${isBest?' cell-best':''}" onclick="editCell(${pi},${ri})" title="Cliquer pour éditer">${val}</td>`;
          }).join('')}
          <td class="mono total-row">${totals.find(t=>t.idx===pi)?.total??0}</td>
        </tr>`).join('')}
    </tbody>
  </table>`;
}

function editCell(playerIdx, roundIdx) {
  const g = state.currentGame; if(!g) return;
  const cells = document.querySelectorAll('.history-table tbody tr')[playerIdx]?.querySelectorAll('td');
  if (!cells) return;
  const cell = cells[roundIdx + 1];
  const cur = g.rounds[roundIdx][playerIdx] ?? 0;
  cell.innerHTML = `<input class="inline-edit" type="number" inputmode="numeric" value="${cur}"
    onblur="commitEdit(${playerIdx},${roundIdx},this)"
    onkeydown="if(event.key==='Enter')this.blur();if(event.key==='Escape'){this.value='${cur}';this.blur();}" autofocus>`;
  cell.querySelector('input').select();
}

function commitEdit(pi, ri, input) {
  const g = state.currentGame; if(!g) return;
  g.rounds[ri][pi] = parseInt(input.value) || 0;
  saveCurrentGame();
  renderRoundHistory();
  renderLeaderboard();
  renderChart();
  renderLiveStats();
}

// ============================================================
// LIVE STATS
// ============================================================
function renderLiveStats() {
  const g = state.currentGame; if(!g) return;
  const panel = document.getElementById('live-stats-grid');
  if (!panel) return;

  if (!g.rounds.length) {
    panel.innerHTML = '<p class="empty-message" style="grid-column:1/-1">Jouez une manche pour voir les stats</p>';
    return;
  }

  const totals = getTotals(g);
  const ranked = getRanked(g);
  const n = g.players.length;
  const nRounds = g.rounds.length;

  // Leader
  const leader = ranked[0];
  // Gap leader vs 2nd
  const second = ranked[1];
  const gap = Math.abs(leader.total - second.total);

  // Most wins (best score per round)
  const roundWins = Array(n).fill(0);
  g.rounds.forEach(r => {
    const best = g.direction === 'high' ? Math.max(...r) : Math.min(...r);
    r.forEach((v,i) => { if(v === best) roundWins[i]++; });
  });
  const topWinner = totals.reduce((a,b) => roundWins[a.idx] >= roundWins[b.idx] ? a : b);

  // Most consistent (lowest variance, min 3 rounds)
  const variances = totals.map(p => ({...p, v: variance(p.perRound)}));
  const mostConsistent = variances.reduce((a,b) => a.v <= b.v ? a : b);

  // Biggest momentum (last 2 rounds vs prev 2)
  let momentum = null;
  if (nRounds >= 4) {
    const momScores = totals.map(p => {
      const last2 = p.perRound.slice(-2).reduce((a,b)=>a+b,0);
      const prev2 = p.perRound.slice(-4,-2).reduce((a,b)=>a+b,0);
      return {...p, mom: last2 - prev2};
    });
    momentum = momScores.reduce((a,b) => (g.direction==='high'?a.mom>=b.mom:a.mom<=b.mom) ? a : b);
  }

  // Current winning streak
  let streak = 0; let streakPlayer = null;
  for (let ri = nRounds-1; ri >= 0; ri--) {
    const r = g.rounds[ri];
    const best = g.direction==='high' ? Math.max(...r) : Math.min(...r);
    const winnerIdx = r.indexOf(best);
    if (streak === 0) { streak=1; streakPlayer=winnerIdx; }
    else if (winnerIdx === streakPlayer) streak++;
    else break;
  }

  // Comeback: who gained most ranks since round 1
  let biggestClimber = null;
  if (nRounds >= 2) {
    const afterR1 = g.players.map((_,i) => g.rounds[0][i]);
    const sortedR1 = [...afterR1].sort((a,b) => g.direction==='high'?b-a:a-b);
    const initialRanks = afterR1.map(v => sortedR1.indexOf(v)+1);
    const climbers = ranked.map((p,currentRank) => ({
      ...p,
      gain: initialRanks[p.idx] - (currentRank+1)
    }));
    biggestClimber = climbers.reduce((a,b) => a.gain >= b.gain ? a : b);
  }

  const stats = [
    { label: 'En tête', value: leader.avatar + ' ' + leader.name, sub: leader.total + ' pts' },
    { label: 'Écart avec le 2ème', value: gap + ' pts', sub: second.name + ' à ' + second.total },
    { label: 'Manches remportées', value: topWinner.avatar + ' ' + topWinner.name, sub: roundWins[topWinner.idx] + ' / ' + nRounds },
    { label: 'Plus régulier', value: mostConsistent.avatar + ' ' + mostConsistent.name, sub: 'variance ' + Math.round(mostConsistent.v) },
  ];

  if (streak >= 2 && streakPlayer !== null) {
    stats.push({ label: 'Série en cours', value: g.players[streakPlayer].avatar + ' ' + g.players[streakPlayer].name, sub: streak + ' manches d\'affilée' });
  }

  if (momentum && nRounds >= 4) {
    const sign = momentum.mom > 0 ? '+' : '';
    stats.push({ label: 'Momentum', value: momentum.avatar + ' ' + momentum.name, sub: sign + momentum.mom + ' sur les 2 dern.' });
  }

  if (biggestClimber && biggestClimber.gain > 0) {
    stats.push({ label: 'Remontée', value: biggestClimber.avatar + ' ' + biggestClimber.name, sub: '+' + biggestClimber.gain + ' place(s)' });
  }

  panel.innerHTML = stats.map(s => `
    <div class="stat-pill">
      <div class="label">${s.label}</div>
      <div class="value">${s.value}</div>
      <div class="sub">${s.sub}</div>
    </div>`).join('');
}

// ============================================================
// CHART
// ============================================================
function renderChart() {
  const g = state.currentGame; if(!g) return;
  const noData = document.getElementById('chart-no-data');
  const canvas = document.getElementById('main-chart');
  if (!g.rounds.length) {
    noData.style.display = '';
    canvas.style.display = 'none';
    if (state.activeChart) { state.activeChart.destroy(); state.activeChart = null; }
    return;
  }
  noData.style.display = 'none';
  canvas.style.display = '';

  if (state.activeChart) { state.activeChart.destroy(); state.activeChart = null; }

  const labels = g.rounds.map((_,i) => `M${i+1}`);
  const mode = state.chartMode;

  if (mode === 'line') {
    // Cumulative
    const datasets = g.players.map((p,pi) => {
      let cum = 0;
      return {
        label: `${p.avatar} ${p.name}`,
        data: g.rounds.map(r => { cum += r[pi]??0; return cum; }),
        borderColor: p.color,
        backgroundColor: p.color + '18',
        tension: 0.35, fill: false,
        pointBackgroundColor: p.color, pointRadius: 4, borderWidth: 2.5,
      };
    });
    state.activeChart = new Chart(canvas, {
      type: 'line', data: { labels, datasets },
      options: chartOptions('Progression Cumulée'),
    });

  } else if (mode === 'bar') {
    // Per-round gains
    const datasets = g.players.map((p,pi) => ({
      label: `${p.avatar} ${p.name}`,
      data: g.rounds.map(r => r[pi]??0),
      backgroundColor: p.color + 'cc',
      borderColor: p.color,
      borderWidth: 1, borderRadius: 4,
    }));
    state.activeChart = new Chart(canvas, {
      type: 'bar', data: { labels, datasets },
      options: chartOptions('Gains par Manche'),
    });

  } else if (mode === 'rank') {
    // Rank per round (bump chart)
    const n = g.players.length;
    const datasets = g.players.map((p,pi) => {
      const ranks = g.rounds.map((_,ri) => {
        const partial = g.players.map((_2,i2) => g.rounds.slice(0,ri+1).reduce((s,r)=>s+(r[i2]??0),0));
        const sorted = [...partial].sort((a,b) => g.direction==='high'?b-a:a-b);
        // Stable rank: find position of this player's value
        return sorted.indexOf(partial[pi]) + 1;
      });
      return {
        label: `${p.avatar} ${p.name}`,
        data: ranks,
        borderColor: p.color,
        backgroundColor: p.color + '22',
        tension: 0.2, fill: false,
        pointBackgroundColor: p.color, pointRadius: 5, borderWidth: 2.5,
      };
    });
    state.activeChart = new Chart(canvas, {
      type: 'line', data: { labels, datasets },
      options: {
        ...chartOptions('Classement par Manche'),
        scales: {
          ...chartOptions().scales,
          y: {
            ...chartOptions().scales?.y,
            reverse: true,
            min: 1, max: n,
            ticks: { stepSize: 1, font: { family: "'JetBrains Mono'", size: 10 } },
            grid: { color: 'oklch(0.92 0.01 290)' },
          }
        }
      }
    });

  } else if (mode === 'gap') {
    // Gap vs leader
    const datasets = g.players.map((p,pi) => {
      const data = g.rounds.map((_,ri) => {
        const partial = g.players.map((_2,i2) => g.rounds.slice(0,ri+1).reduce((s,r)=>s+(r[i2]??0),0));
        const leader = g.direction==='high' ? Math.max(...partial) : Math.min(...partial);
        return g.direction==='high' ? partial[pi] - leader : leader - partial[pi];
      });
      return {
        label: `${p.avatar} ${p.name}`,
        data,
        borderColor: p.color,
        backgroundColor: p.color + '18',
        tension: 0.3, fill: false,
        pointBackgroundColor: p.color, pointRadius: 4, borderWidth: 2.5,
      };
    });
    state.activeChart = new Chart(canvas, {
      type: 'line', data: { labels, datasets },
      options: chartOptions('Écart avec le Leader'),
    });
  }
}

function chartOptions(title) {
  return {
    responsive: true, maintainAspectRatio: true,
    plugins: {
      legend: { position: 'top', labels: { font: { family: "'JetBrains Mono'", size: 11 }, usePointStyle: true, padding: 12, boxWidth: 8 }},
      title: title ? { display: false } : undefined,
    },
    scales: {
      x: { grid: { color: 'oklch(0.92 0.01 290)' }, ticks: { font: { family: "'JetBrains Mono'", size: 10 } }},
      y: { grid: { color: 'oklch(0.92 0.01 290)' }, ticks: { font: { family: "'JetBrains Mono'", size: 10 } }}
    },
    animation: { duration: 350 },
  };
}

function switchChart(mode, el) {
  state.chartMode = mode;
  document.querySelectorAll('.chart-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  el.classList.add('active');
  el.setAttribute('aria-selected', 'true');
  renderChart();
}

// ============================================================
// END GAME
// ============================================================
function endGame() {
  const g = state.currentGame;
  if (!g) return;
  if (!g.rounds.length) { toast('Jouez au moins une manche d\'abord !'); return; }
  showConfirm(
    `Terminer la partie "${g.name}" ?`,
    () => {
      const ranked = getRanked(g);
      g.winner = ranked[0].name;
      g.finalRanked = ranked;
      g.stats = computeStats(g);
      state.history.push({...g});
      saveHistory();
      saveCurrentGame();
      showView('awards');
      launchConfetti();
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
      showView('welcome');
    },
    'Abandonner',
    true
  );
}

// ============================================================
// STATS COMPUTATION
// ============================================================
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

// ============================================================
// AWARDS VIEW
// ============================================================
function renderAwards() {
  const g = state.currentGame;
  if (!g || !g.finalRanked) return;

  document.getElementById('awards-game-name').textContent = g.name + ' · ' + new Date(g.date).toLocaleDateString('fr-FR');

  // Podium
  const podium = document.getElementById('podium');
  const top = g.finalRanked.slice(0,3);
  const medals = ['🥇','🥈','🥉'];
  const ranks = ['1er','2ème','3ème'];
  podium.innerHTML = top.map((p,i) => `
    <div class="podium-slot${i===0?' p1':''}">
      <span class="podium-avatar">${p.avatar}</span>
      <div class="podium-medal">${medals[i]}</div>
      <div class="podium-rank">${ranks[i]}</div>
      <div class="podium-name" style="color:${p.color}">${p.name}</div>
      <div class="podium-score">${p.total}</div>
    </div>`).join('');

  // Awards
  const awards = generateAwards(g);
  const grid = document.getElementById('awards-grid');
  grid.innerHTML = awards.map((a, i) => `
    <div class="award-card" style="animation-delay:${i*0.08}s">
      <span class="award-emoji">${a.emoji}</span>
      <div class="award-title">${a.title}</div>
      <div class="award-player">${a.player}</div>
      <div class="award-desc">${a.desc}</div>
    </div>`).join('');

  // Game summary stats
  renderAwardsSummary(g);
}

function renderAwardsSummary(g) {
  const el = document.getElementById('awards-summary');
  if (!el) return;
  const nRounds = g.rounds.length;
  const allScores = g.rounds.flatMap(r => r);
  const maxScore = Math.max(...allScores);
  const gap = Math.abs(g.finalRanked[0].total - g.finalRanked[1]?.total);
  el.innerHTML = `
    <div class="summary-stat"><span>${nRounds}</span><small>manches</small></div>
    <div class="summary-stat"><span>${g.players.length}</span><small>joueurs</small></div>
    <div class="summary-stat"><span>${maxScore}</span><small>record de manche</small></div>
    <div class="summary-stat"><span>${gap}</span><small>pts d'écart final</small></div>
  `;
}

function generateAwards(g) {
  const ranked = g.finalRanked;
  const stats = g.stats;
  const totals = getTotals(g);
  const awards = [];

  // Champion (always first, always displayed)
  awards.push({ priority: 0, emoji:'🏆', title:'Le Champion', player: ranked[0].name, desc: `Vainqueur incontesté avec ${ranked[0].total} pts. À la prochaine.` });

  // Last place
  if (ranked.length > 1) {
    const snail = ranked[ranked.length-1];
    awards.push({ priority: 1, emoji:'🐌', title:'L\'Escargot', player: snail.name, desc: `Dernière place avec ${snail.total} pts. L'important c'est le voyage.` });
  }

  // Tyrant — led the most rounds
  if (stats.tyrant) {
    const tyrantCount = stats.leadCounts[stats.tyrant];
    awards.push({ priority: 2, emoji:'👑', title:'Le Tyran', player: stats.tyrant, desc: `En tête pendant ${tyrantCount} manche${tyrantCount>1?'s':''}. Le pouvoir est addictif.` });
  }

  // Gambler — highest variance (distinct from wall)
  if (stats.gambler && stats.gambler.name !== stats.wall?.name) {
    awards.push({ priority: 3, emoji:'🎲', title:'Le Flambeur', player: stats.gambler.name, desc: `Scores imprévisibles sur chaque manche. Vit pour le chaos.` });
  }

  // Wall — most consistent (distinct from gambler)
  if (stats.wall && stats.wall.name !== stats.gambler?.name) {
    const wallIsWinner = ranked[0].name === stats.wall.name;
    awards.push({ priority: 4, emoji:'🧱', title:'Le Mur', player: stats.wall.name, desc: wallIsWinner ? `Régularité absolue ET victoire. Le combo parfait.` : `Scores ultra-réguliers. Pas premier, mais imperturbable.` });
  }

  // Comeback
  if (stats.comeback && g.rounds.length > 2) {
    awards.push({ priority: 5, emoji:'🚀', title:'La Fusée', player: stats.comeback.name, desc: `La plus grosse remontée en seconde moitié de partie. Pas de panique, juste du talent.` });
  }

  // Sniper
  if (stats.sniper) {
    awards.push({ priority: 6, emoji:'🎯', title:'Le Sniper', player: stats.sniper.name, desc: `Meilleure manche à la toute dernière round. Le timing, c'est tout.` });
  }

  // Big Bang
  if (stats.bigBang) {
    awards.push({ priority: 7, emoji:'💥', title:'Le Big Bang', player: stats.bigBang.name, desc: `Le plus haut score sur une seule manche. Un tour légendaire.` });
  }

  // Collapse
  if (stats.collapse && g.rounds.length > 2) {
    awards.push({ priority: 8, emoji:'📉', title:'L\'Effondrement', player: stats.collapse.name, desc: `La plus grosse chute entre deux manches. Ce qui monte doit redescendre.` });
  }

  // Reversal
  if (stats.reversal) {
    awards.push({ priority: 9, emoji:'⚡', title:'Le Retournement', player: stats.reversal.name, desc: `Derrière pendant la majorité de la partie, vainqueur à la fin. Magistral.` });
  }

  // Clutch
  if (stats.clutch) {
    awards.push({ priority: 10, emoji:'🧊', title:'Le Sang-Froid', player: stats.clutch.name, desc: `Meilleures deux dernières manches combinées. La pression fait les diamants.` });
  }

  // Tourist — fixed condition: always in bottom half every round
  if (stats.tourist) {
    awards.push({ priority: 11, emoji:'🧳', title:'Le Touriste', player: stats.tourist.name, desc: `Jamais sorti du bas du classement. Juste content d'être là.` });
  }

  // Sleeper
  if (stats.sleeper) {
    awards.push({ priority: 12, emoji:'👻', title:'La Menace Fantôme', player: stats.sleeper.name, desc: `Discret en première moitié, explosif en seconde. On n'aurait pas dû les ignorer.` });
  }

  // Phoenix
  if (stats.phoenix) {
    awards.push({ priority: 13, emoji:'🔥', title:'Le Phoenix', player: stats.phoenix.name, desc: `Dernier à mi-partie, champion à la fin. Renaître des cendres, c'est un art.` });
  }

  // Low-score direction bonus
  if (g.direction === 'low') {
    awards.push({ priority: 14, emoji:'🎭', title:'Le Minimaliste', player: ranked[0].name, desc: `Moins c'est mieux. Le plus bas score remporte la mise.` });
  }

  // Champion du presque — 2nd place within 5%
  if (ranked.length >= 2) {
    const winner = ranked[0]; const runnerUp = ranked[1];
    const pct = Math.abs(winner.total - runnerUp.total) / Math.max(1, Math.abs(winner.total));
    if (pct < 0.05) {
      awards.push({ priority: 15, emoji:'🏅', title:'Champion du Presque', player: runnerUp.name, desc: `${Math.abs(winner.total - runnerUp.total)} point(s) d'écart. La victoire vous frôlait.` });
    }
  }

  // Round wins trophy
  const roundWinLeader = g.players.reduce((a,b) => stats.roundWins[a.idx] >= stats.roundWins[b.idx] ? a : b,
    {...g.players[0], idx: 0});
  if (stats.roundWins[roundWinLeader.idx] >= Math.ceil(g.rounds.length * 0.5)) {
    awards.push({ priority: 16, emoji:'⚔️', title:'Le Dominateur', player: roundWinLeader.name, desc: `A remporté ${stats.roundWins[roundWinLeader.idx]} manche${stats.roundWins[roundWinLeader.idx]>1?'s':''} sur ${g.rounds.length}. Une présence écrasante.` });
  }

  // Sort by priority and return all
  return awards.sort((a,b) => a.priority - b.priority);
}

// ============================================================
// HISTORY VIEW
// ============================================================
function renderHistory() {
  const container = document.getElementById('history-games-list');
  const gstats = document.getElementById('global-stats');

  const total = state.history.length;
  const allPlayers = {};
  state.history.forEach(g => {
    g.players?.forEach(p => {
      if (!allPlayers[p.name]) allPlayers[p.name] = {wins:0, games:0, podiums:0};
      allPlayers[p.name].games++;
    });
    if (g.winner) {
      if (!allPlayers[g.winner]) allPlayers[g.winner] = {wins:0, games:0, podiums:0};
      allPlayers[g.winner].wins++;
    }
    (g.finalRanked||[]).slice(0,3).forEach(p => {
      if (allPlayers[p.name]) allPlayers[p.name].podiums++;
    });
  });
  const topPlayer = Object.entries(allPlayers).sort((a,b)=>b[1].wins-a[1].wins)[0];
  const totalRounds = state.history.reduce((s,g)=>s+(g.rounds?.length||0),0);
  const uniquePlayers = Object.keys(allPlayers).length;

  gstats.innerHTML = `
    <div class="gstat"><div class="num">${total}</div><div class="lbl">Parties jouées</div></div>
    <div class="gstat"><div class="num">${totalRounds}</div><div class="lbl">Manches totales</div></div>
    <div class="gstat"><div class="num">${uniquePlayers}</div><div class="lbl">Joueurs uniques</div></div>
    <div class="gstat"><div class="num">${topPlayer ? topPlayer[0].slice(0,10) : '—'}</div><div class="lbl">Plus de victoires${topPlayer?' ('+topPlayer[1].wins+')':''}</div></div>`;

  if (!state.history.length) {
    container.innerHTML = '<p class="empty-message empty-message-xl">Aucune partie jouée. Lancez votre première partie !</p>';
    return;
  }

  container.innerHTML = state.history.slice().reverse().map((g,i) => {
    const realIdx = state.history.length - 1 - i;
    const top3 = (g.finalRanked || []).slice(0,3);
    return `
      <div class="history-game-card" onclick="reviewGame(${realIdx})">
        <div class="hgc-head">
          <span class="hgc-name">${g.name}</span>
          <span class="hgc-date">${new Date(g.date).toLocaleDateString('fr-FR')} · ${g.rounds?.length||0} manches</span>
          <span class="history-item-badge">${g.winner||'?'}</span>
        </div>
        <div class="hgc-podium">
          ${top3.map((p,r)=>`<span class="hgc-podium-chip" style="color:${p.color}">${['#1','#2','#3'][r]} ${p.avatar} ${p.name} <span class="mono" style="opacity:.6">${p.total}</span></span>`).join('')}
        </div>
        <div class="hgc-players">
          ${(g.players||[]).map(p=>`
            <div class="hgc-player-chip">
              <div style="width:0.5rem;height:0.5rem;border-radius:9999px;background:${p.color}"></div>
              ${p.avatar} ${p.name}
            </div>`).join('')}
        </div>
      </div>`;
  }).join('');
}

function reviewGame(idx) {
  const g = state.history[idx];
  if (!g) return;
  state.currentGame = {...g, _readonly: true};
  state.currentGame.finalRanked = state.currentGame.finalRanked || getRanked(g);
  state.currentGame.stats = state.currentGame.stats || computeStats(g);
  showView('awards');
}

// ============================================================
// CONFETTI
// ============================================================
function launchConfetti() {
  const container = document.getElementById('confetti');
  container.innerHTML = '';
  const colors = ['#7c3aed','#2563eb','#059669','#d97706','#db2777','#f59e0b','#10b981','#ef4444'];
  const shapes = ['2px','4px','6px','8px'];
  for (let i=0; i<120; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const size = shapes[Math.floor(Math.random()*shapes.length)];
    el.style.cssText = `
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${1.8+Math.random()*2.5}s;
      animation-delay:${Math.random()*1.2}s;
      width:${6+Math.random()*8}px;
      height:${6+Math.random()*8}px;
      border-radius:${Math.random()>0.5?'50%':size};
      transform:rotate(${Math.random()*360}deg);
    `;
    container.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// ============================================================
// INIT
// ============================================================
// Restore mid-game session if available
(function restoreSession() {
  const saved = localStorage.getItem('boardnight_current');
  if (saved) {
    try {
      const g = JSON.parse(saved);
      if (g && g.id && !g._readonly && g.rounds) {
        state.currentGame = g;
        const banner = document.getElementById('resume-banner');
        if (banner) {
          banner.style.display = 'flex';
          banner.querySelector('.resume-game-name').textContent = g.name;
          banner.querySelector('.resume-round').textContent = `Manche ${g.currentRound} · ${g.rounds.length} terminées`;
        }
      }
    } catch(e) { localStorage.removeItem('boardnight_current'); }
  }
})();

function discardCurrentGame() {
  state.currentGame = null;
  localStorage.removeItem('boardnight_current');
  const banner = document.getElementById('resume-banner');
  if (banner) banner.style.display = 'none';
}

initSetup();
renderWelcome();
