socket.emit('getTeamColors', (colors) => {
    let teamSelector = document.querySelector('.teamSelector');
    if(colors.length == 0){
        teamSelector.innerHTML = 'Create Teams on your TV and refresh!';
        return;
    }
    else{
        for(let i = 0; i < colors.length; i++){
            let el = document.createElement('button');
            el.classList.add('joinTeamButton');
            el.style.backgroundColor = colors[i];
            el.innerHTML = `Join Team ${i}`
            el.onclick = () => {
                const user = document.querySelector('input').value;
                if(user == "") return;
                socket.emit('user', user, i, cb => {
                    window.location.replace('/play');
                })
            }
            teamSelector.appendChild(el);
        }
    }
})

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
    el.onclick = () => document.location.href = "/play";
});