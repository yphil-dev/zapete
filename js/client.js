let ws;
const serverMessages = document.getElementById("serverMessages");
const buttonContainer = document.getElementById("buttonContainer");
const buttonInfocontainer = document.getElementById("buttonInfoContainer");
const serverAddressInput = document.getElementById("serverAddressInput");
const buttons = buttonContainer.querySelectorAll("button");
const refreshButtons = document.getElementById("refreshButtons");
refreshButtons.style.display = "none";

const newButton = document.querySelector("#newButton");
newButton.style.display = "none";
newButton.addEventListener("click", (event) => openButtonForm(event, true));

function parseUrl(elt) {

    const hostname = document.location.hostname;
    const queryString = document.location.search.slice(1);
    const queryParams = new URLSearchParams(queryString);

    if (elt.type === "queryString") {
        return queryParams.get('ws');
    }

    return hostname;
}

const wsValue = parseUrl({type:"queryString"}) || "8008";
const hostname = parseUrl({type:"hostname"});

if (hostname && wsValue) {
    serverAddressInput.value = hostname + ":" + wsValue;
}

console.log('serverAddressInput.value: ', serverAddressInput.value);

serverMessages.value = "Connect to server to see your buttons";

function connect() {
    const serverAddress = serverAddressInput.value;
    serverMessages.value = "Connecting to server";
    ws = new WebSocket(`ws://${serverAddress}`);

    ws.onopen = function() {
        serverMessages.value = "Connected to server";
        newButton.style.display = 'block';
        refreshButtons.style.display = 'block';
        sendMessage('requestButtons');
    };

    ws.onmessage = function(event) {
        try {
            const buttons = JSON.parse(event.data);
            setButtonsToPage(buttons);
        } catch (err) {
            console.log('err: ', err);

            if (event.data === "OK") {
                serverMessages.value = "Right click / long press a button to edit";
            } else {
                serverMessages.value = event.data;
            }
            
        }
    };
}

function sendMessage(command) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        serverMessages.value = "";
        if (command && command !== "requestButtons" && command !== "requestDefaultButtons") {
            ws.send(JSON.stringify({ type: 'button_command', command: command }));
        } else if (command && command === "requestButtons") {
            ws.send(JSON.stringify({ type: 'button_request' }));
        } else if (command && command === "requestDefaultButtons") {
            console.log('yup: ');
            ws.send(JSON.stringify({ type: 'button_defaults_request' }));
        } else {
            ws.send(JSON.stringify({ type: 'button_update', buttons: getButtonsFromPage() }));
        }
    } else {
        serverMessages.value = "WebSocket connection is not open";
    }
}

function moveButtonLeft(selectedButton) {
    if (selectedButton && selectedButton.previousElementSibling) {
        buttonContainer.insertBefore(selectedButton, selectedButton.previousElementSibling);
        sendMessage();
    }
}

function moveButtonRight(selectedButton) {
    if (selectedButton && selectedButton.nextElementSibling) {
        buttonContainer.insertBefore(selectedButton.nextElementSibling, selectedButton);
        sendMessage();
    }
}

let callerButton = null;

function openButtonForm(event, isNew) {
    event.preventDefault();
    
    callerButton = event.target;

    fetch('button-form.html')
        .then(response => response.text())
        .then(html => {
            const buttonForm = document.createElement('article');
            buttonForm.classList.add('message', 'column', 'is-fullwidth');
            buttonForm.innerHTML = html;
            buttonInfocontainer.innerHTML = '';
            buttonInfocontainer.appendChild(buttonForm);

            const command = callerButton.getAttribute('data-command');
            const icon = callerButton.getAttribute('data-icon');
            const color = callerButton.getAttribute('data-color');
            const name = callerButton.getAttribute('data-name');

            const positionButtons = buttonForm.querySelector('#positionButtons');
            positionButtons.style.display = isNew ? 'none' : 'block';

            const formTitle = buttonForm.querySelector('#formTitle');

            const saveButton = buttonForm.querySelector('#saveButton');
            const cancelButton = buttonForm.querySelector('#cancelButton');

            formTitle.textContent = isNew ? "Add button" : "Edit button";
            saveButton.textContent = isNew ? "Add" : "Save";
            cancelButton.textContent = isNew ? "Cancel" : "Delete";
            cancelButton.classList.add(isNew ? 'is-info' : 'is-danger');

            saveButton.addEventListener('click', () => {
                editButton(event, isNew);
                return false;
            });

            if (!isNew) {
                cancelButton.addEventListener('click', () => callerButton.remove());
            }

            const buttonNameInput = buttonForm.querySelector('.button-name');
            buttonNameInput.value = name;
            
            const buttonCommandOption = buttonForm.querySelector('.button-command');
            buttonCommandOption.value = command;

            const colorSelect = document.getElementById('colorSelect');
            colorSelect.value = color || "is-none";
            colorSelect.selected = true;

            populateIconSelect();
            
            const iconSelect = document.getElementById('iconSelect');
            iconSelect.value = icon || "icon-none";
            iconSelect.selected = true;
            
            const leftButton = buttonForm.querySelector('.left');
            const rightButton = buttonForm.querySelector('.right');
            leftButton.addEventListener('click', () => moveButtonLeft(callerButton));
            rightButton.addEventListener('click', () => moveButtonRight(callerButton));    

            buttonForm.querySelector('.cancel').addEventListener('click', () => buttonInfocontainer.innerHTML = '');
            buttonForm.querySelector('.delete').addEventListener('click', () => buttonInfocontainer.innerHTML = '');

        })
        .catch(error => console.error('Error loading template:', error));
}

