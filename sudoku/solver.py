def is_valid(board, row, col, num):
    # Vérif ligne
    if num in board[row]:
        return False

    # Vérif colonne
    if num in [board[r][col] for r in range(9)]:
        return False

    # Vérif carré 3x3
    start_row, start_col = 3 * (row // 3), 3 * (col // 3)
    for r in range(start_row, start_row + 3):
        for c in range(start_col, start_col + 3):
            if board[r][c] == num:
                return False

    return True


def solve(board):
    for row in range(9):
        for col in range(9):
            if board[row][col] == 0:
                for num in range(1, 10):
                    if is_valid(board, row, col, num):
                        board[row][col] = num
                        if solve(board):
                            return True
                        board[row][col] = 0
                return False  # Aucun chiffre ne convient → backtrack
    return True  # Toutes les cases sont remplies


def solve_sudoku(flat_grid):
    # Reconstruction de la grille 9x9
    board = [flat_grid[i*9:(i+1)*9] for i in range(9)]

    if solve(board):
        # Aplatissement pour renvoyer à JS
        return [board[r][c] for r in range(9) for c in range(9)]
    else:
        return None