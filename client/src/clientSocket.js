const socket = io();

// Redirect on command from server
socket.on('redirect', loc => {
    if(window.location.pathname !== loc)
        window.location.href = loc;
})

// Refresh page on command
socket.on('refresh', () => {
    document.location.reload();
})

// Send initialization data to server
socket.on('sendID', (dnm) => {
    console.log('Sending ID')
    let sessData = getCookie('gameSessionData');
    console.log("sessData = " + sessData)
    if(sessData === "") return;
    socket.emit('pID', sessData.split('|')[0]);
});

socket.on('resetCookie', () => {
    console.log("Removing cookie");
    Cookies.remove("gameSessionData");
    window.location.reload();
})