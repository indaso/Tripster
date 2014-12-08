var express = require('express');
var router = express.Router();
var oracle = require('oracle');


router.get('/login', function(req, res) {
  res.render('login', { title: 'Tripster:Login' });
});

router.post('/login', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;

   	//check to see if correct user informaion
   	console.log("LOGIN");
   	console.log(email);
   	console.log(password);
    });

router.post('/signup', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;

   	//check to see if correct user informaion
   	console.log("SIGNUP")
   	console.log(email);
   	console.log(password);
});

module.exports = router;