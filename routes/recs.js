let mongoose = require('mongoose');
var express = require('express');
var router = express.Router();

var mongoDB = require('../lib/db');
var Schema = mongoose.Schema;

var recSchema = mongoDB.recSchema, Recs = mongoDB.Recs, recCatSchema = mongoDB.recCatSchema, Cat = mongoDB.Cat, db = mongoDB.db;
var User = require('./users');

router.get('/recs', (req, res) => {
	
	//res.render('rec', { title: "עריכת מתכון", showuser: true });
	res.render('rec', { title: "עריכת מתכון", user: req.user, showuser: true } );	
	/*Cat.find({}, function(err, cats) {
		var recCats = [];
		cats.forEach(function(cat) {
			if (cat.name != null) recCats.push({name: cat.name});
		});
		res.send (recCats);
	});*/
	
});




module.exports = router;
module.exports.recSchema = recSchema ;
module.exports.Recs = Recs;
