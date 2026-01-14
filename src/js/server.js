const WebSocket = require('isomorphic-ws');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const QRCode = require('qrcode');
const httpServer = require('http-server');

const httpPort = process.env.npm_package_http_port || 8009;
const wsPort = process.env.npm_package_config_websocket_port || 8008;

const configDir = path.join(os.homedir(), '.config', 'zapete');
const buttonsPath = path.join(configDir, 'buttons.json');
const defaultsPath = path.join(__dirname, '..', 'buttons-defaults.json');

function prettyConfigPath(fullPath) {
  return fullPath.replace(os.homedir(), '~');
}

if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
}

if (!fs.existsSync(buttonsPath)) {
    fs.copyFileSync(defaultsPath, buttonsPath);
    console.log('Initialized new config file at', buttonsPath);
}

console.log('Zapete version: ', process.env.npm_package_version);

const interfaces = os.networkInterfaces();
let hostIP;
let buttons = [];

const options = {
    cache: -1, // Disable
    port: httpPort
};

const wsOptions = {
    port: wsPort
};

// Check if port is available before starting server
function checkPort(port) {
    return new Promise((resolve) => {
        const net = require('net');
        const server = net.createServer();

        server.listen(port, '127.0.0.1', () => {
            server.close();
            resolve(true); // Port available
        });

        server.on('error', () => resolve(false)); // Port in use
    });
}

// Show system notification
function showNotification(title, message) {
    exec(`notify-send "${title}" "${message}"`, (err) => {
        if (err) {
            // Fallback to zenity dialog
            exec(`zenity --info --title="${title}" --text="${message}"`, (err2) => {
                if (err2) {
                    // Last resort: console message
                    console.log(`🔔 ${title}: ${message}`);
                }
            });
        }
    });
}

// Check port availability before starting
checkPort(httpPort).then(async (portAvailable) => {
    if (!portAvailable) {
        console.log(`Port ${httpPort} is already in use - Zapete may already be running`);
        showNotification(
            "Zapete Already Running",
            "Opening existing Zapete instance in browser..."
        );

        // Open browser to existing instance
        openWithXDG(`http://localhost:${httpPort}`);

        // Give time for notification and browser to complete
        setTimeout(() => process.exit(0), 1000);
        return;
    }

    // Port is available, start the servers
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
        } else if (data.type === 'mouse_command') {
            handleMouseCommand(data, ws);
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

    QRCode.toFile('src/img/zapete-qrcode.png', "http://" + hostIP + ":" + httpPort + "?ws=" + wsPort, {
        errorCorrectionLevel: 'H'
    }, function(err) {
        if (err) console.log("err: ", err);
        console.log('QR code saved!');
    });

    openWithXDG("http://localhost:" + httpPort + "?ws=" + wsPort + "/#settings");
    // openWithXDG(imagePath);
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

function handleMouseCommand(data, ws) {
    let command = '';

    switch (data.mouseAction) {
        case 'click':
            // Map button names to xdotool button numbers
            const buttonNum = data.mouseButton === 'left' ? 1 : 3;
            command = `xdotool mousedown ${buttonNum}`;
            break;
        case 'move':
            // Use relative movement with gentle scaling
            const dx = Math.round(data.dx * 1.2); // Gentle scaling for better control
            const dy = Math.round(data.dy * 1.2);
            // Always use -- separator to handle negative coordinates properly
            if (dx !== 0 || dy !== 0) {
                command = `xdotool mousemove_relative -- ${dx} ${dy}`;
            }
            break;
        case 'release':
            // Map button names to xdotool button numbers
            const releaseButtonNum = data.mouseButton === 'left' ? 1 : 3;
            command = `xdotool mouseup ${releaseButtonNum}`;
            break;
        default:
            console.error('Unknown mouse action:', data.mouseAction);
            return;
    }

    if (command) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing mouse command: ${error}`);
            }
            if (stderr) {
                console.error(`Mouse command stderr: ${stderr}`);
            }
        });
    }
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

}); // Close the checkPort().then() callback
