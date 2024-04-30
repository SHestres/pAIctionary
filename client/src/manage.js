const socket = io();

document.querySelector('.generatorOffBtn').onclick = () => {
    socket.emit("turnOffGenerator");
}

socket.emit("transmitLog");

socket.on("log", text => {
    const el = document.createElement('li');
    el.innerHTML = text;
    document.querySelector('ul').appendChild(el);
})

socket.on("teamsUpdate", players => {
    console.log("teams update");
    const el = document.createElement('pre');
    el.innerHTML = JSON.stringify(players,null,2);
    document.querySelector(".teamStat").innerHTML = JSON.stringify(players,null,2);
})

socket.on("playersUpdate", players => {
    console.log("players update");
    const el = document.createElement('pre');
    el.innerHTML = JSON.stringify(players,null,2);
    document.querySelector(".playerStat").innerHTML = JSON.stringify(players,null,2);
})

socket.on("generator", (status) => {
    statDisplay = document.querySelector(".genStatus")
    statDisplay.innerHTML = status ? "Connected" : "Disconnected";
    statDisplay.style.color = status ? "#00FF00" : "#FF0000";
})

//socket.on()