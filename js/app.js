'use strict';
// Model
const MINE = '💣';
const FLAG = '🚩';
const HINT = '💡';
const PLAYER = '😐';
const WINNER = '🤩';
const LOSER = '😫';

var smallBoomSound = new Audio('sounds/smallBoom.mp3');
var bigBoomSound = new Audio('sounds/bigBoom.mp3');
var winSound = new Audio('sounds/win.mp3');
var gameOverSound = new Audio('sounds/gameOver.mp3');
var clockSound = new Audio('sounds/clock.mp3');

var gBoard;
const gLevels = [
    { size: 4, mines: 2, lives: 1, hints: 3 },
    { size: 8, mines: 14, lives: 2, hints: 3 },
    { size: 12, mines: 32, lives: 3, hints: 3 },
];
var gLevel = gLevels[0];

var gTimerInterval;

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: gLevel.lives,
};

var gIsFirstClick = true;
var gIsGameOver = false;

// prevent default of right click on game table
const elTable = document.querySelector('table');
elTable.addEventListener('contextmenu', (e) => e.preventDefault());

function initGame() {
    gBoard = buildBoard();
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);

    console.table(gBoard);
}

function onChooseLevel(elBtn) {
    if (gGame.isOn) return;
    var elLevelBtns = document.querySelectorAll('.level-btn');
    for (var i = 0; i < elLevelBtns.length; i++) {
        if (elLevelBtns[i].classList.contains('checked')) {
            elLevelBtns[i].classList.toggle('checked');
        }
    }
    // Model
    gLevel = gLevels[elBtn.dataset.id];
    gGame.lives = gLevel.lives;
    gBoard = buildBoard();
    // Dom
    elBtn.classList.add('checked');
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);
    renderLives(gLevel.lives);
    // on easy level exterminator pops: 1 mine, in medium:3, hard:6
    switch (gLevel.size) {
        case 4:
            gPopNum = 1;
            break;
        case 8:
            gPopNum = 3;
            break;
        case 12:
            gPopNum = 6;
            break;
    }
    console.table(gBoard);
    document.querySelector('.exterminator span').innerText = gPopNum;
}

function renderLives(lives) {
    var elLives = document.querySelector('.lives');
    var strLivesHTML = '';
    for (var i = 0; i < lives; i++) {
        strLivesHTML += '❤️';
    }
    elLives.innerText = strLivesHTML;
}

function onCellClicked(elCell, iIdx, jIdx) {
    if (gIsGameOver) return;
    if (gBoard[iIdx][jIdx].isMarked) return; //return if flag marked
    // check if hint on
    if (gIsHintOn && gLevel.hints > 0) {
        showHint(iIdx, jIdx, gBoard);
        return;
    }

    // check if mega hint on
    if (gIsMegaHintOn) {
        checkMegaHint(elCell);
        return;
    }

    // // check if pop mines is on
    // if (gIsPopOn && !gIsPopUsed) {
    //     popMines(gBoard);
    //     gIsPopUsed = true;
    // }

    if (!elCell.classList.contains('cover')) return; //return if shown

    if (elCell.innerText === MINE) {
        if (!gGame.isOn) startTimer();
        if (gIsFirstClick) {
            //check if first click
            moveMine(elCell, iIdx, jIdx, gBoard);
            gGame.isOn = true;
            return;
        }
        if (gGame.lives) {
            //check if have lives
            // Model
            smallBoomSound.play();
            gGame.lives--;
            gBoard[iIdx][jIdx].isShown = true;
            gGame.markedCount++;

            // Dom
            renderFlagsCount(gGame.markedCount);
            renderLives(gGame.lives);
            elCell.classList.remove('cover');
            elCell.style.background = 'red';
        } else {
            bigBoomSound.play();
            gameOverSound.play();
            revealMines(gBoard);
            setGameOver(false);
            console.log('game over');
        }
    } else if (elCell.innerText) {
        if (!gGame.isOn) startTimer();
        // Model
        gGame.isOn = true;
        gIsFirstClick = false;
        gGame.shownCount++;
        gBoard[iIdx][jIdx].isShown = true;
        // Dom
        renderCounts(gGame.shownCount);
        elCell.classList.remove('cover');
        checkVictory();
    } else {
        if (!gGame.isOn) startTimer();
        gGame.isOn = true;
        gIsFirstClick = false;

        gGame.shownCount++;
        renderCounts(gGame.shownCount);
        expandShown(elCell, iIdx, jIdx, gBoard);
        gGame.shownCount--;
        renderCounts(gGame.shownCount);
        checkVictory();
    }
}

function checkVictory() {
    console.log('shown count', gGame.shownCount);
    console.log('flag count', gGame.markedCount);
    var shownCount = checkShown(gBoard);
    var diff = gIsPopUsed ? gPopNum : 0;
    shownCount -= diff;
    console.log('flag', gGame.markedCount);
    console.log('count', shownCount);
    console.log('mines', gLevel.mines);
    console.log('shown', gLevel.size ** 2 - gLevel.mines);
    if (
        gGame.markedCount >= gLevel.mines &&
        shownCount >= gLevel.size ** 2 - gLevel.mines
    ) {
        console.log('win!');
        winSound.play();
        setGameOver(true);
    }
}

