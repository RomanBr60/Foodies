const cookieUserKey = 'user'; 
const secretKey = 'qwerty60';

const dbConnectionString = "mongodb+srv://romanbr87:qwerty60@foodies-3klsx.mongodb.net/test?retryWrites=true&w=majority";
//const dbConnectionString = "mongodb://localhost:27017/test"

const cloudinary_config = { 
  cloud_name: 'foodies', 
  api_key: '627834318378827', 
  api_secret: 'g-qj1PYfulxOgppGuxfmpAHlLMg' 
};

module.exports.cookieUserKey = cookieUserKey; 
module.exports.secretKey = secretKey;
module.exports.cloudinary_config = cloudinary_config;
module.exports.dbConnectionString = dbConnectionString; 

