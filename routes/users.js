var mongoose = require('mongoose');
var express = require('express');
var bcrypt = require('bcryptjs');
var moment = require('moment');
var _ = require('lodash');

var router = express.Router();

var mongoDB = require('../lib/db');
var Schema = mongoose.Schema;
var userSchema = mongoDB.userSchema, Users = mongoDB.Users, db = mongoDB.db;

/* login */
router.get('/login', function(req, res, next) {
		var url = "/reccategories";
		console.log (req.user);
		if (!req.user) res.render('login', { title: "כניסה לפרופיל", url: url, showuser: false });
		else res.redirect (url);
});

/* signup */
router.get('/signup', function(req, res, next) {
		res.render('signup', { title: "רישום משתמש פודיז חדש", showuser: false });
});

router.post('/SETUSER', function(req, res, next) {
	
	var newUser = {
		$inc: { user_id: 1 },
		username: req.body.username,
		name: req.body.name,
		email: req.body.email,
		birthDayDate: moment(req.body.birthDayDate).toISOString(),
		gender: req.body.gender,
		usertype: req.body.usertype,
		password: req.body.password
	};
	
	newUser = new Users (newUser);
	bcrypt.genSalt(10, function(err, salt) {	
		if(err) {
			console.error(err);
			res.status(401).send(err);
		}
	
		else {
			bcrypt.hash(newUser.password, salt, function(err, hash) {
				if(err) {
					console.error(err);
					res.status(401).send(err);
				}

				else {
					newUser.password = hash;
					newUser.save(function (err, data) {
						if (err) {
							console.error(err);
							res.status(401).send(err);
						}
						else {
						   console.log("SUCCESS");
						   res.send("User " + newUser.username + " was signed successfuly");
						}

					});
				}
				
			});
		}
		
	});
});


/* user detalils */
router.get('/user', function(req, res, next){
	if (!req.user) next();
	else if (req.user.usertype <= 3) res.render ('user', { title: "שינוי פרטי משתמש", user: req.user, showuser: true });
});

router.post('/changeuser', function(req, res, next) {
	function updateUser (user) {
		var id = req.user.user_id;
		//console.log (user);	
		req.logout();
		Users.findOneAndUpdate({ user_id: id }, { $set: user }, function (err, new_user) {
		   console.log (new_user)
		   if (err) {
				res.statusCode = 401;
				console.error("can't update user");
				res.send("can't update user");
		   }
		   else {
				req.login(new_user, function (err) {
					if(err) res.send (err);
					else {
					   console.log("User updated");
					   res.send("User updated");
					}
				});			   
		   }
		   
		});
	}
	
	var user = {};

	
	if (req.body.username !== req.user.username) user.username = req.body.username;
	if (req.body.name !== req.user.name) user.name = req.body.name;
	if (req.body.gender !== req.user.gender) user.gender = req.body.gender;
	if (req.body.birthDayDate !== req.user.birthDayDate) user.birthDayDate = req.body.birthDayDate;
	if (req.body.email !== req.user.email) user.email = req.body.email;
	if (req.body.password !== '') {
		bcrypt.genSalt(10, function(err, salt) {	
			if(err) {
				console.error(err);
				res.status(401).send(err);
				return
			}
		
			else {
				bcrypt.hash(req.body.password, salt, function(err, hash) {
					if(err) {
						console.error(err);
						res.status(401).send(err);
						return;
					}

					else {
						user.password = hash;
						updateUser (user);
						return;
					}
				});
			}
		
		});
	}
	
	else updateUser(user);

});

/* user_activation */
router.get('/user_activation', function(req, res, next){
	if (!req.user) next();
	else if (req.user.usertype <= 3) {
		getUsers({ activated: false }, function (err, users) {
			//res.json(users);
			res.render ('user_activation', { title: "הפעלת משתמשים", users: users, user: req.user, showuser: false });
		});
	}
});

function getUsers (query, callback) {
	Users.find (query , (err, users) => {
		var users1 = {};
		//console.log (users);
		for (u in users) {
			users1[users[u].user_id] = _.pick(users[u], ['user_id', 'name', 'username', 'activated']);	
		}
			
		//console.log(users1);
		callback (err, users1);
		//res.json (users1);
	});
}

router.post('/get_users_for_validation', function(req, res, next){
	var search_data = {};
	search_data.usertype = {$lt : 3 };
	
	if (req.body.user_type == 2) search_data.activated = false;
	else if (req.body.user_type == 3) search_data.activated = true;
	
	if (req.body.search_data != null) {
		var data = { "$regex": req.body.search_data, "$options": "i" };
		var userdata = [{username: data }, { name: data }, { email: data }];
		search_data.$or = userdata;
	}
	
	//console.log (search_data);
	console.log ("search_data: " + req.body.search_data);
	Users.find (search_data, function(err, users) { 
		
		if (err) {
			console.error("can't find user");
			res.status(401).send(err);
		}
		
		else {
			if (users.length == 0 && req.body.err != null) {
				res.status(401).send(req.body.err);
				return;
			}
			
			console.log(users);
			var users1 = {};
			for (u in users) {
				users1[users[u].user_id] = _.pick(users[u], ['user_id', 'name', 'username', 'activated']);	
			}
			
			res.send (users1);
		}

	});
	
});

router.put('/user_activation', function(req, res, next){
	getUserById (req.body.id, function(err, user) {
		if (err) res.status(401).send(err);
		else {
			Users.findOneAndUpdate({ user_id: req.body.id }, { $set: { activated: req.body.activated } }, function (err, user) {
			   if (err) {
					console.error("can't update user");
					res.status(401).send(err);
			   }
			   else {
				   msg = "user " + user.username + (req.body.activated ? " activated" : " deactivated");
				   res.send (msg);
			   }
			});
		}
	});
});


var getUserByUsername = function(username, callback){
	Users.findOne({username: username}, callback);
}

var getUserById = function(id, callback){
  Users.findOne({ user_id: id }, callback);
}

var comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if(err) throw err;
    callback(null, isMatch);
  });
}

module.exports = router;
module.exports.getUserByUsername = getUserByUsername;
module.exports.getUserById = getUserById;
module.exports.comparePassword = comparePassword;