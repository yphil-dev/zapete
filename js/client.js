let ws;

function connect() {
    const serverAddress = document.getElementById('serverAddress').value;
    console.log('Connecting to server...');
    ws = new WebSocket(`ws://${serverAddress}:8008`);

    ws.onopen = function() {
        console.log('Connected to server');
        alert('Connected to server');
        ws.send('Hello, server!');
    };

    ws.onmessage = function(event) {
        console.log('Received: ' + event.data);
        alert('Received: ' + event.data);
    };
}

function sendMessage(command) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        console.log('Sending command: ' + command);
        ws.send(command);
    } else {
        console.log('WebSocket connection is not open');
    }
}
