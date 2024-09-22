'use strict'

const MINE = '💣'
const FLAG = '🚩'
const SMILEYNORMAL = '😄' 
const SMILEYDEAD = '🤯' 
const SMILEYWIN = '😎'
const LIFE = '💗'
const HINT = '💡'

var gBoard = []

var gMines = []

var gLevels = [
    { SIZE: 4, MINES: 2, HINTS: 1, LIVES: 1 },
    { SIZE: 8, MINES: 14, HINTS: 2, LIVES: 2 },
    { SIZE: 12, MINES: 32, HINTS: 3, LIVES: 3 },
]

var gLevel = gLevels[0]

var gLifeLost = 0

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gGameInterval
var gIsvictory = false

window.addEventListener("contextmenu", e => e.preventDefault())

function onInit() {

    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gBoard.secsPassed = 0
    gLifeLost = 0
    gMines = []

    gBoard = buildBoard()
    renderBoard(gBoard)
    renderButtons()
    renderLives()
    renderSmiley()
    console.log("gLevel.LIVES", gLevel.LIVES)
    console.log("gLevels[0].LIVES", gLevels[0].LIVES)
    console.log("gLevels[1].LIVES", gLevels[1].LIVES)
    console.log("gLevels[2].LIVES", gLevels[2].LIVES)

}

function chooseLevel(level) {

    clearInterval(gGameInterval)

    switch (level.innerText) {

        case 'Beginner':
            gLevel = gLevels[0]
            break
        case 'Medium':
            gLevel = gLevels[1]
            break
        case 'Expert':
            gLevel = gLevels[2]
            break
        default:
    }

    onInit()
}

function createBoard(size) {
    var board = []
    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = ''
        }
    }
    return board
}


function buildBoard() {
    var board = createBoard(gLevel.SIZE)
    var cell = {}

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
        }


    }

    // board[1][2].isMine = true
    // board[2][3].isMine = true



    return board
}


function placeMines(board, idxI, idxJ) {

    var mineCount = 0
    while (mineCount < gLevel.MINES) {
        var i = getRandomInt(0, gLevel.SIZE)
        var j = getRandomInt(0, gLevel.SIZE)
        if (!board[i][j].isMine && (i !== idxI && j !== idxJ)) {
            board[i][j].isMine = true
            gMines.push({ i: i, j: j })
            mineCount++
        }
    }

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount = setMinesNegsCount(i, j, board)
            }
        }
    }

    return board
}

function setMinesNegsCount(cellI, cellJ, mat) {
    var minesAroundCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > mat[i].length - 1) continue
            if (i === cellI && j === cellJ) continue
            if (mat[i][j].isMine) minesAroundCount++
        }
    }
    return minesAroundCount
}


function renderBoard(board) {
    var strHTML = ''
    var cellDisp
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            var className = `cell cell-${i}-${j}`
            className += cell.isShown ? ' shown' : ' hidden'
            //strHTML += '<td class = "' + className + '"' + ' onclick="onCellClicked(this,' + i + ',' + j + ')">'
            if (cell.isShown) {
                if (!cell.isMine) {
                    cellDisp = cell.minesAroundCount
                } else { cellDisp = MINE }
            } else {
                if (cell.isMarked) {
                    cellDisp = FLAG
                } else {
                    cellDisp = ''
                }
            }

            //strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i}, ${j})">${cell}</td>`
            strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j})">${cellDisp}</td>`

        }
        strHTML += '</tr>'
    }
    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML

    // Creating a mat that shows the board content to help with debugging
    var boardValues = []
    for (var i = 0; i < board.length; i++) {
        boardValues[i] = []
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine) {
                boardValues[i][j] = '*'
            } else boardValues[i][j] = board[i][j].minesAroundCount
        }

    }
    console.table(boardValues)
}

function renderButtons() {
    var strHtmlButtons = `<button onclick="chooseLevel(this)" class="b1">Beginner</button>` + `<button onclick="chooseLevel(this)" class="b2">Medium</button>` + `<button onclick="chooseLevel(this)" class="b3">Expert</button>`
    var elButtons = document.querySelector('.buttons')
    elButtons.innerHTML = strHtmlButtons
}

function renderLives() {
    var lives = genLives() 
    var strHtmlLives = `Lives: ${lives}`
    var elLife = document.querySelector('.life')
    elLife.innerHTML = strHtmlLives
    
}

