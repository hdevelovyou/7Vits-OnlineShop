// src/socket.js
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL, {
  withCredentials: true,
//  autoConnect: true,    // sẽ connect thủ công khi cần
});

export default socket;
