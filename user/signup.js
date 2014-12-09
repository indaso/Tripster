var express = require('express');
var router = express.Router();
var oracle = require('oracle');

var connectData = {
  hostname: "ln -s libocci.dynlib.11.1 libocci.dynlib",
  port: 1521,
  database: "xe",
  user: "masterusr",
  password: "CS450&frdS"
};

//Must handle successful and unsuccessful user creation
//e.g. user email already exists in system -> forgot password
router.post('/signup', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

   	//check to see if correct user informaion
   	console.log("SIGNUP")
   	console.log(username);
   	console.log(password);
});