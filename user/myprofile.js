/*jslint node: true */
"use strict";

var express = require('express');
var router = express.Router();
var oracle = require('oracle');
//global.friends = [];
var friends = [];



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



//If user is logged in, get his profile information from the database and populate the editprofile.jade page

var uniqueFriends = [];
var uniquePics = [];

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
	//var query = "";
	if (global.currUser.signed_in) {
		var email;
		var affiliation;
		var interests;
		var name;

		//get user's information from the database
		oracle.connect(connectData, function (err, connection) {
			if (err) {
				console.log("Error connecting to db:", err);
				return;
			}

			//Populates user profile information
			var query = "SELECT * FROM USERS WHERE USER_ID='" + global.currUser.username + "'";
			connection.execute(query, [], function (err, results) {
				if (err) {
					console.log("Error executing query:", err);
					return;
				}

				console.log(results[0].EMAIL); //print for testing

				email = results[0].EMAIL;
				name = results[0].NAME;
				affiliation = results[0].AFFILIATION;
				interests = results[0].INTERESTS;

				//check to see if values are null or undefined
				if (!email)
					email = "";
				if (!name)
					name = "";
				if (!affiliation)
					affiliation = "";
				if (!interests)
					interests = "";
			});

			//DAFUQ DOES THIS DO
			var query = "SELECT * FROM FRIENDS_WITH FW " +
				"INNER JOIN PLANS P ON P.USER_ID=FW.FRIEND_ID2 " +
				"INNER JOIN TRIPS T ON T.TRIP_ID=P.TRIP_ID " +
				"INNER JOIN LOCATION L ON L.LOCATION_NAME=T.LOCATION_ID " +
				"INNER JOIN HAS H ON H.TRIP_ID=T.TRIP_ID " +
				"INNER JOIN INCLUDES I ON I.ALBUM_ID=H.ALBUM_ID " +
				"INNER JOIN CONTENT C ON C.CONTENT_ID=I.CONTENT_ID " +
				"WHERE FW.ACCEPTED=1 " +
				"AND FW.FRIEND_ID1='" + global.currUser.username + "'";
			console.log('QUERY = ' + query);
			connection.execute(query, [], function (err, results) {
				if (err) {
					console.log("Error executing query:", err);
					return;
				}

				var qresults = results;

				// first get each friend

				var uniqueFriendsIds = [];



				friendObj.id = "";
				friendObj.trips = [];

				/**
				 * Unique trips for variable
				 * @type {Array}
				 */
				var uniqueTrips = [];
				var uniqueTripsIds = [];

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



				/*console.log("uniqueTrips length: " + uniqueTrips.length);
				console.log("uniqueFriendsIds length " + uniqueFriendsIds.length);
				console.log("uniquePics length" + uniquePics.length);*/

				// for each person, print out their trips for testing
				/*			for (var i = 0; i < uniqueFriends.length; i++) {
								for (var j = 0; j < uniqueFriends[i].trips.length; j++) {
									console.log("Friend: " + uniqueFriends[i].id);
									console.log("Trip: " + uniqueFriends[i].trips[j].trip);
									console.log("Trip Pictures: " + uniqueFriends[i].trips[j].pics);
								}
							}
				*/
				friends = uniqueFriends;
				//console.log("Friends array: " + friends);
				//console.log("Friends length: " + friends.length);
				//console.log("Friends[0]: " + friends[0].id);

				//console.log(results); //print for testing

				connection.close();
				res.render('myprofile', {
					title: 'Tripster:MyProfile',
					username: global.currUser.username,
					name: name,
					email: email,
					affiliation: affiliation,
					interests: interests,
					friends: friends,
				});
				uniqueFriends = [];
				uniqueFriendsIds = [];
				uniqueTrips = [];
				uniqueTripsIds = [];
				uniquePics = [];

			});
		});
} else {
	//if not logged in, redirect to login page
	res.redirect('/login');
}
});

