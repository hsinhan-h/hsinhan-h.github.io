const initialMinValue = 1;
const initialMaxValue = 100;
const limitSeconds = 60;
const totalHint = 2;

function getUserName() {
    return document.querySelector('.name-input-block').value;
}


const homePage = document.querySelector(".home-page");
const gamePage = document.querySelector(".game-page");

const pNameMessage = document.querySelector(".player-name-message");

const playerNameTag = document.querySelector(".game-page .player-name");
const playerGuess = document.querySelector(".player-guess");
const gameMessage = document.querySelector(".game-message");


let minNumberElement = document.querySelector(".min-number");
let maxNumberElement = document.querySelector(".max-number");


const gameResultBlock = document.querySelector(".game-result-block");

let answer;
let inGame = true;

function verifyUserName() {
    const userName = getUserName();
    if (userName === "") {
        pNameMessage.textContent = "玩家名稱不可為空白"
        return false;
    }
    if (userName.length > 6) {
        pNameMessage.textContent = "玩家名稱不可超過6個字"
        return false;
    }
    return true;
}

function startGame() {
    if (verifyUserName()) {
        homePage["style"]["opacity"] = "0";
        homePage["style"]["transform"] = "translateX(100%)";
        homePage["style"]["transition"] = "1s";
        gamePage["style"]["display"] = "block";
        playerNameTag.textContent = getUserName();
        answer = generateAnswer();
        startCountDown();
        inGame = true;
    }
}

function generateAnswer() {
    return Math.ceil(Math.random() * 100);
}

function startCountDown() {
    let remainSeconds = parseInt(document.querySelector(".timer .second").textContent);
    const interval = setInterval(() => {
        if (remainSeconds > 1 && inGame === true) {
            remainSeconds -= 1;
            document.querySelector(".timer .second").textContent = remainSeconds;
        } else if (remainSeconds > 1 && inGame === false) {
            clearInterval(interval);
            // document.querySelector(".timer .second").textContent = 60;

        } else {
            document.querySelector(".game-result-block h3").innerHTML = "時間到!<br>你沒有猜到答案";
            popGameResultBlock();
            clearInterval(interval);
            document.querySelector(".timer .second").textContent = 0;
        }
    }, 1000);
}

function resetPlayerGuess() {
    playerGuess.value = "";
}

function getPlayerGuess() {
    return playerGuess.value;
}

function verifyPlayerGuess() {
    const playerGuess = parseInt(getPlayerGuess());
    const minNumber = parseInt(minNumberElement.textContent);
    const maxNumber = parseInt(maxNumberElement.textContent);
    resetGameMessageColor();

    if (isNaN(playerGuess)) {
        gameMessage.textContent = "請輸入正確的數字格式";
        gameMessage["style"]["color"] = "#f00";
        resetPlayerGuess();
        return;
    }
    if (playerGuess === answer) {
        const spentTime = 60 - parseInt(document.querySelector(".second").textContent);
        document.querySelector(".game-result-block h3").innerHTML = `猜對了!答案是${answer}<br>你總共花了${spentTime}秒`;
        popGameResultBlock();
        inGame = false;
        return;
    }
    if (playerGuess > initialMaxValue || playerGuess < initialMinValue) {
        gameMessage.textContent = "請輸入1 ~ 100範圍內的整數";
        gameMessage["style"]["color"] = "#f00";
        resetPlayerGuess();
        return;
    }
    if (playerGuess < minNumber || playerGuess > maxNumber) {
        gameMessage.textContent = "猜錯了! 請看目前的範圍區間";
        resetPlayerGuess();
        return;
    }
    else {
        gameMessage.textContent = "猜錯了! 已縮小數字範圍";
        resetPlayerGuess();
        return updateMinAndMax(playerGuess);
    }
}

function popGameResultBlock() {
    gameResultBlock["style"]["transform"] = "translateY(-20%)";
    gameResultBlock["style"]["background-color"] = "azure";
    document.querySelector(".game-wrapper")["style"]["filter"] = "brightness(70%)";
}

