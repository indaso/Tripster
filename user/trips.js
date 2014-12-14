var express = require('express');
var router = express.Router();
var oracle = require('oracle');
global.User = require('./user');

//for dropdown things
var dropdown = [];

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
  	if (global.currUser.signed_in) {
		//Render Createtrip page
	  	res.render('createtrip', {});
	} else {
    	res.redirect('/login');
	}
});

router.post('/createtrip', function (req, res) {
	if (global.currUser.signed_in) {
		var userid = currUser.username;
		var planid = req.body.planid;
		var privacycontent = req.body.privacycontent;
		var locationname = req.body.locationname; //want to change location to country, if USA state + city, else city
		var locationtype = req.body.locationtype;
		var album = req.body.album;
		var content = req.body.content;
		var items = req.body.items;
		var tripid;

		//check if location exists, if not, create it in table
		oracle.connect(connectData, function (err, connection) {
			if (err) {
				console.log("Error connecting to db creating trip:", err);
				return;
			}
			//if location does not exist in location table, add it
			var exists;
			var loc_query = "SELECT * FROM LOCATION WHERE LOCATION_NAME='" + locationname + "'";
				connection.execute(loc_query, [], function(err, results) {
				if (err) {
					console.log('Error executing location query:', err);
					return;
				}

				if (results.length === 0) {
					if (!type) {
						var create_query = "INSERT INTO LOCATION (LOCATION_NAME) VALUES";
						create_query = create_query + "('" + locationname  +"')";
						console.log(create_query);
						connection.execute(create_query, [], function (err, results) {
							console.log('here2');
							if (err) {
								console.log('Error executing location query:::', err);
								return;
							}
							console.log(results);
							connection.close();
						});
					} else {
						var create_query = "INSERT INTO LOCATION (LOCATION_NAME, LOCATION_TYPE) VALUES";
						create_query = create_query + " ('" + locationname +"', '" + locationtype +"')";
						console.log(create_query);
						connection.execute(create_query, [], function (err, results) {
							console.log('here2');
							if (err) {
								console.log('Error executing location query:', err);
								return;
							}
							console.log(results);
						});
					}
				} 
			});
			//create trip id
			var query = 'SELECT MAX(TRIP_ID) AS MAX FROM TRIPS';
			connection.execute(query, [], function (err, results) {
				if (err) {
					console.log("Error executing query:", err);
					return;
				}
				console.log("TRIP_ID: " + results[0].MAX);	//testing
				console.log(results[0].MAX + 1);
				tripid = results[0].MAX + 1;

				//create trip in database
				var newtrip = "INSERT INTO TRIPS (TRIP_ID, LOCATION_ID, PRIVACY_CONTENT) VALUES('" + tripid 
					+ "', '" + locationname + "', '" + privacycontent + "')";
				console.log(newtrip);
				connection.execute(newtrip, [], function (err, results) {
					console.log('attempting query: ' + newtrip);
					if (err) {
						console.log("Error connecting to db:", err);
						return;
					}
					console.log(results);
				});
				var planquery = "INSERT INTO PLANS values( '" + userid + "', " +
					tripid + ", " + planid + ")";
				connection.execute(planquery, [], function (err, results) {
					console.log('attempting query: ' + planquery);
					if (err) {
						console.log("Error connecting to db:", err);
						return;
					}
					console.log(planquery + "EXECUTED");
					connection.close();
					
				});
			});	
		});
		//render part II of trip requests - invite friends
		dropdown = [];
		create_dropdown();
		res.render('invitefriends',{
			invitees: dropdown,
			tripid : tripid
		});
	} else {
		res.redirect('/login');
	}
});


module.exports = router;