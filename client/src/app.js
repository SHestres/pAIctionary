var readyToPrompt = true;
var lastPrompt = "";
var waitingPrompt = "";

function promptServer(prompt){
    waitingPrompt = prompt;
    if(readyToPrompt){
        readyToPrompt = false;
        lastPrompt = prompt;
        socket.emit('prompt', prompt)
    }
}

// Send message to the server when button is clicked
document.querySelector('button').onclick = () => {
    const text = document.querySelector('input').value;
    // Send message to the server
    promptServer(text)
}


document.querySelector('input').oninput = (e) => {
    promptServer(e.target.value)
}


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

socket.on('youDraw', () => {
    console.log("You're drawing");
})

socket.on('youGuess', () => {
    console.log("You're guessing");
});

socket.on('youWait', () => {
    console.log("You're waiting")
})