const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer)
const path = require('path');

const port = 3000;

// Serve js files
app.use(express.static(path.join(__dirname, 'src')));

// Serve basic html with express
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

// Sockets setup
io.on('connection', (socket) => {
    console.log('a user connnected');

    // When recieving message from any connection...
    socket.on('message', (message) => {
        console.log(message);
        
        // Relay that message to all connections with io.emit()
        io.emit('message', `${socket.id.substr(0,2)} said ${message}`);
    });
});

// Can't use app.listen, it will create a new httpserver
httpServer.listen(port);
console.log('listening at http://localhost:' + port)