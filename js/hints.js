'use strict';

var gIsHintOn = false;
var gHintsCount = 3;

function onClickedHints(elHints) {
    gIsHintOn = true;
    elHints.style.border = '6px solid white';
}

function showHint(cellI, cellJ, board) {
    if (!gGame.isOn) startTimer();
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            // if (i === cellI && j === cellJ) continue;

            var elCellNegs = document.querySelector(
                `[data-i="${i}"][data-j="${j}"]`
            );
            elCellNegs.classList.remove('cover');
        }
    }
    setTimeout(() => {
        hideHints(cellI, cellJ, gBoard);
    }, 1000);

    // Model
    gIsHintOn = false;
    gHintsCount--;
    // Dom
    var strHintsHTML = '';
    for (var h = 0; h < gHintsCount; h++) {
        strHintsHTML += HINT;
    }
    var elHints = document.querySelector('.hints');
    elHints.innerText = strHintsHTML;
    elHints.style.border = 'none';
}

function hideHints(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            var elCellNegs = document.querySelector(
                `[data-i="${i}"][data-j="${j}"]`
            );
            elCellNegs.classList.add('cover');
        }
    }
}
