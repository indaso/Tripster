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

//If user is logged in, get his profile information from the database and populate the editprofile.jade page
router.get('/myprofile', function(req, res) {
	if (currUser.signed_up) {
		var email;
		var affiliation;
		var interests;
		var name;

		//get user's information from the database
		oracle.connect(connectData, function(err, connection) {
    		if (err) {console.log("Error connecting to db:", err); return;}
    		var query = "SELECT * FROM USERS WHERE USER_ID='" + global.currUser.username + "'";
	    	connection.execute(query, [], function(err, results) {
	     	   if (err) {console.log("Error executing query:", err); return; }

	    	    console.log(results[0].EMAIL);     //print for testing

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
	    	    	affiliation ="";
	    	    if (!interests)
	    	    	interests = "";

	    	   	connection.close();
				
				//pass values to the client
				res.render('myprofile', { title: 'Tripster:MyProfile', username: global.currUser.username,
				name: name, email: email, affiliation: affiliation, interests: interests});
	    	   });
		});
	} else {
		//if not logged in, redirect to login page
		res.redirect('/login');
	}
});



//If user is logged in, get his profile information from the database and populate the editprofile.jade page
router.get('/editprofile', function(req, res) {
	if (currUser.signed_up) {
		var email;
		var affiliation;
		var interests;
		var name;
		
		//get user's information from the database
		oracle.connect(connectData, function(err, connection) {
    		if (err) {console.log("Error connecting to db:", err); return;}
    		var query = "SELECT * FROM USERS WHERE USER_ID='" + global.currUser.username + "'";
	    	connection.execute(query, [], function(err, results) {
	     	   if (err) {console.log("Error executing query:", err); return; }

	    	    console.log(results);     //print for testing

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
	    	    	affiliation ="";
	    	    if (!interests)
	    	    	interests = "";

	    	   	//pass values to the client
				res.render('editprofile', { title: 'Tripster:Edit My Profile', username: global.currUser.username,
				name: name, email: email, affiliation: affiliation, interests: interests});


	    	   	connection.close();
	    	});
		});
	} else {
		//if not logged in, redirect to login page
		res.redirect('/login');
	}
});

//Edit My Profile
router.post('/editprofile', function(req, res) {
	if (currUser.signed_up) {
		var email = req.body.email;
		var affiliation = req.body.affiliation;
		var interests = req.body.interests;
		var name = req.body.name;


		//Update users information
		oracle.connect(connectData, function(err, connection) {
	    	if (err) {console.log("Error connecting to db:", err); return;}

	   	 	var query = "UPDATE USERS SET EMAIL='" + email +"', NAME='" + name + "', AFFILIATION='";
	   	 	query = query + affiliation + "', INTERESTS='" + interests + "' WHERE USER_ID='" + currUser.username + "'";
	   	 	console.log(query);

	    	connection.execute(query, [], function(err, results) {
	    		if (err) {console.log("Error executing query:", err); return; }

	    	    console.log(results);     //print for testing
	    	   	connection.close();
	    	   });
		});

		//pass values to the client
		res.redirect('/myprofile');
	} else {
	//if not logged in, redirect to login page
	res.redirect('/login');
	}
});


router.get('/addfriends', function(req,res) {
	res.render('addfriends', {errormsg: ''});
});

router.post('/addfriends', function(req, res) {
	var friender = currUser.username;
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
	        } else if (friendee== friender) {	//replace with friender usernamer
				var mess = "Sorry, you cannot add yourself";
				res.render("addfriends", {errormsg: mess});
	        } 
	        else {
	        	oracle.connect(connectData, function(err, connection) {
    				if (err) {console.log("Error connecting to db:", err); return;}
   						//check if friend pair or friend request already exists
    					var friended = "SELECT * FROM FRIENDS_WITH WHERE (FRIEND_ID1 = '" + friender + "' AND FRIEND_ID2 = '" + friendee + "')";
    					friended = friended + "OR (FRIEND_ID1 = '" + friendee + "' AND FRIEND_ID2 = '" + friender + "'";
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
    					createreq = createreq + "('" + friender + "', '" + friendee + "', " + 0 + ")"; 					
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


//Get users friend requests

module.exports = router;