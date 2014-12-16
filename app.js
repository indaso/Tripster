var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    http = require('http');

//Maintain user session
//app.use(express.cookieParser());
//app.use(express.session({secret: '1234567890QWERTY'}))

//module dependencies
var home_routes = require('./home/index');
var login_routes = require('./user/login');
var myprofile_routes = require('./user/myprofile');
var signup_routes = require('./user/signup');
var trips_routes = require('./user/trips');
var mytrips_routes = require('./user/mytrips');
var recommend_routes = require('./user/recommends');

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
app.use(express.static(path.join(__dirname, 'public')));

//Specify routes
app.use('/', home_routes);
app.use('/', login_routes);
app.use('/', myprofile_routes);
app.use('/', signup_routes);
app.use('/', trips_routes);
app.use('/', mytrips_routes);
app.use('/', recommend_routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

var server = app.listen(8080, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

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


module.exports = app;