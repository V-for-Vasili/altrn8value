const mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
  _id: String,
  username: String,
  saltedHash: String,
  salt: String
});
let User = mongoose.model('User',UserSchema);

module.exports = {User};
