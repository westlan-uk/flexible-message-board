var youtube = function() {

	this.niceName = 'YouTube';

	this.renderScreen = function(message) {
		var state = window.state;

		state.ui.resetFrame();
		state.ui.updateFrames();

		function playVideo(id) {
			window.ytPlayer = new YT.Player('slideshow', {
				width: $('#slideshow').width(),
				height: $('#slideshow').height(),
				videoId: message.content,
				playerVars: {
					//
				},
				events: {
					'onReady': window.onPlayerReady,
					'onStateChange': window.onPlayerStateChange,
					'onError': window.onPlayerError
				}
			});
		}

		if (window.ytReady === undefined) {
			var tag = document.createElement('script');
			tag.src = 'https://www.youtube.com/iframe_api';
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		} else {
			window.ytPlayer.destroy();
			playVideo(message.content);
		}

		window.onYouTubeIframeAPIReady = function() {
			window.ytReady = true;
			console.log('YT API ready');

			playVideo(message.content);
		};

		window.onPlayerReady = function(event) {
			event.target.playVideo();
		};

		var done = false;
		window.onPlayerStateChange = function(event) {
			if (event.data == YT.PlayerState.ENDED && !done) {
				window.stopVideo();
				done = true;
			}
		};

		window.notifyVideoFinished = function() {
			window.state.connectionHandler.socket.emit('youtube-finished', { message: window.state.currentMessage });
		};

		window.stopVideo = function() {
			window.ytPlayer.stopVideo();
			window.notifyVideoFinished();
		};

		window.onPlayerError = function() {
			window.stopVideo();
			window.notifyVideoFinished();
		};

		console.log('YT video playing');
	};

	/* Socket IO Routes */
	window.state.connectionHandler.socket.on('youtube-play', function() {
		if (window.ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
			window.ytPlayer.pauseVideo();
		} else {
			window.ytPlayer.playVideo();
		}
	});
};
