var passport = require('passport');
var express = require('express');
var bcrypt = require('bcryptjs');

var LocalStrategy = require('passport-local').Strategy;
var CookieStrategy = require('passport-cookie').Strategy; 

var crypto = require('./crypto');
var router = express.Router();
var User = require('../routes/users');
var app = require('../app');

const cookieUserKey = require('./config').cookieUserKey; 
const secretKey = require('./config').secretKey;

var userID = null;

//user authentication from login page
passport.use('local', new LocalStrategy(
	function(username, password, done) {	
		User.getUserByUsername(username, function(err, user){
			if(err) {
				//throw err;
				return done(null, err, { message: err, auth: false });
			}
			
			if(!user) {
				return done(null, false, { message: 'Unknown User', auth: false });
			}
			
			else if (user.activated) {
				if (password == user.password) {
					return done(null, user, {message: 'You signed the user: ' + user.username });	
				}
				
				User.comparePassword(password, user.password, function(err, isMatch){
					if(err) {
						//throw err;
						return done(null, err, {message: err, auth: false });
					}
				
					if(isMatch) {
							return done(null, user, {message: 'You signed the user: ' + user.username });
					} else {
						return done(null, false, {message: 'Invalid password', auth: false });
					}
				
				});
			}
			
			else return done(null, false, {message: 'User is not activated', auth: false });
		});
	}
));

/*passport.use('local', new LocalStrategy(
	function(username, password, done) {	
		User.getUserByUsername(username, function(err, user){
			if(err) {
				//throw err;
				return done(null, err, { message: err, auth: false });
			}
			
			if(!user) {
				return done(null, false, { message: 'Unknown User', auth: false });
			}

			return done(null, user, {message: 'You signed the user: ' + user.username });

				
		});
	}
));*/

//user authentication from cookies
passport.use(new CookieStrategy(
	{ cookieName: cookieUserKey },
	function(id, done) {
		id = crypto.decrypt (id);
		User.getUserById(id, function(err, user) {
			if(err) {
				return done(null, err, {message: err, auth: false });
			}
			
			if(!user) {
				return done(null, false, { message: 'Unknown User', auth: false });
			}				
			
			return done(null, user, {message: 'You signed the user: ' + user.username });
		});
	}
));



passport.serializeUser(function(user, done) {
  done(null, user.user_id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

//user autologin
router.use(function (req, res, next) {
	if (!req.user) {
		id = req.cookies[cookieUserKey];
		if (!id) {
			next();
			return;
		}
		
		var id = crypto.decrypt(id);
		User.getUserById (id, function(err, user){
			if(err) next();
			else {
				  passport.authenticate("cookie", { session: true }, function(err, user, info) {
					req.logIn(user, function(err) {
						if (err) return next(err);
						else {
							return user;
						}
					});
					next();
				})(req, res, next);
			}
		});
	}

	else {
		next();
	}
});

//user login request
router.post('/login', function(req, res, next) {
	if (req.user) res.status(401).send({message: 'You are already signed the user: ' + req.user.username, auth: false });
	else {
		passport.authenticate('local', function(err, user, info) {
			if (!user) {
				res.send (info);
			} else {
				
				req.login(user, function (err) {
					if(err) res.send ({ message: err, auth: false });
					else {
						console.log ("login: " + req.body.save_login);
						if (req.body.save_login) {
							var id = crypto.encrypt (user.user_id.toString());
							var cookieRes = res.cookie(cookieUserKey, id, { httpOnly: true });
							console.log ("cookieRes: ");
						}

						info.auth = true;
						console.log (info);
						res.send (info);
					}
				});
				
			}
		})(req, res, next);
	}
});

	// Endpoint to logout
router.get('/logout', function(req, res, next){	
	res.clearCookie(cookieUserKey);
	req.logout();
	res.send(null);
});

router.post('/logout', function(req, res, next){	
	res.clearCookie(cookieUserKey);
	req.logout();
	res.send(true);
});


module.exports = passport;
module.exports.router = router