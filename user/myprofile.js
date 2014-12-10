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



module.exports = router;