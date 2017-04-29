function initialise(s) {
	console.log('YouTube init');

	this.routes(s);
	this.settings(s);

	return 'YouTube';
}

function routes(s) {
	console.log('Delaring YouTube Routes');

	s.app.get('/control/youtube', function(req, res) {
		res.render('youtube', {
			screenAvailable: (s.screen !== undefined),
			adminPermission: (req.session.adminPermission || false),
			settings: s.settings,
			pluginsList: s.pluginManager.registered,
			moderationQueue: s.settings.youtube.moderationQueue
		});
	});

	s.app.get('/control/youtube/delete', s.urlencodedParser, function(req, res) {
		var id = req.query.id;
		var success = false;

		var message;
		s.settings.youtube.moderationQueue.forEach(function(video) {
			if (video.content == id) {
				message = video;
			}
		});

		var index = s.settings.youtube.moderationQueue.indexOf(message);

		if (index !== -1) {
			s.settings.youtube.moderationQueue.splice(index, 1);
			success = true;
		}

		res.redirect('/control/youtube?success=' + success);
	});

	s.app.post('/control/admin/youtube', s.urlencodedParser, function(req, res) {
		var message;
		var success = false;

		s.settings.youtube.moderationQueue.forEach(function(submission) {
			if (submission.content === req.query.id) {
				message = submission;
			}
		});

		if (message !== undefined) {
			var index = s.settings.youtube.moderationQueue.indexOf(message);

			if (index > -1) {
				s.settings.youtube.moderationQueue.splice(index, 1);
				success = true;
			}

			var ytMessage = {
				type: 'youtube',
				content: req.query.id,
				priority: parseInt(req.body.priority, 10)
			};

			s.screen.addMessage(ytMessage);
		}

		res.redirect('/control/youtube?success=' + success);
	});

	s.app.get('/control/admin/youtube/play', function(req, res) {
		s.screen.emitMessagesToEveryone('youtube-play', null);
		res.redirect('/control/youtube');
	});

	s.app.get('/control/admin/youtube/skip', function(req, res) {
		var currentMsg = s.screen.currentMessage;

		if (currentMsg.type === 'youtube') {
			s.screen.removeMessage(currentMsg);

			s.screen.checkTimer();
			res.redirect('/control/youtube');
			return;
		}

		res.sendStatus(200);
	});

	s.app.post('/youtube', s.urlencodedParser, function(req, res) {
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		console.log('YouTube submitted from ip: ' + ip);

		var success = false;

		if (req.body.hasOwnProperty('watch')) {
			success = true;

			if (s.settings.youtube.moderationEnabled) {
				s.settings.youtube.moderationQueue.push({
					content: req.body.watch,
					ip: ip
				});
			} else {
				var ytMessage = {
					type: 'youtube',
					content: req.body.watch,
					priority: s.settings.youtube.noModerationPriority
				};

				s.screen.addMessage(ytMessage);
			}
		}

		res.redirect('/control/youtube?success=' + success);
	});

	s.app.post('/youtube/settings', s.urlencodedParser, function(req, res) {
		var success = false;
		var moderationEnabled = false;

		if (req.body.hasOwnProperty('moderationEnabled')) {
			success = true;
			moderationEnabled = req.body.moderationEnabled;
		}

		s.settings.youtube.moderationEnabled = moderationEnabled;

		if (req.body.hasOwnProperty('noModerationPriority')) {
			success = true;
			s.settings.youtube.noModerationPriority = req.body.noModerationPriority;
		}

		s.screen.updateSettings();

		res.redirect('/control/youtube?success=' + success);
	});
}

function settings(s) {
	console.log('Loading YouTube Settings & Defaults');

	if (s.settings.youtube === undefined) {
		s.settings.youtube = {};
	}

	var settings = s.settings.youtube;

	if (settings.moderationEnabled === undefined) {
		settings.moderationEnabled = true;
	}

	if (settings.noModerationPriority === undefined) {
		settings.noModerationPriority = 2;
	}

	if (settings.moderationQueue === undefined) {
		settings.moderationQueue = [];
	}
}

module.exports = {
	initialise: initialise,
	routes: routes,
	settings: settings
};
