var express = require('express');
var router = express.Router();
var oracle = require('oracle');
global.friends = [];

/* When user tries to log on, verify his information.
If it is correct, redirect him/her to his/her profile
If incorrect, stay on login page - alert user of error */

var connectData = {
	hostname: "tripsterdb.cmjcmauyxdtp.us-east-1.rds.amazonaws.com",
	port: 1521,
	database: "Wally",
	user: "masterusr",
	password: "CS450&frdS"
};

var uniqueFriends = [];
uniquePics = [];

function friendObj() {}

/**
 * Returns true if the element exists within the array.
 * @param  {Array} arr  [array to be put into method]
 * @param  {Object} elem [element to search for in array]
 * @return {Boolean}      [returns true if element is in array, false otherwise]
 */

function contains(arr, elem) {
	for (var i = 0; i < arr.length; i++) {
		if (elem === arr[i]) {
			return true;
		}
	}
	return false;
}

router.get('/myprofile', function (req, res) {
	var query = "";
	oracle.connect(connectData, function (err, connection) {
		if (err) {
			console.log("Error connecting to db:", err);
			return;
		}

		//Query database for username's password
		//userid for testing
		var query = "SELECT * FROM FRIENDS_WITH FW " +
			"INNER JOIN PLANS P ON P.USER_ID=FW.FRIEND_ID2 " +
			"INNER JOIN TRIPS T ON T.TRIP_ID=P.TRIP_ID " +
			"INNER JOIN LOCATION L ON L.LOCATION_ID=T.LOCATION_ID " +
			"INNER JOIN HAS H ON H.TRIP_ID=T.TRIP_ID " +
			"INNER JOIN INCLUDES I ON I.ALBUM_ID=H.ALBUM_ID " +
			"INNER JOIN CONTENT C ON C.CONTENT_ID=I.CONTENT_ID " +
			"WHERE FW.ACCEPTED=1 " +
			"AND FW.FRIEND_ID1='" + currUser.username + "'";
		console.log('QUERY = ' + query);
		connection.execute(query, [], function (err, results) {
			if (err) {
				console.log("Error executing query:", err);
				return;
			}

			qresults = results;

			// first get each friend

			uniqueFriendsIds = [];



			friendObj.id = "";
			friendObj.trips = [];

			/**
			 * Unique trips for variable
			 * @type {Array}
			 */
			uniqueTrips = [];
			uniqueTripsIds = [];

			for (var i = 0; i < results.length; i++) {
				if (!contains(uniqueFriendsIds, results[i].FRIEND_ID2)) {
					var friend = new friendObj();
					friend.id = results[i].FRIEND_ID2;
					friend.trips = [];
					uniqueFriends.push(friend);
					uniqueFriendsIds.push(friend.id);
				}
			}

			// for each friend, find his unique trips

			// does this cover multiple locations?

			for (var i = 0; i < results.length; i++) {
				// check for unique trips
				if (!contains(uniqueTrips, results[i].TRIP_ID)) {
					// if it's a unique trip, match it to friend object
					for (var j = 0; j < uniqueFriends.length; j++) {
						if (uniqueFriends[j].id === results[i].FRIEND_ID2) {
							// add location name to object
							var tripObj = {
								trip: results[i].LOCATION_NAME,
								pics: []
							};
							uniqueFriends[j].trips.push(tripObj);
							uniqueTrips.push(results[i].TRIP_ID);
						}
					}
				}
			}

			for (var i = 0; i < results.length; i++) {
				if (!contains(uniquePics, results[i].URL)) {
					// if it's a unique trip, match it to friend object
					for (var j = 0; j < uniqueFriends.length; j++) {
						if (uniqueFriends[j].id === results[i].FRIEND_ID2) {
							// go through each trip object
							for (var k = 0; k < uniqueFriends[j].trips.length; k++) {
								uniqueFriends[j].trips[k].pics.push(results[i].URL);
							}
							uniquePics.push(results[i].URL);
						}
					}
				}
			}

			console.log("uniqueTrips length: " + uniqueTrips.length);
			console.log("uniqueFriendsIds length " + uniqueFriendsIds.length);
			console.log("uniquePics length" + uniquePics.length);

			// for each person, print out their trips for testing
			for (var i = 0; i < uniqueFriends.length; i++) {
				for (var j = 0; j < uniqueFriends[i].trips.length; j++) {
					console.log("Friend: " + uniqueFriends[i].id);
					console.log("Trip: " + uniqueFriends[i].trips[j].trip);
					console.log("Trip Pictures: " + uniqueFriends[i].trips[j].pics);
				}
			}

			friends = uniqueFriends;
			console.log("Friends array: " + friends);
			console.log("Friends length: " + friends.length);
			//console.log("Friends[0]: " + friends[0].id);

			//console.log(results); //print for testing
			if (true) {
				//console.log("SUCCESSFUL LOGIN");
				//console.log("User name=" + currUser.username + " User password=" + currUser.password);
			} else console.log("WRONG");

			connection.close(); //close db connection after query
			res.render('myprofile', {
				title: 'Tripster:MyProfile',
				friends: friends
			});
		});
	});

});



