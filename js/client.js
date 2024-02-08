let ws;

let serverMessages = document.getElementById("serverMessages");

function connect() {
    const serverAddress = document.getElementById("serverAddress").value;
    serverMessages.value = "Connecting to server";
    ws = new WebSocket(`ws://${serverAddress}`);

    ws.onopen = function() {
        serverMessages.value = "Connected to server";
    };

    ws.onmessage = function(event) {
        serverMessages.value = event.data;
    };
}

function sendMessage(command) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        serverMessages.value = "";
        ws.send(command);
    } else {
        serverMessages.value = "WebSocket connection is not open";
    }
}

const buttonContainer = document.getElementById('buttonContainer');

function moveButtonLeft(selectedButton) {
    console.log('selectedButton: ', selectedButton);
    if (selectedButton && selectedButton.previousElementSibling) {
        buttonContainer.insertBefore(selectedButton, selectedButton.previousElementSibling);
    }
}

function moveButtonRight(selectedButton) {
    if (selectedButton && selectedButton.nextElementSibling) {
        buttonContainer.insertBefore(selectedButton.nextElementSibling, selectedButton);
    }
}

function handleContextMenu(event) {
    event.preventDefault(); 

    console.log('event: ', event.target.getAttribute('data-cmd'));

    
    const cmd = event.target.getAttribute('data-cmd');
    const icon = event.target.getAttribute('data-icon');
    const name = event.target.getAttribute('name');

    const selectedButton = event.target;

    // Create the left and right buttons
    const leftButton = document.createElement('button');
    leftButton.textContent = 'Left';
    leftButton.className = 'button';
    leftButton.addEventListener('click', () => moveButtonLeft(selectedButton));

    const rightButton = document.createElement('button');
    rightButton.textContent = 'Right';
    rightButton.className = 'button';
    rightButton.addEventListener('click', () => moveButtonRight(selectedButton));

    // Update content in the info div
    const infoDiv = document.getElementById('button-info');
    infoDiv.innerHTML = `
        <div class="box">
            <h3 class="h3">Button Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Icon:</strong> ${icon}</p>
            <p><strong>Command:</strong> ${cmd}</p>
        </div>
    `;

    infoDiv.appendChild(leftButton);
    infoDiv.appendChild(rightButton);
}

const controlsDiv = document.querySelector('.controls');
const buttons = controlsDiv.querySelectorAll('button');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        console.log(button.getAttribute('data-cmd'));
        sendMessage(button.getAttribute('data-cmd'));
    });
});

function getButtonsFromPage() {
    const controlsDiv = document.querySelector('.controls');
    const buttons = [];
    controlsDiv.querySelectorAll('button').forEach(buttonElement => {
        const button = {
            name: buttonElement.getAttribute('name'),
            icon: buttonElement.getAttribute('data-icon'), // Assuming the icon class is the fourth class
            command: buttonElement.getAttribute('data-cmd')
        };
        buttons.push(button);
    });
    return buttons;
}

// Function to set buttons array to the div.controls in the page
function setButtonsToPage(buttons) {
    const controlsDiv = document.querySelector('.controls');
    controlsDiv.innerHTML = ''; // Clear existing buttons
    buttons.forEach(button => {
        const buttonElement = document.createElement('button');
        buttonElement.setAttribute('name', button.name);
        buttonElement.classList.add('button', 'is-info', 'is-large', 'column', button.icon);
        buttonElement.setAttribute('data-command', button.command);
        controlsDiv.appendChild(buttonElement);
    });
}

function saveButtonsToLocalStorage(buttons) {
    localStorage.setItem('buttons', JSON.stringify(buttons));
}

function loadButtonsFromLocalStorage() {
    const buttonsJSON = localStorage.getItem('buttons');
    return JSON.parse(buttonsJSON) || [];
}

document.querySelector('.read-button').addEventListener('click', function() {
    const buttons = getButtonsFromPage();
    console.log('Buttons:', buttons);
});

document.querySelector('.write-button').addEventListener('click', function() {
    const buttons = getButtonsFromPage();
    saveButtonsToLocalStorage(buttons);
    console.log('Buttons saved to localStorage.');
});

// // Load buttons from localStorage and display them on page
// window.addEventListener('DOMContentLoaded', function() {
//     const buttons = loadButtonsFromLocalStorage();
//     setButtonsToPage(buttons);
// });
