function UserInterface() {
	var self = this;

	self.headerVisible = true;

	self.layouts = {
		fullscreen: function() {
			return $('<div>').attr('id', 'slideshow').addClass('layout2-slideshow');
		}
	};

	self.updateFrames = function() {
		console.log('Updating Frames');
		var layout = window.state.settings.layout;

		var frame = self.layouts[layout];

		self.resetFrame();
		$('#frame').append(frame);
	};

	self.renderSlide = function() {
		if (window.state.currentMessage === null) {
			self.resetFrame();
			self.renderNoMessages();
			return;
		}

		this.updateFrames();

		var msgType = window.state.currentMessage.type;

		if (msgType === 'slide') {
			$('#slideshow').append( $('<div>').append(window.state.currentMessage.content).addClass('auto-margin') );
		} else {
			if (window.plugin.loaded[msgType] && typeof window.plugin.loaded[msgType].renderScreen == 'function') {
				window.plugin.loaded[msgType].renderScreen(window.state.currentMessage);
			}
		}
	};

	self.renderNoMessages = function() {
		console.log('No Messages');

		if ($('#frame').contains('.noMessages')) {
			return;
		}

		$('#frame').append('<div class="noMessages">FMB is working, but has no messages!<br /><br />An admin should create some with the control panel!</div>');
	};

	self.setStatus = function(message, karma) {
		console.log('Status: ', message, karma);

		$('#status').text(message);
		$('#status').removeClass('bad good neutral');
		$('#status').addClass(karma);
	};

	self.showHeader = function() {
		if (window.state.ui.headerVisible === false) {
			window.state.ui.headerVisible = true;
			$('#header').slideDown(2000);
		}
	};

	self.hideHeader = function() {
		if (window.state.ui.headerVisible === true) {
			window.state.ui.headerVisible = false;
			$('#header').slideUp(2000);
		}
	};

	self.resetFrame = function() {
		$('#frame').remove();
		$('body').append( '<div id="frame"></div>' );
	};

	return self;
}

function Sound() {
	this.alarm = document.getElementById('alarm');

	this.play = function() {
		this.alarm.play();
	};
}

function ServerConnectionHandler() {
	var self = this;

	self.socket = io.connect();

	self.setupSocketHandlers = function() {
		self.socket.on('connect', function() {
			window.state.ui.hideHeader();
			window.state.ui.setStatus('Connected', 'good');
		});

		self.socket.on('connecting', function() {
			console.log('Connecting...');
		});

		self.socket.on('disconnect', function() {
			window.state.ui.showHeader();
			window.state.ui.setStatus('Disconnected', 'bad');
		});

		self.socket.on('initialise', function(data) {
			console.log('Initialising Screen with data');

			window.state.settings = data.settings;
			window.state.currentMessage = data.message;

			window.state.ui.renderSlide();
		});

		self.socket.on('message', function(data) {
			console.log(data.message);
			window.state.currentMessage = data.message

			window.state.ui.renderSlide();
		});

		self.socket.on('settings', function(data) {
			console.log('Updating Settings');
			window.state.settings = data.settings;

			window.state.ui.renderSlide();
		});

		self.socket.on('refresh', function() {
			window.location.reload();
		});
	};

	self.init = function() {
		self.setupSocketHandlers();
	};

	return this;
}

function State() {
	this.settings = [];
	this.currentMessage = null;
	
	this.ui = new UserInterface();
	this.sound = new Sound();

	this.connectionHandler = new ServerConnectionHandler();

	return this;
}

function Plugin() {
	this.loaded = {};

	this.loadPlugins = function() {
		(function($) {
			$.extend(true, {
				import_js: function(script) {
					$('head').append('<script type="text/javascript" src="' + script + '"></script>');
				}
			});
		})(jQuery);

		var dir = '/js/plugins';

		var fileExtension = '.js';
		$.ajax({
			url: dir,
			success: function(data) {
				$(data).find('a:contains(' + fileExtension + ')').each(function() {
					var filename = this.href.replace(window.location.host, '');

					if (filename.indexOf('/') != -1) {
						filename = filename.substring(filename.lastIndexOf('/') + 1);
					}

					$.import_js(dir + '/' + filename);

					filename = filename.substring(0, filename.lastIndexOf('.'));
					console.log('Plugin Available: ' + filename);
					window.plugin.loaded[filename] = new window[filename];
				});
			}
		});
	};
}

function init() {
	window.state = new State();
	window.state.ui.resetFrame();

	window.plugin = new Plugin();
	window.plugin.loadPlugins();
	
	window.state.connectionHandler.init();
}

$(document).ready(init);
