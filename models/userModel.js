const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  socketId: { type: String },
  online: { type: Boolean, default: false }, 
});


module.exports = mongoose.model('User', UserSchema);
