
const express = require('express');
const authController = require('../controllers/userController');
const router = express.Router();
const User = require('../models/userModel')

router.post('/register', authController.registerUser);

router.post('/login', authController.loginUser);



module.exports = router;
