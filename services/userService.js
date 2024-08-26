// services/authService.js
const bcrypt = require('bcrypt');
const User = require('../models/userModel.js');

const registerUser = async (username, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return User.create({ username, email, password: hashedPassword });
};

const authenticateUser = async (username, password) => {
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        console.log('User authenticated:', user);

        return user;
    }
    return null;
};

module.exports = {
    registerUser,
    authenticateUser
};
