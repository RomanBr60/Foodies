var express = require('express');
var cloudinary = require('cloudinary');
var multer  = require('multer')
 var path = require('path');

var router = express.Router();
var config = require('../lib/config');

var storage = multer.memoryStorage();
var upload = multer({ dest: './uploads/', storage: storage });

cloudinary.config (config.cloudinary_config);

var mongoDB = require('../lib/db');
var imageSchema = mongoDB.imageSchema, Imgs = mongoDB.Imgs, db = mongoDB.db;

router.get('/img', function(req, res, next){	
  return res.render('upload');
});


//var type = upload.single('file');
router.post('/fileupload', upload.single('file'), (req, res) => {
	cloudinary.v2.uploader.upload(getImageBaase64(req.file), { public_id: uploadToServer(req) },  
	function(err, data) {
		if (err) {
			console.log(err); 
			res.status(401).send (err);
		}
		
		else {
			var newImg = {
				img_path: data.url,
				img_uploader: req.user._id
			}

			newImg = new Imgs(newImg);
			newImg.save(function (err, data) {
				//if (err) res.status(401).send (JSON.parse(JSON.stringify(err.errmsg)));
				if (err) {
					var val = err.errors.img_path.value;
					res.status(401).send (val);
				}
				else {
					console.log (data._id);
					res.send (data.img_path);
				}
			})
			
		}
	});
	//res.send (uploadToServer(req));
	
});


function getImageBaase64 (file) {
	const data = JSON.parse(JSON.stringify(file.buffer)).data;
	const imgBase64 = "data:" + file.mimetype + ";base64," + Buffer.from(data).toString('base64');
	return imgBase64;
}

function uploadToServer (req) {
	let filename = req.user._id + "/" + req.file.originalname;
	return filename.split('.')[0];
}

function add_imgs (link, callback) {
	newImg.save(callback);
}

module.exports = router;
module.exports.getImageBaase64 = getImageBaase64;
module.exports.uploadToServer = uploadToServer;