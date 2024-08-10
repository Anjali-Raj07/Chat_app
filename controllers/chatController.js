// controllers/chatController.js
const user = require('../models/userModel');
const chatService = require('../services/chatService');

const renderChatPage = async (req, res) => {
    //console.log(req);
    
    if (!req.session.user) {
 
        
        return res.redirect('/login');
    }

    try {

        
        const users = await chatService.getAllUsers();
        res.render('chat', { user: req.session.user, users });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.redirect('/login');
    }
};

module.exports = {
    renderChatPage
};
