var oracle = require('oracle');

var connectData = {
	hostname: "tripsterdb.cmjcmauyxdtp.us-east-1.rds.amazonaws.com",
	port: 1521,
	database: "Wally",
	user: "masterusr",
	password: "CS450&frdS"
};

var User = function (username, password) {
	this.username = username;
	this.password = password;



	function findOne(username, password, callback) {
		//Connect to database
		oracle.connect(connectData, function (err, connection) {
			if (err) {
				console.log("Error connecting to db:", err);
				return;
			}

			//Query database for username's password
			//userid for testing
			var query = 'SELECT PASSWORD, USER_ID FROM USERS WHERE PASSWORD = ' + "'" + password + "'" +
				"AND USER_ID = '" + username + "'";
			console.log('QUERY = ' + query);
			connection.execute(query, [], function (err, results) {
				if (err) {
					console.log("Error executing query:", err);
					return;
				}

				user = results;
				console.log(results); //print for testing
				if (results.length == 1) {
					console.log("SUCCESSFUL LOGIN");
					res.redirect('/myprofile');
				} else console.log("WRONG");

				connection.close(); //close db connection after query
			});
		});

	}

	return {
		findOne: findOne,
		findById: findById
	};
};

module.exports = User;