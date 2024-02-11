const WebSocket = require('isomorphic-ws');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');

const port = "8008";
const interfaces = os.networkInterfaces();
let hostIP;
let buttons = [];

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
    // ws.send(JSON.stringify(buttons));

    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);
        console.log('data: ', data);
        if (data.type === 'button_update') {
            buttons = data.buttons;
            saveButtonsToServer(ws);
        } else if (data.type === 'button_request') {
            sendButtonsToClient(ws, 'buttons.json');
        } else if (data.type === 'button_defaults_request') {
            console.log('godit: ');
            sendButtonsToClient(ws, 'buttons-defaults.json');
        } else {
            executeCommand(data.command.toString(), ws); 
        }
    });
    ws.send('Hello, client!');
});

wss.on('listening', function() {
    console.log(`WebSocket server is listening on ${hostIP}:${port}`);
});

wss.on('error', function error(err) {
    console.error('WebSocket server error:', err);
});

function executeCommand(command, ws) {
    console.log('Running command: ', command);
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            // ws.send(`${error.message}`);
            // return;
        }
        if (stderr) {
            ws.send(`${stderr}`);
            console.error(`Command stderr: ${stderr}`);
        }
        console.log(`Command stdout: ${stdout}`);
        return;
    });
}

function sendButtonsToClient(ws, fileName) {
    fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
            console.error('Error loading buttons from file:', err);
        } else {
            buttons = JSON.parse(data);
            const jsonData = JSON.stringify(buttons); // Convert JSON data to string
            ws.send(jsonData);
            console.log('Buttons loaded from file:', buttons);
        }
    });
}

function saveButtonsToServer(ws) {
    fs.writeFile('buttons.json', JSON.stringify(buttons), 'utf8', (err) => {
        if (err) {
            ws.send('Error saving buttons to server:' + err);
            console.error('Error saving buttons to server:', err);
        } else {
            ws.send('Buttons saved to server');
            console.log('Buttons saved to server');
        }
    });
}

// sendButtonsToClient(); // Load buttons from file when the server starts
