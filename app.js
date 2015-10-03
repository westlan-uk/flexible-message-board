#!/usr/bin/node 

require("./public/js/allure.js");

var path = require('path'),
    http = require('http'),
    express = require('express'),
    app = express(),
    httpServer = http.createServer(app),
    io = require('socket.io').listen(httpServer, { log: true }),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session'),
	jsonParser = bodyParser.json(),
	urlencodedParser = (bodyParser.urlencoded({ extended: false }));

var settings = require("./settings.js").settings;

app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(expressSession({
    secret: 'fmbforwestlan',
    resave: true,
    saveUninitialized: false
}));

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

app.get('/control/admin', function(req, res) {
    if (req.session.adminPermission === true) {
        res.sendFile(path.join(__dirname, 'control/admin.html'));
    }
    else {
        res.redirect('/control');
    }
});

app.post('/control/admin', urlencodedParser, function(req, res) {
    if (req.body.hasOwnProperty('password')) {
        var pass = req.body.password;
        
        console.log("Login attempt: " + pass + " against: " + settings.adminPassword);
        
        if (pass == settings.adminPassword) {
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

app.get('/control/admin/settings', function(req, res) {
    res.json(settings);
});

app.post('/control/admin/settings', urlencodedParser, function(req, res) {
    for (var setting in req.body) {
        if (settings[setting] !== undefined) {
            settings[setting] = req.body[setting];
        }
    }
    res.redirect('/control/admin');
});

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
			expire: settings.shoutoutExpiry,
			delay: settings.shoutoutDuration
		});
	}
	
	if (success) {
		res.redirect('/control/shoutout?success=true');
	} else {
		res.redirect('/control/shoutout?success=false');
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

screen = new require("./Screen.js").Screen(settings)

httpServer.listen(settings.port);
console.log('Server started on port ' + settings.port);

connections = []
ConnectionHandler = require('./ConnectionHandler.js').ConnectionHandler;

io.sockets.on('connection', function(socket) {
	handler = new ConnectionHandler(socket);

	connections.push(handler);
});

function dumpCurrentConnections() {
	console.log("Connections: " + connections.length)
	connections.forEach(function(connectionHandler) {
		console.log(" - " + connectionHandler.socket.conn.id + " / " + connectionHandler.ip + " disconnected?: " + connectionHandler.socket.disconnected)
	});
}

var serverStarted = Math.floor(Date.now() / 1000);

settings.defaultMessages.forEach(screen.addMessage);