function genLives() {
    var livesHtml = LIFE
    var strLives = ''
    for (var i = 0; i < gLevel.LIVES - gLifeLost; i++) {
        strLives += livesHtml
    }
    return strLives
}

function renderSmiley() {
    var strHtmlSmiley = `<button onclick="onInit()">`
    var normal = `${SMILEYNORMAL}`
    var win = `${SMILEYWIN}`
    var lose = `${SMILEYDEAD}`
    strHtmlSmiley += gGame.isOn ? normal : gIsvictory ? win : lose
    
    console.log('gGame.isOn', gGame.isOn)
    console.log('gIsvictory', gIsvictory)
    strHtmlSmiley += `</button>`
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerHTML = strHtmlSmiley;
}



//Called when a cell is clicked

function onCellClicked(elCell, i, j) {

    // if (cell.isShown || !gGame.isOn) return

    if (gGame.shownCount === 0) {
        placeMines(gBoard, i, j)

    }

    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isShown = true
        if (!gBoard[i][j].isMine) {  
            gGame.shownCount++
            expandShown(i, j)
        }
        //LOSE: when clicking a mine, all the mines are revealed
        else {
            
            if ((gLevel.LIVES - gLifeLost) === 1){
                for (var i = 0; i < gMines.length; i++) {
                    var currMine = gBoard[gMines[i].i][gMines[i].j]
                    currMine.isShown = true
                }
                gGame.isOn = false
                gIsvictory = false
                renderSmiley()
            } 
            gLifeLost++
            renderLives()
        }

        checkGameOver()
        console.log('checkGameOver', checkGameOver())

    }

    renderBoard(gBoard)

}


//Called when a cell is right- clicked See how you can hide the context menu on right click
//Right click flags/unflags a suspected cell (cannot reveal a flagged cell)

function onCellMarked(elCell, i, j) {

    if (!gBoard[i][j].isShown) {
        if (!gBoard[i][j].isMarked) {
            if (gGame.markedCount < gLevel.MINES) {
                gBoard[i][j].isMarked = true
                gGame.markedCount++
            }
        } else {
            gBoard[i][j].isMarked = false
            gGame.markedCount--
        }
    }
    checkGameOver()
    console.log('checkGameOver', checkGameOver())
    renderBoard(gBoard)
}

//Game ends when:
//LOSE: when clicking a mine, all the mines are revealed
//WIN: all the mines are flagged, and all the other cells are shown

//Game ends when all mines are marked, and all the other cells are shown

function checkGameOver() {
    var allMinesMarked
    var markedMines = 0

    for (var i = 0; i < gMines.length; i++) {
        var currMine = gBoard[gMines[i].i][gMines[i].j]
        if (currMine.isMarked) markedMines++
    }

    if (markedMines === gLevel.MINES) {
        allMinesMarked = true
    } else {
        allMinesMarked = false
    }

    console.log("allMinesMarked", allMinesMarked)

    if (gGame.shownCount === (gLevel.SIZE ** 2 - gLevel.MINES) && allMinesMarked) {
        gGame.isOn = false
        gIsvictory = true
        console.log("gGame.isOn", gGame.isOn)
        console.log("gIsvictory", gIsvictory)
        renderSmiley()
        return true
    } else return false

}

//When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.
//NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors
//BONUS: if you have the time later, try to work more like the real algorithm (see description at the Bonuses section below)

function expandShown(i, j) {
    var cell = gBoard[i][j]
    if (cell.minesAroundCount === 0) {
        for (var idxI = i - 1; idxI <= i + 1; idxI++) {
            if (idxI < 0 || idxI > gBoard.length - 1) continue
            for (var idxJ = j - 1; idxJ <= j + 1; idxJ++) {
                if (idxJ < 0 || idxJ > gBoard[idxI].length - 1) continue
                if (idxI === i && idxJ === j) continue
                if (!gBoard[idxI][idxJ].isShown && !gBoard[idxI][idxJ].isMarked) {
                    gBoard[idxI][idxJ].isShown = true
                    gGame.shownCount++
                    console.log('gGame.shownCount', gGame.shownCount)
                    expandShown(idxI, idxJ)
                }
            }
        }
    }

}