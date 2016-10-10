var youtube = function() {
    
    this.niceName = 'YouTube';
    
    this.renderScreen = function(message) {
        var state = window.state;

        state.messages.splice(state.messages.indexOf(message), 1);

        state.ui.resetFrame();
        $('#frame').append('<div id="slideshow">');
        
        state.endInterval();
        
        function playVideo(id) {
            window.ytPlayer = new YT.Player('slideshow', {
                width: $('#frame').width(),
                height: $('#frame').height(),
                videoId: message.content,
                events: {
                    'onReady': window.onPlayerReady,
                    'onStateChange': window.onPlayerStateChange,
                    'onError': window.onPlayerError
                }
            });
        }


        if (window.ytReady === undefined) {
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
            window.ytPlayer.destroy();
            playVideo(message.content);
        }

        window.onYouTubeIframeAPIReady = function() {
            window.ytReady = true;
            console.log('api ready');
            
            playVideo(message.content);
        }
        
        window.onPlayerReady = function(event) {
            event.target.playVideo();
        }
        
        var done = false;
        window.onPlayerStateChange = function(event) {
            if (event.data == YT.PlayerState.ENDED && !done) {
                window.stopVideo();
                done = true;
            }
        }
        
        window.stopVideo = function() {
            window.ytPlayer.stopVideo();
            state.startInterval();
        }
        
        window.onPlayerError = function() {
            window.stopVideo();
        }
        
        console.log('Video Playing');
        /*state.ui.renderSlide(message);
		state.lastSlide = state.messages.indexOf(message);
		state.currentSlideStart = Math.floor(Date.now() / 1000);*/
    };
    
    this.adminMenu = function() {
        $.get('/control/admin/youtube', function(data) {
            data.submissions.forEach(function(submission) {
                $('#youtubeMenuItems').append(
                    '<form method="POST" action="/control/admin/youtube?id=' + submission.content + '">' +
                        '<div class="panel panel-default">' +
                            '<div class="panel-body">' +
                                '<div class="col-sm-9">' +
                                    '<iframe width="100%" height="300" src="https://www.youtube.com/embed/' + submission.content + '" frameborder="0"></iframe>' +
                                '</div>' +
                                '<div class="form-group col-md-3">' +
                                    '<p><b>IP Address of Submitter</b></p>' +
                                    '<p>' + submission.ip + '</p>' +
                                '</div>' +
                                '<div class="form-group col-md-3">' +
                                    '<p><b>Video ID</b></p>' +
                                    '<p>' + submission.content + '</p>' +
                                '</div>' +
                                '<div class="form-group col-md-3">' +
                                    '<select name="priority">' +
                                        '<option value="3">Start Immediately</option>' +
                                        '<option value="2">Start Next Slide</option>' +
                                    '</select>' +
                                    '<br />' +
                                    '<br />' +
                                    '<p><a href="/control/youtube/delete?id=' + submission.content + '" class="inline-delete">Delete</a>' +
                                    '</p>' +
                                    '<button type="submit" class="btn btn-default submitBtn">Send to Screen</button>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</form>'
                );
            });
        });
    };
    
    this.adminSettings = function() {
        return '';
    };
};
