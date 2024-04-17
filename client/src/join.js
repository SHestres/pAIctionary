document.querySelector('button').onclick = async () => {
    const user = document.querySelector('input').value;
    await socket.emit('user', user);
    window.location.replace('/chat');
}

socket.on('sendID', (dnm) => {
    console.log('Sending ID')
    let sessData = getCookie('gameSessionData');
    console.log("sessData = " + sessData)
    if(sessData === "") return;
    socket.emit('pID', sessData.split('|')[0]);
});

socket.on('allowRejoin', () => {
    let el = document.createElement('button');
    document.querySelector('body').appendChild(el);
    el.innerText = "Rejoin?";
    el.onclick = () => document.location.href = "/chat";
});