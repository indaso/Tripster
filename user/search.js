/*jslint node: true */
"use strict";

var express = require('express');
var router = express.Router();
var oracle = require('oracle');



/* When user tries to log on, verify his information.
If it is correct, redirect him/her to his/her profile
If incorrect, stay on login page - alert user of error */

var userArray = [];
var tripArray = [];

var connectData = {
	hostname: "tripsterdb.cmjcmauyxdtp.us-east-1.rds.amazonaws.com",
	port: 1521,
	database: "Wally",
	user: "masterusr",
	password: "CS450&frdS"
};

router.get('/search', function (req, res) {
	if (!global.currUser.signed_in) {
		res.redirect('/login');
	} else {
		res.render('search', {
			users: userArray,
			trips: tripArray
		});
		userArray = [];
		tripArray = [];
	}
});

router.post('/search', function (req, res) {
	var username = req.body.username;
	var location = req.body.location;

	//Print for testing/building
	console.log("SEARCH");
	console.log("Username: " + username);
	console.log("Location: " + location);

	//Connect to database
	oracle.connect(connectData, function (err, connection) {
		if (err) {
			console.log("Error connecting to db:", err);
			return;
		}

		//Query database for username's password
		//userid for testing
		var query = "SELECT USER_ID FROM USERS WHERE USER_ID= '" + username + "'";
		connection.execute(query, [], function (err, results) {
			if (err) {
				console.log("Error executing query:", err);
				return;
			}

			for (var i = 0; i < results.length; i++) {
				userArray.push(results[i].USER_ID);
				console.log("USER ID: " + results[i].USER_ID);
			}

			var query = "SELECT TRIP_ID, LOCATION_ID FROM Trips WHERE LOCATION_ID='" + location + "'";
			connection.execute(query, [], function (err, results) {
				if (err) {
					console.log("Error executing query:", err);
					return;
				}

				for (var i = 0; i < results.length; i++) {
					tripArray.push(results[i].TRIP_ID);
					console.log("TRIP ID: " + results[i].TRIP_ID);
				}

				connection.close(); //close db connection after query
				res.redirect('/search');
			});
		});
	});
});

module.exports = router;