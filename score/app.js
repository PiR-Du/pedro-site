// ============================================================
// STATE
// ============================================================
const AVATARS = ['😀','😎','🤓','🥸','😈','👻','🐸','🐼','🦊','🐯','🦁','🐲','🚀','⚡','🌟','🎯','🎲','🃏','🏆','🎸'];
const COLORS = ['#7c3aed','#2563eb','#059669','#dc2626','#d97706','#db2777','#0891b2','#65a30d'];
const COLOR_NAMES = ['Violet','Blue','Green','Red','Amber','Pink','Cyan','Lime'];

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
  if (v === 'game') { renderLeaderboard(); renderScoreInputs(); renderRoundHistory(); renderChart(); }
  if (v === 'awards') renderAwards();
  window.scrollTo(0,0);
}

function toast(msg, dur=2500) {
  const c = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, dur);
}

function saveHistory() { localStorage.setItem('boardnight_history', JSON.stringify(state.history)); }

function getPlayerColor(color) { return color || '#7c3aed'; }

function variance(arr) {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a,b)=>a+b,0)/arr.length;
  return arr.reduce((s,x)=>s+(x-mean)**2,0)/arr.length;
}

// ============================================================
// WELCOME
// ============================================================
function renderWelcome() {
  const list = document.getElementById('recent-games-list');
  if (!state.history.length) { list.innerHTML = ''; return; }
  list.innerHTML = `<div class="eyebrow recent-title">Recent Games</div>` +
    state.history.slice(-5).reverse().map((g,i) => `
      <div class="history-item" onclick="reviewGame(${state.history.length-1-i})">
        <div class="history-avatar">${g.players[0]?.avatar||'🎲'}</div>
        <div class="history-item-info">
          <strong>${g.name}</strong>
          <span>${g.players.length} players · ${g.rounds.length} rounds · ${new Date(g.date).toLocaleDateString()}</span>
        </div>
        <span class="history-item-badge">${g.winner}</span>
      </div>`).join('');
}

// ============================================================
// SETUP
// ============================================================
function initSetup() {
  state.setupPlayers = [
    {name:'Player 1',avatar:'😀',color:COLORS[0]},
    {name:'Player 2',avatar:'😎',color:COLORS[1]},
  ];
  renderSetupPlayers();
}

function renderSetupPlayers() {
  const list = document.getElementById('player-list');
  list.innerHTML = state.setupPlayers.map((p,i) => `
    <div class="player-row" id="player-row-${i}">
      <div class="player-avatar-btn" onclick="openAvatarModal(${i})" title="Change avatar">${p.avatar}</div>
      <div class="player-color-dot" style="background:${p.color}"></div>
      <input class="player-name-input" type="text" value="${p.name}" placeholder="Player name"
        oninput="state.setupPlayers[${i}].name=this.value">
      <button class="btn btn-icon btn-danger" onclick="removePlayer(${i})" title="Remove">✕</button>
    </div>`).join('');
  document.getElementById('add-player-btn').style.display = state.setupPlayers.length >= 8 ? 'none' : '';
}

function addPlayerRow() {
  if (state.setupPlayers.length >= 8) return;
  const i = state.setupPlayers.length;
  state.setupPlayers.push({name:`Player ${i+1}`, avatar: AVATARS[i % AVATARS.length], color: COLORS[i % COLORS.length]});
  renderSetupPlayers();
}

function removePlayer(i) {
  if (state.setupPlayers.length <= 2) { toast('Need at least 2 players'); return; }
  state.setupPlayers.splice(i, 1);
  renderSetupPlayers();
}

function startGame() {
  const names = state.setupPlayers.map(p => p.name.trim()).filter(Boolean);
  if (names.length < 2) { toast('Add at least 2 players'); return; }
  const gameName = document.getElementById('game-name-input').value.trim() || 'Board Game Night';
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

  showView('game');
  document.getElementById('game-display-name').textContent = gameName;
  updateRoundInfo();
}

