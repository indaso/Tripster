var express = require('express');
var router = express.Router();

router.get('/login', function(req, res) {
  res.render('login', { title: 'Tripster:Login' });
});

router.post('/login', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;

   	//check to see if correct user informaion
    });

module.exports = router;