function checkShown(board) {
    var count = 0;
    console.table(board);
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isShown && !board[i][j].isMine) count++;
        }
    }
    renderCounts(count);
    return count;
}

function setGameOver(isWin) {
    clearInterval(gTimerInterval);
    // set local storage
    gIsGameOver = true;
    gGame.isOn = false;
    var elPlayerBtn = document.querySelector('.player-btn button');
    elPlayerBtn.innerText = isWin ? WINNER : LOSER;
    elPlayerBtn.style.background = isWin ? 'green' : 'red';
    elPlayerBtn.style.transform = 'scale(2)';
}

function onRestartGame(elBtn) {
    if (gGame.isOn) return;
    elBtn.style.background = 'lightgrey';
    elBtn.style.transform = 'scale(1)';
    elBtn.innerText = PLAYER;
    setupRestart();
}

function setupRestart() {
    // setup Model
    gIsGameOver = false;
    gIsFirstClick = true;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gGame.shownCount = 0;
    gGame.lives = gLevel.lives;
    gIsMegaHintUsed = false;
    gIsPopUsed = false;
    gSafeClickCount = 3;
    if (gLevel.lives === 1) gLevel.mines = 2;
    else if (gLevel.lives === 2) gLevel.mines = 14;
    else if (gLevel.lives === 3) gLevel.mines = 32;
    // setup Dom
    renderLives(gLevel.lives);
    renderTime(gGame.secsPassed);
    renderCounts(gGame.shownCount);
    renderFlagsCount(gGame.markedCount);
    renderHints(3);
    renderSafeClickCount(gSafeClickCount);
    document.querySelector('.mega-hint').style.background = 'rgb(21, 107, 54)';
    document.querySelector('.safe-click').style.background = 'rgb(88, 88, 219)';
    document.querySelector('.exterminator').style.background =
        'rgb(162, 46, 21)';
    initGame();
}

function renderCounts(count) {
    document.querySelector('.count span').innerText = count;
}

function expandShown(elCell, cellI, cellJ, board) {
    elCell.classList.remove('cover');
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) {
                board[i][j].isShown = true;
                continue;
            }
            var elNegCell = document.querySelector(
                `[data-i="${i}"][data-j="${j}"]`
            );
            if (board[i][j].isShown || board[i][j].isMine) continue;
            else {
                // Model
                board[i][j].isShown = true;
                gGame.shownCount++;
                //Dom
                elNegCell.classList.remove('cover');

                if (!elNegCell.innerText) {
                    expandShown(elNegCell, i, j, board);
                }
            }
        }
    }
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

// move mine if its first click
function moveMine(elCell, cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (!board[i][j].isMine) {
                // Model - prevCell
                gGame.shownCount++;
                board[cellI][cellJ].isMine = false;
                board[cellI][cellJ].content[0] = '';
                board[cellI][cellJ].isShown = true;

                // Dom - prevCell

                renderCounts(gGame.shownCount);
                elCell.innerText = '';

                //Model - newCell
                board[i][j].isMine = true;
                board[i][j].content[0] = MINE;

                //Dom - newCell
                document.querySelector(
                    `[data-i="${i}"][data-j="${j}"]`
                ).innerText = MINE;

                setMinesNegsCount(board);
                renderBoard(board);

                elCell.classList.remove('cover');
                gIsFirstClick = false;

                return;
            }
        }
    }
}

function onCellMarked(elCell) {
    if (gIsGameOver) return;
    if (!elCell.classList.contains('cover')) return;

    var iIdx = elCell.dataset.i;
    var jIdx = elCell.dataset.j;

    if (!gBoard[iIdx][jIdx].isMarked) {
        // update Model
        gBoard[iIdx][jIdx].isMarked = true;
        gGame.markedCount++;
        // update Dom
        elCell.innerText = FLAG;
        renderFlagsCount(gGame.markedCount);
        checkVictory(gGame.markedCount);
    } else {
        // update Model
        gBoard[iIdx][jIdx].isMarked = false;
        gGame.markedCount--;
        // update Dom
        elCell.innerHTML = `<span>${gBoard[iIdx][jIdx].content[0]}</span>`;
        renderFlagsCount(gGame.markedCount);
    }
}

function renderFlagsCount(count) {
    document.querySelector('.flags span').innerText = count;
}

function startTimer() {
    clockSound.play();
    gTimerInterval = setInterval(() => {
        gGame.secsPassed++;
        renderTime(gGame.secsPassed);
    }, 1000);
}

function renderTime(time) {
    document.querySelector('.timer span').innerText = time + '/s';
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j];
            var minesNegsCount = countMineAround(i, j, board);
            currCell.minesCountAround = minesNegsCount;
        }
    }
}

function countMineAround(cellI, cellJ, board) {
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
        var iIdx = getRandomInt(0, board.length);
        var jIdx = getRandomInt(0, board.length);

        if (board[iIdx][jIdx].isMine) {
            iIdx = getRandomInt(0, board.length);
            jIdx = getRandomInt(0, board.length);
            i--;
        } else {
            board[iIdx][jIdx].isMine = true;
            board[iIdx][jIdx].content.unshift(MINE);
        }
    }
}
