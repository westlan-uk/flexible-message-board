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
	adminPassword: "fmb"
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

module.exports = {
    settings: settings
};
