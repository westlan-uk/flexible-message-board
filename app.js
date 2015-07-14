var path = require('path'),
    http = require('http'),
    express = require('express'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server, { log: true }),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session');

app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(expressSession({
    secret: 'fmbforwestlan',
    resave: true,
    saveUninitialized: false
}));

var jsonParser = bodyParser.json();
var urlencodedParser = (bodyParser.urlencoded({ extended: false }));

server.listen(process.env.PORT);
console.log('Server started on port ' + process.env.PORT);

var screen;
var adminPassword = process.argv.slice(2); // First cli arg
var shoutoutDuration = 30;


var defaultMessages = [
        {
            type: 'text',
            content: '<p>Hellow World</p>',
            expire: 0,
            delay: 10
        },
        {
            type: 'text',
            content: '<p>Welcome to WestLAN!</p><p>You can find the wiki and help at http://www</p>',
            expire: 18000,
            delay: 10
        },
        {
            type: 'text',
            content: '<p>If you want to create a shoutout, go to http://fmb/control/shoutout</p>',
            expire: 0,
            delay: 15
        }
    ];


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

app.post('/control/admin/logout', function(req, res) {
    req.session.adminPermission = false;
    console.log('Client logged out');
    res.redirect('/control');
});

app.post('/control/admin', urlencodedParser, function(req, res) {
    if (req.body.hasOwnProperty('password')) {
        var pass = req.body.password;
        
        console.log("Login attempt: " + pass + " against: " + adminPassword);
        
        if (pass == adminPassword) {
            console.log('Client logged in');
            req.session.adminPermission = true;
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

app.get('/status/admin', function (req, res) {
    var aDef = (req.session.adminPermission || false);
    res.json({ status: aDef });
});
// Routes //


io.sockets.on('connection', function(socket) {
    
    if (screen === undefined) {
        socket.screen = new Screen(socket);
        screen = socket.screen;
    }
    
    var ip = socket.handshake.headers['x-forwarded-for'] || socket.handsake.address;
    console.log('Client Screen Connection from: ' + ip);
    
    
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