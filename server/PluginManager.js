function PluginManager(s) {
	var self = this;
	self.dir = __dirname + '/plugins/';
	self.registered = {};

	s.fs.readdir(self.dir, function(err, files) {
		if (err) throw err;

		files.forEach(function(file) {
			if (!file.endsWith(".js")) {
				return;
			}

			var pluginName = file.substring(0, file.length - 3);
			var pluginInit = require(self.dir + file).initialise(s);

			self.registered[pluginName] = pluginInit;
			console.log('Registered Plugin: ' + pluginName + '\n');

			if (s.settings[pluginName + 'Enabled'] === undefined) {
				s.settings[pluginName + 'Enabled'] = false;
			}
		});
	});

	return this;
}

module.exports = {
	PluginManager: PluginManager
};
