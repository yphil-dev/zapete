const WebSocket = require('isomorphic-ws');
const { exec } = require('child_process');

const wss = new WebSocket.Server({ port: 8008 });

wss.on('connection', function connection(ws) {
  console.log('Client connected');

  ws.on('message', function incoming(message) {
    console.log('Received: %s', message);
    
    // Execute system command based on the received message
    executeCommand(message);
  });

  ws.send('Hello, client!');
});

function executeCommand(command) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
      return;
    }
    console.log(`Command stdout: ${stdout}`);
  });
}
