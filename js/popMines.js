'use strict';

var gIsPopUsed = false;
var gPopNum = 1; //default - easy level

function onClickedPopMines(elBtn) {
    if (gIsGameOver || gIsPopUsed) {
        return;
    }
    if (!gGame.isOn) {
        startTimer();
        gGame.isOn = true;
    }
    elBtn.style.border = '6px solid white';
    setTimeout(() => {
        elBtn.style.border = 'none';
        elBtn.style.background = 'lightgrey';
    }, 1000);
    popMines(gBoard);
}

function popMines(board) {
    for (var i = 0; i < gPopNum; i++) {
        popRandomMine(board);
        gGame.markedCount++;
    }
}

function popRandomMine(board) {
    var mines = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j];
            if (currCell.isMine && !currCell.isShown) {
                var currElCell = document.querySelector(
                    `[data-i="${i}"][data-j="${j}"]`
                );
                mines.push(currElCell);
            }
        }
    }
    console.log(mines);
    var randIdx = getRandomInt(0, mines.length);
    console.log(randIdx);
    var cellPoped = mines[randIdx];
    console.log(cellPoped);
    var iIdx = +cellPoped.dataset.i;
    var jIdx = +cellPoped.dataset.j;
    // Model
    gIsPopUsed = true;
    board[iIdx][jIdx].isMine = false;
    board[iIdx][jIdx].content[0] = '';

    // Dom
    smallBoomSound.play();
    cellPoped.innerText = '';

    setMinesNegsCount(board);
    renderBoard(board);
}
