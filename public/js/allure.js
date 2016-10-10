Array.prototype.isEmpty = function() { 
	return this.length === 0;
};

Array.prototype.notEmpty = function() {
	return !this.isEmpty();
};

Array.prototype.lastItem = function() {
	return this[this.length - 1];
};

$.prototype.contains = function(search) {
	return $(this).children(search).length > 0;
}
