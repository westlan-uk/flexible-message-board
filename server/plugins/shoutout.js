function initialise(s) {
	console.log('Shoutout init');

	this.routes(s);
	this.settings(s);

	return 'Shoutout';
}

function routes(s) {
	console.log('Delaring Shoutout Routes');

	s.app.get('/control/shoutout', function(req, res) {
		res.render('shoutout', {
			screenAvailable: (s.screen !== undefined),
			adminPermission: (req.session.adminPermission || false),
			settings: s.settings,
			pluginsList: s.pluginManager.registered
		});
	});

	s.app.post('/shoutout', s.urlencodedParser, function(req, res) {
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		console.log('Shoutout submitted from ip: ' + ip);
		
		var success = false;

		if (req.body.hasOwnProperty('content')) {
			success = true;

			var striptags = require("striptags")
			var content = striptags(req.body.content);

			s.screen.emitMessagesToEveryone('shoutout-new', { content: content });
		}
		
		res.redirect('/control/shoutout?success=' + success);
	});

	s.app.post('/shoutout/settings', s.urlencodedParser, function(req, res) {
		var success = false;

		if (req.body.hasOwnProperty('shoutoutEnabled') && req.body.shoutoutEnabled === '1') {
			s.settings.shoutout.enabled = true;

			if (req.body.hasOwnProperty('shoutoutLayout')) {
				s.settings.layout = req.body.shoutoutLayout;
			}

			success = true;
		} else if (s.settings.layout === 'shoutoutRight' || s.settings.layout === 'shoutoutBottom') {
			s.settings.shoutout.enabled = false;
			s.settings.layout = 'fullscreen';

			success = true;
		}

		if (success) {
			s.screen.updateSettings();
		}

		res.redirect('/control/shoutout?success=' + success);
	});
}

function settings(s) {
	console.log('Loading Shoutout Settings & Defaults');

	if (s.settings.shoutout === undefined) {
		s.settings.shoutout = {};
	}

	var settings = s.settings.shoutout;

	if (settings.enabled === undefined) {
		settings.enabled = false;
	}
}

module.exports = {
	initialise: initialise,
	routes: routes,
	settings: settings
};
