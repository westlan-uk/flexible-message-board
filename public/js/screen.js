$( document ).ready(function() {
    function resetFrame() {
        $( "#frame" ).remove();
        $( "body" ).prepend( '<div id="frame"></div>' );
    }
    
    resetFrame();
    
    var socket = io.connect();
    
    socket.on('connect', function() {
        console.log('connected');
    });
});