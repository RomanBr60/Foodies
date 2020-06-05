let mongoose = require('mongoose');
var express = require('express');
var router = express.Router();

mongoose.set('useFindAndModify', false);

var mongoDB = require('../lib/db');
var Schema = mongoose.Schema;

var recCatSchema = mongoDB.recCatSchema, Cat = mongoDB.Cat, db = mongoDB.db;
var User = require('./users');

let getCats = function (req, callback) {
	Cat.find(req, function(err, cats) {
		return callback(err, cats);
	});
}

router.get('/reccategories', function(req, res, next) {
	Cat.find({}, function(err, cats) {
		var recCats = [];
		cats.forEach(function(cat) {
			if (cat.name != null) recCats.push({ id: cat.recCat_id, name: cat.name, description: encodeURI(cat.description) });
		});
		res.render('recCat', { title: "סוגי מתכונים", recCats: recCats, user: req.user, showuser: true } );
	});
});

router.put('/EDITTYPE', function(req, res, next) {
	console.log ("update: " + req.body.id);
	var val_toset = {};
	if (req.body.name !== '') val_toset.name = req.body.name;
	if (req.body.description !== '') val_toset.description = req.body.description;
	Cat.findOneAndUpdate({ recCat_id: req.body.id }, { $set: val_toset }, function (err, cat) {
	   if (err) {
			res.statusCode = 401;
			console.error("ERROR");
			res.send({result: false});
	   }
	   else {
		   console.log("SUCCESS");
		   res.send({result: true});
	   }
	});
});

router.post('/ADDTYPE', function(req, res, next) {

	console.log (req.body);
	var cat = new Cat ({ recCat_id: req.body.id, name: req.body.name, description: req.body.description });
	//var cat = new Cat ({ recCat_id: req.body.id, name: req.body.name });
	cat.save(function (err, data) {

	   if (err) {
			console.error(err);
			res.statusCode(401).send({result: false});
	   }
	   else {
		   console.log("SUCCESS");
		   res.send({result: true});
	   }

	});
});

router.delete('/DELETETYPE/:id/:name', function(req, res, next) {
	
	console.log ("deleted value: " + req.params.name);
	Cat.findOneAndRemove({ recCat_id: req.params.id }, function (err) {
	   if (err) {
			res.statusCode = 401;
			console.error("ERROR");
			res.send({result: false});
	   }
	   else {
		   console.log("SUCCESS");
		   res.send({result: true});
	   }

	});
});



module.exports = router;
module.exports.recCatSchema = recCatSchema ;
module.exports.Cat = Cat;
module.exports.getCats = getCats;
