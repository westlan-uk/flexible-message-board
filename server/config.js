function isDir(dir) {
	fs = require('fs');
	
	try {
		statResult = fs.lstatSync(dir)

		if (statResult.isDirectory()) {
			return true;
		}
	} catch (e) {
	}

	return false;
}

// Short function for now, but makes it easy to relocate configuration
// and have multiple sources
function getFilePath(filename) {
	configdir = '.';

	if (isDir(__dirname + '/configuration/')) {
		configdir = __dirname + '/configuration/';
	}

	if (isDir('c:/programdata/fmb/')) {
		configdir = 'c:/programdata/fmb/';
	}

	if (isDir('/etc/fmb/')) {
		configdir = '/etc/fmb/';
	}

	return configdir + filename;
}

function readJsonFile(filename) {
	var config = require('fs').readFileSync(getFilePath(filename));
	config = JSON.parse(config);

	return config;
}

function readClientSettingsFromFile() {
	settings = readJsonFile('client.json')

	return settings;
}

function readServerSettingsFromFile() {
	settings = readJsonFile('server.json');

	if (typeof(settings.port) == 'undefined') {
		settings.port = 1337;
	}

	if (typeof(process.env.PORT) != 'undefined') {
		settings.port = process.env.PORT;
	}

	if (typeof(settings.expiryCheckInterval) == 'undefined') {
		settings.expiryCheckInterval = 5;
	}

	return settings;
}

function reloadMessagesFromFile(server) {
	try {
		messages = readJsonFile('messages.json')

		console.log("Loaded messages are: \n" + messages);

		messages.forEach(server.screen.addMessage);
	} catch (err) {
		console.log("could not load default messages", err);
	}
}

module.exports = {
	getFilePath: getFilePath,
	readJsonFile: readJsonFile,
	readServerSettingsFromFile: readServerSettingsFromFile,
	reloadMessagesFromFile: reloadMessagesFromFile,
	readClientSettingsFromFile: readClientSettingsFromFile
}
