app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'screen.html'));
});

app.get('/control', function(req, res) {
    res.sendFile(path.join(__dirname, 'control/index.html'));
});

app.get('/control/shoutout', function(req, res) {
    res.sendFile(path.join(__dirname, 'control/shoutout.html'));
});

app.get('/control/slides', function(req, res) {
    res.sendFile(path.join(__dirname, 'control/slides.html'));
});

app.post('/control/admin', urlencodedParser, function(req, res) {
    if (req.body.hasOwnProperty('password')) {
        var pass = req.body.password;
        
        console.log("Login attempt: " + pass + " against: " + adminPassword);
        
        if (pass == adminPassword) {
            console.log('Client logged in');
            req.session.adminPermission = true;
            res.sendFile(path.join(__dirname, 'control/admin.html'));
        }
    } else {
        res.json({ login: "failed" });
    }
});

app.post('/control/admin/logout', function(req, res) {
    req.session.adminPermission = false;
    console.log('Client logged out');
    res.redirect('/control');
});

app.get('/status/screen', function (req, res) {
    var sDef = (screen !== undefined);
    res.json({ status: sDef });
});

app.get('/status/admin', function (req, res) {
    var aDef = (req.session.adminPermission || false);
    res.json({ status: aDef });
});

