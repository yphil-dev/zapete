const WebSocket = require('isomorphic-ws');
const wsPort = process.env.npm_package_websocket_port || 8008;

const ws = new WebSocket(`ws://localhost:${wsPort}`);

ws.on('open', () => {
  ws.send(JSON.stringify({ type: 'shutdown' }));
  setTimeout(() => process.exit(0), 500); // Exit after sending
});

ws.on('error', (err) => {
  console.error('Could not connect to server:', err.message);
  process.exit(1);
});
