#!/usr/bin/node 

require("./allure.js");

var s = {};

s.path = require('path');
s.http = require('http');
s.express = require('express');
s.app = s.express();
s.httpServer = s.http.createServer(s.app);
s.serveIndex = require('serve-index');
s.io = require('socket.io').listen(s.httpServer, { log: true });
s.fs = require('fs');
s.bodyParser = require('body-parser');
s.cookieParser = require('cookie-parser');
s.expressSession = require('express-session');
s.jsonParser = s.bodyParser.json();
s.urlencodedParser = (s.bodyParser.urlencoded({ extended: false }));

s.settings = require("./settings.js").settings;

s.app.use(s.express.static(__dirname + '/../public'));
s.app.use('/js/plugins', s.serveIndex(__dirname + '/../public/js/plugins'));
s.app.use(s.cookieParser());
s.app.use(s.expressSession({
    secret: 'fmbforwestlan',
    resave: true,
    saveUninitialized: false
}));

s.routes = require('./routes.js').Route(s);
s.plugin = require('./Plugin.js').Plugin(s);
s.screen = require('./Screen.js').Screen(s, s.settings);

s.httpServer.listen(s.settings.port);
console.log('Server started on port ' + s.settings.port);

s.connections = [];
ConnectionHandler = require('./ConnectionHandler.js').ConnectionHandler;

s.io.sockets.on('connection', function(socket) {
    var handler = new ConnectionHandler(s, socket);
    
    s.connections.push(handler);
});

try {
    var messages = require('fs').readFileSync('./messages.js', 'utf-8');
    messages = JSON.parse(messages)

    console.log("Loaded messages are: \n" + messages);

    messages.forEach(s.screen.addMessage);
} catch (err) {
    console.log("could not load default messages", err);
}
