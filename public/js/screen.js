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
});