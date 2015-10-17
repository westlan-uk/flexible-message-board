#!/usr/bin/node 

require("./public/js/allure.js");

var s = {};

s.path = require('path');
s.http = require('http');
s.express = require('express');
s.app = s.express();
s.httpServer = s.http.createServer(s.app);
s.io = require('socket.io').listen(s.httpServer, { log: true });
s.bodyParser = require('body-parser');
s.cookieParser = require('cookie-parser');
s.expressSession = require('express-session');
s.jsonParser = s.bodyParser.json();
s.urlencodedParser = (s.bodyParser.urlencoded({ extended: false }));

s.settings = require("./settings.js").settings;

s.app.use(s.express.static(__dirname + '/public'));
s.app.use(s.cookieParser());
s.app.use(s.expressSession({
    secret: 'fmbforwestlan',
    resave: true,
    saveUninitialized: false
}));

s.routes = require('./routes.js').Route(s);


s.screen = require('./Screen.js').Screen(s, s.settings);

s.httpServer.listen(s.settings.port);
console.log('Server started on port ' + s.settings.port);

s.connections = [];
ConnectionHandler = require('./ConnectionHandler.js').ConnectionHandler;

s.io.sockets.on('connection', function(socket) {
    var handler = new ConnectionHandler(s, socket);
    
    s.connections.push(handler);
});

function dumpCurrentConnections() {
    console.log("Connections: " + s.connections.length)
    s.connections.forEach(function(connectionHandler) {
        console.log(" - " + connectionHandler.socket.conn.id + " / " + connectionHandler.ip + " disconnected?: " + connectionHandler.socket.disconnected);
    });
}

try {
	messages = require('fs').readFileSync('./messages.js', 'utf-8');
	messages = JSON.parse(messages)

	console.log(messages);

	messages.forEach(s.screen.addMessage);
} catch (err) {
	console.log("could not load default messages", err);
}

