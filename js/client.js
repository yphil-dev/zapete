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
        console.log('event: ', event);
        try {
            const buttons = JSON.parse(event.data);
            console.log('BUTTONS!! ', buttons);
            setButtonsToPage(buttons);
        } catch (err) {
            console.log('err: ', err);
            serverMessages.value = event.data;
        }
    };

}

const defaultButtons = [
    {
        "name": "prev",
        "icon": "icon-pl_prev",
        "color": "is-info",
        "command": "plop"
    },
    {
        "name": "rewind3",
        "icon": "icon-rewind3",
        "color": "is-info",
        "command": "smplayer -send-action rewind3"
    },
    {
        "name": "rewind1",
        "icon": "icon-rewind1",
        "color": "is-info",
        "command": "smplayer -send-action rewind1"
    },
    {
        "name": "play / pause",
        "icon": "icon-pause",
        "color": "is-success",
        "command": "smplayer -send-action pause"
    },
    {
        "name": "forward1",
        "icon": "icon-forward1",
        "color": "is-info",
        "command": "smplayer -send-action forward1"
    },
    {
        "name": "forward3",
        "icon": "icon-forward3",
        "color": "is-info",
        "command": "smplayer -send-action forward3"
    },
    {
        "name": "pl_next",
        "icon": "icon-pl_next",
        "color": "is-info",
        "command": "smplayer -send-action pl_next"
    },
    {
        "name": "Sub -",
        "icon": "none",
        "color": "none",
        "command": "smplayer -send-action dec_sub_step"
    },
    {
        "name": "fullscreen",
        "icon": "icon-fullscreen",
        "color": "none",
        "command": "smplayer -send-action fullscreen"
    },
    {
        "name": "Sub +",
        "icon": "none",
        "color": "none",
        "command": "smplayer -send-action inc_sub_step"
    }
];

function sendMessage(command) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        serverMessages.value = "";
        if (command && command !== "requestButtons") {
            ws.send(JSON.stringify({ type: 'button_command', command: command }));
        } else if (command && command === "requestButtons") {
            ws.send(JSON.stringify({ type: 'button_request' }));
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

function handleContextMenuOld(event) {
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

function handleContextMenu(event) {
    event.preventDefault();

    const cmd = event.target.getAttribute('data-cmd');
    const icon = event.target.getAttribute('data-icon');
    const color = event.target.getAttribute('data-color');
    const name = event.target.getAttribute('name');

    const selectedButton = event.target;

    // Clone the template
    const template = document.getElementById('button-info-template');
    const infoDiv = template.cloneNode(true);
    infoDiv.removeAttribute('id'); // Remove ID to avoid duplication

    infoDiv.style.display = 'block';

    // Populate the cloned template with button information
    infoDiv.querySelector('.button-name').textContent = name;
    infoDiv.querySelector('.button-icon').textContent = icon;
    infoDiv.querySelector('.button-color').textContent = color;
    infoDiv.querySelector('.button-command').textContent = cmd;

    // Populate the select menu
    populateIconSelect();

    // Add event listeners to left and right buttons
    const leftButton = infoDiv.querySelector('.left');
    const rightButton = infoDiv.querySelector('.right');
    leftButton.addEventListener('click', () => moveButtonLeft(selectedButton));
    rightButton.addEventListener('click', () => moveButtonRight(selectedButton));

    // Append the populated template to the infoDiv
    const container = document.getElementById('button-info');
    container.innerHTML = ''; // Clear existing content
    container.appendChild(infoDiv);
}


const buttons = buttonContainer.querySelectorAll('button');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        console.log(button.getAttribute('data-cmd'));
        sendMessage(button.getAttribute('data-cmd'));
    });
});

function getButtonsFromPage() {
    const buttons = [];
    buttonContainer.querySelectorAll('button').forEach(buttonElement => {
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

function plop() {
    console.log('object: ');
}

function setButtonsToPage(buttons) {
    buttonContainer.innerHTML = '';
    buttons.forEach(button => {

        const buttonElement = document.createElement('button');
        buttonElement.setAttribute('name', button.name);
        buttonElement.classList.add('button', 'is-large', 'column', button.color || '');
        if (button.icon !== "none") {
            buttonElement.classList.add(button.icon);
        } else {
            buttonElement.innerHTML = button.name;
        }
        buttonElement.setAttribute('data-cmd', button.command);
        buttonElement.setAttribute('data-color', button.color);
        buttonElement.setAttribute('data-icon', button.icon);
        buttonElement.addEventListener('click', () => {
            console.log("Sending", button.command);
            sendMessage(button.command);
        });

        buttonElement.setAttribute('oncontextmenu', 'handleContextMenu(event); return false;');

        buttonContainer.appendChild(buttonElement);
    });
}

document.querySelector('.load-button').addEventListener('click', function() {
    // const buttons = getButtonsFromPage();
    // console.log('Load Buttons:', buttons);
    // setButtonsToPage(buttons);
    sendMessage('requestButtons');
});

document.querySelector('.save-button').addEventListener('click', function() {
    const buttons = getButtonsFromPage();
    console.log('Save Buttons: ', buttons);
    sendMessage();
    // console.log('Buttons saved to localStorage.');
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
        const option = document.createElement('option');
        // Remove the colon from the end of the icon name
        const cleanedIconName = iconName.replace(/:$/, '');
        option.textContent = cleanedIconName;
        option.value = cleanedIconName;
        selectMenu.appendChild(option);
    });
}



