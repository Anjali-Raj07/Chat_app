document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io();
    const userId = document.getElementById('sender').getAttribute('userId');
    const groupChatContainer = document.getElementById('group-chat-container');
    const groupNameElement = document.getElementById('group-name');
    const groupMessages = document.getElementById('group-messages');
    const receiverInfo = document.getElementById('receiver-info'); 
    let receiver = '';

    function loginUser(username) {
        socket.emit('user login', username);
    }
    loginUser(userId);

    function updateReceiverInfo(selectedReceiver) {
        receiver = selectedReceiver;
        receiverInfo.textContent = `Sending messages to: ${receiver}`; 
        receiverInfo.style.display = receiver ? 'block' : 'none'; 
    }

    document.getElementById('send').addEventListener('click', () => {
        const message = document.getElementById('message').value;

        if (receiver) {
            socket.emit('chat message', { sender: userId, receiver, message });

            const li = document.createElement('li');
            li.textContent = `Me: ${message}`;
            document.getElementById('messages').appendChild(li);
            document.getElementById('message').value = '';
        } else {
            Swal.fire('Error', 'Please select a receiver.', 'error');
        }
    });

    document.getElementById('create-group').addEventListener('click', () => {
        Swal.fire({
            title: 'Create Group',
            input: 'text',
            inputLabel: 'Enter group name',
            inputPlaceholder: 'Group Name',
            showCancelButton: true
        }).then(result => {
            if (result.isConfirmed && result.value) {
                const groupName = result.value;
                socket.emit('createGroup', groupName);
                document.getElementById('group-name').textContent = groupName;
                groupChatContainer.style.display = 'block';
            }
        });
    });

    document.getElementById('join-group').addEventListener('click', () => {
        Swal.fire({
            title: 'Join Group',
            input: 'text',
            inputLabel: 'Enter group name',
            inputPlaceholder: 'Group Name',
            showCancelButton: true
        }).then(result => {
            if (result.isConfirmed && result.value) {
                const groupName = result.value;
                socket.emit('joinGroup', groupName);
                document.getElementById('group-name').textContent = groupName;
                groupChatContainer.style.display = 'block';
            }
        });
    });

    document.getElementById('send-group').addEventListener('click', () => {
        const message = document.getElementById('group-message').value;
        const groupName = document.getElementById('group-name').textContent;
        if (message) {
            socket.emit('sendGroupMessage', { groupName, message });
            document.getElementById('group-message').value = '';
        } else {
            Swal.fire('Error', 'Please type a message before sending.', 'error');
        }
    });

    socket.on('chat message', (data) => {
        const { sender, receiver, message } = data;
        const li = document.createElement('li');
        li.textContent = sender === userId ? `Me: ${message}` : `${sender}: ${message}`;
        document.getElementById('messages').appendChild(li);
    });

    socket.on('group message', (data) => {
        const li = document.createElement('li');
        li.textContent = `${data.sender}: ${data.content}`;
        groupMessages.appendChild(li);
    });

    document.getElementById('leave-group').addEventListener('click', () => {
        const groupName = document.getElementById('group-name').textContent;
        if (groupName) {
            Swal.fire({
                title: 'Do you want to leave this group?',
                showCancelButton: true,
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    socket.emit('leaveGroup', groupName);

                    document.getElementById('group-name').textContent = '';
                    groupMessages.innerHTML = '';
                    groupChatContainer.style.display = 'none';
                }
            });
        } else {
            Swal.fire('Error', 'You are not in any group.', 'error');
        }
    });

    document.getElementById('logout').addEventListener('click', () => {
        window.location.href = '/logout';
    });

    function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.classList.add('message');

        const chatContainer = document.getElementById('chat-box');
        chatContainer.appendChild(messageElement);
    }

    socket.on('message', (message) => {
        displayMessage(message);
    });

    // Add click event to online users to set receiver and update display
    document.getElementById('online-users').addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const selectedReceiver = event.target.getAttribute('data-username');
            updateReceiverInfo(selectedReceiver);
        }
    });

    
});
