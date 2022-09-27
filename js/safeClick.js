'use strict';

var gIsSafeClickOn = false;
var gSafeClickCount = 3;

// check if safe click on
if (gIsSafeClickOn && gSafeClickCount > 0) {
    showSafeClick(gBoard);
}

function onSafeClicked(elBtn) {
    if (!gGame.isOn) startTimer();
    if (!gSafeClickCount || gIsGameOver) return;
    gGame.isOn = true;
    gIsSafeClickOn = true;
    elBtn.style.border = '6px solid white';
    showSafeClick(gBoard, elBtn);
}

function showSafeClick(board, elBtn) {
    var iIdx = getRandomInt(0, board.length);
    var jIdx = getRandomInt(0, board.length);
    while (gBoard[iIdx][jIdx].isMine || gBoard[iIdx][jIdx].isShown) {
        iIdx = getRandomInt(0, board.length);
        jIdx = getRandomInt(0, board.length);
        if (checkShown(board) >= gLevel.size ** 2 - gLevel.mines) break;
    }
    var elSafeClick = document.querySelector(
        `[data-i="${iIdx}"][data-j="${jIdx}"]`
    );
    elSafeClick.classList.add('safe-click-on');
    setTimeout(() => {
        elSafeClick.classList.remove('safe-click-on');
        elBtn.style.border = 'none';
        gSafeClickCount--;
        renderSafeClickCount(gSafeClickCount, elBtn);
        if (!gSafeClickCount) elBtn.style.background = 'lightgrey';
    }, 2500);
}

function renderSafeClickCount(count) {
    document.querySelector('.safe-click-count').innerText = count;
}
