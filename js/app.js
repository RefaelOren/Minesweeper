'use strict';
const MINE = '💣';
const FLAG = '🚩';

// Model
var gBoard;
const gLevelEasy = {
    size: 4,
    mines: 2,
};
// const gLevelMedium = {
//     size: 8,
//     mines: 14,
// };
// const gLevelHard = {
//     size: 12,
//     mines: 32,
// };
var gLevel = gLevelEasy;
var gTimerInterval;

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

function onCellClicked(elCell) {
    if (!gGame.isOn) startTimer();

    var iIdx = elCell.dataset.i;
    var jIdx = elCell.dataset.j;

    if (gBoard[iIdx][jIdx].isMarked) return;
    if (!elCell.classList.contains('cover')) return;
    gGame.isOn = true;
    if (elCell.innerText !== MINE && elCell.innerText)
        elCell.classList.remove('cover');
}

// prevent default of right click
const elTable = document.querySelector('table');
elTable.addEventListener('contextmenu', (e) => e.preventDefault());

function onCellMarked(elCell) {
    if (!elCell.classList.contains('cover')) return;

    var iIdx = elCell.dataset.i;
    var jIdx = elCell.dataset.j;

    if (!gBoard[iIdx][jIdx].isMarked) {
        // update Model
        gBoard[iIdx][jIdx].isMarked = true;
        // update Dom
        elCell.innerText = FLAG;
    } else {
        // update Model
        gBoard[iIdx][jIdx].isMarked = false;
        // update Dom
        elCell.innerHTML = `<span>${gBoard[iIdx][jIdx].content[0]}</span>`;
    }
}

function startTimer() {
    var currTime = 1;
    gTimerInterval = setInterval(() => {
        document.querySelector('.timer span').innerText = currTime + '/s';
        gGame.secsPassed++;
        currTime++;
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
        var iIdx = getRandomInt(0, board.length - 1);
        var jIdx = getRandomInt(0, board.length - 1);

        board[iIdx][jIdx].isMine = true;
        board[iIdx][jIdx].content.unshift(MINE);
    }
}
console.log(getRandomInt(0, 3));
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}
