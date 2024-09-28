'use strict'

///// game images /////

const MINE = '<img src= "img/mine.png" width="20" height="20">'
const FLAG = '<img src= "img/flag.png" width="20" height="20">'
const SMILEYNORMAL = '<img src= "img/tiffinormal.png" width="50" height="50">'
const SMILEYDEAD = '<img src= "img/tiffilose.png" width="50" height="50">'
const SMILEYWIN = '<img src= "img/tiffiwin.png" width="50" height="50">'
const LIFE = '<img src= "img/life.png" width="20" height="20">'
const LOST_LIFE = '<img src= "img/lostlife.png" width="20" height="20">'
const HINT = '<img src= "img/unusedhint.png" width="20" height="20">'
const USED_HINT = '<img src= "img/usedhint.png" width="20" height="20">'
const BEST_SCORE = '<img src= "img/bestscore.png" width="20" height="20">'
const TIMER = '<img src= "img/tiffitimer.png" width="20" height="20">'

///// global game variables /////

var gBoard = []

var gMines = []

var gLevels = [
    { SIZE: 4, MINES: 2, HINTS: 1, LIVES: 1, MINEEXTERMINATOR: 1 },
    { SIZE: 8, MINES: 14, HINTS: 2, LIVES: 2, MINEEXTERMINATOR: 2 },
    { SIZE: 12, MINES: 32, HINTS: 3, LIVES: 3, MINEEXTERMINATOR: 3 },
]

var gLevel = gLevels[0]

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gGameInterval

var gIsvictory = false
var gBestScoreLevel = 'bestScore' + gLevel.SIZE
var gLifeLost
var gHintUsed
var gHintIsOn
var gMineExterminatorUsed
var gSafeClicks

var display = document.querySelector('.time')
var isRuning = false
var startTime = 0
var timer = null
var gSeconds
var gSecondsDisp
var elapsedTime = 0

///// hide the context menu on right click ////

window.addEventListener("contextmenu", e => e.preventDefault())

///// Dark Mode /////

const toggleButton = document.getElementById('dark-mode-toggle')  
toggleButton.addEventListener('click', function () {
    document.body.classList.toggle('dark-mode')
  })

///// The Game /////

function onInit() {
    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gLifeLost = 0
    gHintUsed = 0
    gHintIsOn = false
    gMineExterminatorUsed = false
    gMines = []
    gSafeClicks = 3
    gBestScoreLevel = 'bestScore' + gLevel.SIZE
    gBoard = buildBoard()
    renderBoard(gBoard)
    renderButtons()
    renderMarksLeft()
    renderLives()
    renderHints()
    renderSmiley()
    resetTimer()
    renderBestScore()
    renderSafeClickBtn()
    renderSafeClicksCounter()
    renderMineExterminatorBtn()
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

    playSound('sounds/levelchange.wav')
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

    mapNeighbors(board)
    return board
}

function mapNeighbors(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount = setMinesNegsCount(i, j, board)
            }
        }
    }
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
    var cellColor
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
                    switch (cellDisp) {

                        case 0:
                            cellColor = "white"
                            break
                        case 1:
                            cellColor = "blue"
                            break
                        case 2:
                            cellColor = "green"
                            break
                        case 3:
                            cellColor = "red"
                            break
                        case 4:
                            cellColor = "yellow"
                            break
                        case 5:
                            cellColor = "brown"
                            break
                        case 6:
                            cellColor = "purple"
                            break
                        case 7:
                            cellColor = "pink"
                            break
                        case 8:
                            cellColor = "black"
                            break
                        default:
                    }
                } else { cellDisp = MINE }
            } else {
                if (cell.isMarked) {
                    cellDisp = FLAG
                } else {
                    cellDisp = ''
                }
            }

            strHTML += `<td class="${className}" onclick="onCellClicked(${i}, ${j})" oncontextmenu="onCellMarked(${i}, ${j})" style="color:${cellColor}">${cellDisp}</td>`
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
    var strHtmlButtons = `<button onclick="chooseLevel(this)" class="b1">Beginner</button>`
    strHtmlButtons += `<button onclick="chooseLevel(this)" class="b2">Medium</button>`
    strHtmlButtons += `<button onclick="chooseLevel(this)" class="b3">Expert</button>`
    var elButtons = document.querySelector('.buttons')
    elButtons.innerHTML = strHtmlButtons
}

