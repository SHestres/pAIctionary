const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");
const cookie = require('cookie')

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cookie: true,
})
const path = require('path');

const port = 3000;

// Serve webpage files
app.use(express.static(path.join(__dirname, 'pages'),{extensions:['html']}));
app.use('/src', express.static(path.join(__dirname, 'src'),{extensions:['html']}));

app.get('/', (req, res) => {
    res.redirect('/join')
})


var players = {};

// Check cookies during handshake
io.engine.on("initial_headers", (headers, request) => {
    let id = Object.keys(players).length;
    // Do nothing if it has a gameSessionData cookie
    if(request.headers.cookie && Object.keys(cookie.parse(request.headers.cookie)).includes("gameSessionData")) return;
    // Else set cookie and create player entry
    headers["set-cookie"] = cookie.serialize("gameSessionData", `${id}|${Date.now()}`, {path: '/', maxAge: 120 * 60}); //maxAge is in seconds
    players[id] = {initialized: false};
});


// Sockets setup
io.on('connection', (socket) => {
    console.log('A player connected');
    //console.log(socket.handshake)
    
    // Check for and parse cookie if client has one
    if(socket.handshake.headers.cookie){
        var cook = cookie.parse(socket.handshake.headers.cookie)
    }

    // If has gameSessionData cookie
    if(cook && Object.keys(cook).includes('gameSessionData')){
        console.log("Player has gameSessionData cookie");
        console.log(cook.gameSessionData);
        // Set socket id
        let id = cook.gameSessionData.split('|')[0];
        socket.data.id = id;
        
        // If id from cookie is valid
        if(Object.keys(players).includes(socket.data.id)){
            console.log("gameSessionData is valid");
            // Check initialization
            if(players[id].initialized){
                console.log("Was initialized")
                socket.emit('allowRejoin'); //Only handled by join screen
            }
            else{
                console.log("Wasn't initialized");
                socket.emit('redirect', '/join');
            }
        }
        else{
            console.log("Game Session data invalid");
            // Reset cookie (client handler also refreshes page)
            socket.emit('resetCookie');
        }
    }
    // Client didn't already have cookie in handshake
    else{
        console.log("Connection had no Cookies");
        socket.emit('sendID', 'plz');
    }

    // Set socketid from new cookie
    socket.on('pID', (id) => {
        socket.data.id = id;
        socket.emit('redirect', '/join');
    })

    // When recieving message from any connection...
    socket.on('message', (message) => {
        if(!Object.keys(players).includes(socket.data.id)) 
        {socket.emit('redirect', '/join'); return;}

        // Relay that message to all connections with io.emit()
        io.emit('message', `${players[socket.data.id].user} said ${message}`);
    });

    // Player initialization (player should be valid)
    socket.on('user', (user) => {
        // Assign player name
        players[socket.data.id].user = user;
        console.log('added player name ' + user + " to id " + socket.data.id);

        // Mark player initialized
        players[socket.data.id].initialized = true;

        // Redirect to play screen
        socket.emit("redirect", "/chat");
    })
});

// Can't use app.listen, it will create a new httpserver
httpServer.listen(port);
console.log('listening at http://localhost:' + port)