function UserInterface() {
	var self = this;

	this.resetFrame = function() {
		$( "#frame" ).remove();
		$( "body" ).prepend( '<div id="frame"></div>' );
	}

	this.displayMessage = function(message) {
		console.log('displaying message: ');
		console.log(message);
		resetFrame();
		
		currentMsgStart = Math.floor(Date.now() / 1000);
		
		switch (message.type) {
			case 'text':
				$( "#frame" ).append( message.content );
				break;
			case 'shoutout':
				$( "#frame" ).append( message.content ); // add to template
				break;
			default:
				break;
		}
	}


	return this;
}

function ConnectionHandler() {
	var self = this;

    this.socket = io.connect();

	this.setupSocketHandlers = function() {
		self.socket.on('connect', function() {
			console.log('Connected');
		});
		
		self.socket.on('urgentMessages', function(data) {
			console.log('Received Urgent');
			urgentMessages = data.messages;
			
			window.state.ui.displayMessage(urgentMessages.lastItem());
		});
			
		self.socket.on('messages', function(data) {
			console.log('Updated Messages');
			messages = data.messages;
		});
	};

	this.setupSocketHandlers();
}

function State() {
	this.connectionHandler = new ConnectionHandler();
	this.ui = new Interface();
    this.messages = [];
    this.urgentMessages = [];

	return this;
}

function init() {     
	window.state = new State();

    resetFrame();

	setInterval(tick, 2000); // ms between checks
}

function tick() {
	var timeNow = Math.floor(Date.now() / 1000);
	
	state = window.state;

	if (state.urgentMessages.notEmpty()) {
		nextMessage = urgentMessages.lastItem()
	} else if (state.messages.notEmpty()) {
		nextMessage = state.messages.lastItem()
	} else {
		return;
	}
	
	console.log(nextMessage);
	
	if ((timeNow - currentMsgStart) >= nextMessage.delay) {
		console.log('Display Next', nextMessage);
		
		displayMessage(nextMessage);
	}
} 
