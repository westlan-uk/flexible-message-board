function ConnectionHandler(server, socket) {
	var self = this;
	this.socket = socket;
	this.ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
	console.log('Client Screen Connection from: ' + this.ip);

	this.init = function() {
		self.setupSocketHandlers();
		
		server.screen.sendInitialData(self);
	};

	this.setupSocketHandlers = function () {
		
	};

	socket.on('disconnect', function() {
		server.connections.forEach(function(connection, index) {
			if (connection.socket == socket) {
				server.connections.splice(index, 1);
			}
		});
	});

	this.init();

	return this;

}

module.exports = {
	ConnectionHandler: ConnectionHandler
};
