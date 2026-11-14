const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// public papkasidagi index.html faylini ko'rsatish
app.use(express.static(path.join(__dirname, 'public')));

// Onlayn foydalanuvchilar ro'yxati
const users = {};

io.on('connection', (socket) => {
    // Foydalanuvchi ism kiritib kirganda
    socket.on('join', (username) => {
        users[socket.id] = { id: socket.id, name: username };
        io.emit('userList', Object.values(users));
    });

    // Shaxsiy SMS yuborilganda
    socket.on('privateMessage', ({ to, message }) => {
        const sender = users[socket.id];
        if (sender && users[to]) {
            io.to(to).emit('newMessage', {
                fromId: socket.id,
                fromName: sender.name,
                message: message
            });
        }
    });

    // Foydalanuvchi chiqib ketganda
    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('userList', Object.values(users));
    });
});

// Cloud server bergan portda ishga tushirish
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server muvaffaqiyatli ishga tushdi. Port: ${PORT}`);
});