router.get('/myprofile/:user_id', function (req, res) {
	//var query = "";
	if (global.currUser.signed_in) {
		var email;
		var affiliation;
		var interests;
		var name;

		//get user's information from the database
		oracle.connect(connectData, function (err, connection) {
			if (err) {
				console.log("Error connecting to db:", err);
				return;
			}

			//Populates user profile information
			var query = "SELECT * FROM USERS WHERE USER_ID='" + req.params.user_id + "'";
			connection.execute(query, [], function (err, results) {
				if (err) {
					console.log("Error executing query:", err);
					return;
				}

				console.log(results[0].EMAIL); //print for testing

				email = results[0].EMAIL;
				name = results[0].NAME;
				affiliation = results[0].AFFILIATION;
				interests = results[0].INTERESTS;

				//check to see if values are null or undefined
				if (!email)
					email = "";
				if (!name)
					name = "";
				if (!affiliation)
					affiliation = "";
				if (!interests)
					interests = "";
			});

			//DAFUQ DOES THIS DO
			var query = "SELECT * FROM FRIENDS_WITH FW " +
				"INNER JOIN PLANS P ON P.USER_ID=FW.FRIEND_ID2 " +
				"INNER JOIN TRIPS T ON T.TRIP_ID=P.TRIP_ID " +
				"INNER JOIN LOCATION L ON L.LOCATION_NAME=T.LOCATION_ID " +
				"INNER JOIN HAS H ON H.TRIP_ID=T.TRIP_ID " +
				"INNER JOIN INCLUDES I ON I.ALBUM_ID=H.ALBUM_ID " +
				"INNER JOIN CONTENT C ON C.CONTENT_ID=I.CONTENT_ID " +
				"WHERE FW.ACCEPTED=1 " +
				"AND FW.FRIEND_ID1='" + req.params.user_id + "'";
			console.log('QUERY = ' + query);
			connection.execute(query, [], function (err, results) {
				if (err) {
					console.log("Error executing query:", err);
					return;
				}

				var qresults = results;

				// first get each friend

				var uniqueFriendsIds = [];



				friendObj.id = "";
				friendObj.trips = [];

				/**
				 * Unique trips for variable
				 * @type {Array}
				 */
				var uniqueTrips = [];
				var uniqueTripsIds = [];

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



				/*console.log("uniqueTrips length: " + uniqueTrips.length);
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
				*/
				friends = uniqueFriends;
				//console.log("Friends array: " + friends);
				//console.log("Friends length: " + friends.length);
				//console.log("Friends[0]: " + friends[0].id);

				//console.log(results); //print for testing

				connection.close();
				res.render('myprofile', {
					title: 'Tripster:MyProfile',
					username: req.params.user_id,
					name: name,
					email: email,
					affiliation: affiliation,
					interests: interests,
					friends: friends,
				});
				uniqueFriends = [];
				uniqueFriendsIds = [];
				uniqueTrips = [];
				uniqueTripsIds = [];
				uniquePics = [];

				//console.log("Rendered page, dropdown: " + dropdown);

			});
		});
	} else {
		//if not logged in, redirect to login page
		res.redirect('/login');
	}
});

//If user is logged in, get his profile information from the database and populate the editprofile.jade page
router.get('/editprofile', function (req, res) {
	if (global.currUser.signed_in) {
		var email;
		var affiliation;
		var interests;
		var name;

		//get user's information from the database
		oracle.connect(connectData, function (err, connection) {
			if (err) {
				console.log("Error connecting to db:", err);
				return;
			}
			var query = "SELECT * FROM USERS WHERE USER_ID='" + global.currUser.username + "'";
			connection.execute(query, [], function (err, results) {
				if (err) {
					console.log("Error executing query:", err);
					return;
				}

				console.log(results); //print for testing

				email = results[0].EMAIL;
				name = results[0].NAME;
				affiliation = results[0].AFFILIATION;
				interests = results[0].INTERESTS;

				//check to see if values are null or undefined
				if (!email)
					email = "";
				if (!name)
					name = "";
				if (!affiliation)
					affiliation = "";
				if (!interests)
					interests = "";

				//pass values to the client
				res.render('editprofile', {
					title: 'Tripster:Edit My Profile',
					username: global.currUser.username,
					name: name,
					email: email,
					affiliation: affiliation,
					interests: interests
				});


				connection.close();
			});
		});
	} else {
		//if not logged in, redirect to login page
		res.redirect('/login');
	}
});

