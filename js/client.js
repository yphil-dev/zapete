function connect() {
    const serverAddress = document.getElementById('serverAddress').value;
    console.log('plop! ');
    ws = new WebSocket(`ws://${serverAddress}:8008`);

    ws.onopen = function() {
        console.log('Connected to server');
        ws.send('Hello, server!');
    };

    ws.onmessage = function(event) {
        console.log('Received: ' + event.data);
    };
}
