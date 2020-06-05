//includes
var url = require('url');
var util = require('util');
var path = require('path');
var fs = require('fs');  
var multer = require('multer');  

var favicon = require('serve-favicon');
var compression = require('compression');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var logger = require('morgan');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var cors = require('cors');
var session = require('express-session');
var flash = require('connect-flash');
var LocalStrategy = require('passport-local').Strategy; 
var CookieStrategy = require('passport-cookie').Strategy; 

var mongoose = require('mongoose');
var express = require('express');
var passport = require('passport');
var cookies = require('browser-cookies');
var async = require('async');
var app = express();

var User = require('./routes/users');
var catRouter = require('./routes/rec_cat_table');
var recs = require('./routes/recs');
var auth = require('./lib/auth');
var crypto = require('./lib/crypto');
var images = require('./routes/images');


//pass image to memmory 
var storage = multer.memoryStorage();
var upload = multer({ dest: './uploads/', storage: storage });


// view engine setup
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, './public')));
app.use(compression());

app.use(session({ 
	secret: 'some-secret',
	saveUninitialized: false,
	resave: true,
}));

app.use(logger('dev'));
/*app.use(logger(function (tokens, req, res) {
	console.log (req.cookies);
}));*/

app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(helmet());
app.use(cors());
//app.use(favicon());

// Passport init
app.use(auth.initialize());
app.use(auth.session());

app.use(flash());

//routes
app.use('/', auth.router);
app.use('/', catRouter);
app.use('/', recs);
app.use('/', User);
app.use('/', images);

app.get('/', function(req, res, next){	
	if (!req.user) res.send ("Not signed");
	else res.send(req.user);
});

app.get('/loginbox', function(req, res) {	
	res.render('loginbox', { title: "כניסה לפרופיל", showuser: false });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;