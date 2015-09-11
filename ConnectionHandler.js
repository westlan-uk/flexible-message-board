function ConnectionHandler(socket) {
	var self = this;

    var ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
    console.log('Client Screen Connection from: ' + ip);

	this.init = function() { 
		// CONTROL //
	};

	this.setupSocketHandlers = function (socket, screen) {
		socket.on('requestMessages', function() {
			screen.emitUpdates();
		});
	};

	this.init();

	return this;
}

module.exports = {
	ConnectionHandler: ConnectionHandler
}
