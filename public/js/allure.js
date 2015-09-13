Array.prototype.isEmpty = function() { 
	return this.length == 0;
}

Array.prototype.notEmpty = function() {
	return !this.isEmpty();
}

Array.prototype.lastItem = function() {
	return this.items[this.length - 1];
}


