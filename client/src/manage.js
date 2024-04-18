const socket = io();


socket.emit("transmitLog");

socket.on("log", text => {
    const el = document.createElement('li');
    el.innerHTML = text;
    document.querySelector('ul').appendChild(el);
})

//socket.on()