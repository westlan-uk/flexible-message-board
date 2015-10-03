$( document ).ready(function() {
    $.get('/control/admin/settings', function(data) {
        for (var setting in data) {
            if (! $.isArray(data[setting])) {
                var selector = $("[name=" + setting + "]");
                
                if (selector.prop("type") == "radio") {
                    $("#" + setting + data[setting]).prop("checked", true);
                }
                else {
                    selector.val( data[setting] );
                }
                
                selector.change();
            }
        }
    });
});
