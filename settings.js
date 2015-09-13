settings = {
	id: 0,
	shoutoutDuration: 30,
	shoutoutExpiry: 30,
	expiryCheckInterval: 20,
	defaultMessages: [
        {
            type: 'text',
            content: '<p>Hellow World</p>',
            expire: 10,
            delay: 10,
            added: 0
        },
        {
            type: 'text',
            content: '<p>Welcome to WestLAN!</p><p>You can find the wiki and help at http://www</p>',
            expire: 18000,
            delay: 10,
            added: 0
        },
        {
            type: 'text',
            content: '<p>If you want to create a shoutout, go to http://fmb/control/shoutout</p>',
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

settings.adminPassword = process.argv.slice(2); // First cli arg

module.exports = {
	settings: settings
};
