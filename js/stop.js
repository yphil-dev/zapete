const http = require('http');
const WebSocket = require('isomorphic-ws');

const wsPort = process.env.npm_package_websocket_port || 8008;

const ws = new WebSocket('ws://localhost:' + wsPort);

ws.on('open', () => {
  ws.send(JSON.stringify({ type: 'shutdown' }));
});
