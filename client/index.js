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
var eventLog = [];

// Serve webpage files
app.use(express.static(path.join(__dirname, 'pages'),{extensions:['html']}));
app.use('/src', express.static(path.join(__dirname, 'src'),{extensions:['html']}));

app.get('/', (req, res) => {
    res.redirect('/join')
})


var players = {};
var generatorConnected = false;

// Check cookies during handshake
io.engine.on("initial_headers", (headers, request) => {
    let id = Object.keys(players).length;
    // Do nothing if it has a gameSessionData cookie
    if(request.headers.cookie && Object.keys(cookie.parse(request.headers.cookie)).includes("gameSessionData")) return;
    // Do nothing if it's a generator connection
    if(request.headers['user-agent'] && request.headers['user-agent'].includes('python-requests')) return;
    // Do nothing if it's a manager connection
    if(request.headers.referer && request.headers.referer.split('/')[3].substring(0,6) == "manage") return;
    // Else set cookie and create player entry
    headers["set-cookie"] = cookie.serialize("gameSessionData", `${id}|${Date.now()}`, {path: '/', maxAge: 120 * 60}); //maxAge is in seconds
    players[id] = {initialized: false, user: "unnamed"};
    updateManagerPlayers();
});


// Sockets setup
io.on('connection', (socket) => {
    
    // Check for and parse cookie if client has one
    if(socket.handshake.headers.cookie){
        var cook = cookie.parse(socket.handshake.headers.cookie)
    }

// Handle special connections

    // Generator connection (must be before any reference to referer)
    if(socket.handshake.headers['user-agent'] && socket.handshake.headers['user-agent'].includes('python-requests')){
        log("Generator connected");
        io.to("manager").emit("generator", true);
        generatorConnected = true;
        socket.join("generator");

        socket.on('disconnect', () => {
            log("Generator disconnected");
            io.to("manager").emit("generator", false);
            generatorConnected = false;
        })
        
        socket.on('generatedImage', ({prompt, genTime, formatTime, img}) => {
            log(`Generated image with prompt \"${prompt}\" in ${genTime} ms. Formatted in ${formatTime} ms`)
            io.emit('image', img)
        })

        socket.on('stillThere', (cb) => {
            socket.emit("yupStillHere")
        })

        return;
    }

    // Manager connection 
    if(socket.handshake.headers.referer.split('/')[3].substring(0,6) == "manage"){
        socket.on('transmitLog', () => {
            for(let item of eventLog){
                socket.emit("log", item);
            }
        })

        socket.on('transmitPlayers', () => {
            socket.emit('playerTransmission', players);
        })

        socket.on('turnOffGenerator', () => {
            io.to('generator').emit('exitGenerator');
        })

        socket.on('disconnect', (reason) => {
            log('### Manager disconnected');
        })

        log("### Manager connected");
        socket.join("manager");
        updateManagerPlayers();
        updateManagerGenerator();
        
        // Don't do player setup
        return;
    }

//Handle player connections
    log('A player connected');

    // Handle connection with existing cookie
    if(cook && Object.keys(cook).includes('gameSessionData')){
        log("Player has gameSessionData cookie " + JSON.stringify(cook.gameSessionData));
        // Set socket id
        let id = cook.gameSessionData.split('|')[0];
        socket.data.id = id;
        

        // If id from cookie is valid
        if(Object.keys(players).includes(socket.data.id)){
            log("gameSessionData is valid");
            // Check initialization
            if(players[id].initialized){
                log("Was initialized")
                socket.emit('allowRejoin'); //Only handled by join screen
            }
            else{
                log("Wasn't initialized");
                socket.emit('redirect', '/join');
            }
        }
        else{ // Id from cookies was invalid
            log("Game Session data invalid, clearing cookies and reconnecting");
            // Reset cookie (client handler also refreshes page)
            socket.emit('resetCookie');
            return;
        }
    }
    
    // Request client data from client that didn't have a cookie in the handshake
    else{
        log("Connection had no Cookies");
        socket.emit('sendID', 'plz');
    }
    // Handle response with client data
    socket.on('pID', (id) => {
        socket.data.id = id;
        socket.emit('redirect', '/join');
    })

    // Handle player initialization event (player should be valid at this point)
    socket.on('user', (user) => {
        // Assign player name
        players[socket.data.id].user = user;
        log('Added player name ' + user + " to id " + socket.data.id);
        updateManagerPlayers()

        // Mark player initialized
        players[socket.data.id].initialized = true;
        updateManagerPlayers()

        // Redirect to play screen
        socket.emit("redirect", "/play");
    })

    // Events for player sockets

    // Relay recieved messages
    socket.on('prompt', (prompt) => {
        // Likely unneeded TODO: find out
        if(!Object.keys(players).includes(socket.data.id)) 
        {socket.emit('redirect', '/join'); return;}

        // Send prompt to generator
        io.to("generator").emit("prompt", prompt);

        // Relay that message to all connections with io.emit()
        io.emit('message', `${players[socket.data.id].user} prompted ${prompt}`);
    });

    socket.on('finishedImage', () => {
        io.to('generator').emit('imageRecieved')
    })

    socket.on('disconnect', () => {
        //players[socket.data.id].connected = false;
        //updateManagerPlayers();
        log("Player disconnected");
    })

    log("---End new connection setup---\n");

    //log(`---Player ${players[socket.data.id].user} id:${socket.data.id} finished connecting`);
});

// Helper to log data for manager screen
const log = (entry) => {
    let datedEntry = new Date().toTimeString().substring(0,8) + "--" + entry
    eventLog.push(datedEntry)
    //console.log(datedEntry);
    io.to("manager").emit('log', datedEntry);
}

const updateManagerPlayers = () => {
    io.to("manager").emit("playersUpdate", players);
}

const updateManagerGenerator = () => {
    io.to("manager").emit("generator", generatorConnected);
}

// Can't use app.listen, it will create a new httpserver
httpServer.listen(port);
console.log('listening at http://localhost:' + port)