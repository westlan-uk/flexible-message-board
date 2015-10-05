function UserInterface() {
	var self = this;

	this.renderMessage = function(message) {
		var el = $('<p class = "message"></p>');
		el.html(message.content);

		return el;
	};

	this.setStatus = function(message, karma) {
		console.log('Status:', message, karma);

		$('#status').text(message);
		$('#status').removeClass('bad good neutral');
		$('#status').addClass(karma);
	};

	this.resetFrame = function() {
		$( "#frame" ).remove();
		$( "body" ).append( '<div id="frame"></div>' );
	};

	this.displayMessage = function(message) {
		console.log('displaying message: ', message);
		
		currentMsgStart = Math.floor(Date.now() / 1000);
		
		switch (message.type) {
			case 'text':
				$( "#frame" ).prepend(self.renderMessage(message));
				break;
			case 'shoutout':
				$( "#frame" ).prepend(self.renderMessage(message)); // add to template
				break;
			default:
				break;
		}
	};

	return this;
}

function Sound() {
	this.init = function() {
		var alarm = document.getElementById('alarm');
		alarm.src = '/sounds/204424__jaraxe__alarm-3.wav';
	};
	
	this.play = function() {
		var alarm = document.getElementById('alarm');
		alarm.play();
	};
}

function ConnectionHandler() {
	var self = this;

    this.socket = io.connect();

	this.setupSocketHandlers = function() {
		self.socket.on('connect', function() {
			window.state.ui.setStatus('Connected', 'good');
		});

		self.socket.on('disconnect', function() {
			window.state.ui.setStatus('Disconnected', 'bad');
			window.state.ui.resetFrame();
		});
		
		self.socket.on('messages', function(data) {
			console.log('Recv Messages', data);

			data.messages.forEach(function(message) {
				window.state.ui.displayMessage(message);
				window.state.sound.play();
			});
		});
	};

	this.init = function() {
		this.setupSocketHandlers();
	};

	return this;
}

function State() {
	this.connectionHandler = new ConnectionHandler();
	this.ui = new UserInterface();
	this.sound = new Sound();
    this.messages = [];

	return this;
}

function init() {     
	window.state = new State();
    window.state.ui.resetFrame();
	window.state.connectionHandler.init();
	window.state.sound.init();

	setInterval(tick, 2000); // ms between checks
}

function tick() {
	var timeNow = Math.floor(Date.now() / 1000);
	
	state = window.state;

	if (state.messages.notEmpty()) {
		nextMessage = state.messages.lastItem();
	} else {
		return;
	}
	
	console.log(nextMessage);
	
	if ((timeNow - currentMsgStart) >= nextMessage.delay) {
		console.log('Display Next', nextMessage);
		
		displayMessage(nextMessage);
	}
} 