function renderMarksLeft() {
    var marksLeft = (gGame.shownCount === 0) ? (gLevel.MINES - gGame.markedCount) : (gMines.length - gGame.markedCount - gLifeLost);
    var strHtmlMarksLeft = `Flags: ${marksLeft} ${FLAG}`
    var elMarksLeft = document.querySelector('.marksleft')
    elMarksLeft.innerHTML = strHtmlMarksLeft
}

///// Lives /////

function renderLives() {
    var lives = genLives()
    var strHtmlLives = `Lives: ${lives}`
    var elLife = document.querySelector('.life')
    elLife.innerHTML = strHtmlLives

}

function genLives() {
    var livesHtml = LIFE
    var usedLivesHtml = LOST_LIFE
    var strLives = ''
    for (var i = 0; i < gLevel.LIVES - gLifeLost; i++) {
        strLives += livesHtml
    }

    for (var i = 0; i < gLifeLost; i++) {
        strLives += usedLivesHtml
    }
    return strLives
}

///// Hints /////

function renderHints() {
    var hints = genHints()
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

    if (gHintUsed < gLevel.HINTS) {
        gHintUsed++
        gHintIsOn = true
        renderHints()
    }
}

function handleHint(i, j) {

    var revealedCells = []

    for (var idxI = i - 1; idxI <= i + 1; idxI++) {
        if (idxI < 0 || idxI > gBoard.length - 1) continue
        for (var idxJ = j - 1; idxJ <= j + 1; idxJ++) {
            if (idxJ < 0 || idxJ > gBoard[idxI].length - 1) continue
            if (!gBoard[idxI][idxJ].isShown) {
                gBoard[idxI][idxJ].isShown = true
                revealedCells.push({ i: idxI, j: idxJ })
            }
        }
    }

    renderBoard(gBoard)

    setTimeout(() => {
        for (var idxI = 0; idxI < revealedCells.length; idxI++) {

            gBoard[revealedCells[idxI].i][revealedCells[idxI].j].isShown = false

        }
        gHintIsOn = false
        renderBoard(gBoard)

    }, 1000)
}

///// Smiley /////

function renderSmiley() {
    var strHtmlSmiley = `<button onclick="onInit(); playSound('sounds/oninit.wav')""class="b4">`
    var normal = `${SMILEYNORMAL}`
    var win = `${SMILEYWIN}`
    var lose = `${SMILEYDEAD}`
    strHtmlSmiley += gGame.isOn ? normal : gIsvictory ? win : lose

    strHtmlSmiley += `</button>`
    var elSmiley = document.querySelector('.smiley')
    elSmiley.innerHTML = strHtmlSmiley
}

///// Safe Clicks /////

function renderSafeClickBtn() {
    var strHtmlSafeClick = `<button onclick="onSafeClick()" class="b5">Safe Click</button>`

    var elSafeClick = document.querySelector('.SafeClick')
    elSafeClick.innerHTML = strHtmlSafeClick
}

function renderSafeClicksCounter() {
    var clicksAvailable = document.querySelector('.clicksAvailable')
    clicksAvailable.textContent = gSafeClicks + ' clicks available'
}

function onSafeClick() {

    if (!gSafeClicks) return

    var safeCells = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                safeCells.push({ i: i, j: j })
            }
        }
    }

    var randIdxSafeCell = getRandomInt(0, safeCells.length)

    var randElementId = `.cell-${safeCells[randIdxSafeCell].i}-${safeCells[randIdxSafeCell].j}`
    var elRandSafeCell = document.querySelector(randElementId)
    elRandSafeCell.style.border = "5px solid #a20dbd"

    safeCells.splice(randIdxSafeCell, 1)

    setTimeout(() => {
        renderBoard(gBoard)
    }, 2000)

    gSafeClicks--
    renderSafeClicksCounter()
    playSound('sounds/safecells.wav')

}

function renderMineExterminatorBtn() {
    var classBtn = (gMineExterminatorUsed) ?  'used' : 'unused'
    var strHtmlMineExterminator = `<button onclick="onClickMineExterminator()"class="b6${classBtn}">Mine Exterminator</button>`


    var elMineExtermiantor = document.querySelector('.MineExterminator')
    elMineExtermiantor.innerHTML = strHtmlMineExterminator

   

}

