import { io } from 'socket.io-client';

const userId1 = '000000000000000000000001';
const userId2 = '000000000000000000000002';

console.log('[INFO] Starting Socket.io connection test...');
console.log('[INFO] Backend server should be running on http://localhost:5000');

// Create first socket connection
const socket1 = io('http://localhost:5000', {
  query: { userId: userId1 },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling'],
});

// Create second socket connection  
const socket2 = io('http://localhost:5000', {
  query: { userId: userId2 },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling'],
});

let socket1Connected = false;
let socket2Connected = false;

// Socket 1 event handlers
socket1.on('connect', () => {
  socket1Connected = true;
  console.log(`[User 1] Connected! Socket ID: ${socket1.id}`);
});

socket1.on('getOnlineUsers', (users) => {
  console.log(`[User 1] Online users received: ${JSON.stringify(users)}`);
});

socket1.on('disconnect', (reason) => {
  socket1Connected = false;
  console.log(`[User 1] Disconnected! Reason: ${reason}`);
});

socket1.on('connect_error', (error) => {
  console.error(`[User 1] Connection error: ${error.message}`);
});

socket1.on('error', (error) => {
  console.error(`[User 1] Socket error: ${error}`);
});

// Socket 2 event handlers
socket2.on('connect', () => {
  socket2Connected = true;
  console.log(`[User 2] Connected! Socket ID: ${socket2.id}`);
});

socket2.on('getOnlineUsers', (users) => {
  console.log(`[User 2] Online users received: ${JSON.stringify(users)}`);
});

socket2.on('disconnect', (reason) => {
  socket2Connected = false;
  console.log(`[User 2] Disconnected! Reason: ${reason}`);
});

socket2.on('connect_error', (error) => {
  console.error(`[User 2] Connection error: ${error.message}`);
});

socket2.on('error', (error) => {
  console.error(`[User 2] Socket error: ${error}`);
});

// Wait for both connections and check status
setTimeout(() => {
  console.log('\n[TEST] Checking connection status...');
  console.log(`[User 1] Connected: ${socket1Connected}`);
  console.log(`[User 2] Connected: ${socket2Connected}`);
  
  if (socket1Connected && socket2Connected) {
    console.log('[TEST RESULT] ✓ Both users successfully connected via Socket.io');
    console.log('[TEST] Closing connections...');
    socket1.disconnect();
    socket2.disconnect();
    setTimeout(() => {
      console.log('[INFO] Test completed');
      process.exit(0);
    }, 500);
  } else {
    console.log('[TEST RESULT] ✗ Connection failed');
    if (!socket1Connected) console.log('  - User 1 failed to connect');
    if (!socket2Connected) console.log('  - User 2 failed to connect');
    socket1.disconnect();
    socket2.disconnect();
    setTimeout(() => {
      process.exit(1);
    }, 500);
  }
}, 3000);
