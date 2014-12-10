/*jslint node: true */
"use strict";

var express = require('express');
var router = express.Router();
var oracle = require('oracle');
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var username;
var password;
var User = require('./user');

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


/*router.post('/login', function (req, res) {
  username = req.body.username;
  password = req.body.password;

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

      user = results;
      console.log(results); //print for testing
      if (results.length == 1) {
        console.log("SUCCESSFUL LOGIN");
        res.redirect('/myprofile');
      } else console.log("WRONG");

      connection.close(); //close db connection after query
    });
  });
});*/


// passport/login.js
passport.use('login', new LocalStrategy({
    passReqToCallback: true
  },
  function (req, username, password, done) {
    // check in mongo if a user with username exists or not
    User.findOne(user.username, user.password
      function (err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log error & redirect back
        if (!user) {
          console.log('User Not Found with username ' + username);
          return done(null, false,
            req.flash('message', 'User Not found.'));
        }
        // User exists but wrong password, log the error 
        /*        if (!isValidPassword(user, password)) {
                  console.log('Invalid Password');
                  return done(null, false,
                    req.flash('message', 'Invalid Password'));
                }*/
        // User and password both match, return user from 
        // done method which will be treated like success
        return done(null, user);
      }
    );
  }));


module.exports = router;