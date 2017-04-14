#!/usr/bin/node

require("./allure.js");

var s = {};
s.config = require('./config.js');

s.path = require('path');
s.http = require('http');
s.express = require('express');
s.app = s.express();
s.pug = require('pug');
s.httpServer = s.http.createServer(s.app);
s.serveIndex = require('serve-index');
s.io = require('socket.io').listen(s.httpServer, { log: true });
s.fs = require('fs');
s.bodyParser = require('body-parser');
s.cookieParser = require('cookie-parser');
s.expressSession = require('express-session');
s.jsonParser = s.bodyParser.json();
s.urlencodedParser = (s.bodyParser.urlencoded({ extended: true }));
s.uuid = require('uuid');

s.settings = s.config.readSettingsFromFile();

s.crypto = require('crypto')
/*var genRandomString = function(length) {
	return s.crypto.randomBytes(Math.ceil(length/2))
		.toString('hex')
		.slice(0, length);
}*/
s.sha512 = function(password, salt) {
	var hash = s.crypto.createHmac('sha512', salt);
	hash.update(password);
	var value = hash.digest('hex');
	return {
		salt: salt,
		passwordHash: value
	}
}

//s.settings.salt = genRandomString(16);
//var passwordData = s.sha512('123', s.settings.salt);
//console.log(passwordData.passwordHash);
//console.log(passwordData.salt);

s.app.use(s.express.static(__dirname + '/../public'));
s.app.use('/js/plugins', s.serveIndex(__dirname + '/../public/js/plugins'));
s.app.use(s.cookieParser());
s.app.use(s.expressSession({
	secret: 'fmbforwestlan',
	resave: true,
	saveUninitialized: false
}));
s.app.set('view engine', 'pug');
s.app.set('views', __dirname + '/../public/views');

s.routes = require('./routes.js').Route(s);
s.screen = require('./Screen.js').Screen(s);

s.connections = [];
ConnectionHandler = require('./ConnectionHandler.js').ConnectionHandler;
s.io.sockets.on('connection', function(socket) {
	var handler = new ConnectionHandler(s, socket);

	s.connections.push(handler);
});

s.pluginManager = require('./PluginManager.js').PluginManager(s);

s.httpServer.listen(s.settings.port);
console.log('Server started on port ' + s.settings.port);

s.config.reloadMessagesFromFile(s.screen);
