function Screen(settings) {
	var self = this;

    this.messages = [];
    this.urgentMessages = [];
    
    this.emitUpdates = function() {
    };
    
    this.addMessage = function(message) {
        var urgent = message.urgent || false;

        if (urgent === true) {
            self.urgentMessages.push(message);
        } else {
        	self.messages.push(message);
        }
    };
    
    this.removeMessage = function(message) {
        var urgent = message.urgent || false;
        
        var messages = (urgent === true) ? self.urgentMessages : self.messages;
        
        var index = messages.indexOf(message);
        
        if (index > -1) {
            messages.splice(index, 1);
        }
        
        if (urgent === true) {
            self.urgentMessages = messages;
        } else {
            self.messages = messages;
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
       
	   	self.urgentMessages.forEach(function(message) { 
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