function updateMinAndMax(playerGuess) {
    const minNumber = parseInt(minNumberElement.textContent);
    const maxNumber = parseInt(maxNumberElement.textContent);
    if (playerGuess >= maxNumber || playerGuess <= minNumber) {
        return;
    }
    else if (playerGuess > answer) {
        return maxNumberElement.textContent = playerGuess;
    }
    else if (playerGuess < answer) {
        return minNumberElement.textContent = playerGuess;
    }
}

function getHint() {
    gameMessage["style"]["color"] = "#ff0";
    const hintLeft = parseInt(document.querySelector(".hint-left").textContent);
    const minNumber = parseInt(minNumberElement.textContent);
    const maxNumber = parseInt(maxNumberElement.textContent);
    document.querySelector(".hint-left").textContent = hintLeft - 1;

    //若最大值和最小值相差10以內, 提示奇偶數
    if (maxNumber - minNumber < 15) {
        gameMessage.textContent = (answer % 2 === 0) ?
            "提示: 答案是偶數" :
            "提示: 答案是奇數";
        removeEventIfHintIsEmpty();
    }
    //若答案比較靠近最小值, 最大值改為(最大值 - (最大值 - 答案)/3)
    else {
        if ((maxNumber - answer) > (answer - minNumber)) {
            const hintMaxNumber = maxNumber - Math.floor((maxNumber - answer) / 3);
            gameMessage.textContent = `提示: 答案比${hintMaxNumber}還要小`;
            maxNumberElement.textContent = hintMaxNumber;
            removeEventIfHintIsEmpty();
        }
        else {
            const hintMinNumber = minNumber + Math.floor((answer - minNumber) / 3);
            gameMessage.textContent = `提示: 答案比${hintMinNumber}還要大`;
            minNumberElement.textContent = hintMinNumber;
            removeEventIfHintIsEmpty();
        }
    }
}

function removeEventIfHintIsEmpty() {
    const hintLeft = parseInt(document.querySelector(".hint-left").textContent);
    if (hintLeft === 0) {
        hintButton.removeEventListener('click', getHint);
        hintButton.addEventListener('click', showMessageIfHintIsEmpty);
    }
}

function showMessageIfHintIsEmpty() {
    const hintLeft = parseInt(document.querySelector(".hint-left").textContent);
    if (hintLeft === 0) {
        gameMessage.textContent = "提示已用盡!";
        gameMessage["style"]["color"] = "#f00";
    }
}

function resetGameMessageColor() {
    gameMessage["style"]["color"] = "#fff";
}

function turnGameOff() {
    inGame = false;
}

function resetGame() {
    minNumberElement.textContent = initialMinValue;
    maxNumberElement.textContent = initialMaxValue;
    pNameMessage.textContent = "";
    document.querySelector(".timer .second").textContent = limitSeconds;
    gameResultBlock["style"]["transform"] = "translateY(100%)";
    homePage["style"]["transform"] = "translateX(0%)";
    homePage["style"]["opacity"] = "1";
    gameMessage.textContent = "";
    document.querySelector(".hint-left").textContent = totalHint;
    hintButton.addEventListener('click', getHint);
    hintButton.removeEventListener('click', showMessageIfHintIsEmpty);
    resetPlayerGuess();
    document.querySelector(".game-wrapper")["style"]["filter"] = "brightness(100%)";
}


const startButton = document.querySelector('.start-button');
const guessButton = document.querySelector('.guess-button');
const hintButton = document.querySelector('.hint-button');
const playAgainButton = document.querySelector('.play-again-button');
const endGameButton = document.querySelector('.endgame-button');

startButton.addEventListener('click', verifyUserName);
startButton.addEventListener('click', startGame);

guessButton.addEventListener('click', verifyPlayerGuess);
hintButton.addEventListener('click', getHint);
endGameButton.addEventListener('click', turnGameOff);
endGameButton.addEventListener('click', resetGame);

playAgainButton.addEventListener('click', resetGame);

