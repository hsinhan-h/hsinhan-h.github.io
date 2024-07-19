const guessBoxes = document.querySelectorAll('.guess-box');
const numberButtons = document.querySelector('.number-buttons');
const gameMessage = document.querySelector('.game-message');
const randomPickBtn = document.querySelector('.button.random-pick');
const guessBtn = document.querySelector('.button.guess');
const guessHistories = document.querySelector('.guess-histories');
const topScoresBox = document.querySelector('.top-scores-box');
const topScoreBtn = document.querySelector('.button.top-scores');
let answer;
let userGuessArray = [];
let attempt = 0;


window.addEventListener('load', initGame);


function initGame() {
    answer = generateRandomFourNumbers();
    attempt = 0;
    resetDisabledButtons();
    clearGuessBox();
    guessHistories.innerHTML = "";
    appendTopScores();
    topScoresBox.style.transform = 'translateX(-98%)';
}

function generateRandomFourNumbers() {
    const numArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffle(numArray);
    return numArray.splice(0, 4).join('');
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

numberButtons.addEventListener('click', (e) => {
    if (isNumberInput(e.target) && userGuessArray.length < 4) {
        fillInGuessBox(e.target.textContent);
        e.target.classList.add('disabled');
    } else if (e.target.classList.contains('backward') && userGuessArray.length > 0) {
        const numToBeRemoved = userGuessArray[userGuessArray.length - 1];
        numberButtons.querySelectorAll('.button').forEach((numEl) => {
            if (numEl.textContent === numToBeRemoved) {
                numEl.classList.remove('disabled');
            }
        })
        removeNumFromGuessBox();
    } else if (e.target.classList.contains('clear-inputs')) {
        resetDisabledButtons();
        clearGuessBox();
    }
});

function resetDisabledButtons() {
    numberButtons.querySelectorAll('.button').forEach((numEl) => {
        if (numEl.classList.contains('disabled')) {
            numEl.classList.remove('disabled');
        }
    })
};

randomPickBtn.addEventListener('click', () => {
    clearGuessBox();
    resetDisabledButtons();
    const randomPickNums = generateRandomFourNumbers();
    randomPickNums.split('').forEach((num) => {
        guessBoxes[userGuessArray.length].textContent = num;
        userGuessArray.push(num);
    })
})

guessBtn.addEventListener('click', () => {
    let a = 0;
    let b = 0;
    if (userGuessArray.length === 4) {
        for (let i = 0; i < answer.length; i++) {
            if (userGuessArray[i] === answer[i]) {
                a++;
            } else if (answer.includes(userGuessArray[i])) {
                b++;
            }
        }
        attempt++;
        appendGuessHistory(attempt, a, b);
        checkGameWin(a);
    } else {
        alert('please guess 4 different numbers!')
    }
    resetDisabledButtons();
    clearGuessBox();
})

topScoreBtn.addEventListener('click', () => {
    topScoresBox.style.transform = 'translateX(0%)';
})


topScoresBox.querySelector('.close').addEventListener('click', () => {
    topScoresBox.style.transform = 'translateX(-98%)';
})

document.querySelector('.button.restart').addEventListener('click', initGame);
document.querySelector('.button.cheat').addEventListener('click', () => {
    alert(`The answer is ${answer}`);
})

function fillInGuessBox(number) {
    guessBoxes[userGuessArray.length].textContent = number;
    userGuessArray.push(number);
}

function removeNumFromGuessBox() {
    guessBoxes[userGuessArray.length - 1].textContent = "";
    userGuessArray.pop();
}

function clearGuessBox() {
    guessBoxes.forEach((guessBox) => guessBox.textContent = "");
    userGuessArray.splice(0, userGuessArray.length);
}

function isNumberInput(el) {
    return (!(el.classList.contains('disabled') ||
        el.classList.contains('backward') ||
        el.classList.contains('clear-inputs'))) &&
        el.classList.contains('button');
}

function appendGuessHistory(attempt, a, b) {
    guessHistories.innerHTML += `
        <div class="guess-history-row">    
            <div>${attempt}</div>
            <div>${userGuessArray.join("")}</div>
            <div>${a}A${b}B</div> 
    `
}

function checkGameWin(a) {
    if (a === 4) {
        alert(`Congrats! You guessed the right number in ${attempt} attemps!!!`);
        saveRecordToLocalStorage(attempt);
    }
}

function saveRecordToLocalStorage(attempt) {
    let scoresArray = getRecordsFromLocalStorage();
    scoresArray.push(attempt);
    scoresArray.sort((a, b) => a - b);
    scoresArray = scoresArray.filter((score, idx, arr) => idx === arr.indexOf(score)); //remove duplicates
    localStorage.setItem('scoreRecords', JSON.stringify(scoresArray));
}

function getRecordsFromLocalStorage() {
    const scoreRecords = localStorage.getItem('scoreRecords');
    return scoreRecords ? JSON.parse(scoreRecords) : [];
}

function appendTopScores() {
    let scoreRecords = getRecordsFromLocalStorage();
    if (scoreRecords.length > 5) {
        scoreRecords = scoreRecords.slice(0, 5);
    }
    document.querySelectorAll('.score-container .attempts').forEach((score, idx) => {
        if (scoreRecords[idx]) {
            score.innerHTML = scoreRecords[idx];
        }
    })
}
