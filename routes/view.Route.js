const express = require('express');
const authController = require('../controllers/viewController');
const router = express.Router();
// const verifyToken = require('../middleware/verifyToken');

router.get('/register', authController.renderRegisterPage);
router.get('/login', authController.renderLoginPage);

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/login'); 
    });
});



module.exports = router;
