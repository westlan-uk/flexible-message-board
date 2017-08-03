var shoutout = function() {

	this.niceName = 'Shoutout';

	window.state.shoutouts = [];

	function refreshAllShoutouts() {
		var html = '';

		for (var shoutout of window.state.shoutouts) {
			if (shoutout) {
				var $html = generateShoutout(shoutout, true);
				html += $html.prop('outerHTML');
			}
		}

		return html;
	}

	function generateShoutout(content, refresh = false) {
		var tick = $('<p>').addClass('message');
		tick.html(content);

		if (!refresh) {
			tick.css('display', 'none');
		}

		return tick;
	}

	function renderShoutout(content) {
		var tick = generateShoutout(content);
		$('#ticker').prepend(tick);
		tick.slideDown();
		window.state.sound.play();
	}

	/* Declaring Layouts */
	window.state.ui.layouts.shoutoutRight = function() {
		var frame = $('<div>').addClass('row').addClass('full-height');
		frame.append( $('<div>').attr('id', 'slideshow').addClass('col-md-10').addClass('full-height') );
		frame.append( $('<div>').attr('id', 'ticker').addClass('col-md-2').addClass('full-height').html(refreshAllShoutouts()) );
		return frame;
	};

	window.state.ui.layouts.shoutoutBottom = function() {
		var frame = $('<div>').addClass('full-height');
		frame.append( $('<div>').attr('id', 'slideshow').addClass('layout1-slideshow') );
		frame.append( $('<div>').attr('id', 'ticker').addClass('layout1-ticker').html(refreshAllShoutouts()) );
		return frame;
	};

	/* Declaring Socket IO Routes */
	window.state.connectionHandler.socket.on('shoutout-new', function(data) {
		window.state.shoutouts.unshift(data.content);

		renderShoutout(data.content);

		window.state.shoutouts.length = 50;
	});
};
