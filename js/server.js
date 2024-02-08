const WebSocket = require('isomorphic-ws');
const { exec } = require('child_process');

const wss = new WebSocket.Server({ port: 8008 });

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    ws.on('message', function incoming(message) {
        executeCommand(message.toString());
    });

    ws.send('Hello, client!');
});

wss.on('error', function error(err) {
    console.error('WebSocket server error:', err);
});

function executeCommand(command) {
    console.log('Running command: ', command);
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
