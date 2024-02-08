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
        // let cmd = "smplayer -send-action " + command;
        ws.send(command);
    } else {
        alert("WebSocket connection is not open");
    }
}

// Select the div containing the buttons
const controlsDiv = document.querySelector('.controls');

// Select all buttons within the controls div
const buttons = controlsDiv.querySelectorAll('button');

// Add click event listener to each button
buttons.forEach(button => {
    button.addEventListener('click', () => {
        console.log(button.getAttribute('data-cmd'));
        sendMessage(button.getAttribute('data-cmd'));
    });
});


// Function to get buttons array from the div.controls in the page
function getButtonsFromPage() {
    const controlsDiv = document.querySelector('.controls');
    const buttons = [];
    controlsDiv.querySelectorAll('button').forEach(buttonElement => {
        const button = {
            name: buttonElement.getAttribute('name'),
            icon: buttonElement.classList[3], // Assuming the icon class is the fourth class
            command: buttonElement.getAttribute('data-command')
        };
        buttons.push(button);
    });
    return buttons;
}

// // Function to set buttons array to the div.controls in the page
// function setButtonsToPage(buttons) {
//     const controlsDiv = document.querySelector('.controls');
//     controlsDiv.innerHTML = ''; // Clear existing buttons
//     buttons.forEach(button => {
//         const buttonElement = document.createElement('button');
//         buttonElement.setAttribute('name', button.name);
//         buttonElement.classList.add('button', 'is-info', 'is-large', 'column', button.icon);
//         buttonElement.setAttribute('data-command', button.command);
//         controlsDiv.appendChild(buttonElement);
//     });
// }

// // Function to save buttons array to localStorage
// function saveButtonsToLocalStorage(buttons) {
//     localStorage.setItem('buttons', JSON.stringify(buttons));
// }

// // Function to retrieve buttons array from localStorage
// function loadButtonsFromLocalStorage() {
//     const buttonsJSON = localStorage.getItem('buttons');
//     return JSON.parse(buttonsJSON) || [];
// }

// Read buttons from page and display them
document.querySelector('.read-button').addEventListener('click', function() {
    const buttons = getButtonsFromPage();
    console.log('Buttons:', buttons);
});

// // Save buttons from page to localStorage
// document.querySelector('.write-button').addEventListener('click', function() {
//     const buttons = getButtonsFromPage();
//     saveButtonsToLocalStorage(buttons);
//     console.log('Buttons saved to localStorage.');
// });

// // Load buttons from localStorage and display them on page
// window.addEventListener('DOMContentLoaded', function() {
//     const buttons = loadButtonsFromLocalStorage();
//     setButtonsToPage(buttons);
// });
