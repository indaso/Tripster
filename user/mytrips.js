var express = require('express');
var router = express.Router();
var oracle = require('oracle');
global.User = require('./user');


var connectData = {
	hostname: "tripsterdb.cmjcmauyxdtp.us-east-1.rds.amazonaws.com",
	port: 1521,
	database: "Wally",
	user: "masterusr",
	password: "CS450&frdS"
};

function loadpage() {
	oracle.connect(connectData, function (err, connection) {
		if (err) {
			console.log("Error connecting to db:", err);
			return;
		}

		//get tripid, planid
		var query = "SELECT TRIP_ID, PLAN_ID FROM PLANS WHERE USER_ID='" + global.currUser.username + "'";
		console.log("tripid/planid query = " + query);
		connection.execute(query, [], function (err, results) {
			if (err) {
				console.log("Error executing query:", err);
				return;
			}
			var tripid = results.TRIP_ID;
			console.log(results);
			console.log("now just tripid's " + tripid);

			/*var q2 = "SELECT LOCATION_ID FROM TRIPS WHERE TRIP_ID='" + tripid + "'";
			connection.execute(query, [], function (err, results) {
			if (err) {
				console.log("Error executing query:", err);
				return;
			}*/
		});
	});
}



router.get('/mytrips', function (req, res) {
	if (global.currUser.signed_in) {
		loadpage();
		//Render Mytrips page
		res.render('mytrips', {});
	} else {
		res.redirect('/login');
	}
});


module.exports = router;