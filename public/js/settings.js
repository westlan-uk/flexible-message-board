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
    
    function loadPlugins() {
        (function($) {
			/*
			 * $.import_js() helper (for JavaScript importing within JavaScript code).
			 */
			$.extend(true,
			{
				import_js : function(script)
				{
					$("head").append('<script type="text/javascript" src="' + script + '"></script>');
				}
			});
		})(jQuery);
		
		var dir = "/js/plugins";
		
	    var fileextension=".js";
	    
		$.ajax({
			//This will retrieve the contents of the folder
			url: dir,
			success: function (data) {
				//Lsit all js file names in the page
				$(data).find("a:contains(" + fileextension + ")").each(function () {
					var filename = this.href.replace(window.location.host, "");
					
					if(filename.indexOf("/") != -1) {
						filename = filename.substring(filename.lastIndexOf("/") + 1);
					}
					
					$.import_js(dir + '/' + filename);
					
					filename = filename.substring(0, filename.lastIndexOf("."));
					console.log('Plugin Available: ' + filename);
					
					var plugin = new window[filename];
					
					if (typeof plugin.adminMenu === 'function') {
                        $('#adminTabs').append('<li><a href="#' + filename + '" data-toggle="tab">' + plugin.niceName + '</a></li>');
                        
                        $('#adminMenu').append(
                            '<div class="tab-pane" id="' + filename + '">' +
    			    		    '<div class="col-md-12">' +
									'<div id="' + filename + 'MenuItems" />' +
    			    		    '</div>' +
    			    		'</div>'
                        );
                        
                        plugin.adminMenu();
                        
                        /*
		    			<div class="panel panel-default">
		    				<div class="panel-heading">
		    					<h3 class="panel-title">Add New Slide</h3>
		    				</div>
		    				<div class="panel-body">
		    					<div class="form-group form-group-sm col-md-12">
		    						<label for="content" class="control-label">Content</label>
		    						<textarea rows="10" class="form-control" name="content" placeholder="HTML Here..." required></textarea>
		    					</div>
		    					
		    					<div class="form-group form-group-sm">
		    						<label for="expire" class="col-md-1 control-label">Expire Time (s)</label>
		    						<div class="col-md-11">
		    							<input type="text" name="expire" class="form-control" required/>
		    						</div>
		    					</div>
		    					
		    					<div class="form-group form-group-sm">
		    						<label for="delay" class="col-md-1 control-label">Display Time (s)</label>
		    						<div class="col-md-11">
		    							<input type="text" name="delay" class="form-control" required />
		    						</div>
		    					</div>
		    				</div>
		    			</div>*/
					}
					
					var adminSettings;
					
					if (typeof plugin.adminSettings === 'function') {
					    adminSettings = plugin.adminSettings();
					}
					else {
					    adminSettings = '';
					}
					
					$('#pluginSettings').append(
    			        '<div class="panel panel-default">' +
        					'<div class="panel-heading">' +
        						'<h3 class="panel-title">' + plugin.niceName + '</h3>' +
        					'</div>' +
        					'<div class="panel-body">' +
        						'<div class="form-group form-group-sm">' +
        							'<label for="panelControl" class="col-sm-1 control-label">Enabled</label>' +
        							'<div class="col-sm-11">' +
    									'<input type="radio" name="' + filename + 'Enabled" id="' + filename + 'Enabledtrue" value="true" /> Yes' +
    									'<br/>' +
    									'<input type="radio" name="' + filename + 'Enabled" id="' + filename + 'Enabledfalse" value="false" /> No' +
    								'</div>' +
    							'</div>' +
    							adminSettings +
        					'</div>' +
        				'</div>'
        			);
				});
			}
		});
    }
    
    loadPlugins();
});
