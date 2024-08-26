require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const User = require('./models/userModel');
const authRoutes = require('./routes/user.Route');
const chatRoutes = require('./routes/chat.Route');
const viewRoutes = require('./routes/view.Route');
const Group = require('./models/groupModel');
const Message = require('./models/messageModel')

const connectDB = require('./config/dbConnection');
const { authenticateUser } = require('./services/userService');


connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);



app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));


app.use('/', authRoutes);
app.use('/chat', chatRoutes);
app.use('/', viewRoutes);



io.on('connection', (socket) => {
    console.log('A user connected with socket ID:', socket.id);
    socket.on('user login', async (username) => {
        try {
            const user = await User.findOne({ username });
            if (user) {

                const updatedUser = await User.findByIdAndUpdate(
                    user._id,
                    {
                        socketId: socket.id,
                        online: true
                    },
                    { new: true }
                );
                // console.log(updatedUser);
                socket.userId = user._id;
                socket.username = username;
                console.log('User login successful:', updatedUser);

                console.log("socket.userid:", socket.userId)
                console.log("socket.username:", socket.username)
                socket.emit('login success', `Welcome ${updatedUser.username}`);

            }
        } catch (error) {
            console.error('Error during user login:', error);
            socket.emit('login error', 'Login failed. Please try again.');
        }
    });


    socket.on('chat message', async (data) => {
        const { sender, receiver, message } = data;
        console.log('Received chat message data:', data);

        try {
            const receiverUser = await User.findOne({ username: receiver });

            if (receiverUser && receiverUser.socketId) {
                io.to(receiverUser.socketId).emit('chat message', { sender, receiver, message });
                console.log('Message sent to receiver:', receiverUser.socketId);
            } else {
                socket.emit('chat message', { sender: 'System', message: 'User is offline or not available.' });
                console.log('User is offline or not available:', receiverUser);
            }
        } catch (error) {
            console.error('Error handling chat message:', error);
        }
    });


    socket.on('createGroup', async (groupName) => {
        try {
            const newGroup = new Group({
                name: groupName,
                members: [socket.userId]
            });

            await newGroup.save();
            console.log(newGroup)
            socket.join(groupName);
            socket.emit('message', `Group '${groupName}' created and you have joined it.`);


        } catch (error) {
            console.error('Error creating group:', error);
        }
    });



    socket.on('joinGroup', async (groupName) => {
        try {

            socket.join(groupName);
            const group = await Group.findOne({ name: groupName });
            if (group) {
                console.log('Group before update:', group);
                console.log('User ID:', socket.userId);


                if (!group.members.includes(socket.userId)) {
                    group.members.push(socket.userId);
                    await group.save();
                }

                socket.emit('message', `You have joined the group '${groupName}'.`);
                socket.to(groupName).emit('message', `A new user has joined the group: ${groupName}`);

            } else {
                socket.emit('message', 'Group does not exist.');
            }
        } catch (err) {
            socket.emit('message', 'An error occurred while joining the group.');
        }
    });
    socket.on('leaveGroup', async (groupName) => {
        try {
            const group = await Group.findOne({ name: groupName });
            if (group) {
                
                group.members = group.members.filter(member => member.toString() !== socket.userId.toString());
                await group.save();
    
                
                socket.leave(groupName);
    
                
                socket.emit('message', `You have left the group '${groupName}'.`);
                socket.to(groupName).emit('message', `${socket.username} has left the group.`);
            } else {
                socket.emit('message', 'Group does not exist.');
            }
        } catch (err) {
            socket.emit('message', 'An error occurred while leaving the group.');
        }
    });
    

    // Sending group message

    socket.on('sendGroupMessage', async (data) => {
        const { groupName, message } = data;
        console.log('Sending message to group:', data);

        try {

            const group = await Group.findOne({ name: groupName });
            if (group) {

                io.to(groupName).emit('group message', {
                    sender: socket.username,
                    content: message,

                });
                const newMessage = new Message({
                    sender: socket.userId,
                    group: group._id,
                    content: message,
                });
                await newMessage.save();
                console.log(newMessage)


            } else {
                socket.emit('message', { sender: 'System', content: 'Group does not exist.' });


            }
        }
        catch (error) {
            console.error('Error sending group message:', error);
        }
    });



    socket.on('disconnect', async () => {
        try {
            if (socket.userId) {
                await User.findByIdAndUpdate(
                    socket.userId,
                    {
                        socketId: null,
                        online: false
                    }
                );
                console.log(`User ${socket.username} disconnected and is now offline.`);
            }
        } catch (error) {
            console.error('Error during user disconnect:', error);
        }
    });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server started at PORT: ${PORT}`);
});

