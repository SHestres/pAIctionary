var readyToPrompt = true;
var lastPrompt = "";
var waitingPrompt = "";
var infoText = document.querySelector('.infoText');
var promptInput = document.querySelector('.promptInput');
var readyButton = document.querySelector('.readyToDrawButton');

const defaultMsg = "Wait for the game to Start!";
const drawerMsg = "You are Drawing! \nAre you ready?";
const guesserMsg = "Your team is drawing this round! Get ready to guess!";
const waiterMsg = "Your team isn't up this round! Dont' give away your thoughts to your opponents!";

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
var playerState = ""

socket.emit('getPlayerStates', state => {
    switch (state){
        case playerStates.NONE:
            infoText.innerHTML = defaultMsg;
            break;
        case playerStates.DRAW:
            infoText.innerHTML = drawerMsg;
            break;
        case playerStates.GUESS:
            infoText.innerHTML = guesserMsg;
            break;
        case playerStates.WAIT:
            infoText.innerHTML = waiterMsg;
            break;
        default:
            console.error('Invalid player state sent by server')
            break;
    }
})

socket.on('youDraw', () => {
    playerState = playerStates.DRAW;
    infoText.innerHTML = drawerMsg;
    readyButton.classList.remove('hide');
    console.log("You're drawing");
})

socket.on('youGuess', () => {
    playerState = playerStates.GUESS;
    infoText.innerHTML = guesserMsg;
    console.log("You're guessing");
});

socket.on('youWait', () => {
    playerState = playerStates.WAIT;
    infoText.innerHTML = waiterMsg;
    console.log("You're waiting")
})
