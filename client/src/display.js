var blue = "#255ff4";
var red = "#ff2626";
var teamColors = [];
var numberOfTeams = 2;

const socket = io();

var gameScreen = document.querySelector('.gameScreen');
var teamCreateScreen = document.querySelector('.teamCreateScreen');
var joinScreen = document.querySelector('.joinScreen');
var postTurnScreen = document.querySelector('.postTurnScreen');
var ptWords = document.querySelector('.ptWords');
var ptPrompts = document.querySelector('.ptPrompts');
var gameState = "";

// Set temporary button onclicks
document.querySelector('.blueButton').onclick = () => {setColor(blue)}
document.querySelector('.redButton').onclick = () => {setColor(red)}
document.querySelector('.timerButton').onclick = () => {setTimer(30)}
document.querySelector('.countdownButton').onclick = () => {startCountdown()};

// Set permanent button onclicks
document.querySelector('.increaseNumTeams').onclick = increaseNumTeams;
document.querySelector('.decreaseNumTeams').onclick = decreaseNumTeams;
document.querySelector('.finishTeamSelectBtn').onclick = submitTeams;
document.querySelector('.startGameButton').onclick = startGame;

document.querySelector('.numberOfTeams').innerHTML = numberOfTeams;

// Return to correct screen on refresh
socket.emit('getGameState', (state) => {
    console.log("GameState: " + state);
    gameState = state;
    switch (state){
        case "CREATE_TEAMS":
            drawScreen();
            break;
        case "PLAYERS_JOIN":
            socket.emit('getTeamColors', (colorList) => {
                console.log(colorList);
                teamColors = colorList;
                numberOfTeams = teamColors.length;
                loadJoinScreen();
            })
            break;
        case "PRE_TURN":
            // Ask server to re-trigger displays pre-turn
            socket.emit('getPreTurn'); 
            break;
        case "TURN":
            socket.emit('getPreTurn');
            break;
        case "POST_TURN":
            loadPostTurn();
            break;
        default:
            freshLoadGameScreen();
            break;
    }
});

/*
socket.on('startGame', () => {
    loadGameScreen();
})
*/

//////// Team Creation ////////

// Template to create team color selector
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
</div>"

// Create new color selector element from template string
const newColorSelectorTemplate = () => {
    let div = document.createElement('div');
    div.innerHTML = colorSelectorTemplateString.trim();
    return div.firstChild;
};

// Setup initial two teams
for(let i = 0; i < numberOfTeams; i++) addColorSelector();

// Add callbacks to increase and decrease number of teams buttons
function increaseNumTeams(event){
    if(numberOfTeams >= 6) return;
    numberOfTeams++;
    document.querySelector('.numberOfTeams').innerHTML = numberOfTeams;
    addColorSelector();
}
function decreaseNumTeams(event){
    if(numberOfTeams <= 1) return;
    numberOfTeams--;
    document.querySelector('.numberOfTeams').innerHTML = numberOfTeams;
    removeColorSelector();
}

// Helper functions to add and remove color selector elements
function addColorSelector(){
    // Add element
    let selectors = document.querySelector('.teamColorSelectors');
    let newSelector = selectors.appendChild(newColorSelectorTemplate());
    // Select color corresponding to team number
    let ind= selectors.children.length - 1;
    let selCol = Array.from(newSelector.lastChild.children)[ind];
    newSelector.firstElementChild.innerHTML = 'Team ' + (ind + 1);
    selCol.classList.add('selectedColor');
    // Remember selected color
    teamColors[ind] = window.getComputedStyle(selCol).backgroundColor;
    // Set callbacks
    document.querySelectorAll('.selectableColor').forEach(el => {el.onclick = selectColor})
}

function removeColorSelector(){
    let selectors = document.querySelector('.teamColorSelectors');
    selectors.removeChild(selectors.lastChild);
}





socket.on('addPlayer', (teamInd, name) => {
    let newName = document.createElement('div');
    newName.classList.add('playerName');
    newName.classList.add('slide-in-bck-center');
    newName.innerHTML = name;
    Array.from(document.querySelector('.teamLists').children)[teamInd].appendChild(newName)
})


socket.on('image', image => {
    console.log('recieved image');
    document.querySelector('.imageImage').src = `data:image/jpeg;base64,${new TextDecoder().decode(image)}`;
})

socket.on('startCountdown', () => {
    startCountdown();
});

socket.on('startRound', (roundLength) => {
    setTimer(roundLength);
})

socket.on('startPostTurn', () => {
    loadPostTurn();
})
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

function submitTeams(){
    socket.emit('createTeams', teamColors.slice(0, numberOfTeams));
    gameState = "PLAYERS_JOIN";
    loadJoinScreen();
}

function startGame() {
    socket.emit('startGame');
}

function loadGameScreen(){
    joinScreen.classList.add('hide');
    gameScreen.classList.remove('hide');

    document.querySelector('.imageImage').setAttribute('src', '/img/ready_to_guess_2.jpg');
}

function drawScreen(){
    setElVis(gameScreen, gameState == "PRE_TURN" || gameState == "TURN")
    setElVis(teamCreateScreen, gameState == "CREATE_TEAMS")
    setElVis(joinScreen, gameState == "PLAYERS_JOIN")
    setElVis(postTurnScreen, gameState == "POST_TURN")
}

function loadJoinScreen(){
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
    drawScreen();
}

socket.on('PRE_TURN', (guessers, drawer, col) => {
    gameState = "PRE_TURN";

    // Set color
    setColor(col);

    // Display guesser names
    var guessList = document.querySelector('.guessersNamesList');
    guessList.innerHTML = null;
    guessers.forEach(g => {
        let newName = document.createElement('div');
        newName.innerHTML = g;
        guessList.appendChild(newName)
    })

    // Display drawer name
    document.querySelector('.drawerName').innerHTML = drawer + " is Drawing";

    // Draw Screen
    drawScreen();
})

function loadPostTurn(){
    gameScreen.classList.add('hide');
    postTurnScreen.classList.remove('hide');
    ptWords.innerHTML = null;
    ptPrompts.innerHTML = null;
    socket.emit('getPromptsData', (gotWords, skipWords) => {
        gotWords.forEach(w => {
            let newWord = document.createElement('div');
            newWord.innerHTML = w.word;
            newWord.classList.add('ptWordGuessed')
            ptWords.appendChild(newWord);
            let newPrompt = document.createElement('div');
            newPrompt.innerHTML = w.prompt;
            newPrompt.classList.add('ptPromptGuessed')
            ptPrompts.appendChild(newPrompt)
        })
        skipWords.forEach(w => {
            let newSkip = document.createElement('div');
            newSkip.innerHTML = w;
            newSkip.classList.add('ptWordSkipped')
            ptWords.appendChild(newSkip);
        })
    })
    drawScreen();
}

function setElVis(element, visible){
    if(visible){
        try{ element.classList.remove('hide'); }
        catch{}
    }
    else{
        try{ element.classList.add('hide'); }
        catch{}
    }
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