var express = require('express');
var router = express.Router();
var oracle = require('oracle');
global.User = require('./user');
global.currUser = new User();

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

router.get('/login', function (req, res) {
  res.render('login', {
    title: 'Tripster:Login'
  });
});


router.post('/login', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  //Print for testing/building
  console.log("LOGIN");
  console.log(username);
  console.log(password);

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

      console.log(results); //print for testing
      if (results.length == 1) {
        currUser = new User(username, password);
        currUser.signed_up = true;
        console.log("SUCCESSFUL LOGIN");
        console.log("User name=" + currUser.username + " User password=" + currUser.password);
        res.redirect('/myprofile');
      } else console.log("WRONG");

      connection.close(); //close db connection after query
    });
  });
});


module.exports = router;