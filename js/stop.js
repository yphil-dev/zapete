const http = require('http');
const WebSocket = require('isomorphic-ws');

// Replace '8009' with the port your WebSocket server is running on
const ws = new WebSocket('ws://localhost:8008');

// Send a message to the WebSocket server to initiate shutdown
ws.on('open', () => {
  ws.send(JSON.stringify({ type: 'shutdown' }));
});

// Gracefully close the HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is shutting down...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0); // Exit the process once the server is closed
  });
});
