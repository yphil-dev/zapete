const WebSocket = require('isomorphic-ws');

const wss = new WebSocket.Server({ port: 8008 });

wss.on('connection', function connection(ws) {
  console.log('Client connected');

  ws.on('message', function incoming(message) {
    console.log('Received: %s', message);
  });

  ws.send('Hello, client!');
});
