'use strict'

const MINE = '💣'
const FLAG = '🚩'
const SMILEYNORMAL = '😄'
const SMILEYDEAD = '🤯'
const SMILEYWIN = '😎'
const LIFE = '💗'
const HINT = '💡'
const USED_HINT = '🔅'

var gBoard = []

var gMines = []

var gLevels = [
    { SIZE: 4, MINES: 2, HINTS: 1, LIVES: 1 },
    { SIZE: 8, MINES: 14, HINTS: 2, LIVES: 2 },
    { SIZE: 12, MINES: 32, HINTS: 3, LIVES: 3 },
]

var gLevel = gLevels[0]

var gLifeLost
var gHintUsed
var gHintIsOn

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gGameInterval
var gIsvictory = false
var gBestScoreLevel = 'bestScore' + gLevel.SIZE
var display = document.querySelector('.time')
var isRuning = false
var startTime = 0
var timer = null
var elapsedTime = 0 

window.addEventListener("contextmenu", e => e.preventDefault())

function onInit() {

    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gBoard.secsPassed = 0
    gLifeLost = 0
    gHintUsed = 0
    gHintIsOn = false
    gMines = []

    gBoard = buildBoard()
    renderBoard(gBoard)
    renderButtons()
    renderLives()
    renderHints()
    renderSmiley()
    resetTimer()
    renderBestScore()
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

function renderHints() {
    var hints = genHints()
    //`<button onclick="chooseLevel(this)">Hints: ${hints}</span>`
    var strHtmlHints = `<span class="hints" onclick="onClickHint()">Hints: ${hints}</span>`
    var elHint = document.querySelector('.hints')
    elHint.innerHTML = strHtmlHints

}

function genHints() {
    var hintsHtml = HINT
    var usedhintsHtml = USED_HINT
    var strHints = ''
    for (var i = 0; i < gLevel.HINTS - gHintUsed; i++) {
        strHints += hintsHtml
    }

    for (var i = 0; i < gHintUsed; i++) {
        strHints += usedhintsHtml
    }

    return strHints
}

function onClickHint() {

    gHintUsed++
    gHintIsOn = true

    renderHints()

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
        onTimer()
    }

    if (gHintIsOn) {
        handleHint(i,j)

  

        

    } else {

        if (!gBoard[i][j].isMarked) {
            gBoard[i][j].isShown = true
            if (!gBoard[i][j].isMine) {
                gGame.shownCount++
                expandShown(i, j)
            }
            //LOSE: when clicking a mine, all the mines are revealed
            else {

                if ((gLevel.LIVES - gLifeLost) === 1) {
                    for (var i = 0; i < gMines.length; i++) {
                        var currMine = gBoard[gMines[i].i][gMines[i].j]
                        currMine.isShown = true
                    }
                    gGame.isOn = false
                    gIsvictory = false
                    stopTimer()
                    renderSmiley()
                }
                gLifeLost++
                renderLives()
            }

        }

        checkGameOver()

    }

    renderBoard(gBoard)

}

function handleHint(i,j){

    var revealedCells = []
    
    for (var idxI = i - 1; idxI <= i + 1; idxI++) {
        if (idxI < 0 || idxI > gBoard.length - 1) continue
        for (var idxJ = j - 1; idxJ <= j + 1; idxJ++) {
            if (idxJ < 0 || idxJ > gBoard[idxI].length - 1) continue
            if (!gBoard[idxI][idxJ].isShown) {
                gBoard[idxI][idxJ].isShown = true
                revealedCells.push({i:idxI,j:idxJ})
            }
        }
    } 

    renderBoard(gBoard)

    setTimeout(() => {
        for (var idxI = 0; idxI< revealedCells.length; idxI++) {
       
                    gBoard[revealedCells[idxI].i][revealedCells[idxI].j].isShown = false
                
                }

        renderBoard(gBoard)
        
      }, 1000)
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


    if (gGame.shownCount === (gLevel.SIZE ** 2 - gLevel.MINES) && allMinesMarked) {
        gGame.isOn = false
        gIsvictory = true
        checkBestScore()
        renderBestScore()
        renderSmiley()
        stopTimer()
        return true
    } else return false



}

function checkBestScore() {
    gBestScoreLevel = 'bestScore' + gLevel.SIZE
    console.log('gBestScoreLevel',gBestScoreLevel)
    if (localStorage.getItem(gBestScoreLevel) === null) {
        localStorage.setItem(gBestScoreLevel, elapsedTime)
    } else if (localStorage.getItem(gBestScoreLevel) > elapsedTime) {
        localStorage.setItem(gBestScoreLevel, elapsedTime)
    }
}

function renderBestScore() {
    var bestScore = localStorage.getItem(gBestScoreLevel)
    if (bestScore !== null) {
        var strHtmlBestScore = `Best Score: ${bestScore} seconds`
    } else {
        strHtmlBestScore = `Best Score: Not Set Yet`
    }
    var elBestScore = document.querySelector('.bestScore')
    elBestScore.innerHTML = strHtmlBestScore;
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
                    expandShown(idxI, idxJ)
                }
            }
        }
    }

}

function onTimer() {
    if (!isRuning) {
        startTime = Date.now()
        timer = setInterval(update,50)
        isRuning = true
    }
  }

  function update() {
    var currentTime = Date.now()
    elapsedTime = currentTime - startTime
    var seconds  = Math.floor(elapsedTime / 1000 % 60)
    var milliSeconds  = Math.floor(elapsedTime % 1000 )
    seconds = String(seconds).padStart(2,'0')
    milliSeconds= String(milliSeconds).padStart(3,'0')

    display.textContent = `${seconds}:${milliSeconds}`

  }

  function stopTimer() {
    if (isRuning) {
        clearInterval(timer)
        elapsedTime = Date.now - startTime
        isRuning = false
    }
  }

  function resetTimer() {
    clearInterval(timer)
    isRuning = false
    startTime = 0
    elapsedTime = 0 
    display.textContent = '00:000'
  }