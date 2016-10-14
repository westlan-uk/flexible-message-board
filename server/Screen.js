config = require('./config.js')

function Screen(server) {
    var self = this;

    this.messages = [];
	this.clientSettings = config.readClientSettingsFromFile()
    
    this.emitMessagesToEveryone = function (socketName, data) {
        console.log("Sending messages to all connections, of which there are: " + server.connections.length);
        
        server.connections.forEach(function(connectionHandler) {
            console.log(connectionHandler.socket.conn.id, "==", connectionHandler.socket.conn.id);
            self.emitMessagesTo(connectionHandler, socketName, data);
        });
    };
    
    this.emitMessagesTo = function(connectionHandler, socketName, data) {
        console.log("Emitting messages to conn, count: ", self.messages.length, " id: ", connectionHandler.socket.conn.id);
        connectionHandler.socket.emit(socketName, data);
    };
    
    this.addMessage = function(message) {
        if (message.added !== undefined && message.added === 0) {
            message.added = Math.floor(Date.now() / 1000);
        }
        
        if (message.id !== undefined && message.id === 0) {
            message.id = require('uuid').v1();
        }
        
        self.messages.push(message);
        self.saveMessages();
    };
    
    this.saveMessages = function() {
        console.log("save messages");
        var extend = require('util')._extend;
        
        var messagesToSave = [];
        self.messages.forEach(function(msg) {
            console.log(msg.expire);
            if (msg.expire == 0 || msg.expire == null || Number.isNaN(msg.expire)) {
                messagesToSave.push(msg);
            }
        });
        
        server.fs.writeFile("messages.js", JSON.stringify(messagesToSave, null, 4));
    };
    
    this.updateSettings = function() {
        this.emitMessagesToEveryone('clientSettings', { settings: self.clientSettings });
    };
    
    this.sendInitialData = function(connectionHandler) {
        this.emitMessagesTo(connectionHandler, 'initialise', { messages: self.messages, settings: self.clientSettings });
    };
    
    this.forceRefresh = function(connectionHandler) {
        this.emitMessagesToEveryone('refresh', {});
    };
    
    this.processMessage = function(message) {
        if (message.type !== undefined) {
            message.added = Math.floor(Date.now() / 1000);
            
            if (message.priority === undefined) {
                message.priority = 1;
            }
            
            self.addMessage(message);
            
            self.emitMessagesToEveryone('messages', { message: message });
        }
    };
    
    this.removeMessage = function(message) {
        var index = self.messages.indexOf(message);
        
        if (index > -1) {
            self.messages.splice(index, 1);
        }
    };
    
    this.sendExpireNotice = function(id) {
        this.emitMessagesToEveryone('expire', { id: id });
    };
    
    this.removeExpiredMessages = function() {
        console.log('Checking Expiry @ ' + Math.floor(Date.now() / 1000) + ', message count: ' + self.messages.length);
        var toExpire = [];
        
        self.messages.forEach(function(message) {
            if (message.expire !== undefined && message.expire > 0) {
                if ((message.added + message.expire) <= Math.floor(Date.now() / 1000)) {
                    toExpire.push(message);
                }
            }
        });
       
        toExpire.forEach(function(message) {
            self.removeMessage(message);
            self.sendExpireNotice(message.id);
        });
    };

	this.shouldPlayAudioNotification = function(message) {
		return false;
	};

    setInterval(this.removeExpiredMessages, server.settings.expiryCheckInterval * 1000);

    return this;
}

module.exports = {
    Screen: Screen
};
