function initialise(s) {
    console.log("Hi, From YouTube");
    this.routes(s);
    this.settings(s);
}

function routes(s) {
    console.log('Declaring YouTube Routes');
    
    s.app.get('/control/youtube', function (req, res) {
        res.sendFile(s.path.join(__dirname, '/../../public/control/youtube.html'));
    });
    
    s.app.get('/control/youtube/delete', function (req, res) {
        var id = req.param.id;
        var success = false;
        
        var message;
        
        s.settings.youtube.moderationQueue.forEach(function(video) {
            if (video.content == id) {
                message = video;
            }
        });
        
        var index = self.messages.indexOf(message);
        
        if (index !== -1) {
            s.settings.youtube.moderationQueue.splice(index, 1);
            success = true;
        }
        
        res.redirect('/control/admin?success=' + success);
    });
    
    s.app.get('/control/admin/youtube', function(req, res) {
        res.json({ submissions: s.settings.youtube.moderationQueue });
    });
    
    s.app.post('/control/admin/youtube', s.urlencodedParser, function (req, res) {
        var message;
        var success = false;
        
        s.settings.youtube.moderationQueue.forEach(function(submission) {
            if (submission.content === req.query.id) {
                message = submission;
            }
        });
        
        if (message !== undefined) {
            var index = s.settings.youtube.moderationQueue.indexOf(message);
        
            if (index > -1) {
                s.settings.youtube.moderationQueue.splice(index, 1);
                success = true;
            }
            
            var ytMessage = {
                type: 'youtube',
                content: req.query.id,
                priority: parseInt(req.body.priority, 10),
                added: Math.floor(Date.now() / 1000),
                id: s.settings.id++,
            };
            
            s.screen.emitMessagesToEveryone('messages', { message: message });
            
            /*s.screen.processMessage({
                type: 'youtube',
                content: req.query.id,
                priority: parseInt(req.body.priority, 10),
            });*/
            
            s.screen.updateSettings();
        }
        
        res.redirect('/control/admin?success=' + success);
    });
    
    s.app.post('/youtube', s.urlencodedParser, function (req, res) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log('YouTube submitted from ip: ' + ip);
        
        var success = false;
        
        if (req.body.hasOwnProperty('watch')) {
            success = true;
            
            s.settings.youtube.moderationQueue.push({
                content: req.body.watch,
                ip: ip
            });
            
            s.screen.updateSettings();
            /*
            s.screen.processMessage({
                type: 'youtube',
                content: req.body.watch,
                ip: ip,
                priority: req.body.priority
            });*/
            // submit, watch, delete
            // don't store in messages or worry about expiry
        }
        
        res.redirect('/control/youtube?success=' + success);
    });
}

function settings(s) {
    console.log('Loading YouTube Settings & Defaults');
    
    s.settings.youtube = {};
    var settings = s.settings.youtube;
    
    settings.moderationQueue = [];
    
    /*
        Moderation Object:
        {
            ip: '192.168.0.92',
            content: '42sdf91f'
        }
    */
}

module.exports = {
    initialise: initialise,
    routes: routes,
    settings: settings
};
