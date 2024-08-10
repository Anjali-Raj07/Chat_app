
const express = require('express');
const authController = require('../controllers/authcontroller');
const router = express.Router();
const User = require('../models/userModel')

router.post('/register', authController.registerUser);

router.post('/login', authController.loginUser);

router.get('/logout', async (req, res) => {
    console.log('Logout request received');
    const user = await User.find({ _id: req.session.user._id });
    console.log(user[0]);
    user[0].online = false;

    await user[0].save();

    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).json({ message: 'Failed to log out' });
        }

        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});


module.exports = router;
