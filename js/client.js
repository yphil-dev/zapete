let ws;

let serverMessages = document.getElementById("serverMessages");

function connect() {
    const serverAddress = document.getElementById("serverAddress").value;
    serverMessages.value = "Connecting to server";
    ws = new WebSocket(`ws://${serverAddress}`);

    ws.onopen = function() {
        serverMessages.value = "Connected to server";
    };

    // ws.onmessage = function(event) {
    //     const buttons = JSON.parse(event.data);
    //     setButtonsToPage(buttons);
    // };

    ws.onmessage = function(event) {
        serverMessages.value = event.data;
    };

}

function sendMessage(command) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        serverMessages.value = "";
        if (command) {
            ws.send(JSON.stringify({ type: 'button_command', command: command }));
        } else {
            ws.send(JSON.stringify({ type: 'button_update', buttons: getButtonsFromPage() }));
        }
    } else {
        serverMessages.value = "WebSocket connection is not open";
    }
}

const buttonContainer = document.getElementById('buttonContainer');

function moveButtonLeft(selectedButton) {
    if (selectedButton && selectedButton.previousElementSibling) {
        buttonContainer.insertBefore(selectedButton, selectedButton.previousElementSibling);
        // sendMessage();
    }
}

function moveButtonRight(selectedButton) {
    if (selectedButton && selectedButton.nextElementSibling) {
        buttonContainer.insertBefore(selectedButton.nextElementSibling, selectedButton);
        // sendMessage();
    }
}

function handleContextMenu(event) {
    event.preventDefault();

    const cmd = event.target.getAttribute('data-cmd');
    const icon = event.target.getAttribute('data-icon');
    const color = event.target.getAttribute('data-color');
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
            <p><strong>Color:</strong> ${color}</p>
            <p><strong>Command:</strong> ${cmd}</p>
            <div class="select is-primary"><select id="iconSelect"></select></div>
        </div>
    `;

    populateIconSelect();
    
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
            icon: buttonElement.getAttribute('data-icon'),
            color: buttonElement.getAttribute('data-color'),
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


document.querySelector('.read-button').addEventListener('click', function() {
    const buttons = getButtonsFromPage();
    console.log('Buttons:', buttons);
});

document.querySelector('.write-button').addEventListener('click', function() {
    const buttons = getButtonsFromPage();
    saveButtonsToLocalStorage(buttons);
    console.log('Buttons saved to localStorage.');
});

function populateIconSelect() {
    const iconNames = [];
    const styleSheets = document.styleSheets;
    Array.from(styleSheets).forEach(styleSheet => {
        const rules = styleSheet.rules || styleSheet.cssRules;
        Array.from(rules).forEach(rule => {
            const selector = rule.selectorText;
            if (selector && selector.startsWith('.icon-')) {
                const match = /\.icon-(.*?):before/.exec(selector);
                if (match && match[1]) {
                    iconNames.push(match[1]);
                }
            }
        });
    });

    const selectMenu = document.getElementById('iconSelect');
    iconNames.forEach(iconName => {
        console.log('iconName: ', iconName);
        const option = document.createElement('option');
        // Remove the colon from the end of the icon name
        const cleanedIconName = iconName.replace(/:$/, '');
        option.textContent = cleanedIconName;
        option.value = cleanedIconName;
        selectMenu.appendChild(option);
    });
}



