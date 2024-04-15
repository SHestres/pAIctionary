console.log("js loaded");

const socket = io();

// Post any recieved messages into the message list
socket.on('message', text => {
    const el = document.createElement('li');
    el.innerHTML = text;
    document.querySelector('ul').appendChild(el);
});

// Send message to the server when button is clicked
document.querySelector('button').onclick = () => {
    const text = document.querySelector('input').value;
    // Send message to the server
    socket.emit('message', text)
}