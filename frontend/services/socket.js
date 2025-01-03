import { io } from 'socket.io-client';

const SOCKET_URL = 'http://172.19.4.8:5000';

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false, 
});

export const connectSocket = (roomId) => {
  if (!socket.connected) {
    socket.connect();
    socket.emit('joinEvent', roomId);
  }
};

export const disconnectSocket = (roomId) => {
  if (socket.connected) {
    socket.emit('leaveEvent', roomId);
    socket.disconnect();
  }
};
