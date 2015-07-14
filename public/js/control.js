$( document ).ready(function() {
    var screenAvailable = false;
    var adminPermission = false;
    
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
    
});