import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './config/db.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import path from 'path';

connectDB();

// Express instance to handle HTTP requests
const app = express();
// Uses HTTP module to create a server using express
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Global
app.set('socketio', io);

// Middleware
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/uploads/files', express.static(path.join(process.cwd(), 'uploads', 'files')));
app.use(cors()); // for the frontend
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/messages', messageRoutes);

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('joinEvent', (eventId) => {
    socket.join(eventId);
    console.log(`Socket ${socket.id} joined event ${eventId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
