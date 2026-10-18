// Monopoly, édition française : probabilités exactes par chaîne de Markov.
// Source des valeurs « monopoly-* » de labo/data.js (fiche monopoly-cases-rentables).
// Usage : node labo/datasets/monopoly-markov.js  → affiche un JSON par stratégie de prison.
//   sq       : fréquentation à long terme des 40 cases, en % (une observation = un lancer de dés)
//   jail     : part des lancers où le pion est incarcéré ; visite : simple visite de la case 10
//   convJail : probabilité d'être sur la case 10 après n lancers en partant de Départ
//   tv       : distance (variation totale) entre la loi après n lancers et la loi stationnaire, en %
const CHANCE = [7, 22, 36], CAISSE = [2, 17, 33], JAIL = 'J';
// Distribution des destinations après résolution de la case d'arrivée : [[dest, p], ...] ; dest = 0..39 ou 'J'
function resolve(sq) {
  if (sq === 30) return [[JAIL, 1]];
  if (CHANCE.includes(sq)) {
    const out = [[0, 1/16], [39, 1/16], [11, 1/16], [24, 1/16], [15, 1/16], [JAIL, 1/16], [sq, 9/16]];
    resolve((sq + 37) % 40).forEach(([d, p]) => out.push([d, p / 16]));
    return out;
  }
  if (CAISSE.includes(sq)) return [[0, 1/16], [1, 1/16], [JAIL, 1/16], [sq, 13/16]];
  return [[sq, 1]];
}
const ROLLS = []; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) ROLLS.push([a + b, a === b]);
// États : 's,d' (case s, d doubles déjà faits ce tour) et 'J,k' (en prison, k tentatives ratées)
function build(policy) {
  const states = [];
  for (let s = 0; s < 40; s++) if (s !== 30) for (let d = 0; d < 3; d++) states.push(`${s},${d}`);
  const maxK = policy === 'payer' ? 1 : 3;
  for (let k = 0; k < maxK; k++) states.push(`J,${k}`);
  const idx = new Map(states.map((s, i) => [s, i]));
  const T = states.map(() => new Map());
  const add = (i, key, p) => { const j = idx.get(key); T[i].set(j, (T[i].get(j) || 0) + p); };
  const land = (i, from, sum, nextD, p) => resolve((from + sum) % 40).forEach(([dst, q]) => add(i, dst === JAIL ? 'J,0' : `${dst},${nextD}`, p * q));
  states.forEach((st, i) => {
    const [a, b] = st.split(','); const k = +b;
    ROLLS.forEach(([sum, dbl]) => {
      const p = 1 / 36;
      if (a !== 'J') {
        if (dbl && k === 2) add(i, 'J,0', p);
        else land(i, +a, sum, dbl ? k + 1 : 0, p);
      } else if (policy === 'payer') {
        land(i, 10, sum, dbl ? 1 : 0, p);
      } else {
        if (dbl) land(i, 10, sum, 0, p);
        else if (k < 2) add(i, `J,${k + 1}`, p);
        else land(i, 10, sum, 0, p);
      }
    });
  });
  return { states, idx, T };
}
function step(T, v) { const out = new Float64Array(v.length); T.forEach((row, i) => { if (v[i]) row.forEach((p, j) => { out[j] += v[i] * p; }); }); return out; }
function squares(states, v) {
  const sq = new Array(40).fill(0); let jail = 0;
  states.forEach((st, i) => { const [a] = st.split(','); if (a === 'J') { sq[10] += v[i]; jail += v[i]; } else sq[+a] += v[i]; });
  return { sq, jail };
}
const out = {};
for (const policy of ['payer', 'attendre']) {
  const { states, idx, T } = build(policy);
  let v = new Float64Array(states.length); v[idx.get('0,0')] = 1;
  const conv = [];
  for (let n = 1; n <= 5000; n++) { v = step(T, v); if (n <= 60) conv.push(squares(states, v)); }
  const st = squares(states, v);
  const tv = conv.map(c => 0.5 * c.sq.reduce((s, x, i) => s + Math.abs(x - st.sq[i]), 0));
  out[policy] = { sq: st.sq.map(x => +(100 * x).toFixed(3)), jail: +(100 * st.jail).toFixed(3), visite: +(100 * (st.sq[10] - st.jail)).toFixed(3),
    convJail: conv.map(c => +(100 * c.sq[10]).toFixed(3)), tv: tv.map(x => +(100 * x).toFixed(3)) };
}
console.log(JSON.stringify(out));
