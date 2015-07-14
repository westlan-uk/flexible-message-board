$( document ).ready(function() {
    var screenAvailable = false;
    var adminPermission = false;
    
    $.get('/status/screen', function(data) {
        if (data.status === true) {
            screenAvailable = true;
            var status = $('#screen');
            var statusImg = $('#screen span');
            status.removeClass('bg-danger');
            status.addClass('bg-success');
            statusImg.removeClass('glyphicon-remove');
            statusImg.addClass('glyphicon-ok');
        }
    });
    
    
});