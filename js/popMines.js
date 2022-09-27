'use strict';

var gIsPopOn = false;
var gIsPopUsed = false;
var gPopNum = 1; //default - easy level

function onClickedPopMines(elBtn) {
    if (gIsGameOver) {
        return;
    }
    if (gIsPopUsed) return;
    alert(`Click on any cell and ${gPopNum} mines will pop away!!!`);
    if (!gGame.isOn) {
        startTimer();
        gGame.isOn = true;
    }

    gIsPopOn = true;
    elBtn.style.border = '6px solid white';
    setTimeout(() => {
        elBtn.style.border = 'none';
        elBtn.style.background = 'lightgrey';
    }, 2000);
}

function popMines(board) {
    console.log('hey');
    for (var i = 0; i < gPopNum; i++) {
        popRandomMine(board);
        gGame.markedCount++;
    }
}

function popRandomMine(board) {
    // setting random area to pull random mine
    var iIdxStart = getRandomInt(0, board.length / 2);
    var iIdxEnd = getRandomInt(board.length / 2, board.length);
    var jIdxStart = getRandomInt(0, board.length / 2);
    var jIdxEnd = getRandomInt(board.length / 2, board.length);
    for (var i = iIdxStart; i < iIdxEnd; i++) {
        for (var j = jIdxStart; j < jIdxEnd; j++) {
            var currCell = board[i][j];
            if (currCell.isMine && !currCell.isShown) {
                //Model
                currCell.isMine = false;
                currCell.content[0] = '';
                //Dom
                document.querySelector(
                    `[data-i="${i}"][data-j="${j}"]`
                ).innerText = '';
                setMinesNegsCount(board);
                renderBoard(board);
                return;
            }
        }
    }
}