router.get('/addfriends', function (req, res) {
	res.render('addfriends', {
		errormsg: ''
	});
});

router.post('/addfriends', function (req, res) {
	//var friender = your username
	var friendee = req.body.friendee;

	//Validate that person you are trying to friend exists
	var query = 'SELECT USER_ID FROM USERS WHERE USER_ID =' + "'" + friendee + "'";

	oracle.connect(connectData, function (err, connection) {
		if (err) {
			console.log("Error connecting to db:", err);
			return;
		}

		connection.execute(query, [], function (err, results) {
			if (err) {
				console.log("Error executing query:", err);
				return;
			}

			console.log(results); //print for testing

			connection.close();
			console.log(results[0]);
			if (results.length === 0) {
				//Person does not exist
				var mess = "Sorry, we were not able to find: " + friendee + " in out database. Please try again";
				res.render("addfriends", {
					errormsg: mess
				});
				//else if user is self
				//else if users are already friendspiazza

			} else if (results[0].USER_ID == "jenhu") { //replace with friender usernamer
				var mess = "Sorry, you cannot add yourself";
				res.render("addfriends", {
					errormsg: mess
				});
			} else {
				oracle.connect(connectData, function (err, connection) {
					if (err) {
						console.log("Error connecting to db:", err);
						return;
					}
					//check if friend pair or friend request already exists
					//replace jenhu with username
					var friended = "SELECT * FROM FRIENDS_WITH WHERE FRIEND_ID1 = '" + "jenhu" + "' AND FRIEND_ID2 = '" +
						friendee + "'";
					console.log(friended);
					connection.execute(friended, [], function (err, results) {
						if (err) {
							console.log("Error executing query:", err);
							return;
						}

						console.log(results); //print for testing

						connection.close();

						if (results.length == 1) {
							if (results[0].ACCEPTED == 1) {
								var mess = "You and " + friendee + " are already friends!";
								res.render("addfriends", {
									errormsg: mess
								});
							} else {
								var mess = "You already sent " + friendee + " a friend request!";
								res.render("addfriends", {
									errormsg: mess
								});
							}
						}
					});

					//Place friend request in database
					var createreq = "INSERT INTO FRIENDS_WITH (FRIEND_ID1, FRIEND_ID2, ACCEPTED) VALUES";
					createreq = createreq + "('" + "jenhu" + "', '" + friendee + "', " + 0 + ")";
					//replace jenhu w/ friender    					
					console.log(createreq);
					connection.execute(createreq, [], function (err, results) {
						if (err) {
							console.log("Error executing query:", err);
							return;
						}

						console.log(results); //print for testing

						connection.close();
					});
				});
			}
		});
	});
});

module.exports = router;