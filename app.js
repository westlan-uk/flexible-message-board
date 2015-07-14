var path = require('path'),
    http = require('http'),
    express = require('express'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server, { log: true }),
    bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));
var jsonParser = bodyParser.json();
var urlencodedParser = (bodyParser.urlencoded({ extended: false }));

server.listen(process.env.PORT);
console.log('Server started on port ' + process.env.PORT);

var screen;
var adminPassword = process.argv.slice(2); // First cli arg

// Routes //
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'screen.html'));
});

app.get('/control', function(req, res) {
    res.sendFile(path.join(__dirname, 'control/index.html'));
});

app.get('/control/shoutout', function(req, res) {
    res.sendFile(path.join(__dirname, 'control/shoutout.html'));
});

app.get('/control/slides', function(req, res) {
    res.sendFile(path.join(__dirname, 'control/slides.html'));
});

app.post('/control/admin', urlencodedParser, function(req, res) {
    if (req.body.hasOwnProperty('password')) {
        var pass = req.body.password;
        
        console.log("Login attempt: " + pass + " against: " + adminPassword);
        
        if (pass == adminPassword) {
            res.sendFile(path.join(__dirname, 'control/admin.html'));
        }
    }
    else {
        res.json({ login: "failed" });
    }
});

app.get('/status/screen', function (req, res) {
    var sDef = (screen !== undefined);
    res.json({ status: sDef });
});
// Routes //


io.sockets.on('connection', function(socket) {
    
    if (screen === undefined) {
        socket.screen = new Screen(socket);
        screen = socket.screen;
    }
    
    var ip = socket.handshake.headers['x-forwarded-for'] || socket.handsake.address;
    console.log('Client Connection from: ' + ip);
    
    // SCREEN //
    
    
    // CONTROL //
    app.post('/shoutout', function(req, res) {
        console.log('Client submitted shoutout');
    });
});


function Screen(socket) {
    this.s = socket;
    this.currentMessages = [];
}