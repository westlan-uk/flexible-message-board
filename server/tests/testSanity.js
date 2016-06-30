// var foo = require("../public/js/foo.js")

module.exports = {
	"booleans": function(test) {
		test.equals(true, true);
		test.done();
	},
	"foo": function(test) {
		// test.equals(true, foo.foo());
		test.done();
	}
};