// ============================================================
// AVATAR MODAL
// ============================================================
function openAvatarModal(i) {
  state.avatarEditIdx = i;
  state.pendingAvatar = state.setupPlayers[i].avatar;
  state.pendingColor = state.setupPlayers[i].color;
  const grid = document.getElementById('avatar-grid');
  grid.innerHTML = AVATARS.map(a => `
    <div class="avatar-option${a===state.pendingAvatar?' selected':''}" onclick="selectAvatar('${a}',this)">${a}</div>`).join('');
  const cp = document.getElementById('color-picker');
  cp.innerHTML = COLORS.map((c,ci) => `
    <div class="color-swatch${c===state.pendingColor?' selected':''}" style="background:${c}" 
      title="${COLOR_NAMES[ci]}" onclick="selectColor('${c}',this)"></div>`).join('');
  document.getElementById('avatar-modal').classList.add('open');
}

function selectAvatar(a, el) {
  state.pendingAvatar = a;
  document.querySelectorAll('.avatar-option').forEach(e=>e.classList.remove('selected'));
  el.classList.add('selected');
}

function selectColor(c, el) {
  state.pendingColor = c;
  document.querySelectorAll('.color-swatch').forEach(e=>e.classList.remove('selected'));
  el.classList.add('selected');
}

function confirmAvatar() {
  const i = state.avatarEditIdx;
  state.setupPlayers[i].avatar = state.pendingAvatar;
  state.setupPlayers[i].color = state.pendingColor;
  closeModal();
  renderSetupPlayers();
}

function closeModal() {
  document.getElementById('avatar-modal').classList.remove('open');
}

