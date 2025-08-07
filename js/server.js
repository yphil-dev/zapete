const WebSocket = require('isomorphic-ws');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const QRCode = require('qrcode');
const httpServer = require('http-server');

const httpPort = process.env.npm_package_http_port || 8009;
const wsPort = process.env.npm_package_websocket_port || 8008;

const version = process.env.npm_package_version;

const configDir = path.join(os.homedir(), '.config', 'zapete');
const buttonsPath = path.join(configDir, 'buttons.json');
const defaultsPath = path.join(__dirname, '..', 'buttons-defaults.json');

function prettyConfigPath(fullPath) {
  return fullPath.replace(os.homedir(), '~');
}

if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
}

// Initialize config file if it doesn't exist
if (!fs.existsSync(buttonsPath)) {
    fs.copyFileSync(defaultsPath, buttonsPath);
    console.log('Initialized new config file at', buttonsPath);
}

console.log('version: ', version);

const interfaces = os.networkInterfaces();
let hostIP;
let buttons = [];
const imagePath = 'img/zapete-qrcode.png';

const options = {
    cache: -1, // Disable caching
    port: httpPort
};

const wsOptions = {
    port: wsPort
};

const server = httpServer.createServer(options);
server.listen(options.port, () => {
    console.log(`HTTP server started on port ${options.port}`);
});

const wss = new WebSocket.Server(wsOptions);

let isShuttingDown = false;

process.on('SIGINT', () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log('\nShutting down gracefully...');

  // Close WebSocket server first
  wss.clients.forEach(client => client.terminate());
  wss.close(() => {
    console.log('WebSocket server closed');

    // Then close HTTP server
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
});

// Make server start return the prompt by detaching properly
if (require.main === module) {
  process.stdin.resume(); // Keep stdin open to catch SIGINT
}

Object.keys(interfaces).forEach((interfaceName) => {
    interfaces[interfaceName].forEach((interface) => {
        // Skip over loopback and non-IPv4 addresses
        if (!interface.internal && interface.family === 'IPv4') {
            hostIP = interface.address;
        }
    });
});

function closeWebSocketServer() {
    wss.close((error) => {
        if (error) {
            console.error('Error closing WebSocket server:', error);
        } else {
            console.log('WebSocket server closed.');
        }
    });
}

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);

        if (data.type === 'shutdown') {
            console.log('Received shutdown request. Closing WebSocket server...');
            wss.close(() => {
                console.log('WebSocket server closed.');
                server.close(() => {
                    console.log('HTTP server shut down.');
                    process.exit(0);
                });
            });
        } else if (data.type === 'button_update') {
            buttons = data.buttons;
            saveButtonsToServer(ws);
        } else if (data.type === 'button_request') {
            readButtonsFile(ws, buttonsPath); // Updated path
        } else if (data.type === 'button_defaults_request') {
            readButtonsFile(ws, defaultsPath);
        } else {
            executeCommand(data.command.toString(), ws);
        }
    });

    ws.send('Right click / long press a button to edit');
});

function openWithXDG(arg) {

    let toOpen;

    toOpen = (arg.startsWith('http')) ? arg : path.resolve(arg);

    exec('which xdg-open', (err, stdout, stderr) => {
        if (err) {
            console.error('Error checking xdg-open:', err);
            return;
        }
        if (stdout) {

            exec(`xdg-open ${toOpen}`, (err, stdout, stderr) => {
                if (err) {
                    console.error('Error opening with xdg-open:', err);
                    return;
                }
            });
        } else {
            console.error('xdg-open is not available');
        }
    });
}

wss.on('listening', function() {
    console.log(`WebSocket server is listening on ${hostIP}:${wsPort}`);

    QRCode.toFile('img/zapete-qrcode.png', "http://" + hostIP + ":" + httpPort + "?ws=" + wsPort, {
        errorCorrectionLevel: 'H'
    }, function(err) {
        if (err) throw err;
        console.log('QR code saved!');
    });

    openWithXDG("http://localhost:" + httpPort + "?ws=" + wsPort);
    openWithXDG(imagePath);
});

wss.on('error', function error(err) {
    console.error('WebSocket server error:', err);
});

function executeCommand(command, ws) {
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
        console.log('stdout: ', stdout);
        return;
    });
}

function readButtonsFile(ws, fileName) {

    fs.readFile(fileName, 'utf8', (err, data) => {
        if (!err) {
            let buttons = [];
            try {
                buttons = JSON.parse(data);
                if (Array.isArray(buttons) && buttons.length > 0) {
                    sendButtonsToClient(ws, fileName);
                    return;
                } else {
                    console.error('Buttons file is empty or not an array.');
                }
            } catch (parseError) {
                console.error('Error parsing buttons file:', parseError);
            }
        }
        sendButtonsToClient(ws, 'buttons-defaults.json');
    });
}

function sendButtonsToClient(ws, fileName) {
    fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
            console.error('Error loading buttons from file:', err);
            return;
        }
        ws.send(data);
    });
}

function saveButtonsToServer(ws) {
    const jsonData = JSON.stringify(buttons, null, 4);
    fs.writeFile(buttonsPath, jsonData, 'utf8', (err) => {
        if (err) {
            ws.send('Error saving buttons to server:' + err);
            console.error('Error saving buttons to server:', err);
        } else {
            ws.send(`Buttons saved to ${prettyConfigPath(buttonsPath)}`);
            console.log('Buttons saved to', prettyConfigPath(buttonsPath));
        }
    });
}
