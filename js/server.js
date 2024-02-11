const WebSocket = require('isomorphic-ws');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const QRCode = require('qrcode');
const httpServer = require('http-server');

const port = "8008";

const httpPort = process.env.npm_package_http_port || 8009;
const wsPort = process.env.npm_package_websocket_port || 8008;

const interfaces = os.networkInterfaces();
let hostIP;
let buttons = [];
const imagePath = 'img/zapete-qrcode.png';

// Configure options for the HTTP server
const options = {
    cache: -1, // Disable caching
    port: httpPort
};

const wsOptions = {
    port: wsPort
};

// Start the HTTP server
const server = httpServer.createServer(options);
server.listen(options.port, () => {
    console.log(`HTTP server started on port ${options.port}`);
});

// Handle SIGINT signal (Ctrl+C)
// process.on('SIGINT', () => {
//     console.log('Shutting down HTTP server...');
//     server.close(() => {
//         console.log('HTTP server shut down.');
//         process.exit(0);
//     });
// });

// Iterate over network interfaces to find the local IP address
Object.keys(interfaces).forEach((interfaceName) => {
    interfaces[interfaceName].forEach((interface) => {
        // Skip over loopback and non-IPv4 addresses
        if (!interface.internal && interface.family === 'IPv4') {
            hostIP = interface.address;
        }
    });
});

const wss = new WebSocket.Server(wsOptions);

wss.on('connection', function connection(ws) {
    console.log('Client connected');
    // ws.send(JSON.stringify(buttons));

    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);
        console.log('Received message:', data);

        // Check if the message is a shutdown request
        if (data.type === 'shutdown') {
            console.log('Received shutdown request. Closing WebSocket server...');
            wss.close(() => {
                console.log('WebSocket server closed.');
                process.exit(0); // Exit the process after closing the WebSocket server
                server.close(() => {
                    console.log('HTTP server shut down.');
                    process.exit(0); // Exit the process after closing the servers
                });
            });
        } else if (data.type === 'button_update') {
            buttons = data.buttons;
            saveButtonsToServer(ws);
        } else if (data.type === 'button_request') {
            readButtonsFile(ws, 'buttons.json');
        } else if (data.type === 'button_defaults_request') {
            console.log('got it');
            readButtonsFile(ws, 'buttons-defaults.json');
        } else {
            executeCommand(data.command.toString(), ws); 
        }
    });
    
    ws.send('Hello, client!');
    
});

function openWithXDG(arg) {
    exec('which xdg-open', (err, stdout, stderr) => {
        if (err) {
            console.error('Error checking xdg-open:', err);
            return;
        }
        if (stdout) {

            let toOpen;
            
            try {
                toOpen = path.resolve(arg);
            } catch (err) {
                toOpen = "http://" + arg;
            } 
            
            // const argAbs = path.resolve(arg) || arg;
            exec(`xdg-open ${toOpen}`, (err, stdout, stderr) => {
                if (err) {
                    console.error('Error opening image with xdg-open:', err);
                    return;
                }
            });
        } else {
            console.error('xdg-open is not available');
        }
    });
}

wss.on('listening', function() {
    console.log(`WebSocket server is listening on ${hostIP}:${port}`);

    QRCode.toFile('img/zapete-qrcode.png', hostIP + ":" + port, {
        errorCorrectionLevel: 'H'
    }, function(err) {
        if (err) throw err;
        console.log('QR code saved!');
    });

    // openWithXDG(hostIP + ":8009");
    // openWithXDG(imagePath);
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

function readButtonsFile(ws) {
    let customFileName = 'buttons.json';
    let defaultFileName = 'buttons-defaults.json';

    fs.readFile(customFileName, 'utf8', (err, data) => {
        if (!err) {
            let buttons = [];
            try {
                buttons = JSON.parse(data);
                if (Array.isArray(buttons) && buttons.length > 0) {
                    sendButtonsToClient(ws, customFileName);
                    return;
                } else {
                    console.error('Custom buttons file is empty or not an array.');
                }
            } catch (parseError) {
                console.error('Error parsing custom buttons file:', parseError);
            }
        }

        // If custom file doesn't exist or is invalid, fallback to defaults
        sendButtonsToClient(ws, defaultFileName);
    });
}

function sendButtonsToClient(ws, fileName) {
    fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
            console.error('Error loading buttons from file:', err);
            return;
        }

        // Send the file contents to the client
        ws.send(data);
        console.log('File contents sent:', fileName);
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
