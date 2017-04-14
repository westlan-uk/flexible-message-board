function isDir(dir) {
	try {
		var statResult = require('fs').lstatSync(dir);

		if (statResult.isDirectory()) {
			return true;
		}
	} catch (e) {}

	return false;
}

// Short function for now, but makes it easy to relocate configuration
// and have multiple sources
function getFilePath(filename) {
	var configdir = '.';

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
	var filepath = getFilePath(filename);

	console.log('Reading: ', filepath);

	var config = require('fs').readFileSync(filepath);
	return JSON.parse(config);
}

function writeJsonFile(filename, content) {
	var filepath = getFilePath(filename);

	console.log('Writing: ', filepath);
	require('fs').writeFile(filepath, JSON.stringify(content, null, 4));
}

function readSettingsFromFile() {
	var settings = readJsonFile('settings.json');

	if (settings.port === undefined) {
		settings.port = 1337;
	}

	if (settings.expiryCheckInterval === undefined) {
		settings.expiryCheckInterval = 5;
	}

	if (settings.adminPassword === undefined) {
		// Defaults to '123'
		settings.adminPassword = '2779d36c6dbdfd4261cf7dd1916d3677638af06c3e7121c2b9a5ef19db221a20225460697aa53c8cf4b2ab55da2cbd62a6eb04e2fe49a3309acb9fa90131d77d';
	}

	if (settings.slideExpire === undefined) {
		settings.slideExpire = 0;
	}

	if (settings.slideDisplay === undefined) {
		settings.slideDisplay = 15;
	}

	if (settings.layout === undefined) {
		settings.layout = 'fullscreen';
	}

	if (settings.sound === undefined) {
		settings.sound = '204424__jaraxe__alarm-3.wav';
	}

	settings.availableSounds = getAllSoundFiles();

	return settings;
}

function saveSettingsToFile(settings) {
	writeJsonFile('settings.json', settings);
}

function reloadMessagesFromFile(screen) {
	try {
		var messages = readJsonFile('messages.json');

		console.log('Loaded messages are: \n', messages);

		messages.forEach(screen.addMessage);
		screen.checkTimer();
	} catch (err) {
		console.log('Could not load default messages', err);
	}
}

function saveMessagesToFile(messages) {
	writeJsonFile('messages.json', messages);
}

function getAllSoundFiles() {
	var dir = __dirname + '/../public/sounds/';
	var sounds = [];

	require('fs').readdir(dir, function(err, files) {
		if (err) throw err;

		files.forEach(function(file) {
			sounds.push(file);
		});
	});

	return sounds;
}

module.exports = {
	getFilePath: getFilePath,
	readJsonFile: readJsonFile,
	readSettingsFromFile: readSettingsFromFile,
	reloadMessagesFromFile: reloadMessagesFromFile,
	saveMessagesToFile: saveMessagesToFile,
	saveSettingsToFile: saveSettingsToFile
}
