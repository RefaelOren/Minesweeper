'use strict';
// Model
const MINE = '💣';
const FLAG = '🚩';
const HINT = '💡';

var gBoard;
const gLevels = [
    { size: 4, mines: 2, lives: 1 },
    { size: 8, mines: 14, lives: 2 },
    { size: 12, mines: 32, lives: 3 },
];
var gLevel = gLevels[0];
var gLives = gLevel.lives;
var gTimerInterval;

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
};

// prevent default of right click
const elTable = document.querySelector('table');
elTable.addEventListener('contextmenu', (e) => e.preventDefault());

function initGame() {
    gBoard = buildBoard();
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);
    console.table(gBoard);
}

function onChooseLevel(elBtn) {
    if (gTimerInterval) return;
    var elLevelBtns = document.querySelectorAll('.level-btn');
    for (var i = 0; i < elLevelBtns.length; i++) {
        if (elLevelBtns[i].classList.contains('checked')) {
            elLevelBtns[i].classList.toggle('checked');
        }
    }
    // Model
    gLevel = gLevels[elBtn.dataset.id];
    gLives = gLevel.lives;
    gBoard = buildBoard();
    // Dom
    elBtn.classList.add('checked');
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);
    renderLives(gLives);
}

function renderLives(lives) {
    var elLives = document.querySelector('.lives');
    var strLivesHTML = '';
    for (var i = 0; i < lives; i++) {
        strLivesHTML += '❤️';
    }
    elLives.innerText = strLivesHTML;
}

function onCellClicked(elCell) {
    var iIdx = +elCell.dataset.i;
    var jIdx = +elCell.dataset.j;
    // todo
    // return if game is Not on
    // return if cell already clicked
    if (!elCell.classList.contains('cover')) return;
    // return if cell is marked with flag
    if (gBoard[iIdx][jIdx].isMarked) return;

    // check if hint on
    if (gIsHintOn && gHintsCount > 0) {
        showHint(iIdx, jIdx, gBoard);
        return;
    }
    // check if safe click on
    if (gIsSafeClickOn && gSafeClickCount > 0) {
        showSafeClick(gBoard);
        return;
    }
    // check if mega hint on
    if (gIsMegaHintOn) showMegaHint(elCell, iIdx, jIdx, gBoard);
    // check if pop 3 is on - only from level medium
    if (gIsPop3On) pop3Mines();

    // if click on mine
    //       - check if first click
    //       - check if lives left
    // if click on number
    // if click on empty cell

    // check victory
}

function showMegaHint(elCell, iIdx, jIdx, board) {}

function pop3Mines() {}

function onCellMarked(elCell) {
    if (!elCell.classList.contains('cover')) return;

    var iIdx = elCell.dataset.i;
    var jIdx = elCell.dataset.j;

    if (!gBoard[iIdx][jIdx].isMarked) {
        // update Model
        gBoard[iIdx][jIdx].isMarked = true;
        gGame.markedCount++;
        // update Dom
        elCell.innerText = FLAG;
        document.querySelector('.flags span').innerText = gGame.markedCount;
    } else {
        // update Model
        gBoard[iIdx][jIdx].isMarked = false;
        gGame.markedCount--;
        // update Dom
        elCell.innerHTML = `<span>${gBoard[iIdx][jIdx].content[0]}</span>`;
        document.querySelector('.flags span').innerText = gGame.markedCount;
    }
}
function startTimer() {
    gTimerInterval = setInterval(() => {
        document.querySelector('.timer span').innerText =
            gGame.secsPassed + '/s';
        gGame.secsPassed++;
    }, 1000);
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
                data-i="${i}" data-j="${j}" onclick="onCellClicked(this)"
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