function editButton(event, isNew) {
    event.preventDefault();
   
    const selectedButton = callerButton;
   
    const buttonNameInput = document.querySelector('.button-name');
    const buttonCommandInput = document.querySelector('.button-command');
    const iconSelect = document.querySelector('#iconSelect');
    const colorSelect = document.querySelector('#colorSelect');
    
    const buttonName = buttonNameInput.value;
    const buttonCommand = buttonCommandInput.value;
    const buttonIcon = iconSelect.value;
    const buttonColor = colorSelect.value;

    document.querySelector('.help').textContent = "";
    
    if (!buttonCommand) {
        document.querySelector('.help-command').textContent = 'Please provide a valid name.';
        return;
    }

    if (!buttonName) {
        document.querySelector('.help-name').textContent = 'Please provide a valid command.';
        return;
    }

    if (isNew) {
        
        makeButton({
            name: buttonName,
            command: buttonCommand,
            icon: buttonIcon,
            color: buttonColor
        });

        buttonInfocontainer.innerHTML = '';
        sendMessage();
        return;
    }
    
    selectedButton.classList.forEach(className => {
        if ((className.startsWith('is-') || className.startsWith('icon-')) && className !== 'is-large') {
            console.log('Removing class:', className);
            selectedButton.classList.remove(className);
        }
    });
    
    selectedButton.textContent = (buttonIcon === "icon-none") ? buttonName : '';

    selectedButton.classList.add(buttonColor, buttonIcon);

    selectedButton.setAttribute('data-name', buttonName);
    selectedButton.setAttribute('data-command', buttonCommand);
    selectedButton.setAttribute('data-color', buttonColor);
    selectedButton.setAttribute('data-icon', buttonIcon);

    selectedButton.setAttribute('title', buttonName);
    sendMessage();
}

function makeButton(buttonData) {
    const buttonElement = document.createElement('button');
    buttonElement.classList.add('button', 'is-large', 'column', 'block', buttonData.color, buttonData.icon);
    buttonElement.innerHTML = (buttonData.icon === "icon-none") ? buttonData.name : "";

    buttonElement.setAttribute('name', buttonData.name);
    buttonElement.setAttribute('data-name', buttonData.name);
    buttonElement.setAttribute('data-command', buttonData.command);
    buttonElement.setAttribute('data-color', buttonData.color);
    buttonElement.setAttribute('data-icon', buttonData.icon);

    buttonElement.setAttribute('oncontextmenu', 'openButtonForm(event, false); return false;');
    buttonElement.setAttribute('title', buttonData.name);       
    
    buttonElement.addEventListener('click', () => {
        buttonInfocontainer.innerHTML = '';
        const command = buttonElement.getAttribute('data-command');
        sendMessage(command);
    });

    buttonContainer.appendChild(buttonElement);
    
}

function getButtonsFromPage() {
    const buttons = [];
    buttonContainer.querySelectorAll('button').forEach(buttonElement => {
        buttons.push({
            name: buttonElement.getAttribute('data-name'),
            icon: buttonElement.getAttribute('data-icon'),
            color: buttonElement.getAttribute('data-color'),
            command: buttonElement.getAttribute('data-command')
        });
    });
    return buttons;
}

function setButtonsToPage(buttons) {
    
    buttonContainer.innerHTML = '';

    buttons.forEach(button => {

        makeButton({
            name: button.name,
            command: button.command,
            icon: button.icon,
            color: button.color
        });
        
    });
}

document.querySelector('.load-button').addEventListener('click', function() {
    sendMessage('requestButtons');
});

document.querySelector('.reset-button').addEventListener('click', function() {
    sendMessage('requestDefaultButtons');
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
                    const cleanedIconName = match[1].replace(/:$/, '');
                    iconNames.push(cleanedIconName);
                }
            }
        });
    });

    const selectMenu = document.getElementById('iconSelect');
    const optionNone = document.createElement('option');
    optionNone.textContent = "none";
    optionNone.value = "icon-none";
    optionNone.classList.add("icon-none");
    selectMenu.appendChild(optionNone);
    iconNames.forEach(iconName => {
        const option = document.createElement('option');
        option.textContent = iconName;
        option.value = "icon-" + iconName;
        selectMenu.appendChild(option);
    });
}

