// Send message to the server when button is clicked
document.querySelector('button').onclick = () => {
    const text = document.querySelector('input').value;
    // Send message to the server
    socket.emit('prompt', text)
}

/*
document.querySelector('input').oninput = (e) => {
    socket.emit('prompt', e.target.value)
}
*/

// Post any recieved messages into the message list
socket.on('message', text => {
    const el = document.createElement('li');
    el.innerHTML = text;
    document.querySelector('ul').appendChild(el);
});

socket.on('image', image => {
    // create image with
    const img = new Image();
    // change image type to whatever you use, or detect it in the backend 
    // and send it if you support multiple extensions
    console.log(image)
    console.log(new TextDecoder().decode(image))
    img.src = `data:image/jpeg;base64,${new TextDecoder().decode(image)}`; 
    //img.src = btoa(image)
    // Insert it into the DOM
    document.querySelector('body').appendChild(img)
    socket.emit('finishedImage')
});