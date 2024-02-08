
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('Client connected');

  ws.on('message', function incoming(message) {
    console.log('Received: %s', message);

    // Here, you can interpret the message and control the video player accordingly
    if (message === 'play') {
      // Code to play the video
      console.log('Playing video');
    } else if (message === 'pause') {
      // Code to pause the video
      console.log('Pausing video');
    }
  });
});
