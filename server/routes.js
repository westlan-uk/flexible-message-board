function Route(s) {
    console.log('Declaring Default Routes');
	publicDir = s.path.join(__dirname, '../public/');
	controlDir = s.path.join(__dirname, '/../public/control')
    
    s.app.get('/', function(req, res) {
        res.sendFile(s.path.join(publicDir, 'screen.html'));
    });

	s.app.get('/dumpMessages', function(req, res) {
		console.log(s.screen.messages);

		res.json({message: "Messages dumped to console."})
	});

	s.app.get('/dumpConnections', function(req, res) {
		console.log("Connections: " + s.connections.length)
		s.connections.forEach(function(connectionHandler) {
			console.log(" - " + connectionHandler.socket.conn.id + " / " + connectionHandler.ip + " disconnected?: " + connectionHandler.socket.disconnected);
		});

		res.json({message: "Connections dumped to console."})
	});
    
    
    s.app.get('/control', function(req, res) {
        res.sendFile(s.path.join(controlDir, 'index.html'));
    });
    
    
    s.app.get('/control/shoutout', function(req, res) {
        res.sendFile(s.path.join(controlDir, 'shoutout.html'));
    });
    
    
    s.app.get('/control/slides', function(req, res) {
        res.sendFile(s.path.join(controlDir, 'slides.html'));
    });
    
    
    s.app.get('/control/admin', function(req, res) {
        if (req.session.adminPermission === true) {
            res.sendFile(s.path.join(controlDir, 'admin.html'));
        }
        else {
            res.redirect('/control');
        }
    });
    
    s.app.post('/control/admin', s.urlencodedParser, function(req, res) {
        if (req.body.hasOwnProperty('password')) {
            var pass = req.body.password;
            
            console.log("Login attempt using password: " + pass + ", but the admin password is: '" + s.settings.adminPassword + "' !");
            
            if (pass == s.settings.adminPassword) {
                console.log('Client logged in');
                req.session.adminPermission = true;
                res.sendFile(s.path.join(publicDir, 'control/admin.html'));
            }
        } else {
            res.json({ login: "failed" });
        }
    });
    
    s.app.post('/control/admin/logout', function(req, res) {
        req.session.adminPermission = false;
        console.log('Client logged out');
        res.redirect('/control');
    });
    
    s.app.get('/control/admin/settings', function(req, res) {
        res.json(s.settings);
    });
    
    s.app.post('/control/admin/settings', s.urlencodedParser, function(req, res) {
        for (var setting in req.body) {
            if (s.settings[setting] !== undefined) {
                s.settings[setting] = req.body[setting];
            }
        }
        
        s.screen.updateSettings();
        
        res.redirect('/control/admin');
    });
    
    s.app.post('/control/admin/refresh', function(req, res) {
        s.screen.forceRefresh();
        res.redirect('/control');
    });
    
    s.app.get('/control/admin/slides', function(req, res) {
        var slides = [];
        var allMessages = s.screen.messages;
        
        for (var i = 0; i < allMessages.length; i++) {
            if (allMessages[i].type == 'slide') {
                slides.push(allMessages[i]);
            }
        }
        
        res.json(slides);
    });
    
    s.app.post('/slide', s.urlencodedParser, function(req, res) {
        var ip = req.headers['x-forwarded-for'];
        console.log('Slide submitted from ip: ' + ip);
        
        var success = false;
        
        if (req.body.hasOwnProperty('content')
            && req.body.hasOwnProperty('delay')
            && req.body.hasOwnProperty('expire')) {
            success = true;
            
            s.screen.processMessage({
                id: 0,
                type: "slide",
                content: req.body.content,
                expire: parseInt(req.body.expire, 10),
                delay: parseInt(req.body.delay, 10)
            });
        }
        
        res.redirect('/control/admin?success=' + success);
    });
    
    s.app.get('/slide/delete', s.urlencodedParser, function(req, res) {
        var success = false;
        
        if (req.query.hasOwnProperty('id')) {
            var id = req.query.id;
            var ip = req.headers['x-forwarded-for'];
            console.log('Slide with id "' + id + '" being deleted from ip: ' + ip);
            
            s.screen.messages.forEach(function(message) {
                if (message.id === id) {
                    success = true;
                    s.screen.removeMessage(message);
                    s.screen.sendExpireNotice(id);
                }
            });
        }
        
        res.redirect('/control/admin?success=' + success);
    });
    
    s.app.post('/shoutout', s.urlencodedParser, function(req, res) {
        var ip = req.headers['x-forwarded-for'];
        console.log('Shoutout submitted from ip: ' + ip);
        
        var success = false;
        
        if (req.body.hasOwnProperty('content')) {
            success = true;
            
            s.screen.processMessage({
                type: "tick",
                content: req.body.content,
				playAudioNotification: s.screen.shouldPlayAudioNotification(),
                expire: parseInt(s.settings.shoutoutExpiry, 10),
                delay: parseInt(s.settings.shoutoutDuration, 10)
            });
        }
        
        res.redirect('/control/shoutout?success=' + success);
    });
    
    
    s.app.get('/status/screen', function (req, res) {
        var sDef = (s.screen !== undefined);
        res.json({ status: sDef });
    });
    
    s.app.get('/status/admin', function (req, res) {
        var aDef = (req.session.adminPermission || false);
        res.json({ status: aDef });
    });
}

module.exports = {
    Route: Route
};