///// Mine Exterminator /////

function onClickMineExterminator() {
    
        var minesLeft = 0
        var minesExterminated = 0
        var Idx 
        if (gGame.shownCount > 0) {
            if(!gMineExterminatorUsed){
            for (var i = 0; i < gMines.length; i++) {
                var currMine = gBoard[gMines[i].i][gMines[i].j]
                if(!currMine.isShown && !currMine.isMarked){
                    minesLeft++ 
                }
            }
            if (minesExterminated < gLevel.MINEEXTERMINATOR && minesLeft > 0) {
                playSound('sounds/mineexterminator.wav')
            }
            while (minesExterminated < gLevel.MINEEXTERMINATOR && minesLeft > 0) {
                Idx = getRandomInt(0, gMines.length)
                currMine = gBoard[gMines[Idx].i][gMines[Idx].j]
                if (!currMine.isMarked && !currMine.isShown) {
                    currMine.isMine = false
                    gMines.splice(Idx, 1)
                    minesLeft--
                    minesExterminated++
                }
            }
        
            gMineExterminatorUsed = true
            mapNeighbors(gBoard)
            renderMarksLeft()
            renderBoard(gBoard)
            renderMineExterminatorBtn()
        }
    }
    
}

///// Cell Clicked /////

function onCellClicked(i, j) {

    if (gBoard[i][j].isShown || !gGame.isOn) return

    if (gGame.shownCount === 0) {

        placeMines(gBoard, i, j)
        onTimer()
    }

    if (gHintIsOn) {
        handleHint(i, j)
        playSound('sounds/usehint.wav')

    } else {

        if (!gBoard[i][j].isMarked) {
            gBoard[i][j].isShown = true
            if (!gBoard[i][j].isMine) {
                gGame.shownCount++
                expandShown(i, j)
                playSound('sounds/cellclick.wav')
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
                    playSound('sounds/lostgame.wav')
                }
                playSound('sounds/lostlife.wav')
                gLifeLost++
                renderLives()
            }
        }

        checkGameOver()
    }

    renderBoard(gBoard)
}

/////Cell Marked /////

function onCellMarked(i, j) {

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
        renderMarksLeft()
        playSound('sounds/marked.wav')
    }

    checkGameOver()

    renderBoard(gBoard)
}

///// Game Over /////

//Game ends when all mines are marked, and all the other cells are shown

function checkGameOver() {
    var allMinesMarked
    var markedMines = 0
    var shownMines = 0

    for (var i = 0; i < gMines.length; i++) {
        var currMine = gBoard[gMines[i].i][gMines[i].j]
        if (currMine.isMarked) markedMines++
        if (currMine.isShown) shownMines++
    }

    if (markedMines + shownMines === gMines.length) {
        allMinesMarked = true
    } else {
        allMinesMarked = false
    }

    if (gGame.shownCount === (gLevel.SIZE ** 2 - gMines.length) && allMinesMarked) {
        gGame.isOn = false
        gIsvictory = true
        playSound('sounds/wongame.wav')
        checkBestScore()
        renderBestScore()
        renderSmiley()
        stopTimer()
        return true
    } else return false
}

///// Best Score /////

function checkBestScore() {

    if (localStorage.getItem(gBestScoreLevel) === null) {
        localStorage.setItem(gBestScoreLevel, gSeconds)
    } else if (localStorage.getItem(gBestScoreLevel) > gSeconds) {
        localStorage.setItem(gBestScoreLevel, gSeconds)
    }
}

function renderBestScore() {
    var bestScore = localStorage.getItem(gBestScoreLevel)
    var bestScoreDisp = String(bestScore).padStart(3, '0')
    if (bestScore !== null) {

        var strHtmlBestScore = `${BEST_SCORE} Best Score: ${bestScoreDisp} seconds`
    } else {
        strHtmlBestScore = `${BEST_SCORE} Best Score: Not Set Yet`
    }
    var elBestScore = document.querySelector('.bestScore')
    elBestScore.innerHTML = strHtmlBestScore
}

///// Expand Shown /////

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

