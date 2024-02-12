let ws;
const serverMessages = document.getElementById("serverMessages");
const buttonContainer = document.getElementById('buttonContainer');
const buttonInfocontainer = document.getElementById('buttonInfoContainer');
const serverAddressInput = document.getElementById("serverAddressInput");

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

function handleContextMenu(event) {
    event.preventDefault();

    callerButton = event.target;

    const selectedButton = event.target;

    const command = selectedButton.getAttribute('data-command');
    const icon = selectedButton.getAttribute('data-icon');
    const color = selectedButton.getAttribute('data-color');
    const name = selectedButton.getAttribute('data-name');

    // Create the div container for button information
    const infoArticle = document.createElement('article');
    infoArticle.classList.add('message');
    // infoArticle.classList.add('is-fullwidth');
    // infoArticle.classList.add('is-full');
    infoArticle.innerHTML = `

  <div class="message-header">
    <p>Edit Button</p>
    <button class="delete" aria-label="delete"></button>
  </div>
  <div class="message-body">
<form id="serverForm" onsubmit="editButton(event); return false;">
    
    <div class="field">
        <label class="label">Name</label>
        <div class="control">
            <input class="input button-name" type="text" placeholder="e.g. Play / Pause">
        </div>
        <p class="help help-name is-danger"></p>
    </div>

    <div class="field">
        <label class="label">Command</label>
        <div class="control">
            <input class="input button-command" type="text" placeholder="e.g. ls /">
        </div>
        <p class="help help-command is-danger"></p>
    </div>

    <div class="field">
        <label class="label">Icon</label>
        <div class="control select is-primary">
            <select id="iconSelect"></select>
        </div>
    </div>

    <div class="field">
        <label class="label">Color</label>
        <div class="control select">
            <select id="colorSelect">
                <option value="is-none" class="is-none">none</option>
                <option value="is-primary" class="is-primary">primary</option>
                <option value="is-link" class="is-link">link</option>
                <option value="is-info" class="is-info">info</option>
                <option value="is-success" class="is-success">success</option>
                <option value="is-warning" class="is-warning">warning</option>
                <option value="is-danger" class="is-danger">danger</option>
            </select>
        </div>
    </div>

    <div class="field">
        <label class="label">Position</label>
        <div class="field is-grouped">
            <div class="control">
                <a class="button left">
                    Left
                </a>
            </div>
            <div class="control">
                <a class="button right">
                    Right
                </a>
            </div>
        </div>
    </div>

    <div class="field is-grouped">
        <p class="control">
            <button class="button" type="submit">
                Submit
            </button>
        </p>
        <p class="control">
            <a class="button cancel">
                Cancel
            </a>
        </p>
    </div>

</form>

  </div>
    `;
        
    buttonInfocontainer.innerHTML = ''; 
    buttonInfocontainer.appendChild(infoArticle);

    infoArticle.querySelector('.cancel').addEventListener('click', () => buttonInfocontainer.innerHTML = '');
    infoArticle.querySelector('.delete').addEventListener('click', () => buttonInfocontainer.innerHTML = '');

    const buttonNameInput = infoArticle.querySelector('.button-name');
    buttonNameInput.value = name;
    // buttonNameInput.setAttribute('data-name', name);
    
    const buttonCommandOption = infoArticle.querySelector('.button-command');
    buttonCommandOption.value = command;
    // buttonCommandOption.setAttribute('data-command', command);

    const colorSelect = document.getElementById('colorSelect');
    colorSelect.value = color;
    colorSelect.selected = true;

    populateIconSelect();
    
    const iconSelect = document.getElementById('iconSelect');
    iconSelect.value = icon;
    iconSelect.selected = true;
       
    // Add event listeners to left and right buttons
    const leftButton = infoArticle.querySelector('.left');
    const rightButton = infoArticle.querySelector('.right');
    leftButton.addEventListener('click', () => moveButtonLeft(selectedButton));
    rightButton.addEventListener('click', () => moveButtonRight(selectedButton));    
}

const buttons = buttonContainer.querySelectorAll('button');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        console.log(button.getAttribute('data-command'));
        sendMessage(button.getAttribute('data-command'));
    });
});

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

    console.log('yoo: ');
    
    buttonContainer.innerHTML = '';

    buttons.forEach(button => {

        const columnElement = document.createElement('div');
        columnElement.classList.add('column');

        const buttonElement = document.createElement('button');
        buttonElement.setAttribute('name', button.name);
        buttonElement.classList.add('button', 'is-large', 'column', 'block', button.color, button.icon);
        if (button.icon === "icon-none") {
            buttonElement.innerHTML = button.name;
        } 
        buttonElement.setAttribute('data-command', button.command);
        buttonElement.setAttribute('data-name', button.name);
        buttonElement.setAttribute('data-color', button.color);
        buttonElement.setAttribute('data-icon', button.icon);
        buttonElement.addEventListener('click', () => {
            sendMessage(button.command);
        });

        buttonElement.setAttribute('oncontextmenu', 'handleContextMenu(event); return false;');
        buttonElement.setAttribute('title', button.name);       

        columnElement.appendChild(buttonElement);

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



