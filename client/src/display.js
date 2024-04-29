var blue = "#255ff4";
var red = "#ff2626";
var teamColors = [];
var numberOfTeams = 2;

const socket = io();

document.querySelector('.blueButton').onclick = () => {setColor(blue)}
document.querySelector('.redButton').onclick = () => {setColor(red)}
document.querySelector('.timerButton').onclick = () => {setTimer(30)}
document.querySelector('.increaseNumTeams').onclick = increaseNumTeams;
document.querySelector('.decreaseNumTeams').onclick = decreaseNumTeams;

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
    console.log(newSelector.firstChild);
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
    console.log(ind);
    teamColors[ind] = window.getComputedStyle(event.target).backgroundColor;
    console.log(teamColors);
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