document.getElementById('avatar-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ============================================================
// GAME VIEW
// ============================================================
function updateRoundInfo() {
  const g = state.currentGame;
  document.getElementById('round-info').textContent = `Round ${g.currentRound} · ${g.rounds.length} rounds completed`;
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
  return totals.sort((a,b) => g.direction==='high' ? b.total-a.total : a.total-b.total);
}

function renderLeaderboard() {
  const g = state.currentGame; if(!g) return;
  const ranked = getRanked(g);
  const leader = document.getElementById('leaderboard');
  leader.innerHTML = ranked.map((p,rank) => {
    const prev = g.rounds.length > 1 ? getPrevRank(g, p.idx) : rank+1;
    const delta = prev - (rank+1);
    let deltaHtml = '';
    if (g.rounds.length > 0) {
      if (delta > 0) deltaHtml = `<span class="standing-delta delta-up">▲${delta}</span>`;
      else if (delta < 0) deltaHtml = `<span class="standing-delta delta-down">▼${Math.abs(delta)}</span>`;
      else deltaHtml = `<span class="standing-delta delta-same">—</span>`;
    }
    return `
      <div class="player-standing${rank===0?' rank-1':''}">
        <div class="rank-number">${rank+1}</div>
        <div class="standing-avatar">${p.avatar}</div>
        <div class="standing-name" style="color:${rank===0?p.color:''}">${p.name}</div>
        ${deltaHtml}
        <div class="standing-score">${p.total}</div>
      </div>`;
  }).join('');
}

function getPrevRank(g, playerIdx) {
  if (g.rounds.length < 2) return 0;
  const prevRounds = g.rounds.slice(0,-1);
  const totals = g.players.map((_,i) => prevRounds.reduce((s,r)=>s+(r[i]??0),0));
  const sorted = [...totals].sort((a,b) => g.direction==='high'?b-a:a-b);
  const rank = sorted.indexOf(totals[playerIdx]);
  return rank + 1;
}

function renderScoreInputs() {
  const g = state.currentGame; if(!g) return;
  const container = document.getElementById('score-inputs');
  container.innerHTML = g.players.map((p,i) => `
    <div class="score-row">
      <div class="score-player-name">
        <span>${p.avatar}</span>
        <span style="color:${p.color}">${p.name}</span>
      </div>
      <div class="score-stepper">
        <button class="stepper-btn" onclick="stepScore(${i},-1)">−</button>
        <button class="stepper-btn" onclick="stepScore(${i},1)">+</button>
      </div>
      <input class="score-input-field" type="number" id="score-${i}" value="0" placeholder="0">
    </div>`).join('');
}

function stepScore(i, d) {
  const input = document.getElementById('score-'+i);
  input.value = parseInt(input.value||0) + d;
}

function submitRound() {
  const g = state.currentGame; if(!g) return;
  const scores = g.players.map((_,i) => {
    const v = parseInt(document.getElementById('score-'+i).value) || 0;
    return v;
  });
  g.rounds.push(scores);
  g.currentRound++;
  updateRoundInfo();
  renderLeaderboard();
  renderRoundHistory();
  renderChart();
  // Reset inputs
  g.players.forEach((_,i) => { document.getElementById('score-'+i).value = 0; });
  toast(`Round ${g.currentRound-1} recorded! ✓`);
}

function renderRoundHistory() {
  const g = state.currentGame; if(!g) return;
  const wrap = document.getElementById('round-history-wrap');
  if (!g.rounds.length) {
    wrap.innerHTML = '<p class="empty-message">No rounds yet</p>';
    return;
  }
  const totals = getTotals(g);
  wrap.innerHTML = `<table class="history-table">
    <thead>
      <tr>
        <th>Player</th>
        ${g.rounds.map((_,i)=>`<th>R${i+1}</th>`).join('')}
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${g.players.map((p,pi)=>`
        <tr>
          <td><span style="color:${p.color}">${p.avatar} ${p.name}</span></td>
          ${g.rounds.map((r,ri)=>`<td class="editable-cell mono" onclick="editCell(${pi},${ri})" title="Click to edit">${r[pi]??0}</td>`).join('')}
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
  cell.innerHTML = `<input class="inline-edit" type="number" value="${cur}" 
    onblur="commitEdit(${playerIdx},${roundIdx},this)" 
    onkeydown="if(event.key==='Enter')this.blur();if(event.key==='Escape'){this.value='${cur}';this.blur();}" autofocus>`;
  cell.querySelector('input').select();
}

function commitEdit(pi, ri, input) {
  const g = state.currentGame; if(!g) return;
  g.rounds[ri][pi] = parseInt(input.value) || 0;
  renderRoundHistory();
  renderLeaderboard();
  renderChart();
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

  const labels = g.rounds.map((_,i) => `R${i+1}`);

  if (state.chartMode === 'line') {
    // Cumulative
    const datasets = g.players.map((p,pi) => {
      let cum = 0;
      return {
        label: `${p.avatar} ${p.name}`,
        data: g.rounds.map(r => { cum += r[pi]??0; return cum; }),
        borderColor: p.color,
        backgroundColor: p.color + '22',
        tension: 0.35,
        fill: false,
        pointBackgroundColor: p.color,
        pointRadius: 4,
        borderWidth: 2.5,
      };
    });
    state.activeChart = new Chart(canvas, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { position: 'top', labels: { font: { family: "'JetBrains Mono'", size: 11 }, usePointStyle: true, padding: 12, boxWidth: 8 } } },
        scales: {
          x: { grid: { color: 'oklch(0.92 0.01 290)' }, ticks: { font: { family: "'JetBrains Mono'", size: 10 } } },
          y: { grid: { color: 'oklch(0.92 0.01 290)' }, ticks: { font: { family: "'JetBrains Mono'", size: 10 } } }
        },
        animation: { duration: 400 },
      }
    });
  }
}

