function ConnectionHandler(socket) {
	var self = this;
	this.socket = socket;
	this.ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
	console.log('Client Screen Connection from: ' + this.ip);

	this.init = function() {
		self.setupSocketHandlers();
		
		screen.emitMessagesTo(self);
	}

	this.setupSocketHandlers = function () {
		self.socket.on('requestMessages', function() {
			screen.emitMessages(self);
		});
	};

	socket.on('disconnect', function() {
		connections.forEach(function(connection, index) {
			if (connection.socket == socket) {
				connections.splice(index, 1);
			}
		});
	});

	this.init();

	return this;

}

module.exports = {
	ConnectionHandler: ConnectionHandler
}
