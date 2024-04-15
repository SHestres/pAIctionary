const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer)
const path = require('path');

const port = 3000;

app.use(express.static(path.join(__dirname, 'src')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

io.on('connection', (socket) => {
    console.log('a user connnected');

    socket.on('message', (message) => {
        console.log(message);
        io.emit('message', `${socket.id.substr(0,2)} said ${message}`);
    });
});

httpServer.listen(port);
console.log('listening at http://localhost:' + port)