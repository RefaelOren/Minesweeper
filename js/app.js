'use strict';
const MINE = '💣';
const FLAG = '🚩';

// Model
var gBoard;
var gTimerInterval;
var gIsGameOver = false;
var gIsFirstClick = true;
var gIsHintClicked = false;
var gHintsCount = 3;

const gLevels = [
    { size: 4, mines: 2, lives: 1 },
    { size: 8, mines: 14, lives: 2 },
    { size: 12, mines: 32, lives: 3 },
];

var gLevel = gLevels[2];
var gLives = gLevel.lives;
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
};

function initGame() {
    gBoard = buildBoard();
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);

    console.table(gBoard);
}

function onRestartGame(elBtn) {
    // setup model and Dom
    initGame();
    gIsGameOver = false;
    gGame.isOn = false;
    gIsFirstClick = true;
    gGame.shownCount = 0;
    showCount();
    elBtn.innerText = '😐';
    elBtn.style.background = 'lightgray';
    gGame.secsPassed = 0;
    document.querySelector('.timer span').innerText = '0';
    clearInterval(gTimerInterval);
    gLives = gLevel.lives;
    renderLives(gLives);
    gHintsCount = 3;
    renderHints(gHintsCount);
}

function onChooseLevel(elBtn) {
    if (gGame.isOn) return;
    var elLevelBtns = document.querySelectorAll('.level-btn');
    for (var i = 0; i < elLevelBtns.length; i++) {
        if (elLevelBtns[i].classList.contains('checked')) {
            elLevelBtns[i].classList.toggle('checked');
        }
    }
    gIsGameOver = false;
    elBtn.classList.add('checked');
    gLevel = gLevels[elBtn.dataset.id];
    gLives = gLevel.lives;
    gBoard = buildBoard();
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);
    console.log(gLevel.lives);
    renderLives(gLives);
}

function renderLives(lives) {
    var elLives = document.querySelector('.lives');
    var strLivesHTML = '';
    console.log('gLives', lives);
    for (var i = 0; i < lives; i++) {
        strLivesHTML += '❤️';
    }
    elLives.innerText = strLivesHTML;
}

function onCellClicked(elCell, iIdx, jIdx) {
    if (gIsGameOver) return;
    if (!gGame.isOn) startTimer();
    gGame.isOn = true;
    if (gBoard[iIdx][jIdx].isMarked) return;
    if (!elCell.classList.contains('cover')) return;

    if (elCell.innerText === MINE) {
        // check first click
        if (gIsFirstClick) {
            gBoard = buildBoard();
            renderBoard(gBoard);
            gIsFirstClick = false;
        }
        // check lives
        if (gLives > 0) {
            gLives--;
            elCell.classList.remove('cover');
            renderLives(gLives);
            gGame.markedCount++;
            return;
        }
        revealMines(gBoard);
        gGame.isOn = false;
        console.log(gGame.isOn);
    } else if (elCell.innerText) {
        // check hints
        if (gIsHintClicked && gHintsCount > 0 && elCell.innerText !== MINE) {
            showHintNegs(iIdx, jIdx);
            setTimeout(() => {
                coverHints(iIdx, jIdx);
            }, 1000);
            gHintsCount--;
            renderHints(gHintsCount);
        }
        elCell.classList.remove('cover');
        gGame.shownCount++;
        console.log('count', gGame.shownCount);
    } else {
        expandShown(gBoard, elCell, iIdx, jIdx);
    }
    gIsFirstClick = false;
    showCount();
    checkGameOver();
}

function renderHints(numHints) {
    var strHintsHTML = '';
    for (var i = 0; i < numHints; i++) {
        strHintsHTML += '💡';
    }
    var elHintsBtn = document.querySelector('.hints');
    elHintsBtn.innerText = strHintsHTML;
    elHintsBtn.style.border = ' 2px solid black';
    gIsHintClicked = false;
}

function coverHints(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            var elCellNegs = document.querySelector(
                `[data-i="${i}"][data-j="${j}"]`
            );
            elCellNegs.classList.add('cover');
        }
    }
}

function showHintNegs(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            // if (i === cellI && j === cellJ) continue;
            var elCellNegs = document.querySelector(
                `[data-i="${i}"][data-j="${j}"]`
            );
            elCellNegs.classList.remove('cover');
        }
    }
}

function checkGameOver() {
    console.log('is on', gGame.isOn);
    if (!gGame.isOn) {
        gameOver(false);
        gIsGameOver = true;
        return true;
    } else if (
        gGame.shownCount === gLevel.size ** 2 - gLevel.mines &&
        gGame.markedCount === gLevel.mines
    ) {
        gGame.isOn = false;
        gameOver(true);
        gIsGameOver = true;
        return true;
    }
    return false;
}

