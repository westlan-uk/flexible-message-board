$( document ).ready(function() {
    function resetFrame() {
        $( "#frame" ).remove();
        $( "body" ).prepend( '<div id="frame"></div>' );
    }
    
    resetFrame();
    
    var socket = io.connect();
    
    var messages = [];
    var currentMsg = 0;
    
    var urgentMessages = [];
    var currentUrg = 0;
    
    var currentMsgStart = 0;
    
    function displayMessage(message) {
        console.log('displaying message: ');
        console.log(message);
        resetFrame();
        
        currentMsgStart = Math.floor(Date.now() / 1000);
        
        switch (message.type) {
            case 'text':
                $( "#frame" ).append( message.content );
                break;
            case 'shoutout':
                $( "#frame" ).append( message.content ); // add to template
                break;
            default:
                break;
        }
    }
    
    // Socket Commands //
    socket.on('connect', function() {
        console.log('Connected');
    });
    
    socket.on('urgentMessages', function(data) {
        console.log('Received Urgent');
        urgentMessages = data.messages;
        
        if (currentUrg > urgentMessages.length) {
            currentUrg = 0;
        }
        
        displayMessage(urgentMessages[currentUrg]);
    });
        
    socket.on('messages', function(data) {
        console.log('Updated Messages');
        messages = data.messages;
        
        if (currentMsg > messages.length) {
            currentMsg = 0;
        }
    });
    
    var checkDelay = setInterval(function() {
        var timeNow = Math.floor(Date.now() / 1000);
        
        var currScreen = null;
        
        if (currentUrg >= urgentMessages.length) {
            currentUrg = 0;
        }
        
        if (currentMsg >= messages.length) {
            currentMsg = 0;
        }
        
        if (urgentMessages.length > 0) {
            currScreen = urgentMessages[currentUrg];
        }
        else {
            currScreen = messages[currentMsg];
        }
        
        console.log(currScreen);
        
        if (typeof currScreen.delay !== undefined) {
            if ((timeNow - currentMsgStart) >= currScreen.delay) {
                console.log('Display Next');
                
                if (urgentMessages.length > 0) {
                    if ((currentUrg + 1) >= urgentMessages.length) {
                        currentUrg = 0;
                    }
                    else {
                        currentUrg++;
                    }
                    
                    displayMessage(urgentMessages[currentUrg]);
                }
                else {
                    if ((currentMsg + 1) >= messages.length) {
                        currentMsg = 0;
                    }
                    else {
                        currentMsg++;
                    }
                    
                    displayMessage(messages[currentMsg]);
                }
            }
        }
    }, 2000); // ms between checks
});