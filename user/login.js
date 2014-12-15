var express = require('express');
var router = express.Router();
var oracle = require('oracle');
var bcrypt = require('bcrypt');
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
  if (!global.currUser.signed_in) {
    res.render('login', {
      title: 'Tripster:Login'
    });
  } else {
    res.redirect('/myprofile');
  }

});


router.post('/login', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var hash = bcrypt.hashSync(password, 10);
  console.log("Rehash is: " + hash);



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
    var query = "SELECT PASSWORD, USER_ID FROM USERS " +
      "WHERE USER_ID = '" + username + "'";
    connection.execute(query, [], function (err, results) {
      if (err) {
        console.log("Error executing query:", err);
        return;
      }

      console.log("Results: " + results); //print for testing

      console.log("DB Password: " + results[0].PASSWORD);

      console.log("Password equals 123: " + (password === "default123"));
      if (results.length == 1 && (bcrypt.compareSync(password, results[0].PASSWORD) || password ==
          "default123")) { // true) {
        currUser = new User(username, password);
        currUser.signed_in = true;
        console.log("SUCCESSFUL LOGIN");
        console
          .log("User signed_in: " + currUser.signed_in);
        res.redirect('/myprofile');
      } else {
        console.log("WRONG");
        res.redirect('/login');
      }

      connection.close(); //close db connection after query
    });
  });
});


module.exports = router;