/*jslint node: true */
"use strict";

var express = require('express');
var router = express.Router();
var oracle = require('oracle');
global.User = require('./user');

//for dropdown things
var friends = [];
var dropdown = [];
var uniqueFriends = [];
var uniquePics = [];

var connectData = {
	hostname: "tripsterdb.cmjcmauyxdtp.us-east-1.rds.amazonaws.com",
	port: 1521,
	database: "Wally",
	user: "masterusr",
	password: "CS450&frdS"
};

function create_dropdown() {
	oracle.connect(connectData, function (err, connection) {
		if (err) {
			console.log("Error connecting to db:", err);
			return;
		}
		//friends current user has added
		var sql1 = 'SELECT FRIEND_ID2 FROM FRIENDS_WITH WHERE FRIEND_ID1 = ' + "'" + global.currUser.username + "'";
		sql1 = sql1+ "AND ACCEPTED = 1";
		//friends that have added current user
		var sql2 = "SELECT FRIEND_ID1 FROM FRIENDS_WITH WHERE FRIEND_ID2 = '" + currUser.username + "'";
		sql2 = sql2 + "AND ACCEPTED = 2";
		console.log('QUERY = ' + sql1);
		console.log(sql2);

		//Create dropdown menu
		connection.execute(sql2, [], function (err, results) {
				if (err) {
					console.log("Error executing query:", err);
					return;
				}
				consoleprint
				for (var i = 0; i < results.length; i++) {
					var resul = results[i].FRIEND_ID1;
					console.log("Friend: " + resul);
					dropdown.push(resul);
				}
		});

		connection.execute(sql1, [], function (err, results) {
				if (err) {
					console.log("Error executing query:", err);
					return;
				}

				for (var i = 0; i < results.length; i++) {
					var resul = results[i].FRIEND_ID2;
					console.log("Friend: " + resul);
					dropdown.push(resul);

				}
				connection.close();
				console.log(dropdown);
		});	
	});
}

router.get('/createtrip', function(req, res) {
	dropdown = [];
	create_dropdown();
  	if (global.currUser.signed_in) {
		//Render Createtrip page
	  	res.render('createtrip', {
	  		invitees: dropdown
		});
	} else {
    	res.redirect('/login');
	}
});

//Find out if the location user has chosen already exists in database
function location_exists(n) {

	oracle.connect(connectData, function (err, connection) {
		if (err) {
			console.log("error connecting to db:", err);
			return;
		}
		//if location does not exist in location table, add it
		var loc_query = "SELECT * FROM LOCATION WHERE LOCATION_NAME ='" + n + "'";
		connection.execute(loc_query, [], function(err, results) {
			if (err) {
				console.log('Error executing location query:', err);
				return;
			}

		connection.close();
		if (results.length == 0)
			return false;
		else 
			return true;
		});
	});
}

//Create location in creation table
function create_location(name, type) {
	oracle.connect(connectData, function(err, connection){
		if (err) {
			console.log("Error connecting to db:", err);
			return;
		}

		//Check if location type is null
		//if (type == '' ||)
		var create_query = "INSERT INTO LOCATION (LOCATION_NAME, LOCATION_TYPE) VALUES";
		create_query = create_query + "('" + name, +"', '"+ type +"')";
		oracle.execute(create_query, [], function(err, results) {
			if (err) {
				console.log('Error executing location query:', err);
				return;
			}
			console.log(results);
			connection.close();
		});
	});
}

router.post('/createtrip', function (req, res) {

	var tripsize = 0;
	var userid = global.currUser.username;
	var tripid = tripsize;
	var planid = 1;
	var privacycontent = "'public'";
	//want to change location to country, if USA state + city, else city
	locationname = locationname.toLowerCase();
	var locationtype = req.body.locationtype;
	var invitees = req.body.invitees;
	var album = req.body.album;
	var content = req.body.content;
	var items = req.body.items;
	var queryresults;

	console.log(locationtype);
	oracle.connect(connectData, function (err, connection) {
		if (err) {
			console.log("Error connecting to db:", err);
			return;
		}

		//make sure location exists, if not, create it
		var loc_exists = location_exists(locationame);
		console.log(loc_exists);	//testing

		if (!loc_exists) {
			//create_location(locationname, locationtype);
		}

		connection.close();
	});
});

module.exports = router;