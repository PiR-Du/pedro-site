def solve_sudoku(flat):
    """Résout une grille 9x9 aplatie (liste de 81 ints, 0 = vide).
    Retourne la grille résolue (liste 81 ints) ou None si pas de solution."""
    grid = [list(flat[i * 9:(i + 1) * 9]) for i in range(9)]

    def candidates(r, c):
        used = set(grid[r])
        for i in range(9):
            used.add(grid[i][c])
        br, bc = (r // 3) * 3, (c // 3) * 3
        for i in range(br, br + 3):
            for j in range(bc, bc + 3):
                used.add(grid[i][j])
        return [n for n in range(1, 10) if n not in used]

    def find_empty():
        # MRV: choisit la case vide avec le moins de candidats
        best = None
        best_opts = None
        for r in range(9):
            for c in range(9):
                if grid[r][c] == 0:
                    opts = candidates(r, c)
                    if not opts:
                        return (r, c, [])
                    if best is None or len(opts) < len(best_opts):
                        best = (r, c)
                        best_opts = opts
                        if len(opts) == 1:
                            return (r, c, opts)
        if best is None:
            return None
        return (best[0], best[1], best_opts)

    def backtrack():
        spot = find_empty()
        if spot is None:
            return True
        r, c, opts = spot
        if not opts:
            return False
        for n in opts:
            grid[r][c] = n
            if backtrack():
                return True
            grid[r][c] = 0
        return False

    if not backtrack():
        return None
    return [grid[r][c] for r in range(9) for c in range(9)]
