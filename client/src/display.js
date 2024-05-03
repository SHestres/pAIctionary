var blue = "#255ff4";
var red = "#ff2626";
var teamColors = [];
var numberOfTeams = 2;

const socket = io();

var gameScreen = document.querySelector('.gameScreen');
var teamCreateScreen = document.querySelector('.teamCreateScreen');
var joinScreen = document.querySelector('.joinScreen');

socket.emit('getGameState', (status) => {
    console.log("GameState: " + status);
    switch (status){
        case "CREATE_TEAMS":
            gameScreen.classList.add('hide');
            joinScreen.classList.add('hide');
            break;
        case "PLAYERS_JOIN":
            freshLoadJoinScreen();
            break;
        case "PRE_TURN":
            teamCreateScreen.classList.add('hide');
            socket.emit('getPreTurn'); 
            break;
        default:
            freshLoadGameScreen();
            break;
    }
});

socket.on('startGame', () => {
    loadGameScreen();
})

socket.on('addPlayer', (teamInd, name) => {
    let newName = document.createElement('div');
    newName.classList.add('playerName');
    newName.classList.add('slide-in-bck-center');
    newName.innerHTML = name;
    Array.from(document.querySelector('.teamLists').children)[teamInd].appendChild(newName)
})

socket.on('PRE_TURN', (guessers, drawer, col) => {
    preTurn(guessers, drawer, col);
})

document.querySelector('.blueButton').onclick = () => {setColor(blue)}
document.querySelector('.redButton').onclick = () => {setColor(red)}
document.querySelector('.timerButton').onclick = () => {setTimer(30)}
document.querySelector('.countdownButton').onclick = () => {startCountdown()};

document.querySelector('.increaseNumTeams').onclick = increaseNumTeams;
document.querySelector('.decreaseNumTeams').onclick = decreaseNumTeams;
document.querySelector('.finishTeamSelectBtn').onclick = submitTeams;
document.querySelector('.startGameButton').onclick = startGame;

document.querySelector('.numberOfTeams').innerHTML = numberOfTeams;

const colorSelectorTemplateString = "\
<div class='colorSelectWrapper'>\
    <div class='colorSelectLabel'></div>\
    <div class='teamColorSelect'>\
        <div class='selectableColor blue'></div>\
        <div class='selectableColor red'></div>\
        <div class='selectableColor yellow'></div>\
        <div class='selectableColor green'></div>\
        <div class='selectableColor purple'></div>\
        <div class='selectableColor orange'></div>\
    </div>\
</div>\
"

const newColorSelectorTemplate = () => {
    let div = document.createElement('div');
    div.innerHTML = colorSelectorTemplateString.trim();
    return div.firstChild;
};    

for(let i = 0; i < numberOfTeams; i++) addColorSelector();

const setColorSelectionActions = () => {
    document.querySelectorAll('.selectableColor').forEach(el => {el.onclick = selectColor})
}

setColorSelectionActions();

function increaseNumTeams(event){
    if(numberOfTeams >= 6) return;
    numberOfTeams++;
    document.querySelector('.numberOfTeams').innerHTML = numberOfTeams;
    addColorSelector();
    setColorSelectionActions();
}    

function decreaseNumTeams(event){
    numberOfTeams--;
    document.querySelector('.numberOfTeams').innerHTML = numberOfTeams;
    removeColorSelector();
}

function addColorSelector(){
    let selectors = document.querySelector('.teamColorSelectors');
    let newSelector = selectors.appendChild(newColorSelectorTemplate());
    let ind= selectors.children.length - 1;
    let selCol = Array.from(newSelector.lastChild.children)[ind];
    newSelector.firstElementChild.innerHTML = 'Team ' + (ind + 1);
    selCol.classList.add('selectedColor');
    teamColors[ind] = window.getComputedStyle(selCol).backgroundColor;
}

function removeColorSelector(){
    let selectors = document.querySelector('.teamColorSelectors');
    selectors.removeChild(selectors.lastChild);
}

