var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res) {
  res.render('index', { title: 'Tripster:Home' });
});

//router.get('/signup', function(req, res) {
//  res.render('signup', { title: 'Tripster:Sign up' });
//});

module.exports = router;
