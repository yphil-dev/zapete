let ws;
const serverMessages = document.getElementById("serverMessages");
const buttonContainer = document.getElementById('buttonContainer');
const buttonInfocontainer = document.getElementById('buttonInfoContainer');
const serverAddressInput = document.getElementById("serverAddressInput");
const buttons = buttonContainer.querySelectorAll('button');

const newButton = document.querySelector('#newButton');
newButton.addEventListener('click', (event) => openButtonForm(event, true));

function parseUrl(elt) {

    const hostname = document.location.hostname;
    const queryString = document.location.search.slice(1);
    const queryParams = new URLSearchParams(queryString);

    if (elt.type === "queryString") {
        return queryParams.get('ws');
    }

    return hostname;
}

const wsValue = parseUrl({type:"queryString"});
const hostname = parseUrl({type:"hostname"});

if (hostname && wsValue) {
    serverAddressInput.value = hostname + ":" + wsValue;
}

serverMessages.value = "Connect to server to see your buttons";

function connect() {
    const serverAddress = serverAddressInput.value;
    serverMessages.value = "Connecting to server";
    ws = new WebSocket(`ws://${serverAddress}`);

    ws.onopen = function() {
        serverMessages.value = "Connected to server";
        newButton.style.display = 'block';
        sendMessage('requestButtons');
    };

    ws.onmessage = function(event) {
        try {
            const buttons = JSON.parse(event.data);
            setButtonsToPage(buttons);
        } catch (err) {
            console.log('err: ', err);
            serverMessages.value = event.data;
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
        // sendMessage();
    }
}

function moveButtonRight(selectedButton) {
    if (selectedButton && selectedButton.nextElementSibling) {
        buttonContainer.insertBefore(selectedButton.nextElementSibling, selectedButton);
        // sendMessage();
    }
}

let callerButton = null;

function openButtonForm(event, isNew) {
    event.preventDefault();
    
    callerButton = event.target;

    fetch('button-form.html')
        .then(response => response.text())
        .then(html => {
            const infoArticle = document.createElement('article');
            infoArticle.classList.add('message');
            infoArticle.innerHTML = html;

            const command = callerButton.getAttribute('data-command');
            const icon = callerButton.getAttribute('data-icon');
            const color = callerButton.getAttribute('data-color');
            const name = callerButton.getAttribute('data-name');

            buttonInfocontainer.innerHTML = '';
            buttonInfocontainer.appendChild(infoArticle);

            const formTitle = infoArticle.querySelector('#formTitle');
            // formTitle.textContent = "Edit button";

            formTitle.textContent = isNew ? "New button" : "Edit button";
            
            if (isNew) {
                console.log('isNew: ', isNew);
            } else {
                console.log('NOPE isNew: ', isNew);
            }

            const buttonNameInput = infoArticle.querySelector('.button-name');
            buttonNameInput.value = name;
            
            const buttonCommandOption = infoArticle.querySelector('.button-command');
            buttonCommandOption.value = command;

            const colorSelect = document.getElementById('colorSelect');
            colorSelect.value = color;
            colorSelect.selected = true;

            populateIconSelect();
            
            const iconSelect = document.getElementById('iconSelect');
            iconSelect.value = icon;
            iconSelect.selected = true;
            
            const leftButton = infoArticle.querySelector('.left');
            const rightButton = infoArticle.querySelector('.right');
            leftButton.addEventListener('click', () => moveButtonLeft(callerButton));
            rightButton.addEventListener('click', () => moveButtonRight(callerButton));    

            infoArticle.querySelector('.cancel').addEventListener('click', () => buttonInfocontainer.innerHTML = '');
            infoArticle.querySelector('.delete').addEventListener('click', () => buttonInfocontainer.innerHTML = '');

        })
        .catch(error => console.error('Error loading template:', error));
}

function getButtonsFromPage() {
    const buttons = [];
    buttonContainer.querySelectorAll('button').forEach(buttonElement => {
        const button = {
            name: buttonElement.getAttribute('data-name'),
            icon: buttonElement.getAttribute('data-icon'),
            color: buttonElement.getAttribute('data-color'),
            command: buttonElement.getAttribute('data-command')
        };
        buttons.push(button);
    });
    return buttons;
}

function editButton(event) {
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
    
    selectedButton.classList.forEach(className => {
        if ((className.startsWith('is-') || className.startsWith('icon-')) && className !== 'is-large') {
            console.log('Removing class:', className);
            selectedButton.classList.remove(className);
        }
    });
    
    selectedButton.textContent = (buttonIcon === "icon-none") ? buttonName : '';

    selectedButton.classList.add(buttonColor);
    selectedButton.classList.add(buttonIcon);

    selectedButton.setAttribute('data-name', buttonName);
    selectedButton.setAttribute('data-command', buttonCommand);
    selectedButton.setAttribute('data-icon', buttonIcon);
    selectedButton.setAttribute('data-color', buttonColor);

    selectedButton.setAttribute('title', buttonName);

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

    buttonElement.addEventListener('click', () => sendMessage(buttonData.command));

    buttonContainer.appendChild(buttonElement);
    
}

document.querySelector('.load-button').addEventListener('click', function() {
    sendMessage('requestButtons');
});

document.querySelector('.save-button').addEventListener('click', function() {
    const buttons = getButtonsFromPage();
    console.log('Save Buttons: ', buttons);
    sendMessage();
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



