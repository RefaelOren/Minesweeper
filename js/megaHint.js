'use strict';

var gIsMegaHintOn = false;

var gFirstCell;
var gSecondCell;
var gIsMegaHintUsed = false;

function onClickedMegaHint(elBtn) {
    if (gIsGameOver) return;
    elBtn.style.border = '6px solid white';
    alert(
        'Mega Hint!!!\npay attention! mega hint from top left to top right\nclick on 2 cells and get the mega hint!'
    );
    gIsMegaHintOn = true;
}

function checkMegaHint(elCell) {
    if (!gGame.isOn) startTimer();
    gGame.isOn = true;
    console.log('first click', elCell);
    if (!gFirstCell) {
        gFirstCell = elCell;
        console.log('first cell', gFirstCell);
        gFirstCell.classList.add('mega-hint-on');
    } else {
        gSecondCell = elCell;
        gSecondCell.classList.add('mega-hint-on');

        showMegaHint(gFirstCell, gSecondCell);
    }
}

function cancelMegaHint(startCell, endCell) {
    gIsMegaHintOn = false;
    gFirstCell = null;
    gSecondCell = null;
    startCell.classList.remove('mega-hint-on');
    endCell.classList.remove('mega-hint-on');
    document.querySelector('.mega-hint').style.border = 'none';
}

function showMegaHint(startCell, endCell) {
    var unCoverCells = [];
    var startI = +startCell.dataset.i;
    var startJ = +startCell.dataset.j;
    var endI = +endCell.dataset.i;
    var endJ = +endCell.dataset.j;
    // invalid mega hint -alert user and cancel mega hint
    if (startI > endI || startJ > endJ) {
        alert(
            'invalid cells!\n - mega hint from top left to right bottom only!\n try again'
        );
        cancelMegaHint(startCell, endCell);
        return;
    }
    for (var i = startI; i <= endI; i++) {
        for (var j = startJ; j <= endJ; j++) {
            var ellCurrCell = document.querySelector(
                `[data-i="${i}"][data-j="${j}"]`
            );
            if (ellCurrCell.classList.contains('cover')) {
                ellCurrCell.classList.remove('cover');
                unCoverCells.push(ellCurrCell);
            }
        }
    }
    setTimeout(() => {
        for (var i = 0; i < unCoverCells.length; i++) {
            // Model
            gIsMegaHintOn = false;
            gIsMegaHintUsed = true;
            // Dom
            unCoverCells[i].classList.add('cover');
            startCell.classList.remove('mega-hint-on');
            endCell.classList.remove('mega-hint-on');
            var elMegaBtn = document.querySelector('.mega-hint');
            elMegaBtn.style.border = 'none';
            elMegaBtn.style.background = 'lightgrey';
        }
    }, 2000);
}
