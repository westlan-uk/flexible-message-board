function Screen(settings) {
	var self = this;

    this.messages = [];
    
    this.emitMessagesToEveryone = function() {
		console.log("Sending messages to all connections, of which there are: " + connections.length);

		connections.forEach(function(connectionHandler) {
<<<<<<< HEAD
			console.log("updating conn", self.messages);
			connectionHandler.emit('messages', { messages: self.messages });
=======
			console.log(connectionHandler.socket.conn.id, "==", connectionHandler.socket.conn.id)
			self.emitMessagesTo(connectionHandler)
>>>>>>> wluk/develop
		});
    };

	this.emitMessagesTo = function(connectionHandler) {
		console.log("emitting messages to conn, count: ", self.messages.length, "state: ", connectionHandler.socket.conn.id)
		connectionHandler.socket.emit('messages', { messages: self.messages });
	};
    
    this.addMessage = function(message) {
		self.messages.push(message);
    };
    
    this.removeMessage = function(message) {
        var index = self.messages.indexOf(message);
        
        if (index > -1) {
            self.messages.splice(index, 1);
        }
    };
    
    this.processMessage = function(message) {
        if (message.type !== undefined) {
            message.added = Math.floor(Date.now() / 1000);
            
            self.addMessage(message);
            
            self.emitMessagesToEveryone();
        }
    };
        
    this.removeExpiredMessages = function() {
        console.log('Checking Expiry @ ' + Math.floor(Date.now() / 1000) + ', message count: ' + self.messages.length);
        var toExpire = [];
        
		self.messages.forEach(function(message) {
            if (message.expire !== undefined && message.expire > 0) {
                if ((message.added + message.expire) < Math.floor(Date.now() / 1000)) {
                    toExpire.push(message);
                }
            }
        });
       
		toExpire.forEach(function(message) {
            self.removeMessage(message);
		});
        
        if (toExpire.length > 0) {
            self.emitMessagesToEveryone();
        }
    };

	setInterval(this.removeExpiredMessages, settings.expiryCheckInterval * 1000);

	return this;
}

module.exports = {
	Screen: Screen
};
