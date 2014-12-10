/*jslint node: true */
"use strict";

var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    http = require('http'),
    passport = require('passport'),
    expressSession = require('express-session'),
    flash = require('connect-flash'),
    LocalStrategy = require('passport-local').Strategy,
    oracle = require('oracle');

//Maintain user session
//app.use(express.cookieParser());
//app.use(express.session({secret: '1234567890QWERTY'}))

//module dependencies
var home_routes = require('./home/index');
var login_routes = require('./user/login');
var myprofile_routes = require('./user/myprofile');
var signup_routes = require('./user/signup');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(expressSession({
    secret: 'mySecretKey'
}));
//app.use(oracle());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

//Specify routes

app.use('/', home_routes);
app.use('/', login_routes);
app.use('/', myprofile_routes);
app.use('/', signup_routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    findById(id, function (err, user) {
        done(err, user);
    });
});


/*var connectData = {
    hostname: "tripsterdb.cmjcmauyxdtp.us-east-1.rds.amazonaws.com",
    port: 1521,
    database: "Wally",
    user: "masterusr",
    password: "CS450&frdS"
};

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

        console.log(results); //print for testing
        if (results.length == 1) {
            console.log("SUCCESSFUL LOGIN");
            //res.redirect('/myprofile');
        } else console.log("WRONG");

        connection.close(); //close db connection after query
    });
});*/

function findById(id, fn) {
    var idx = id - 1;
    var users;
    if (users[idx]) {
        fn(null, users[idx]);
    } else {
        fn(new Error('User ' + id + ' does not exist'));
    }
}

module.exports = app;