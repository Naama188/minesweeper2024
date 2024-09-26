'use strict'

function getRandomInt(min, max) { // Maximum is NOT inclusive
    return Math.floor(Math.random() * (max - min)) + min;
}

/////////TIMER////////

function onTimer() {
    if (!isRuning) {
        startTime = Date.now()
        timer = setInterval(updateTimer, 50)
        isRuning = true
    }
}

function updateTimer() {
    var currentTime = Date.now()
    elapsedTime = currentTime - startTime
    // gSeconds = Math.floor(elapsedTime / 1000 % 60)
    gSeconds = Math.floor(elapsedTime / 1000)
    var milliSeconds = Math.floor(elapsedTime % 1000)
    gSecondsDisp = String(gSeconds).padStart(3, '0')
    milliSeconds = String(milliSeconds).padStart(3, '0')

    // display.textContent = (gSeconds < 100) ? `0${gSeconds}` : `${gSeconds}`
    display.textContent = `${gSecondsDisp}`
    // display.textContent = `${seconds}:${milliSeconds}`

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
    display.textContent = '000'
    // display.textContent = '00:000'
}

/////////SOUNDS////////

function playSound(filePath) {
    var audio = new Audio(filePath)
    audio.play();
}



