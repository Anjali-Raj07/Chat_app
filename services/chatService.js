// services/chatService.js
const User = require('../models/userModel');

const getAllUsers = async () => {
    return User.find();
};

module.exports = {
    getAllUsers
};
