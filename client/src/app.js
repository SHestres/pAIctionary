// Send message to the server when button is clicked
document.querySelector('button').onclick = () => {
    const text = document.querySelector('input').value;
    // Send message to the server
    socket.emit('prompt', text)
}


document.querySelector('input').oninput = (e) => {
    socket.emit('prompt', e.target.value)
}


// Post any recieved messages into the message list
socket.on('message', text => {
    const el = document.createElement('li');
    el.innerHTML = text;
    document.querySelector('ul').appendChild(el);
});

socket.on('image', image => {
    // Update image on player page
    document.querySelector('.imgResult').src = `data:image/jpeg;base64,${new TextDecoder().decode(image)}`
    socket.emit('finishedImage')
});