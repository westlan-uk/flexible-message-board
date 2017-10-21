function Route(s) {
	console.log('Declaring Default Routes');

	// Debugging
	s.app.get('/dumpMessages', function(req, res) {
		console.log(s.screen.messages);

		res.json({message: "Messages dumped to console."});
	});

	s.app.get('/dumpConnections', function(req, res) {
		console.log("Connections: " + s.connections.length)
		s.connections.forEach(function(connection) {
			console.log(" - " + connection.socket.conn.id + " / " + connection.ip + " disconnected?: " + connection.socket.disconnected);
		});

		res.json({message: "Connections dumped to console."});
	});

	// Screen
	s.app.get('/', function(req, res) {
		res.render('screen', {
			settings: s.settings
		});
	});

	// Control
	s.app.get('/control', function(req, res) {
		res.render('index', {
			screenAvailable: (s.screen !== undefined),
			adminPermission: (req.session.adminPermission || false),
			settings: s.settings,
			pluginsList: s.pluginManager.registered
		});
	});

	s.app.get('/control/slides', function(req, res) {
		renderSlideList(s, req, res, null);
	});

	s.app.get('/control/slides/edit', function(req, res) {
		if (req.query.hasOwnProperty('id')) {
			var id = req.query.id;

			var slide = s.screen.getMessageById(id)

			console.log(slide)

			renderSlideList(s, req, res, slide);
		}
	});

	s.app.post('/slide', s.urlencodedParser, function(req, res) {
		var ip = req.headers['x-forwarded-for'];
		console.log('Slide submitted from ip: ' + ip);
		
		var success = false;
		
		if (req.body.hasOwnProperty('content')
			&& req.body.hasOwnProperty('delay')
			&& req.body.hasOwnProperty('expire')) {
			success = true;
			
			s.screen.addMessage({
				type: 'slide',
				content: req.body.content,
				expire: parseInt(req.body.expire, 10),
				delay: parseInt(req.body.delay, 10)
			});
		}
		
		res.redirect('/control/slides?success=' + success);
	});

	s.app.get('/slide/delete', s.urlencodedParser, function(req, res) {
		var success = false;

		if (req.query.hasOwnProperty('id')) {
			var id = req.query.id;
			var ip = req.headers['x-forwarded-for'];
			console.log('Slide (' + id + ') being deleted by ip: ' + ip);

			success = s.screen.removeMessage(s.screen.getMessageById(id))
		}

		if (success) {
			s.screen.saveMessages();
		}

		res.redirect('/control/slides?success=' + success);
	});

	s.app.post('/slide/settings', s.urlencodedParser, function(req, res) {
		var success = false;

		if (req.body.hasOwnProperty('slideExpire') &&
			req.body.hasOwnProperty('slideDisplay')) {

			s.settings.slideExpire = req.body.slideExpire;
			s.settings.slideDisplay = req.body.slideDisplay;

			success = true;
			s.screen.updateSettings();
		}

		res.redirect('/control/slides?success=' + success);
	});

	s.app.post('/environment', s.urlencodedParser, function(req, res) {
		var success = false;

		if (req.body.hasOwnProperty('port')) {
			s.settings.port = req.body.port;
			success = true;
			s.screen.updateSettings();
		}

		res.redirect('/control?success=' + success);
	});

	s.app.post('/sound', s.urlencodedParser, function(req, res) {
		var success = false;

		if (req.body.hasOwnProperty('sound')) {
			s.settings.sound = req.body.sound;
			success = true;
		}

		res.redirect('/control?success=' + success);
	});

	s.app.post('/control/admin', s.urlencodedParser, function(req, res) {
		if (req.body.hasOwnProperty('password')) {
			var pass = req.body.password;
			
			if (s.sha512(pass, s.settings.salt).passwordHash === s.settings.adminPassword) {
				console.log('Client logged in');
				req.session.adminPermission = true;
				
				var backUri = req.header('Referer') || '/control'
				res.redirect(backUri);
			} else {
				res.json({ password: false });
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

	s.app.post('/control/admin/update', s.urlencodedParser, function(req, res) {
		var success = false;

		if (req.body.hasOwnProperty('passwordOld') &&
			req.body.hasOwnProperty('password') &&
			req.body.hasOwnProperty('passwordConfirm')) {
			var oldPass = req.body.passwordOld;
			var newPass = req.body.password;

			if (s.sha512(oldPass, s.settings.salt).passwordHash === s.settings.adminPassword) {
				if (newPass === req.body.passwordConfirm) {
					s.settings.adminPassword = s.sha512(newPass, s.settings.salt).passwordHash;
					success = true;
					s.screen.updateSettings();
				}
			}
		}

		res.redirect('/control?success=' + success);
	});

	s.app.post('/control/admin/refresh', function(req, res) {
		s.screen.forceRefresh();
		res.redirect('/control');
	});
}

function renderSlideList(s, req, res, slideTemplate) {
	var slides = [];
	var allMessages = s.screen.messages;

	if (slideTemplate == null) {
		var slideTemplate = {
			expire: s.settings.slideExpire,
			delay: s.settings.slideDisplay, // should be renamed "display" in create slide
			content: "Your slide goes here..."
		}
	}
		
	for (var i = 0; i < allMessages.length; i++) {
		if (allMessages[i].type == 'slide') {
			slides.push(allMessages[i]);
		}
	}

	res.render('slides', {
		screenAvailable: (s.screen !== undefined),
		adminPermission: (req.session.adminPermission || false),
		settings: s.settings,
		pluginsList: s.pluginManager.registered,
		slideTemplate: slideTemplate,
		slides: slides
	});
}

module.exports = {
	Route: Route
};
