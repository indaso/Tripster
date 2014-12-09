var express = require('express');
var router = express.Router();

/* Render home page, login page, and sign up page */

router.get('/', function(req, res) {
  res.render('index', { title: 'Tripster:Home' });
});

router.get('/login', function(req, res) {
  res.render('login', { title: 'Tripster:Login' });
});

router.get('/signup', function(req, res) {
  res.render('signup', { title: 'Tripster:Sign up' });
});

module.exports = router;
