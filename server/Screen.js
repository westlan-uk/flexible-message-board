function Screen(server) {
	var config = server.config;
	var self = this;

	self.messages = [];
	self.currentMessage = null;

	self.messageTimer = undefined;

	self.checkTimer = function() {
		if (self.messageTimer === undefined && self.messages.length > 0) {
			self.findNextMessage();
			self.startMessageTimer();
		} else if (self.messages.length === 0) {
			self.emitMessagesToEveryone('message', { message: null });
		}
	};

	self.findNextMessage = function() {
		if (self.messages.length === 0) {
			self.currentMessage = null;
			return;
		}

		var currentPos = self.messages.indexOf(self.currentMessage);
		var nextPos = currentPos + 1;

		// Last message, move back to beginning.
		if (nextPos === self.messages.length) {
			nextPos = 0;
		}

		self.currentMessage = self.messages[nextPos];
	};

	self.startMessageTimer = function() {
		self.emitMessagesToEveryone('message', { message: self.currentMessage });

		// If you're not setting a delay, you need to call checkTimer when the slide is done
		if (self.currentMessage.delay !== undefined) {
			self.messageTimer = setTimeout(self.onMessageTimerFinish, self.currentMessage.delay * 1000);
		}
	};

	self.clearMessageTimer = function() {
		clearTimeout(self.messageTimer);
		self.messageTimer = undefined;
	};

	self.onMessageTimerFinish = function() {
		self.clearMessageTimer();
		self.checkTimer();
	};

	self.emitMessagesToEveryone = function(socketName, data) {
		console.log('Sending messages to all connections, of which there are: ' + server.connections.length);

		server.connections.forEach(function(connectionHandler) {
			self.emitMessagesTo(connectionHandler, socketName, data);
		});
	};

	self.emitMessagesTo = function(connectionHandler, socketName, data) {
		console.log('Emitting message to conn: ', connectionHandler.socket.conn.id);
		connectionHandler.socket.emit(socketName, data);
	};

	/**
	 * Priorities
	 * 1 - Immediately
	 * 2 - Next
	 * 3 - End of Queue
	 */
	self.addMessage = function(message) {
		if (message.added === undefined || message.added === 0) {
			message.added = Math.floor(Date.now() / 1000);
		}

		if (message.id === undefined || message.id === 0) {
			message.id = server.uuid.v1();
		}

		var priority = (message.priority !== undefined) ? message.priority : 3;

		switch (priority) {
			case 1:
				var nextPos = self.messages.indexOf(self.currentMessage) + 1;
				self.messages.splice(nextPos, 0, message);

				self.clearMessageTimer();
				self.checkTimer();
				break;
			case 2:
				var nextPos = self.messages.indexOf(self.currentMessage) + 1;
				self.messages.splice(nextPos, 0, message);
				break;
			case 3:
			default:
				self.messages.push(message);
		}

		if (self.currentMessage === null) {
			self.checkTimer();
		}

		self.saveMessages();
	};

	self.removeMessage = function(message) {
		var index = self.messages.indexOf(message);

		if (index > -1) {
			self.messages.splice(index, 1);
		}

		if (message === self.currentMessage) {
			self.clearMessageTimer();
			currentMessage = null;
			self.checkTimer();
		}
	};

	self.findMessageById = function(id) {
		return self.messages.find(function(msg) {
			return msg.id === id;
		});
	};

	self.saveMessages = function() {
		console.log('Save Messages');

		var messagesToSave = [];

		self.messages.forEach(function(msg) {
			if (msg.expire === 0 || msg.expire === null || Number.isNaN(msg.expire)) {
				messagesToSave.push(msg);
			}
		});

		config.saveMessagesToFile(messagesToSave);
	};

	self.updateSettings = function() {
		server.config.saveSettingsToFile(server.settings);
		self.emitMessagesToEveryone('settings', { settings: server.settings });
	};

	self.sendInitialData = function(connectionHandler) {
		self.emitMessagesTo(connectionHandler, 'initialise', { message: self.currentMessage, settings: server.settings });
	};

	self.forceRefresh = function() {
		self.emitMessagesToEveryone('refresh', {});
	};

	self.removeExpiredMessages = function() {
		console.log('Checking Expiry @ ' + Math.floor(Date.now() / 1000) + ', message count: ' + self.messages.length);

		self.messages.forEach(function(message) {
			if (message.expire !== undefined && message.expire > 0) {
				if ((message.added + message.expire) <= Math.floor(Date.now() / 1000)) {
					self.removeMessage(message);
				}
			}
		});
	};

	setInterval(self.removeExpiredMessages, server.settings.expiryCheckInterval * 1000);

	return self;
}

module.exports = {
	Screen: Screen
};
