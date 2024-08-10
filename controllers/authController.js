
const authService = require('../services/authService');

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }

    try {
        await authService.registerUser(username, email, password);
        res.redirect('/login');
    } catch (err) {
        console.error('Error registering user:', err);
        res.redirect('/register');
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "All fields are mandatory!" });
        // throw new Error("All fields are mandatory!");
    }

    try {
        const user = await authService.authenticateUser(username, password);
        if (user) {
            console.log(user ,'user neeedd');
            user.online = true;
           await user.save();
            
            req.session.user = user;
            res.redirect('/chat');
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        console.error('Error logging in user:', err);
        res.redirect('/login');
    }
};

module.exports = {
    registerUser,
    loginUser
};
