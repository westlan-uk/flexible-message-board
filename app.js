var path = require('path'),
    http = require('http'),
    express = require('express'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server, { log: true });

app.use(express.static(__dirname + '/public'));

server.listen(process.env.PORT);
console.log('Server started on port ' + process.env.PORT);


// Routes //
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'screen.html'));
});

app.get('/control', function(req, res) {
    res.sendFile(path.join(__dirname, 'control.html'));
});
// Routes //


var screen;

io.sockets.on('connection', function(socket) {
    
    if (screen === undefined) {
        socket.screen = new Screen(socket);
        screen = socket.screen;
    }
    
    var ip = socket.handshake.headers['x-forwarded-for'] || socket.handsake.address;
    console.log('Client Connection from: ' + ip);
    
    // SCREEN //
    
    
    // CONTROL //
    
    
});


function Screen(socket) {
    this.s = socket;
    this.currentMessages = [];
}