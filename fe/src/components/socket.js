// src/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  withCredentials: true,
  autoConnect: false,    // sẽ connect thủ công khi cần
});

export default socket;
