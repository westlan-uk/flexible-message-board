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
	require('fs').writeFile(filepath, JSON.stringify(content, null, 4), function(err, result) {
    if(err) console.log('error', err);
  });
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
		settings.adminPassword = '68ebdac997a3165f8b442fb6eb52e5d35542cf48855a53e6cf765689c87157b265e9aea579717b4eea332823b044b933cf9e74f227c82544a11439a583b4425d';
		settings.salt = 'cbfbc0722e6b6539';
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

	if (settings.resolution === undefined) {
		settings.resolution = {
			x: 1920,
			y: 1080
		};
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

	sounds.push("nosound");

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
