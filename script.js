// script.js

const SIZE = 9;
const board = [];
let selectedNumber = null;

window.onload = () => {
    createNumberPad();
    createBoard();
    document.getElementById('solve-button').addEventListener('click', solveSudoku);
    document.getElementById('reset-button').addEventListener('click', resetBoard);
};

function createNumberPad() {
    const numberPad = document.getElementById('number-pad');
    const numbers = numberPad.querySelectorAll('.number');

    numbers.forEach(number => {
        number.addEventListener('click', () => {
            // Deselect all numbers
            numbers.forEach(num => num.classList.remove('selected'));

            // Select the clicked number
            if (number.dataset.number !== '0') {
                number.classList.add('selected');
                selectedNumber = number.dataset.number;
            } else {
                selectedNumber = null;
            }
        });
    });
}

function createBoard() {
    const boardContainer = document.getElementById('sudoku-board');

    for (let row = 0; row < SIZE; row++) {
        board[row] = [];
        for (let col = 0; col < SIZE; col++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.readOnly = true; // Prevent manual typing
            input.dataset.row = row;
            input.dataset.col = col;

            input.addEventListener('click', handleCellClick);

            board[row][col] = input;
            boardContainer.appendChild(input);
        }
    }
}

function handleCellClick(e) {
    const input = e.target;
    const row = input.dataset.row;
    const col = input.dataset.col;

    if (selectedNumber !== null) {
        // Update the cell value
        input.value = selectedNumber;
    } else {
        // Erase the cell value
        input.value = '';
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

    const startTime = Date.now();
    const timeLimit = 100; // in milliseconds
    let timeoutExceeded = false;

    if (sudokuSolver(grid, startTime, timeLimit)) {
        setBoardValues(grid);
        displayMessage('Sudoku solved successfully!', false);
    } else if (timeoutExceeded) {
        displayMessage('No solution found within 100ms.', true);
    } else {
        displayMessage('No solution exists for the given Sudoku.', true);
    }
}

let timeoutExceeded = false;

function sudokuSolver(grid, startTime, timeLimit) {
    // Check if time limit exceeded
    if (Date.now() - startTime > timeLimit) {
        timeoutExceeded = true;
        return false;
    }

    const emptySpot = findEmpty(grid);

    if (!emptySpot) {
        return true; // Puzzle solved
    }

    const [row, col] = emptySpot;

    for (let num = 1; num <= 9; num++) {
        if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;

            if (sudokuSolver(grid, startTime, timeLimit)) {
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

function resetBoard() {
    for (let row of board) {
        for (let cell of row) {
            cell.value = '';
            cell.classList.remove('conflict');
        }
    }
    removeConflictClass();
    selectedNumber = null;

    // Deselect any selected number
    const numbers = document.querySelectorAll('.number');
    numbers.forEach(num => num.classList.remove('selected'));

    displayMessage('Board reset.', false);
}