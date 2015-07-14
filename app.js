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
var shoutoutExpiry = 300;


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

app.post('/control/admin', urlencodedParser, function(req, res) {
    if (req.body.hasOwnProperty('password')) {
        var pass = req.body.password;
        
        console.log("Login attempt: " + pass + " against: " + adminPassword);
        
        if (pass == adminPassword) {
            console.log('Client logged in');
            req.session.adminPermission = true;
            res.sendFile(path.join(__dirname, 'control/admin.html'));
        }
    } else {
        res.json({ login: "failed" });
    }
});

app.post('/control/admin/logout', function(req, res) {
    req.session.adminPermission = false;
    console.log('Client logged out');
    res.redirect('/control');
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
    socket.on('requestMessages', function() {
        screen.emitUpdates();
    });
    
    // CONTROL //
    app.post('/shoutout', function(req, res) {
        var ip = req.headers['x-forwarded-for'];
        console.log('Shoutout submitted from ip: ' + ip);
        
        if (req.body.hasOwnProperty('content')) {
            screen.processMessage({
                type: "shoutout",
                content: req.body.content
            });
        }
    });
});


function Screen(socket) {
    this.s = socket;
    this.messages = defaultMessages;
    this.currentMsg = 0;
    
    this.urgentMessages = [];
    this.currentUrg = 0;
    
    this.emitUpdates = function() {
        if (this.urgentMessages.length > 0) {
            this.s.emit('urgentMessages',
                {
                    position: this.currentUrg,
                    messages: this.urgentMessages
                }
            );
        } else {
            this.s.emit('messages',
                {
                    position: this.currentMsg,
                    messages: this.messages
                }
            );
        }
    };
    
    this.addMessage = function(message) {
        
    };
    
    this.addUrgentMessage = function(message) {
        
    };
    
    this.processMessage = function(message) {
        if (message.type) {
            message.added = Math.floor(Date.now() / 1000);
            
            if (message.urgent && message.urgent === true) {
                this.addUrgentMessage(message);
            } else {
                this.addMessage(message);
            }
        }
    };
}

/*
Loop through array following delays.
If Urgent message is received via post, broadcast to all screens.

Screens on connect request all messages to process. Will receive one urgent if present or all current messages.
Once an urgent message has finished displaying (expired), it should request the next urgent message or all messages from the server.
*/