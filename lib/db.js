//DataBase file

var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var autoNumber = require('mongoose-auto-number');
const AutoIncrement = require('mongoose-sequence')(mongoose);
var passportLocalMongoose = require("passport-local-mongoose"); 
var beautifyUnique = require('mongoose-beautiful-unique-validation');
var config = require("./config");	
	
//mongoose.set('debug', true);
mongoose.Promise = Promise;

let options = { useNewUrlParser : true, autoIndex : true, autoReconnect : true, promiseLibrary : global.Promise, useUnifiedTopology: true};
mongoose.connect(config.dbConnectionString, options);

/*run().then(() => console.log('done')).catch(error => console.error(error.stack));
async function run() {
  await mongoose.connect(config.dbConnectionString, options);
}*/


var db = mongoose.connection;
//db.on('error', console.error.bind(console, ''));

db.once('open',function () {
    console.log('\nConnected: ' + db.readyState);
}).on('error',function (error) {
	console.log("Ready state: " + db.readyState);	
    console.log('CONNECTION ERROR:',error);
});

var Schema = mongoose.Schema;
autoNumber.init(db);

var recCatSchema, Cat; //Recepie categories' table
var userSchema, Users;  //Users' table
var imageSchema, Imgs; // Images table

CreateTables ();
	

//Creates tables and schemes
function CreateTables () {
	try {
		recCatSchema = new Schema({
			recCat_id: { type: String, unique : true, required : true },
			name: { type: String, unique : true, required : true },
			description: { type: String, unique: false }
		});
		
		//recCatSchema.plugin(uniqueValidator);  
		//recCatSchema.plugin(passportLocalMongoose);  
		
		userSchema = new Schema({
			user_id: { type: Number, unique : true, required : true, autoIncrement: true, default: 0 },
			username: { type: String, unique : true, required : true , uniqueCaseInsensitive: true },
			name: { type: String, required : true },
			email: { type: String, unique : true, required : true , uniqueCaseInsensitive: true },
			img: { type: Schema.Types.ObjectId, unique : true, ref: 'Imgs' },
			birthDayDate: { type: Date },
			gender: { type: String },
			usertype: { type: Number, required: true, min: 1, max: 3 },
			password: { type: String, required: true, minlength: 6 },
			activated: { type: Boolean }
		});
		userSchema.plugin(uniqueValidator, 'Error, expected {PATH} to be unique.');
		userSchema.plugin(autoNumber.plugin);
		userSchema.plugin(passportLocalMongoose);  

		imageSchema = new Schema({
			img_path: { type: String, unique : true, required : true },
			img_uploader: { type: Schema.Types.ObjectId, required : true, ref: 'Users' }
		});
		/*imageSchema = new Schema({
			img_path: { type: String, unique : true, required : true }
		});*/
		imageSchema.plugin(uniqueValidator, 'Error, expected {PATH} to be unique.');
		imageSchema.plugin(beautifyUnique);
		
		recSchema = new Schema({
			rec_author: { type: Number, required : true,  ref: 'Users' },
			rec_title: { type: String, required: true },
			rec_body: { type: String, unique : true, required: true },
			rec_cat: { type: Schema.Types.ObjectId, ref: 'Cat', required: false },
			rec_scat: { type: String, required: true },
			rec_tags: { type: [String], required: true }
		});
		userSchema.plugin(uniqueValidator, 'Error, expected {PATH} to be unique.');

		Cat = mongoose.model('categories', recCatSchema);
		Users = mongoose.model('users', userSchema);
		Imgs = mongoose.model('images', imageSchema);
		Recs = mongoose.model('recepies', recSchema);
	}
	catch (e) { console.log (e) }
}
 
module.exports.db = db;
module.exports.recCatSchema = recCatSchema ;
module.exports.Cat = Cat;
module.exports.userSchema = userSchema;
module.exports.Users = Users;
module.exports.imageSchema = imageSchema;
module.exports.Imgs = Imgs;
module.exports.recSchema = recSchema;
module.exports.Recs = Recs;