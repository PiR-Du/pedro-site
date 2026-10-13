const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';

let grid = new Array(81).fill(0);
let given = new Set();
let solved = new Set();
let selected = null;
let pyodideReady = null; // promesse, créée au premier calcul

const gridEl = document.getElementById('grid');
const numpadEl = document.getElementById('numpad');
const statusEl = document.getElementById('status');
const statusMsg = document.getElementById('status-msg');
const btnSolve = document.getElementById('btn-solve');
const btnReset = document.getElementById('btn-reset');

for (let i = 0; i < 81; i++) {
  const cell = document.createElement('button');
  cell.type = 'button';
  cell.className = 'sudoku__cell';
  cell.dataset.index = i;
  cell.addEventListener('click', () => selectCell(i));
  cell.addEventListener('focus', () => { if (selected !== i) selectCell(i, false); });
  gridEl.appendChild(cell);
}

for (let n = 1; n <= 9; n++) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'btn numpad__key';
  b.textContent = n;
  b.addEventListener('click', () => enterNumber(n));
  numpadEl.appendChild(b);
}

const eraseBtn = document.createElement('button');
eraseBtn.type = 'button';
eraseBtn.className = 'btn numpad__key numpad__key--wide';
eraseBtn.textContent = 'Effacer la case';
eraseBtn.addEventListener('click', () => enterNumber(0));
numpadEl.appendChild(eraseBtn);

function render() {
  const selVal = selected !== null ? grid[selected] : 0;
  for (let i = 0; i < 81; i++) {
    const cell = gridEl.children[i];
    const v = grid[i];
    cell.textContent = v === 0 ? '' : v;
    cell.setAttribute('aria-label', `Ligne ${Math.floor(i / 9) + 1}, colonne ${(i % 9) + 1}, ${v === 0 ? 'vide' : v}`);
    cell.tabIndex = i === (selected ?? 0) ? 0 : -1; // une seule case dans l'ordre de tabulation
    cell.classList.toggle('is-selected', i === selected);
    cell.classList.toggle('is-same', i !== selected && selVal > 0 && v === selVal);
    cell.classList.toggle('is-solved', solved.has(i));
  }
}

function selectCell(i, focus = true) {
  selected = i;
  render();
  if (focus) gridEl.children[i].focus();
}

function enterNumber(n) {
  if (selected === null) return;
  grid[selected] = n;
  if (n === 0) given.delete(selected);
  else given.add(selected);
  solved.delete(selected);
  render();
}

function setStatus(type, msg) {
  statusEl.className = 'status' + (type ? ' status--' + type : '');
  statusMsg.textContent = msg;
}

function resetGrid() {
  grid = new Array(81).fill(0);
  given.clear();
  solved.clear();
  selected = null;
  render();
  setStatus(pyodideReady ? 'ready' : '', 'Grille vide, saisissez vos chiffres');
}

// Pyodide (10 Mo) n'est chargé qu'au premier calcul : la page reste réactive à l'ouverture.
function loadPyodideOnce() {
  if (pyodideReady) return pyodideReady;
  pyodideReady = (async () => {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = PYODIDE_URL;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Pyodide est injoignable'));
      document.head.appendChild(script);
    });
    const py = await loadPyodide();
    const code = await (await fetch('solver.py')).text();
    py.FS.writeFile('/home/pyodide/solver.py', code);
    py.runPython(`import sys\nif '/home/pyodide' not in sys.path: sys.path.insert(0, '/home/pyodide')`);
    return py;
  })();
  pyodideReady.catch(() => { pyodideReady = null; });
  return pyodideReady;
}

async function solveGrid() {
  btnSolve.disabled = true;
  try {
    setStatus('loading', 'Chargement de Python');
    const py = await loadPyodideOnce();
    setStatus('loading', 'Résolution en cours');
    py.globals.set('input_grid', py.toPy(grid));
    const result = py.runPython(`
from solver import solve_sudoku
result = solve_sudoku(list(input_grid))
result
    `);
    if (result === null || result === undefined) {
      setStatus('error', 'Erreur : aucune solution pour cette grille');
    } else {
      const arr = result.toJs();
      const newSolved = new Set();
      for (let i = 0; i < 81; i++) {
        if (!given.has(i)) newSolved.add(i);
        grid[i] = arr[i];
      }
      solved = newSolved;
      render();
      setStatus('ready', 'Grille résolue');
    }
  } catch (e) {
    setStatus('error', 'Erreur : ' + e.message);
  }
  btnSolve.disabled = false;
}

gridEl.addEventListener('keydown', e => {
  if (selected === null) return;
  if (e.key >= '1' && e.key <= '9') { enterNumber(parseInt(e.key, 10)); return; }
  if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') { enterNumber(0); return; }
  const moves = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 };
  if (moves[e.key] !== undefined) {
    e.preventDefault();
    const next = selected + moves[e.key];
    if (next >= 0 && next < 81) selectCell(next);
  }
});

btnSolve.addEventListener('click', solveGrid);
btnReset.addEventListener('click', resetGrid);

render();
