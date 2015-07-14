$( document ).ready(function() {
    function resetFrame() {
       var defaultFrame = '<div id="frame"></div>';
        $( "body" ).prepend( defaultFrame ); 
    }
    
    resetFrame();
    
    var socket = io.connect();
    
    socket.on('connect', function() {
        console.log('connected');
    });
});