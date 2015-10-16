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
    
    $.get('/control/admin/slides', function(data) {
        var table = $('#slideTable');
        
        for (var slide in data) {
            var row = $('<tr>');
            row.append($( '<td>' ).text(data[slide].id));
            row.append($( '<td>' ).text(data[slide].added));
            row.append($( '<td>' ).text(data[slide].content));
            row.append($( '<td>' ).text(data[slide].expire));
            row.append($( '<td>' ).text(data[slide].delay));
            
            var delCol = $('<td>');
            delCol.append($( '<a>' ).addClass('inline-delete').text('Delete').attr('href', '/slide/delete?id=' + data[slide].id));
            row.append(delCol);
            
            table.append(row);
        }
    });
});
