const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const twoPlayerBtn = document.getElementById('two-player-btn');
const aiBtn = document.getElementById('ai-btn');
const xWinsDisplay = document.getElementById('x-wins');
const oWinsDisplay = document.getElementById('o-wins');
const backgroundInteractive = document.getElementById('background-interactive');

let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
let gameActive = false;
let isAI = false;
let winningCombo = null;
let scores = { X: 0, O: 0 };

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]             
];

twoPlayerBtn.addEventListener('click', () => startGame(false));
aiBtn.addEventListener('click', () => startGame(true));
resetBtn.addEventListener('click', resetGame);
cells.forEach(cell => cell.addEventListener('click', handleCellClick));

function startGame(aiMode) {
    isAI = aiMode;
    gameActive = true;
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    winningCombo = null;
    status.textContent = `Player ${currentPlayer}'s Turn`;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('filled', 'x', 'o', 'winner');
    });
    updateBackground();
}

function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (gameState[index] !== '' || !gameActive) return;

    gameState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add('filled', currentPlayer.toLowerCase());

    updateBackground();

    if (checkWin()) {
        status.textContent = `Player ${currentPlayer} Wins!`;
        gameActive = false;
        scores[currentPlayer]++;
        updateScore();
        highlightWinningCells();
        setTimeout(celebrateWin, 500);
        return;
    }

    if (checkDraw()) {
        status.textContent = "It's a Draw!";
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `Player ${currentPlayer}'s Turn`;

    if (isAI && currentPlayer === 'O') {
        setTimeout(aiMove, 500);
    }
}

function checkWin() {
    for (let combo of winningCombinations) {
        if (combo.every(index => gameState[index] === currentPlayer)) {
            winningCombo = combo;
            return true;
        }
    }
    return false;
}

function checkDraw() {
    return gameState.every(cell => cell !== '');
}

function highlightWinningCells() {
    winningCombo.forEach(index => {
        cells[index].classList.add('winner');
    });
}

function celebrateWin() {
    confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: currentPlayer === 'X' ? ['#1a73e8', '#ffffff'] : ['#34c759', '#ffffff']
    });
}

function updateScore() {
    xWinsDisplay.textContent = scores.X;
    oWinsDisplay.textContent = scores.O;
}

function updateBackground() {
    const xCount = gameState.filter(cell => cell === 'X').length;
    const oCount = gameState.filter(cell => cell === 'O').length;
    const pattern = `radial-gradient(circle, rgba(26, 115, 232, 0.2) ${xCount * 5}%, rgba(52, 199, 89, 0.2) ${oCount * 5}%, rgba(0, 0, 0, 0.3) 100%)`;
    backgroundInteractive.style.background = pattern;
    backgroundInteractive.style.animation = 'bgPulse 2s infinite ease-in-out';
}

function aiMove() {
    const bestMove = minimax(gameState, 'O').index;
    gameState[bestMove] = 'O';
    const cell = cells[bestMove];
    cell.textContent = 'O';
    cell.classList.add('filled', 'o');

    updateBackground();

    if (checkWin()) {
        status.textContent = 'Player O (AI) Wins!';
        gameActive = false;
        scores['O']++;
        updateScore();
        highlightWinningCells();
        setTimeout(celebrateWin, 500);
        return;
    }

    if (checkDraw()) {
        status.textContent = "It's a Draw!";
        gameActive = false;
        return;
    }

    currentPlayer = 'X';
    status.textContent = `Player ${currentPlayer}'s Turn`;
}

function minimax(state, player) {
    const availableCells = state.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);

    if (checkWinForPlayer(state, 'X')) return { score: -10 };
    if (checkWinForPlayer(state, 'O')) return { score: 10 };
    if (availableCells.length === 0) return { score: 0 };

    const moves = [];
    for (let i of availableCells) {
        const move = {};
        move.index = i;
        const newState = [...state];
        newState[i] = player;

        if (player === 'O') {
            const result = minimax(newState, 'X');
            move.score = result.score;
        } else {
            const result = minimax(newState, 'O');
            move.score = result.score;
        }

        moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let move of moves) {
            if (move.score > bestScore) {
                bestScore = move.score;
                bestMove = move;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let move of moves) {
            if (move.score < bestScore) {
                bestScore = move.score;
                bestMove = move;
            }
        }
    }

    return bestMove;
}

function checkWinForPlayer(state, player) {
    return winningCombinations.some(combo => combo.every(index => state[index] === player));
}

function resetGame() {
    gameActive = false;
    isAI = false;
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    status.textContent = 'Choose a Mode to Start';
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('filled', 'x', 'o', 'winner');
    });
    updateBackground();
}