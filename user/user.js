var User = function (username, password) {
	this.username = username;
	this.password = password;
	this.signed_in = false;
	this.friends = [];
};

module.exports = User;