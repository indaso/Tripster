var express = require('express');
var router = express.Router();
var oracle = require('oracle');

var connectData = {
  hostname: "tripsterdb.cmjcmauyxdtp.us-east-1.rds.amazonaws.com",
  port: 1521,
  database: "Wally",
  user: "masterusr",
  password: "CS450&frdS"
};

router.get('/signup', function(req, res) {
  res.render("signup", {title: "Tripster: Signup", errormsg: "1"});
});

function create_user (name, username, email, password) {
	console.log("here");
	oracle.connect(connectData, function(err, connection) {
   	if (err) {console.log("Error connecting to db:", err); return;}
   		var q = "INSERT INTO USERS (USER_ID, PASSWORD, NAME, PRIVACY_CONTENT, EMAIL) VALUES";
   		q = q + "('" + username + "', '" + password + "', '" +name + "', " + "'private'" + ", '" + email + "')";
  		//testing
  		console.log(q);

		connection.execute(q, [], function(err, results) {
	 	   if (err) {console.log("Error executing query:", err); return; }

     	   console.log(results);     //print for testing

    	   	connection.close();
	    });
	});
}

//Must handle successful and unsuccessful user creation
//e.g. user email already exists in system 
router.post('/signup', function(req, res) {
	var name = req.body.fname + " " + req.body.lname;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;

    var query = 'SELECT USER_ID FROM USERS WHERE USER_ID =' + "'" + username + "'";
    console.log('QUERY = ' + query);    //print for testing

    oracle.connect(connectData, function(err, connection) {
    	if (err) {console.log("Error connecting to db:", err); return;}

	    connection.execute(query, [], function(err, results) {
	        if (err) {console.log("Error executing query:", err); return; }

	        console.log(results);     //print for testing

	       	connection.close();
	        if(results.length == 0) {
	        	create_user(name, username, email, password);
	        	console.log("asd;jaklsdf");
	        	res.redirect('/myprofile');
	        	
	        } else {
	      		var mess = "Sorry, the username " + username + " has already been taken. Please try again.";
	       		res.render("signup", {title: "Tripster: Signup Login Failed", errormsg: mess }); 
	        }
	    });
	});
});


module.exports = router;