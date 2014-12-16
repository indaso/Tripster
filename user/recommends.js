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

router.get('/addfriends', function (req, res) {
  //get friend recommendations 
  var user = global.currUser.username;
  oracle.connect(connectData, function (err, connection) {
    if (err) {
      console.log("error connecting to db:", err);
      return;
    }

    var recfriends = "WITH FRIENDS(FID) AS ((SELECT FRIEND_ID1 FROM FRIENDS_WITH WHERE FRIEND_ID2 = '" +
      user + "' AND ACCEPTED = 1) UNION (SELECT FRIEND_ID2 FROM FRIENDS_WITH WHERE FRIEND_ID1 = '" + user +
      "' AND ACCEPTED = 1)) (SELECT FW.FRIEND_ID1 AS FRIEND FROM FRIENDS_WITH FW INNER JOIN FRIENDS F ON FW.FRIEND_ID2 = F.FID" +
      " WHERE FW.FRIEND_ID1 <> '" + user +
      "' AND FW.ACCEPTED = 1) UNION (SELECT FW.FRIEND_ID2 AS FRIEND FROM FRIENDS_WITH FW" +
      " INNER JOIN FRIENDS F ON FW.FRIEND_ID1 = F.FID WHERE FW.FRIEND_ID2 <> '" + user +
      "' AND FW.ACCEPTED = 1)";
    console.log(recfriends);
    connection.execute(recfriends, [], function (err, results) {
      if (err) {
        console.log("Error executing query", err);
        return;
      }
      console.log(results);

      var friendsrec = [];
      for (var i = 0; i < results.length; i++)
        friendsrec[i] = results[i].FRIEND;

      connection.close();
      res.render('addfriends', {
        errormsg: '',
        recommendations: friendsrec
      });
    });
  });
});


router.post('/addfriends', function (req, res) {
  var friender = global.currUser.username;
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
          errormsg: mess,
          recommendations: []
        });
      } else if (friendee === friender) { //replace with friender usernamer
        var mess1 = "Sorry, you cannot add yourself";
        res.render("addfriends", {
          errormsg: mess1,
          recommendations: []
        });
      } else {
        oracle.connect(connectData, function (err, connection) {
          if (err) {
            console.log("Error connecting to db:", err);
            return;
          }
          //check if friend pair or friend request already exists
          var friended = "SELECT * FROM FRIENDS_WITH WHERE (FRIEND_ID1 = '" + friender +
            "' AND FRIEND_ID2 = '" + friendee + "')";
          friended = friended + "OR (FRIEND_ID1 = '" + friendee + "' AND FRIEND_ID2 = '" + friender +
            "')";
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
                  errormsg: mess,
                  recommendations: []
                });
              } else {
                var mess2 = "You already sent " + friendee + " a friend request!";
                res.render("addfriends", {
                  errormsg: mess2,
                  recommendations: []
                });
              }
            }
          });

          //Place friend request in database
          var createreq = "INSERT INTO FRIENDS_WITH (FRIEND_ID1, FRIEND_ID2, ACCEPTED) VALUES";
          createreq = createreq + "('" + friender + "', '" + friendee + "', " + 0 + ")";
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
  res.render('addfriends', {
    errormsg: 'Friendrequest sent!'
  });
});



module.exports = router;