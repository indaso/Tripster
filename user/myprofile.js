var express = require('express');
var router = express.Router();
var oracle = require('oracle');

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

router.get('/myprofile', function(req, res) {
  res.render('myprofile', { title: 'Tripster:MyProfile' });
});






router.get('/addfriends', function(req,res) {
	res.render('addfriends', {errormsg: ''});
});

router.post('/addfriends', function(req, res) {
	//var friender = your username
	var friendee = req.body.friendee;

	//Validate that person you are trying to friend exists
    var query = 'SELECT USER_ID FROM USERS WHERE USER_ID =' + "'" + friendee + "'";

    oracle.connect(connectData, function(err, connection) {
    	if (err) {console.log("Error connecting to db:", err); return;}

	    connection.execute(query, [], function(err, results) {
	        if (err) {console.log("Error executing query:", err); return; }

	        console.log(results);     //print for testing

	       	connection.close();
	       	console.log(results[0]);
	        if(results.length == 0) {
	        	//Person does not exist
	        	var mess = "Sorry, we were not able to find: " + friendee + " in out database. Please try again";
	       		res.render("addfriends", {errormsg: mess });
	       		//else if user is self
	       		//else if users are already friendspiazza

	        } else if (results[0].USER_ID == "jenhu") {	//replace with friender usernamer
				var mess = "Sorry, you cannot add yourself";
				res.render("addfriends", {errormsg: mess});
	        } 
	        else {
	        	oracle.connect(connectData, function(err, connection) {
    				if (err) {console.log("Error connecting to db:", err); return;}
   						//check if friend pair or friend request already exists
   						//replace jenhu with username
    					var friended = "SELECT * FROM FRIENDS_WITH WHERE FRIEND_ID1 = '" + "jenhu" + "' AND FRIEND_ID2 = '" + friendee + "'";
    					console.log(friended);
    					connection.execute(friended, [], function(err, results) {
					    	if (err) {console.log("Error executing query:", err); return; }

					        console.log(results);     //print for testing

					       	connection.close();

					       	if (results.length == 1) {
								if (results[0].ACCEPTED == 1) {
									var mess = "You and " + friendee + " are already friends!";
									res.render("addfriends", {errormsg: mess});
								} else {
									var mess = "You already sent " + friendee + " a friend request!";
									res.render("addfriends", {errormsg: mess});
								}
					       	}
					    });

						//Place friend request in database
    					var createreq = "INSERT INTO FRIENDS_WITH (FRIEND_ID1, FRIEND_ID2, ACCEPTED) VALUES";
    					createreq = createreq + "('" + "jenhu" + "', '" + friendee + "', " + 0 + ")";
							//replace jenhu w/ friender    					
    					console.log(createreq);
					    connection.execute(createreq, [], function(err, results) {
					        if (err) {console.log("Error executing query:", err); return; }

					        console.log(results);     //print for testing

					       	connection.close();
					    });
				});
			}
	    });
	});
});

module.exports = router;