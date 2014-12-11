/*jslint node: true */
"use strict";

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

var friends = [];
oracle.connect(connectData, function (err, connection) {
  if (err) {
    console.log("Error connecting to db:", err);
    return;
  }

  var sql1 = 'SELECT FRIEND_ID2 FROM FRIENDS_WITH WHERE FRIEND_ID1 = ' + "'" + 'gsn' + "'";

  console.log('QUERY = ' + sql1);
  connection.execute(sql1, [], function (err, results) {
    if (err) {
      console.log("Error executing query:", err);
      return;
    }

    for (var i = 0; i < results.length; i++) {
      var resul = results[i].FRIEND_ID2;
      console.log(resul);
      friends.push(resul);


    }
    connection.close();
  });


});


router.get('/myprofile', function (req, res) {
  res.render('myprofile', {
    title: 'Tripster:MyProfile',
    invitees: friends
  });
});

router.post('/myprofile', function (req, res) {

  var tripsize = 0;
  var locationid = 0;
  var userid = 'gsn';
  var tripid = tripsize;
  var planid = 1;
  var privacycontent = 'Public';
  var locationname = req.body.locationname;
  var locationtype = req.body.locationtype;
  var invitees = req.body.Invitees;
  var album = req.body.album;
  var content = req.body.content;
  var items = req.body.items;


  oracle.connect(connectData, function (err, connection) {
    if (err) {
      console.log("Error connecting to db:", err);
      return;
    }

    var q2 = 'SELECT TRIP_ID AS COUNT FROM TRIPS WHERE ROWNUM <= 1';
    tripid = connection.execute(q2, [], function (err, results) {
      console.log('attempting tripid query');
      if (err) {
        console.log("Error executing query:", err);
        return;
      }
      results = results[0].COUNT;
      if (results < 15000) tripid = 15000;
      else tripid = results + 1;
      console.log('getting tripid = ' + tripid);

      connection.close();
      return tripid;
    });

    var q = 'SELECT COUNT(LOCATION_ID) AS COUNT FROM LOCATION';
    connection.execute(q, [], function (err, results) {
      console.log('attempting locationid query');
      if (err) {
        console.log("Error executing query:", err);
        return;
      }
      results = results[0].COUNT;
      console.log(results);
      console.log('locationid');
      locationid = results + 1;

      var tripquery = "INSERT INTO TRIPS (TRIP_ID, LOCATION_ID,PRIVACY_CONTENT) values (" + tripid +
        ", " + locationid + ", " + privacycontent + ")";
      connection.execute(tripquery, [], function callback(err, results) {
        console.log('attempting query: ' + tripquery);
        if (err) {
          console.log("Error connecting to db:", err);
          return;
        }
        console.log('FINAL COUNTDOWN: tripid, locationid = ' + locationid + ", " + tripid);
        console.log(tripquery + "EXECUTED");

        connection.close();

      });
    });
  });
  //for table Trips
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