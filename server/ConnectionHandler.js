function ConnectionHandler(server, socket) {
	this.socket = socket;
	this.ip =  socket.handshake.address;
	console.log('Client Screen Connection from: ' + this.ip);

	this.init = function() {
		server.screen.sendInitialData(this);
	};

	socket.on('disconnect', function() {
		server.connections.forEach(function(connection, index) {
			if (connection.socket == socket) {
				server.connections.splice(index, 1);
			}
		});
	});

	socket.on('youtube-finished', function(data) {
		var msg = server.screen.findMessageById(data.message.id);
		console.log(msg);
		server.screen.removeMessage(msg);
	});

	this.init();

	return this;
}

module.exports = {
	ConnectionHandler: ConnectionHandler
};
