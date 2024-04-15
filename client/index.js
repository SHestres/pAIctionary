const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer)
const path = require('path');

const port = 3000;

// Serve webpage files
app.use(express.static(path.join(__dirname, 'pages'),{extensions:['html']}));
app.use('/src', express.static(path.join(__dirname, 'src'),{extensions:['html']}));

app.get('/', (req, res) => {
    res.redirect('/join')
})

// Sockets setup
io.on('connection', (socket) => {
    console.log('a user connnected');

    // When recieving message from any connection...
    socket.on('message', (message) => {
        console.log(message);
        
        // Relay that message to all connections with io.emit()
        io.emit('message', `${socket.data.user} said ${message}`);
    });

    socket.on('user', (user) => {
        socket.data.user = user;
    })
});

// Can't use app.listen, it will create a new httpserver
httpServer.listen(port);
console.log('listening at http://localhost:' + port)