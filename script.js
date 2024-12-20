// script.js

const SIZE = 9;
const board = [];

window.onload = () => {
    createBoard();
    document.getElementById('solve-button').addEventListener('click', solveSudoku);
};

function createBoard() {
    const boardContainer = document.getElementById('sudoku-board');

    for (let row = 0; row < SIZE; row++) {
        board[row] = [];
        for (let col = 0; col < SIZE; col++) {
            const cell = document.createElement('input');
            cell.type = 'number';
            cell.min = 1;
            cell.max = 9;
            cell.dataset.row = row;
            cell.dataset.col = col;

            cell.addEventListener('input', handleInput);
            cell.addEventListener('focus', removeConflictClass);

            board[row][col] = cell;
            boardContainer.appendChild(cell);
        }
    }
}

function handleInput(e) {
    const input = e.target;
    let value = parseInt(input.value);

    if (isNaN(value) || value < 1 || value > 9) {
        input.value = '';
        value = null;
    }

    checkConflicts();
}

function checkConflicts() {
    removeConflictClass();

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const cell = board[row][col];
            const value = parseInt(cell.value);

            if (!value) continue;

            // Check row and column
            for (let i = 0; i < SIZE; i++) {
                if (i !== col && board[row][i].value == value) {
                    cell.classList.add('conflict');
                    board[row][i].classList.add('conflict');
                }
                if (i !== row && board[i][col].value == value) {
                    cell.classList.add('conflict');
                    board[i][col].classList.add('conflict');
                }
            }

            // Check 3x3 subgrid
            const startRow = Math.floor(row / 3) * 3;
            const startCol = Math.floor(col / 3) * 3;

            for (let r = startRow; r < startRow + 3; r++) {
                for (let c = startCol; c < startCol + 3; c++) {
                    if ((r !== row || c !== col) && board[r][c].value == value) {
                        cell.classList.add('conflict');
                        board[r][c].classList.add('conflict');
                    }
                }
            }
        }
    }
}

function removeConflictClass() {
    for (let row of board) {
        for (let cell of row) {
            cell.classList.remove('conflict');
        }
    }
}

function getBoardValues() {
    const grid = [];
    for (let row = 0; row < SIZE; row++) {
        grid[row] = [];
        for (let col = 0; col < SIZE; col++) {
            const value = parseInt(board[row][col].value);
            grid[row][col] = isNaN(value) ? 0 : value;
        }
    }
    return grid;
}

function setBoardValues(grid) {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            board[row][col].value = grid[row][col] || '';
        }
    }
}

function displayMessage(message, isError = true) {
    const messageDiv = document.getElementById('message');
    messageDiv.style.color = isError ? 'red' : 'green';
    messageDiv.textContent = message;

    setTimeout(() => {
        messageDiv.textContent = '';
    }, 5000);
}

function solveSudoku() {
    const grid = getBoardValues();

    if (hasConflicts() || !isValidBoard(grid)) {
        displayMessage('Please fix the highlighted conflicts before solving.');
        return;
    }

    if (sudokuSolver(grid)) {
        setBoardValues(grid);
        displayMessage('Sudoku solved successfully!', false);
    } else {
        displayMessage('No solution exists for the given Sudoku.');
    }
}

function hasConflicts() {
    for (let row of board) {
        for (let cell of row) {
            if (cell.classList.contains('conflict')) {
                return true;
            }
        }
    }
    return false;
}

function isValidBoard(grid) {
    // Check for any invalid numbers (should be between 1 and 9 or 0)
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const num = grid[row][col];
            if (num < 0 || num > 9) {
                return false;
            }
        }
    }
    return true;
}

function sudokuSolver(grid) {
    const emptySpot = findEmpty(grid);

    if (!emptySpot) {
        return true; // Puzzle solved
    }

    const [row, col] = emptySpot;

    for (let num = 1; num <= 9; num++) {
        if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;

            if (sudokuSolver(grid)) {
                return true;
            }

            grid[row][col] = 0;
        }
    }
    return false; // Trigger backtracking
}

function findEmpty(grid) {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (grid[row][col] === 0) {
                return [row, col];
            }
        }
    }
    return null;
}

function isSafe(grid, row, col, num) {
    // Check row
    for (let x = 0; x < SIZE; x++) {
        if (grid[row][x] === num) {
            return false;
        }
    }

    // Check column
    for (let x = 0; x < SIZE; x++) {
        if (grid[x][col] === num) {
            return false;
        }
    }

    // Check 3x3 subgrid
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
            if (grid[r][c] === num) {
                return false;
            }
        }
    }

    return true;
}