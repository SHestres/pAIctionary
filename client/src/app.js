var readyToPrompt = true;
var lastPrompt = "";
var waitingPrompt = "";
var infoText = document.querySelector('.infoText');
var promptInput = document.querySelector('.promptInput');
var readyButton = document.querySelector('.readyToDrawButton');

var playerState = "";
var gameState = "";

const defaultMsg = "Wait for the game to Start!";
const pMsg = {
    CREATE_TEAMS: {
        get: () => defaultMsg
    },
    PLAYERS_JOIN: {
        get: () => defaultMsg
    },
    PRE_TURN: {
        DRAW: "You are Drawing! \nAre you ready?",
        GUESS: "Your team is drawing this round! Get ready to guess!",
        WAIT: "Your team isn't up this round! Dont' give away your thoughts to your opponents!",
    },
    TURN: {
        DRAW: "Text TBD",
        GUESS: "Guess!",
        WAIT: "Don't guess!"
    },
    POST_TURN: {
        NONE: "Phrase TBD",
        DRAW: "Phrase TBD",
        GUESS: "Phrase TBD",
        WAIT: "Phrase TBD"
    }
}

infoText.innerHTML = defaultMsg;
promptInput.classList.add('hide');
readyButton.classList.add('hide');

promptInput.oninput = (e) => {
    promptServer(e.target.value)
}

readyButton.onclick = () => {
    socket.emit('drawerReady');
}

function promptServer(prompt){
    waitingPrompt = prompt;
    if(readyToPrompt){
        readyToPrompt = false;
        lastPrompt = prompt;
        socket.emit('prompt', prompt)
    }
}

// Send message to the server when button is clicked
/*document.querySelector('button').onclick = () => {
    const text = document.querySelector('input').value;
    // Send message to the server
    promptServer(text)
}
*/



// Post any recieved messages into the message list
socket.on('message', text => {
    const el = document.createElement('li');
    el.innerHTML = text;
    document.querySelector('ul').appendChild(el);
});

// Handle recieving image from generator
socket.on('image', image => {
    readyToPrompt = true;
    if(waitingPrompt != lastPrompt) promptServer(waitingPrompt);

    // Update image on player page
    //document.querySelector('.imgResult').src = `data:image/jpeg;base64,${new TextDecoder().decode(image)}`;
    socket.emit('finishedImage')
});

const playerStates = {
    NONE: "NONE",
    DRAW: "DRAW",
    GUESS: "GUESS",
    WAIT: "WAIT"
}

socket.emit('getPlayerAndGameStates', (gState, pState) => {
    console.log('Player and Game State: (' + pState + ", " + gState + ")")
    playerState = pState;
    gameState = gState;
    let txt = "";
    try{
        txt = pMsg[gState][pState];
    }
    catch{
        txt = "Invalid game or player state: (" + gState + ", " + pState + ")";
    }
    infoText.innerHTML = txt;
});

socket.on('youDraw', () => {
    console.log("You're drawing");
    drawPreTurn();
})

function drawPreTurn(){
    playerState = playerStates.DRAW;
    infoText.innerHTML = pMsg.PRE_TURN.DRAW;
    readyButton.classList.remove('hide');
}

socket.on('youGuess', () => {
    console.log("You're guessing");
    guessPreTurn();
});

function guessPreTurn(){
    playerState = playerStates.GUESS;
    infoText.innerHTML = pMsg.PRE_TURN.GUESS;
}

socket.on('youWait', () => {
    console.log("You're waiting")
    waitPreTurn();
})

function waitPreTurn(){
    playerState = playerStates.WAIT;
    infoText.innerHTML = pMsg.PRE_TURN.WAIT;
}
/*
socket.on('startRound', () => {
    switch (playerState){
        case playerStates.NONE:

            break;
        case playerStates.DRAW:
            infoText.innerHTML = drawerPreTurnMsg;
            break;
        case playerStates.GUESS:
            infoText.innerHTML = guesserPreTurnMsg;
            break;
        case playerStates.WAIT:
            infoText.innerHTML = waiterPreTurnMsg;
            break;
        default:
            console.error('Invalid player state sent by server')
            break;
    }
});
*/