function switchChart(mode, el) {
  state.chartMode = mode;
  document.querySelectorAll('.chart-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  renderChart();
}


// ============================================================
// END GAME
// ============================================================
function endGame() {
  const g = state.currentGame;
  if (!g) return;
  if (!g.rounds.length) { toast('Play at least one round first!'); return; }

  const ranked = getRanked(g);
  g.winner = ranked[0].name;
  g.finalRanked = ranked;
  g.stats = computeStats(g);

  // Save to history
  state.history.push({...g});
  saveHistory();

  showView('awards');
  launchConfetti();
}

function abandonGame() {
  if (!confirm('Abandon this game? Progress will be lost.')) return;
  state.currentGame = null;
  showView('welcome');
}

// ============================================================
// STATS COMPUTATION
// ============================================================
function computeStats(g) {
  const totals = getTotals(g);
  const ranked = getRanked(g);
  const n = g.players.length;

  // Biggest comeback: biggest positive rank change (last round vs first round after 1st round)
  let comeback = {gain: -Infinity, player: null};
  if (g.rounds.length > 1) {
    totals.forEach(p => {
      const firstHalf = g.rounds.slice(0, Math.ceil(g.rounds.length/2)).reduce((s,r)=>s+(r[p.idx]??0),0);
      const secondHalf = g.rounds.slice(Math.ceil(g.rounds.length/2)).reduce((s,r)=>s+(r[p.idx]??0),0);
      const gain = secondHalf - firstHalf;
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
    leadCounts[partial[0].name] = (leadCounts[partial[0].name]||0)+1;
  });
  const tyrant = Object.entries(leadCounts).sort((a,b)=>b[1]-a[1])[0];

  // Variance per player
  const vars = totals.map(p=>({...p, var: variance(p.perRound)}));
  vars.sort((a,b)=>b.var-a.var);
  const gambler = vars[0];
  const wall = vars[vars.length-1];

  // Sniper: big jump in last round
  let sniper = null;
  if (g.rounds.length > 1) {
    const lastRound = g.rounds[g.rounds.length-1];
    const maxLastScore = Math.max(...lastRound);
    const sniperIdx = lastRound.indexOf(maxLastScore);
    if (ranked[0].idx === sniperIdx) sniper = g.players[sniperIdx];
  }

  return { comeback: comeback.player, tyrant: tyrant?.[0], gambler, wall, sniper, ranked, leadCounts };
}

// ============================================================
// AWARDS VIEW
// ============================================================
function renderAwards() {
  const g = state.currentGame;
  if (!g || !g.finalRanked) return;

  document.getElementById('awards-game-name').textContent = g.name + ' · ' + new Date(g.date).toLocaleDateString();

  // Podium
  const podium = document.getElementById('podium');
  const top = g.finalRanked.slice(0,3);
  const medals = ['🥇','🥈','🥉'];
  const ranks = ['1st','2nd','3rd'];
  podium.innerHTML = top.map((p,i) => `
    <div class="podium-slot${i===0?' p1':''}">
      <span class="podium-avatar">${p.avatar}</span>
      <div class="podium-rank">${medals[i]} ${ranks[i]}</div>
      <div class="podium-name" style="color:${p.color}">${p.name}</div>
      <div class="podium-score">${p.total}</div>
    </div>`).join('');


  // Awards
  const awards = generateAwards(g);
  const grid = document.getElementById('awards-grid');
  grid.innerHTML = awards.map((a, i) => `
    <div class="award-card" style="animation-delay:${i*0.1}s">
      <span class="award-emoji">${a.emoji}</span>
      <div class="award-title">${a.title}</div>
      <div class="award-player">${a.player}</div>
      <div class="award-desc">${a.desc}</div>
    </div>`).join('');
}

function generateAwards(g) {
  const ranked = g.finalRanked;
  const stats = g.stats;
  const totals = getTotals(g);
  const awards = [];

  // The Snail - last place
  const snail = ranked[ranked.length-1];
  awards.push({ emoji:'🐌', title:'The Snail', player: snail.name, desc: `Dead last with ${snail.total} pts. The journey matters, not the destination.` });

  // The Tyrant - led the most rounds
  if (stats.tyrant) {
    awards.push({ emoji:'👑', title:'The Tyrant', player: stats.tyrant, desc: `Spent the most time at the top. Power is addictive.` });
  }

  // The Gambler - most volatile
  if (stats.gambler) {
    awards.push({ emoji:'🎰', title:'The Gambler', player: stats.gambler.name, desc: `Wildly unpredictable scores. Living for the chaos.` });
  }

  // The Wall - most consistent (but not first)
  const wallPlayer = ranked.find(p => p.name === stats.wall?.name && p !== ranked[0]);
  if (wallPlayer) {
    awards.push({ emoji:'🧱', title:'The Wall', player: stats.wall.name, desc: `Laser-consistent rounds. Not first, but unshakeable.` });
  }

  // The Rocket - biggest comeback
  if (stats.comeback && g.rounds.length > 2) {
    awards.push({ emoji:'🚀', title:'The Rocket', player: stats.comeback.name, desc: `Biggest second-half surge. They didn't panic, they planned.` });
  }

  // The Sniper - won on last round
  if (stats.sniper) {
    awards.push({ emoji:'🎯', title:'The Sniper', player: stats.sniper.name, desc: `Best performance in the final round. Timing is everything.` });
  }
  // 💥 BIG BANG — highest single round
  let bigBang = { val: -Infinity, player: null };
  totals.forEach(p => {
    p.perRound.forEach(score => {
      if (score > bigBang.val) {
        bigBang.val = score;
        bigBang.player = p;
      }
    });
  });

  if (bigBang.player) {
    awards.push({
      emoji: '💥',
      title: 'The Big Bang',
      player: bigBang.player.name,
      desc: 'One explosive turn.'
    });
  }

  // 🕳️ COLLAPSE — biggest drop between rounds
  let collapse = { val: -Infinity, player: null };
  totals.forEach(p => {
    for (let i = 1; i < p.perRound.length; i++) {
      const drop = p.perRound[i - 1] - p.perRound[i];
      if (drop > collapse.val) {
        collapse.val = drop;
        collapse.player = p;
      }
    }
  });

  if (collapse.player) {
    awards.push({
      emoji: '🕳️',
      title: 'The Collapse',
      player: collapse.player.name,
      desc: 'It all fell apart.'
    });
  }

  // 🔄 REVERSAL — beat someone who was ahead most of the game
  let reversal = null;
  totals.forEach(p => {
    let behindCount = 0;

    g.rounds.forEach((_, ri) => {
      const partial = getTotals({
        ...g,
        rounds: g.rounds.slice(0, ri + 1)
      });

      const sorted = partial.sort((a,b)=>g.direction==='high'?b.total-a.total:a.total-b.total);

      if (sorted[0].name !== p.name) behindCount++;
    });

    if (behindCount > g.rounds.length / 2 && ranked[0].name === p.name) {
      reversal = p;
    }
  });

  if (reversal) {
    awards.push({
      emoji: '🔄',
      title: 'The Reversal',
      player: reversal.name,
      desc: 'Tables: turned.'
    });
  }

  // ⏳ CLUTCH — best last 2 rounds combined
  let clutch = { val: -Infinity, player: null };
  totals.forEach(p => {
    const last2 = p.perRound.slice(-2).reduce((a,b)=>a+b,0);
    if (last2 > clutch.val) {
      clutch.val = last2;
      clutch.player = p;
    }
  });

  if (clutch.player) {
    awards.push({
      emoji: '⏳',
      title: 'The Clutch',
      player: clutch.player.name,
      desc: 'Pressure makes diamonds.'
    });
  }

  // 🐢 TOURIST — always behind
  let tourist = null;
  totals.forEach(p => {
    const alwaysLow = p.perRound.every(score => score < (Math.max(...p.perRound) * 0.6));
    if (alwaysLow) tourist = p;
  });

  if (tourist) {
    awards.push({
      emoji: '🐢',
      title: 'The Tourist',
      player: tourist.name,
      desc: 'Just happy to be here.'
    });
  }

  // 🧮 ACCOUNTANT — steady gains
  let accountant = { val: Infinity, player: null };
  totals.forEach(p => {
    const v = variance(p.perRound);
    if (v < accountant.val) {
      accountant.val = v;
      accountant.player = p;
    }
  });

  if (accountant.player) {
    awards.push({
      emoji: '🧮',
      title: 'The Accountant',
      player: accountant.player.name,
      desc: 'Slow, boring… effective.'
    });
  }

  // 🎢 ROLLERCOASTER — high variance
  let roller = { val: -Infinity, player: null };
  totals.forEach(p => {
    const v = variance(p.perRound);
    if (v > roller.val) {
      roller.val = v;
      roller.player = p;
    }
  });

  if (roller.player) {
    awards.push({
      emoji: '🎢',
      title: 'The Rollercoaster',
      player: roller.player.name,
      desc: 'Up, down, up, down…'
    });
  }

  // 💤 SLEEPER — late game spike
  let sleeper = null;
  totals.forEach(p => {
    const first = p.perRound.slice(0, Math.floor(p.perRound.length/2)).reduce((a,b)=>a+b,0);
    const second = p.perRound.slice(Math.floor(p.perRound.length/2)).reduce((a,b)=>a+b,0);
    if (second > first * 1.5) sleeper = p;
  });

  if (sleeper) {
    awards.push({
      emoji: '💤',
      title: 'The Sleeper',
      player: sleeper.name,
      desc: 'We should’ve watched them.'
    });
  }

  // The Champion - winner
  awards.push({ emoji:'🏆', title:'The Champion', player: ranked[0].name, desc: `Winner, winner, chicken dinner. Until next time.` });

  // Bonus: The Tortoise - if scoring direction is low and someone barely scored
  if (g.direction === 'low') {
    awards.push({ emoji:'🐢', title:'The Minimalist', player: ranked[0].name, desc: `Less is more. Scored the least, won the most.` });
  }

  return awards.slice(0, 9); // max 9 awards
}

// ============================================================
// HISTORY VIEW
// ============================================================
function renderHistory() {
  const container = document.getElementById('history-games-list');
  const gstats = document.getElementById('global-stats');

  // Global stats
  const total = state.history.length;
  const allPlayers = {};
  state.history.forEach(g => {
    g.players?.forEach(p => {
      if (!allPlayers[p.name]) allPlayers[p.name] = {wins:0,games:0};
      allPlayers[p.name].games++;
    });
    if (g.winner) {
      if (!allPlayers[g.winner]) allPlayers[g.winner] = {wins:0,games:0};
      allPlayers[g.winner].wins++;
    }
  });
  const topPlayer = Object.entries(allPlayers).sort((a,b)=>b[1].wins-a[1].wins)[0];
  const totalRounds = state.history.reduce((s,g)=>s+(g.rounds?.length||0),0);
  const uniquePlayers = Object.keys(allPlayers).length;

  gstats.innerHTML = `
    <div class="gstat"><div class="num">${total}</div><div class="lbl">Games played</div></div>
    <div class="gstat"><div class="num">${totalRounds}</div><div class="lbl">Total rounds</div></div>
    <div class="gstat"><div class="num">${uniquePlayers}</div><div class="lbl">Unique players</div></div>
    <div class="gstat"><div class="num">${topPlayer?topPlayer[0].slice(0,8):'—'}</div><div class="lbl">Most wins${topPlayer?' ('+topPlayer[1].wins+')':''}</div></div>`;

  if (!state.history.length) {
    container.innerHTML = '<p class="empty-message empty-message-xl">No games played yet. Start your first game!</p>';
    return;
  }

  container.innerHTML = state.history.slice().reverse().map((g,i) => {
    const realIdx = state.history.length - 1 - i;
    return `
      <div class="history-game-card" onclick="reviewGame(${realIdx})">
        <div class="hgc-head">
          <span class="hgc-avatar">${g.players?.[0]?.avatar||'🎲'}</span>
          <span class="hgc-name">${g.name}</span>
          <span class="hgc-date">${new Date(g.date).toLocaleDateString()} · ${g.rounds?.length||0} rounds</span>
          <span class="history-item-badge">
            🏆 ${g.winner||'?'}
          </span>
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
  // Load game as read-only view — just show the awards
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
  const colors = ['#7c3aed','#2563eb','#059669','#d97706','#db2777','#f59e0b','#10b981'];
  for (let i=0;i<80;i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${1.5+Math.random()*2}s;
      animation-delay:${Math.random()*0.8}s;
      width:${6+Math.random()*6}px;
      height:${6+Math.random()*6}px;
      transform:rotate(${Math.random()*360}deg);
    `;
    container.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// ============================================================
// INIT
// ============================================================
initSetup();
renderWelcome();