function selectColor(event){
    event.target.parentElement.childNodes.forEach((node) => {
        try{node.classList.remove('selectedColor');}
        catch{}
    })
    event.target.classList.add('selectedColor');
    let ind = Array.from(event.target.parentElement.parentElement.parentElement.children).indexOf(event.target.parentElement.parentElement);
    teamColors[ind] = window.getComputedStyle(event.target).backgroundColor;
}

function setColor(color){
    document.querySelector(':root').style.setProperty('--primary', color);
    document.querySelector(':root').style.setProperty('--teamColor', color);
}

async function setTimer(time){
    document.querySelector(':root').style.setProperty('--timerLength', time.toString() + 's')
    document.querySelector('.hourglass').classList.add('hgAnim')
    document.querySelector('.fill').classList.add('fAnim')
    document.querySelector('.glare').classList.add('gAnim')

    await new Promise(r => setTimeout(r, time * 1000));

    document.querySelector('.hourglass').classList.remove('hgAnim')
    document.querySelector('.fill').classList.remove('fAnim')
    document.querySelector('.glare').classList.remove('gAnim')
}

function startGame() {
    socket.emit('startGame');
    loadGameScreen();
}

function freshLoadGameScreen(){
    loadGameScreen();
}

function loadGameScreen(){
    joinScreen.classList.add('hide');
    gameScreen.classList.remove('hide');

    document.querySelector('.imageImage').setAttribute('src', '/img/ready_to_guess_2.jpg');
}

function preTurn(guessers, drawer, col){
    //Change screen
    loadGameScreen();

    //Set color
    setColor(col);

    //Display guessers
    var guessList = document.querySelector('.guessersNamesList');
    guessList.innerHTML = null;
    guessers.forEach(g => {
        let newName = document.createElement('div');
        newName.innerHTML = g;
        guessList.appendChild(newName)
    })

    //Display Drawer
    document.querySelector('.drawerName').innerHTML = drawer + " is Drawing";
}

function submitTeams(){
    socket.emit('createTeams', teamColors.slice(0, numberOfTeams));
    loadJoinScreen();
}

function loadJoinScreen(){
    teamCreateScreen.classList.add('hide');
    joinScreen.classList.remove('hide');
    for(let i = 0; i < numberOfTeams; i++){
        let newDiv = document.createElement('div');
        newDiv.classList.add('teamList');
        newDiv.style.backgroundColor = teamColors[i];
        document.querySelector('.teamLists').appendChild(newDiv)
    }
    socket.emit('getPlayers', (players) => {
        let teams = Array.from(document.querySelector('.teamLists').children);
        for(let i = 0; i < numberOfTeams; i++){
            for(let j = 0; j < players[i].length; j++){
                let p = document.createElement('div');
                p.classList.add('playerName');
                p.innerHTML = players[i][j];
                teams[i].appendChild(p);
            }
        }

    })
}

function freshLoadJoinScreen(){
    gameScreen.classList.add('hide');
    socket.emit('getTeamColors', (colorList) => {
        console.log(colorList);
        teamColors = colorList;
        numberOfTeams = teamColors.length;
        loadJoinScreen();
    })
}

async function startCountdown(){
    document.querySelector('.imageImage').setAttribute('src', "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=");
    cd = document.querySelector('.countdownNumber');
    cd.innerHTML = "3";
    cd.classList.add('scale-out-center');
    console.log("Before");
    await sleep(900);
    console.log("After")
    cd.classList.remove('scale-out-center');
    cd.innerHTML = "2";
    await sleep(100);
    cd.classList.add('scale-out-center');
    await sleep(900);
    cd.classList.remove('scale-out-center');
    cd.innerHTML = "1";
    await sleep(100);
    cd.classList.add('scale-out-center');
    await sleep(1000);
    cd.classList.remove('scale-out-center');
    cd.innerHTML = "";
    console.log("End of cd");
}