require("../public/js/allure.js")

module.exports = {
	"isEmpty": function(test) {
		test.ok(typeof [].isEmpty != "undefined");

		arr = [1,2,3];

		test.equals(false, arr.isEmpty());

		arr = [];

		test.equals(true, arr.isEmpty());

		test.done();
	},
	"notEmpty": function(test) {
		test.ok(typeof [].notEmpty != "undefined");

		arr = [1,2,3];

		test.equals(true, arr.notEmpty())
		test.equals(false, !arr.notEmpty())
		test.done();
	},
	"lastItem": function(test) {
		test.ok(typeof [].notEmpty != "undefined");

		arr = [1,2,3];

		test.equals(3, arr.lastItem())
		test.done();
	}
};
