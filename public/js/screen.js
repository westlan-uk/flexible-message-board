function UserInterface() {
	var self = this;
	
	this.headerVisible = true;
	
	this.updateFrames = function() {
		console.log('Updating Frames');
		var layout = window.state.settings.layout;
		
		var frame;
		
		if (window.state.isSlideshow) {
			console.log('Is Slideshow');
			this.hideHeader();
			
			if (layout == "0") {
				frame = $('<div>').addClass('row').addClass('full-height');
				frame.append( $('<div>').attr('id', 'slideshow').addClass('col-md-10').addClass('full-height') );
				frame.append( $('<div>').attr('id', 'ticker').addClass('col-md-2').addClass('full-height') );
			}
			else if (layout == "1") {
				frame = $('<div>').addClass('full-height');
				frame.append( $('<div>').attr('id', 'slideshow').addClass('layout1-slideshow') );
				frame.append( $('<div>').attr('id', 'ticker').addClass('layout1-ticker') );
			}
			else if (layout == "2") {
				frame = $('<div>').attr('id', 'slideshow').addClass('layout2-slideshow');
			}
		}
		else {
			console.log('Is Ticker');
			this.showHeader();
			frame = $('<div>').attr('id', 'ticker').addClass('full-height');
		}
		
		this.resetFrame();
		$( '#frame' ).append(frame);
		self.addExistingTicks();
	};

	this.renderSlide = function(message) {
		this.updateFrames();
		$('#slideshow').append( $('<div>').append($(message.content)).addClass('auto-margin'));
	};
	
	this.renderTick = function(message) {
		var tick = $('<p class="message"></p>');
		tick.html(message.content);
		tick.css('display', 'none');
		
		$('#ticker').prepend(tick);
		tick.slideDown();
		$('#ticker').find('p').slice(50).remove();
	};
	
	this.addExistingTicks = function() {
		window.state.messages.forEach(function (message) {
			if (message.type === 'tick') {
				self.renderTick(message);
			}
		});
	};

	this.setStatus = function(message, karma) {
		console.log('Status:', message, karma);

		$('#status').text(message);
		$('#status').removeClass('bad good neutral');
		$('#status').addClass(karma);
	};
	
	this.showHeader = function() {
		if (window.state.ui.headerVisible === false) {
			window.state.ui.headerVisible = true;
			$('#header').toggle(2000);
		}
	};
	
	this.hideHeader = function() {
		if (window.state.ui.headerVisible === true) {
			window.state.ui.headerVisible = false;
			$('#header').toggle(2000);
		}
	};

	this.resetFrame = function() {
		$( '#frame' ).remove();
		$( 'body' ).append( '<div id="frame"></div>' );
	};

	/*this.displayMessage = function(message) {
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
	};*/

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
		
		self.socket.on('initialise', function(data) {
			console.log('Initialising Screen with data');
			
			window.state.settings = data.settings;
			window.state.messages = data.messages;
		});
		
		self.socket.on('messages', function(data) {
			if (data.message.type === 'tick') {
				window.state.ui.renderTick(data.message);
				window.state.ticksShown.push(data.message.id);
				window.state.sound.play();
			}
			
			window.state.messages.push(data.message);
		});
		
		self.socket.on('settings', function (data) {
			console.log('Updating Settings');
			window.state.settings = data.settings;
		});
		
		self.socket.on('refresh', function () {
			window.location.reload();
		});
		
		self.socket.on('expire', function (data) {
			console.log('Expiring Message: ' + data.id);
			
			window.state.messages.forEach(function(message, i) {
				if (message.id === data.id) {
					window.state.messages.splice(i, 1);
				}
			});
		});
		
		/*self.socket.on('messages', function(data) {
			console.log('Updating Settings');
			
			var oldLayout = window.state.settings.layout;
			
			window.state.settings = data.settings;
			
			if (oldLayout !== window.state.settings.layout) {
				window.state.ui.updateFrames();
			}
			
			window.state.updateState();
			
			
			console.log('Recv Messages', data);
			window.state.messages = data.messages;
			
			data.messages.forEach(function(message) {
				// Only immediately process for tick
				if (message.type == 'tick' && window.state.ticksShown.indexOf(message.id) === -1) {
					window.state.ui.renderTick(message);
					window.state.ticksShown.push(message.id);
					window.state.sound.play();
				}
			});
		});*/
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
    this.settings = [];
    
    /* Slideshow */
    this.isSlideshow = true;
    this.currentSlideStart = 0;
    this.lastSlide = -1; // index, not id
    this.slideshowStarted = Math.floor(Date.now() / 1000);
    this.slideshowEnded = 0;
    
    /* Ticker */
    this.ticksShown = [];
	
	
	this.updateState = function() {
		if (this.settings.slideshowEnabled === false) {
			this.isSlideshow = false;
		}
	};
	
	return this;
}

function init() {
	window.state = new State();
    window.state.ui.resetFrame();
	window.state.connectionHandler.init();
	window.state.sound.init();
	
	setInterval(tick, 2000); // ms between checks
}

function tickDebug(state, timeNow) {
	console.log("------------------");
	console.log("tick@" + timeNow);
	console.log("isSlide: " + state.isSlideshow);
	console.log("lastSlide: " + state.lastSlide);
	console.log("slideshowFreq: " + state.settings.slideshowFrequency);
	console.log("slideshowEnded: " + state.slideshowEnded);
	console.log("------------------");
}

function tick() {
	var timeNow = Math.floor(Date.now() / 1000);
	var state = window.state;
	//tickDebug(state, timeNow);
	
	if (!state.isSlideshow && (state.slideshowEnded + parseInt(state.settings.slideshowFrequency, 10)) <= timeNow) {
		state.isSlideshow = true;
		state.slideshowStarted = Math.floor(Date.now() / 1000);
	}
	else if (parseInt(state.settings.slideshowDuration, 10) != 0) {
		if (state.isSlideshow && (state.slideshowStarted + parseInt(state.settings.slideshowDuration, 10)) <= timeNow) {
			state.isSlideshow = false;
			state.lastSlide = -1;
			state.slideshowEnded = Math.floor(Date.now() / 1000);
			
			state.ui.updateFrames();
		}
	}
	
	if (state.isSlideshow) {
		var found = false;
		
		if (state.lastSlide !== -1 && (state.currentSlideStart + state.messages[state.lastSlide].delay) > timeNow) {
			found = true;
		}
		
		this.getLatestSlide = function() {
			for (var i = (state.lastSlide + 1); i < state.messages.length; i++) {
				if (state.messages[i].type == 'slide') {
					return state.messages[i];
				}
			}
			
			return null;
		};
		
		if (!found) {
			if ((state.lastSlide + 1) >= state.messages.length) {
				state.lastSlide = -1;
			}
			
			var message = this.getLatestSlide();
			
			if (message !== null) {
				state.ui.renderSlide(message);
				state.lastSlide = state.messages.indexOf(message);
				state.currentSlideStart = Math.floor(Date.now() / 1000);
			}
		}
	}
	
	//if (state.messages.notEmpty()) {
	//	nextMessage = state.messages.lastItem();
	//} else {
	//	return;
	//}
	
	//console.log(nextMessage);
	
	//if ((timeNow - currentMsgStart) >= nextMessage.delay) {
	//	console.log('Display Next', nextMessage);
	//	
	//	displayMessage(nextMessage);
	//}
}