//Edit My Profile
router.post('/editprofile', function (req, res) {
	if (global.currUser.signed_in) {
		var email = req.body.email;
		var affiliation = req.body.affiliation;
		var interests = req.body.interests;
		var name = req.body.name;


		//Update users information
		oracle.connect(connectData, function (err, connection) {
			if (err) {
				console.log("Error connecting to db:", err);
				return;
			}

			var query = "UPDATE USERS SET EMAIL='" + email + "', NAME='" + name + "', AFFILIATION='";
			query = query + affiliation + "', INTERESTS='" + interests + "' WHERE USER_ID='" + global.currUser.username +
				"'";
			console.log(query);

			connection.execute(query, [], function (err, results) {
				if (err) {
					console.log("Error executing query:", err);
					return;
				}

				console.log(results); //print for testing
				connection.close();
			});
		});

		//pass values to the client
		res.redirect('/myprofile');
	} else {
		//if not logged in, redirect to login page
		res.redirect('/login');
	}
	//connection.close(); //close db connection after query
});


//Get users friend requests
router.get('/friendrequests', function (req, res) {
	if (global.currUser.signed_in) {
		//get pending requests from the database
		oracle.connect(connectData, function (err, connection) {
			if (err) {
				console.log("Error connecting to db:", err);
				return;
			}
			var query = "SELECT * FROM FRIENDS_WITH WHERE FRIEND_ID2='" + global.currUser.username + "'";
			query = query + "AND ACCEPTED = 0";
			connection.execute(query, [], function (err, results) {
				if (err) {
					console.log("Error executing query:", err);
					return;
				}
				console.log("-----------------------------");
				console.log(results);
				connection.close();

				if (results.length === 0) {
					console.log("I am here");
					res.render('friendrequests', {
						requests: [],
						message: "You have no friend requests at the moment"
					});
				} else {
					var requesters = [];
					for (var i = 0; i < results.length; i++) {
						requesters[i] = results[i].FRIEND_ID1;
					}
					console.log(requesters);
					console.log(requesters.length);
					res.render('friendrequests', {
						requests: requesters,
						message: "Here are your friend requests"
					});
				}
			});
		});
	} else {
		//if not logged in, redirect to login page
		res.redirect('/login');
	}
});


//Accept/Reject User friend requests
router.post('/friendrequests', function (req, res) {
	var friendee = global.currUser.username;
	var friender = req.body.requester;
	var response = req.body.response;

	if (response == "accept") {
		//Validate that person you are trying to friend exists
		var query = "UPDATE FRIENDS_WITH SET ACCEPTED=1 WHERE FRIEND_ID1='" + friender + "' AND FRIEND_ID2='" + friendee +
			"'";
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
				res.redirect('friendrequests');
			});
		});
	} else if (response == "reject") {
		//Validate that person you are trying to friend exists
		var query = "DELETE FROM FRIENDS_WITH WHERE FRIEND_ID1='" + friender + "' AND FRIEND_ID2='" + friendee + "'";
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
				res.redirect('friendrequests');
			});
		});
	}
});


//Log out
router.get('/logout', function (req, res) {
	global.currUser.signed_in = false;
	res.redirect('/');
});



/* function findSelection(privacycontent) {
    var test = 'document.theForm.' + field;
    var sizes = test;

    alert(sizes);
        for (i=0; i < sizes.length; i++) {
            if (sizes[i].checked==true) {
            alert(sizes[i].value + ' you got a value');     
            return sizes[i].value;
        }
    }
}*/



/*//check to see if correct user informaion
console.log("what we got -- plan yo trip"); console.log(locationname); console.log(locationtype); console.log(
  privacycontent); console.log(invitees);

//for table Location
var sql1 = "INSERT INTO LOCATION (LOCATION_ID, LOCATION_NAME, LOCATION_TYPE) VALUES"; sql1 = sql1 + "('" +
locationid + "', '" + locationname + "', '" + locationtype + "')";

//for table Plans
var planquery = "INSERT INTO PLANS (USER_ID, TRIP_ID,PLAN_ID) values (" + userid + ", " +
  tripid + ", " + planid + ")";



//for invites table
if (invitees !== '') {
  var invquery = "INSERT INTO INVITES (USER_INVITER, USER_INVITEE, TRIP_ID) values (" +
    userid + ", '" + invitees + "', " + tripid + ")";

}*/

module.exports = router;