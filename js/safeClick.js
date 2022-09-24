'use strict';

var gIsSafeClickOn = false;
var gSafeClickCount = 3;

function onSafeClicked(elBtn) {
    if (!gGame.isOn) startTimer();
    gIsSafeClickOn = true;
    elBtn.style.border = '6px solid white';
    showSafeClick(gBoard, elBtn);
}

function showSafeClick(board, elBtn) {
    var iIdx = getRandomInt(0, board.length);
    var jIdx = getRandomInt(0, board.length);
    while (gBoard[iIdx][jIdx].isMine) {
        iIdx = getRandomInt(0, board.length);
        jIdx = getRandomInt(0, board.length);
    }
    var elSafeClick = document.querySelector(
        `[data-i="${iIdx}"][data-j="${jIdx}"]`
    );
    elSafeClick.style.background = 'green';
    setTimeout(() => {
        elSafeClick.style.background = 'lightgray';
        elBtn.style.border = 'none';
        gSafeClickCount--;
        elBtn.querySelector('.safe-click-count').innerText = gSafeClickCount;
    }, 2500);
}
