const socket = io();

socket.emit("transmitLog");

socket.on("log", text => {
    const el = document.createElement('li');
    el.innerHTML = text;
    document.querySelector('ul').appendChild(el);
})

socket.on("playersUpdate", players => {
    console.log("players update");
    const el = document.createElement('pre');
    el.innerHTML = JSON.stringify(players,null,2);
    document.querySelector(".playerStat").innerHTML = JSON.stringify(players,null,2);
})


//socket.on()