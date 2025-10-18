const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methids: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);
        socket.broadcast.to(roomId).emit('user-connected', userId);
        
        socket.on('offer', (payload) => {
            io.to(payload.tareget).emit('offer', payload);
        });

        socket.on('answer', (payload) => {
            io.to(payload.target).emit('answer', payload);
        });

        socket.on('ice-candidate', (payload) => {
            io.to(payload.target).emit('ice-candidate', payload.candidate);
        });

        socket.on('send-message', ({ roomId, message, sender }) => {
            console.log(`Received message "${message}" for room ${roomId} from ${sender}`);
            io.to(roomId).emit('receive-message', { message, sender});
        });

        socket.on('disconnect', () => {
            console.log(`User ${userId} disconnected`);
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));