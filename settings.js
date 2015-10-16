settings = {
    _id: 0,
    layout: 1,
    slideshowEnabled: true,
    slideshowFrequency: 600,
    slideshowDuration: 0,
    tickerEnabled: true,
    shoutoutDuration: 30,
    shoutoutExpiry: 30,
    expiryCheckInterval: 20,
    defaultMessages: [
        {
            id: 0,
            type: 'slide',
            content: '<p>Hello World</p>',
            expire: 10,
            delay: 10,
            added: 0
        },
        {
            id: 0,
            type: 'slide',
            content: '<p>Welcome to WestLAN!</p><p>You can find the wiki and help at wiki.westlan.co.uk</p>',
            expire: 0,
            delay: 10,
            added: 0
        },
        {
            id: 0,
            type: 'slide',
            content: '<p>If you want to create a shoutout, go to http://projector/control/shoutout</p>',
            expire: 0,
            delay: 15,
            added: 0
        }
    ]
};

settings.port = function() {
    port = process.env.PORT;

    if (typeof port === 'undefined') {
        return 1337;
    } else {
        return port;
    }
}();

settings.id = function() {
    return ++settings._id;
}();

settings.adminPassword = process.argv.slice(2); // First cli arg

module.exports = {
    settings: settings
};
