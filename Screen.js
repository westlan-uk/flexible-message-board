function Screen(settings) {
	var self = this;

    this.messages = [];
    
    this.emitUpdates = function() {
		console.log("updating");
		connections.forEach(function(connectionHandler) {
			console.log("updating conn", self.messages)
			connectionHandler.emit('messages', { messages: self.messages });
		});
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
            message.id = id++;
            
            self.addMessage(message);
            
            self.emitUpdates();
        }
    };
        
    this.removeExpiredMessages = function() {
        console.log('Checking Expiry @ ' + Math.floor(Date.now() / 1000));
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
            self.emitUpdates();
        }
    } 

	setInterval(this.removeExpiredMessages, settings.expiryCheckInterval * 1000);

	return this;
}

module.exports = {
	Screen: Screen
}
