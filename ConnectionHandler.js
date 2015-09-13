function ConnectionHandler(socket) {
	var self = this;
	this.socket = socket;
	this.ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
	console.log('Client Screen Connection from: ' + this.ip);

	this.init = function() {
		self.setupSocketHandlers();
		
		screen.emitUpdates();
	};

	this.setupSocketHandlers = function () {
		self.socket.on('requestMessages', function() {
			screen.emitUpdates();
		});
	};

	connections.push(this);

	this.init();

	return this;

}

module.exports = {
	ConnectionHandler: ConnectionHandler
};
