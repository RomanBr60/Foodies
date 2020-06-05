//Encryptionq / Decryption functions

var bcrypt = require('bcryptjs');
var crypto = require('crypto')
var jwt = require('jsonwebtoken');

const algorithm = 'aes-256-cbc';
const key = new Buffer('85CE6CCF67FBBAA8BB13479C3A6E084D', 'hex');

function encrypt (text) {
	var cipher = crypto.createCipher(algorithm, key);
	var crypted = cipher.update(text, 'utf-8', 'hex');
	crypted += cipher.final('hex');
	return crypted;
}

function decrypt (text) {
	var decipher = crypto.createDecipher(algorithm, key);
	var decrypted = decipher.update(text, 'hex', 'utf-8');
	decrypted += decipher.final('utf-8');
	return decrypted;
}

function jwtDecrypt (decryptionJson, secretOrPrivateKey, options) {
	return jwt.sign(decryptionJson, secretOrPrivateKey, options, callback);
}

function jwtEncrypt (encryptionJson, secretOrPrivateKey, options) {
	return jwt.verify(encryptionJson, secretOrPrivateKey, options, callback);
}

module.exports = bcrypt;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.hashSync = bcrypt.hashSync;


//algorithm = 'aes-256-ctr',
//password = 'd6F3Efeq';
 //iv = '60iP0h6vJoEa'
//'aes-256-ctr', 'd6F3Efeq', '60iP0h6vJoEa'