function gameOver(isWin) {
    stopClock();
    console.log('game over', 'win? ' + isWin);
    var elPlayerBtn = document.querySelector('.player-btn button');
    elPlayerBtn.innerText = isWin ? '🤩' : '🤯';
    elPlayerBtn.style.background = isWin ? 'green' : 'red';
}

function showCount() {
    gGame.shownCount = gIsGameOver ? 0 : gGame.shownCount;
    document.querySelector('.count span').innerText = gGame.shownCount;
}

function expandShown(board, elCell, cellI, cellJ) {
    elCell.classList.remove('cover');

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) {
                gGame.shownCount++;
                console.log('count', gGame.shownCount);
                continue;
            }

            var elNegsCell = document.querySelector(
                `[data-i="${i}"][data-j="${j}"]`
            );
            if (
                elNegsCell.classList.contains('cover') //&&
                // elNegsCell.innerText !== MINE
            ) {
                elNegsCell.classList.remove('cover');
                gGame.shownCount++;
            }
        }
    }
    // expandShown(board, elCell, i, j);
}

function stopClock() {
    clearInterval(gTimerInterval);
}

function revealMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j];
            if (currCell.content[0] === MINE) {
                var elCell = document.querySelector(
                    `[data-i="${i}"][data-j="${j}"]`
                );
                elCell.classList.remove('cover');
                elCell.style.background = 'red';
            }
        }
    }
}

// prevent default of right click
const elTable = document.querySelector('table');
elTable.addEventListener('contextmenu', (e) => e.preventDefault());

function onCellMarked(elCell) {
    if (!gGame.isOn) return;
    if (!elCell.classList.contains('cover')) return;

    var iIdx = elCell.dataset.i;
    var jIdx = elCell.dataset.j;

    if (!gBoard[iIdx][jIdx].isMarked) {
        // update Model
        gBoard[iIdx][jIdx].isMarked = true;
        gGame.markedCount++;
        // update Dom
        elCell.innerText = FLAG;
    } else {
        // update Model
        gBoard[iIdx][jIdx].isMarked = false;
        gGame.markedCount--;
        // update Dom
        elCell.innerHTML = `<span>${gBoard[iIdx][jIdx].content[0]}</span>`;
    }
    console.log('marke:', gGame.markedCount);
}

function startTimer() {
    var currTime = 1;
    gTimerInterval = setInterval(() => {
        document.querySelector('.timer span').innerText = currTime + '/s';
        gGame.secsPassed++;
        currTime++;
    }, 1000);
}

function onClickedHint(elBtn) {
    gIsHintClicked = true;
    elBtn.style.border = '6px solid white';
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j];
            var minesNegsCount = countMinesAround(i, j, board);
            currCell.minesCountAround = minesNegsCount;
        }
    }
}

function countMinesAround(cellI, cellJ, board) {
    var mineAroundCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j].isMine) mineAroundCount++;
        }
    }
    return mineAroundCount;
}

function buildBoard() {
    var board = [];
    console.log(gLevel);
    for (var i = 0; i < gLevel.size; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j] = {
                minesCountAround: 4,
                isShown: false,
                isMine: false,
                isMarked: false,
                content: [''],
            };
        }
    }

    setRandomMines(board);

    return board;
}

function renderBoard(board) {
    var strHTML = ``;
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`;
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j];
            var classCover = currCell.isShown ? '' : 'cover';
            // show in Dom if  mine or a number that bigger then 0
            var cellContent = '';
            if (currCell.isMine) cellContent = MINE;
            else if (currCell.minesCountAround > 0) {
                cellContent = currCell.minesCountAround;
                currCell.content.unshift(currCell.minesCountAround + '');
            }

            strHTML += `
                \n<td class="cell ${classCover}"
                data-i="${i}" data-j="${j}" onclick="onCellClicked(this,${i},${j})"
                oncontextmenu="onCellMarked(this)">
                <span class="color-${currCell.minesCountAround}">${cellContent}</span>
                </td>`;
        }
        strHTML += `</tr>\n`;
    }
    document.querySelector('table').innerHTML = strHTML;
}

function setRandomMines(board) {
    var minesAmount = gLevel.mines;
    for (var i = 0; i < minesAmount; i++) {
        var iIdx = getRandomInt(0, board.length - 1);
        var jIdx = getRandomInt(0, board.length - 1);

        board[iIdx][jIdx].isMine = true;
        board[iIdx][jIdx].content.unshift(MINE);
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}
