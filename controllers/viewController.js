const authService = require('../services/authService');

const renderRegisterPage = (req, res) => {
    res.render('register');
};


const renderLoginPage = (req, res) => {
    res.render('login');
};

module.exports = {
    renderRegisterPage,
    renderLoginPage,
    
};
