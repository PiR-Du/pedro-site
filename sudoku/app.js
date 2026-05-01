    let grid = new Array(81).fill(0);
    let given = new Set();
    let solved = new Set();
    let selected = null;
    let pyodide = null;

    const gridEl = document.getElementById('grid');
    const numpadEl = document.getElementById('numpad');
    const statusEl = document.getElementById('status');
    const statusMsg = document.getElementById('status-msg');
    const btnSolve = document.getElementById('btn-solve');
    const btnReset = document.getElementById('btn-reset');

    for (let i = 0; i < 81; i++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.index = i;
      cell.dataset.row = Math.floor(i / 9);
      cell.dataset.col = i % 9;
      cell.setAttribute('aria-label', `Cellule ${Math.floor(i / 9) + 1},${(i % 9) + 1}`);
      cell.addEventListener('click', () => selectCell(i));
      gridEl.appendChild(cell);
    }

    for (let n = 1; n <= 9; n++) {
      const b = document.createElement('button');
      b.className = 'num-btn';
      b.textContent = n;
      b.addEventListener('click', () => enterNumber(n));
      numpadEl.appendChild(b);
    }

    const eraseBtn = document.createElement('button');
    eraseBtn.className = 'num-btn erase';
    eraseBtn.textContent = 'Suppr';
    eraseBtn.setAttribute('aria-label', 'Effacer');
    eraseBtn.addEventListener('click', () => enterNumber(0));
    numpadEl.appendChild(eraseBtn);

    function render() {
      const selVal = selected !== null ? grid[selected] : 0;
      for (let i = 0; i < 81; i++) {
        const cell = gridEl.children[i];
        const v = grid[i];
        cell.textContent = v === 0 ? '' : v;
        cell.classList.toggle('selected', i === selected);
        cell.classList.toggle('same-num', i !== selected && selVal > 0 && v === selVal);
        cell.classList.toggle('solved', solved.has(i));
      }
    }

    function selectCell(i) {
      selected = i;
      render();
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
      statusEl.className = 'status-bar ' + type;
      statusMsg.textContent = msg;
    }

    function resetGrid() {
      grid = new Array(81).fill(0);
      given.clear();
      solved.clear();
      selected = null;
      render();
      if (pyodide) setStatus('ready', 'Prêt - saisissez votre grille');
    }

    async function solveGrid() {
      if (!pyodide) return;
      setStatus('solving', 'Résolution en cours...');
      btnSolve.disabled = true;
      try {
        pyodide.globals.set('input_grid', pyodide.toPy(grid));
        const result = pyodide.runPython(`
from solver import solve_sudoku
result = solve_sudoku(list(input_grid))
result
        `);
        if (result === null || result === undefined) {
          setStatus('error', 'Aucune solution trouvée pour cette grille');
        } else {
          const arr = result.toJs();
          const newSolved = new Set();
          for (let i = 0; i < 81; i++) {
            if (!given.has(i)) newSolved.add(i);
            grid[i] = arr[i];
          }
          solved = newSolved;
          render();
          setStatus('solved', 'Grille résolue');
        }
      } catch (e) {
        setStatus('error', 'Erreur : ' + e.message);
      }
      btnSolve.disabled = false;
    }

    document.addEventListener('keydown', e => {
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

    (async function init() {
      try {
        pyodide = await loadPyodide();
        const code = await (await fetch('solver.py')).text();
        pyodide.FS.writeFile('/home/pyodide/solver.py', code);
        pyodide.runPython(`import sys\nif '/home/pyodide' not in sys.path: sys.path.insert(0, '/home/pyodide')`);
        setStatus('ready', 'Prêt - saisissez votre grille');
        btnSolve.disabled = false;
      } catch (e) {
        setStatus('error', 'Erreur de chargement : ' + e.message);
      }
    })();

    render();
