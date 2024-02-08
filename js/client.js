let ws;

function connect() {
    const serverAddress = document.getElementById("serverAddress").value;
    const serverMessages = document.getElementById("serverMessages");
    console.log("Connecting to server...");
    ws = new WebSocket(`ws://${serverAddress}:8008`);

    ws.onopen = function() {
        console.log("Connected to server");
        // alert("Connected to server");
        serverMessages.value = "Connected to server";
    };

    ws.onmessage = function(event) {
        console.log("Received: " + event.data);
    };
}

function handleContextMenu(event, command) {
    event.preventDefault(); // Prevent the default context menu from appearing
    // Handle the context menu action (e.g., sending a message)
    alert(`Right-click or long-press detected for command: ${command}`);
    // sendMessage(command);
}

function sendMessage(command) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        let cmd = "smplayer -send-action " + command;
        ws.send(cmd);
    } else {
        alert("WebSocket connection is not open");
    }
}
