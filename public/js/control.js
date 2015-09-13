$( document ).ready(function() {
    var screenAvailable = false;
    var adminPermission = false;
    
    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) 
        {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) 
            {
                return sParameterName[1];
            }
        }

		return null;
    }
    
    var success = getUrlParameter('success');
    if (success !== undefined) {
        if (success === "true") {
            $('#content').prepend('<div class="alert alert-success" role="alert">Successfully submitted and process. Watch the screen!</div>');
        } else {
            $('#content').prepend('<div class="alert alert-danger" role="alert">Could not be added to messages. Contact a member of staff!</div>');
        }
    }
    
    $.get('/status/screen', function(data) {
        if (data.status === true) {
            screenAvailable = true;
            var screen = $('#screen');
            var screenImg = $('#screen span');
            screen.removeClass('bg-danger');
            screen.addClass('bg-success');
            screenImg.removeClass('glyphicon-remove');
            screenImg.addClass('glyphicon-ok');
        }
    });
    
    $.get('/status/admin', function(data) {
        if (data.status === true) {
            adminPermission = true;
            var admin = $('#admin');
            var adminImg = $('#admin span');
            admin.removeClass('bg-danger');
            admin.addClass('bg-success');
            adminImg.removeClass('glyphicon-remove');
            adminImg.addClass('glyphicon-ok');
            $('#adminLogin').remove();
            $('#login').append('<form id="adminLogout" action="/control/admin/logout" method="POST"><button id="logoutButton" class="btn btn-default" type="submit">Logout</button></form>');
        }
    });
    
    $('.submission').submit(function(event) {
        if (!screenAvailable) {
            event.preventDefault();
            $('#content').prepend('<div class="alert alert-danger" role="alert">The screen is not yet available! Please visit the <a href="/" target="_blank">Screen</a> and refresh this page to try again!</div>');
        }
    });
});
