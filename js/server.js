const WebSocket = require('isomorphic-ws');
const { exec } = require('child_process');
const os = require('os');

const port = "8008";
const interfaces = os.networkInterfaces();
let hostIP;

// Iterate over network interfaces to find the local IP address
Object.keys(interfaces).forEach((interfaceName) => {
    interfaces[interfaceName].forEach((interface) => {
        // Skip over loopback and non-IPv4 addresses
        if (!interface.internal && interface.family === 'IPv4') {
            hostIP = interface.address;
        }
    });
});

const wss = new WebSocket.Server({ port });

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    ws.on('message', function incoming(message) {
        executeCommand(message.toString());
    });

    ws.send('Hello, client!');
});

wss.on('listening', function() {
    console.log(`WebSocket server is listening on ${hostIP}:${port}`);
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
