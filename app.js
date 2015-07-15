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

var id = 0;

var shoutoutDuration = 30; // In seconds
var shoutoutExpiry = 300; // In seconds

var expiryCheckInterval = 20; // In seconds

var serverStarted = Math.floor(Date.now() / 1000);
var defaultMessages = [
        {
            type: 'text',
            content: '<p>Hellow World</p>',
            expire: 10,
            delay: 10,
            added: serverStarted,
            id: id++
        },
        {
            type: 'text',
            content: '<p>Welcome to WestLAN!</p><p>You can find the wiki and help at http://www</p>',
            expire: 18000,
            delay: 10,
            added: serverStarted,
            id: id++
        },
        {
            type: 'text',
            content: '<p>If you want to create a shoutout, go to http://fmb/control/shoutout</p>',
            expire: 0,
            delay: 15,
            added: serverStarted,
            id: id++
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
    
    var ip = socket.handshake.headers['x-forwarded-for'] || socket.handsake.address;
    console.log('Client Screen Connection from: ' + ip);
    
    if (screen === undefined) {
        socket.screen = new Screen(socket);
        screen = socket.screen;
    }
    
    
    // SCREEN //
    socket.on('requestMessages', function() {
        screen.emitUpdates();
    });
    
    
    // CONTROL //
    app.post('/shoutout', urlencodedParser, function(req, res) {
        var ip = req.headers['x-forwarded-for'];
        console.log('Shoutout submitted from ip: ' + ip);
        
        var success = false;
        
        if (req.body.hasOwnProperty('content')) {
            success = true;
            
            screen.processMessage({
                type: "shoutout",
                content: req.body.content,
                urgent: true,
                expire: shoutoutExpiry,
                delay: shoutoutDuration
            });
        }
        
        if (success) {
            res.redirect('/control/shoutout?success=true');
        } else {
            res.redirect('/control/shoutout?success=false');
        }
    });
});


function Screen(socket) {
    this.s = socket;
    this.messages = [];
    this.currentMsg = 0;
    
    this.urgentMessages = [];
    this.currentUrg = 0;
    
    
    this.emitUpdates = function() {
        console.log('Emitting Updates');
        
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
        var urgent = message.urgent || false;
        
        if (urgent === true) {
            this.urgentMessages.push(message);
        } else {
            this.messages.push(message);
        }
        
        console.log("START");
        console.log(message);
        console.log("END");
    };
    
    this.removeMessage = function(message) {
        var urgent = message.urgent || false;
        
        var messages = (urgent === true) ? screen.urgentMessages : screen.messages;
        
        var index = messages.indexOf(message);
        
        if (index > -1) {
            messages.splice(index, 1);
        }
        
        if (urgent === true) {
            screen.urgentMessages = messages;
        } else {
            screen.messages = messages;
        }
    };
    
    this.processMessage = function(message) {
        if (message.type !== undefined) {
            message.added = Math.floor(Date.now() / 1000);
            message.id = id++;
            
            this.addMessage(message);
            
            this.emitUpdates();
        }
    };
    
    for (var i = 0; i < defaultMessages.length; i++) {
        this.addMessage(defaultMessages[i]);
    }
    
    var checkExpiry = setInterval(function() {
        console.log('Checking Expiry @ ' + Math.floor(Date.now() / 1000));
        var toExpire = [];
        
        for (var i = 0; i < screen.messages.length; i++) {
            var message = screen.messages[i];
            if (message.expire !== undefined && message.expire > 0) {
                if ((message.added + message.expire) < Math.floor(Date.now() / 1000)) {
                    toExpire.push(message);
                }
            }
        }
        
        for (var i = 0; i < screen.urgentMessages.length; i++) {
            var message = screen.urgentMessages[i];
            if (message.expire !== undefined && message.expire > 0) {
                if ((message.added + message.expire) < Math.floor(Date.now() / 1000)) {
                    toExpire.push(message);
                }
            }
        }
        
        for (var i = 0; i < toExpire.length; i++) {
            screen.removeMessage(toExpire[i]);
        }
        
        if (toExpire.length > 0) {
            screen.emitUpdates();
            //console.log(screen.messages);
        }
    }, expiryCheckInterval * 1000);
}