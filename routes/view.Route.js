const express = require('express');
const authController = require('../controllers/viewController');
const router = express.Router();
// const verifyToken = require('../middleware/verifyToken');

router.get('/register', authController.renderRegisterPage);
router.get('/login', authController.renderLoginPage);


module.exports = router;
