var User = function (username, password) {
	this.username = username;
	this.password = password;
	this.signed_up = false;
};

module.exports = User;