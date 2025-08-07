const serverMessages = document.getElementById("serverMessages");
const buttonContainer = document.getElementById("buttonContainer");
const buttonInfocontainer = document.getElementById("buttonInfoContainer");
const serverAddressInput = document.getElementById("serverAddressInput");
const buttons = buttonContainer.querySelectorAll("button");
const refreshButtons = document.getElementById("refreshButtons");
const addButton = document.querySelector("#addButton");
let ws;
let callerButton = null;
const resetButton = document.querySelector('#resetButton');

refreshButtons.style.display = "none";
resetButton.style.display = "none";

addButton.style.display = "none";
addButton.addEventListener("click", (event) => openButtonForm(event, true));

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

serverMessages.value = "Connect to server to see your buttons";

function connect() {
    return new Promise((resolve, reject) => {
        const serverAddress = serverAddressInput.value;
        serverMessages.value = "Connecting to server";
        ws = new WebSocket(`ws://${serverAddress}`);

        ws.onopen = function() {
            serverMessages.value = "Connected to server";
            addButton.style.display = 'block';
            refreshButtons.style.display = 'block';
            resetButton.style.display = 'block';
            refreshButtons.addEventListener('click', function() {
                messageServer({type: 'button_request'});
            });
            messageServer({type: 'button_request'});

            resolve();
        };

        ws.onerror = function(error) {
            reject(error);
        };

        ws.onmessage = function(event) {
            try {
                const buttons = JSON.parse(event.data); // If the server response parses, it's the buttons
                setButtonsToPage(buttons);
            } catch (err) {
                serverMessages.value = event.data;
            }
        };
    });
}

function closeConnection() {
    if (ws) {
        ws.close();
        serverMessages.value = "Connection to server closed";
    }
}

function messageServer(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        sendMessage(message);
    } else {
        connect().then(() => {
            serverMessages.value = "Connection to server not open";
            messageServer(message);
        });
    }
}

function sendMessage(message) {
    serverMessages.value = '';
    ws.send(JSON.stringify({
        type: message.type,
        command: message.type === 'button_command' ? message.command : '',
        buttons: message.type === 'button_update' ? getButtonsFromPage() : ''
    }));
}

function moveButtonLeft(selectedButton) {
    if (selectedButton && selectedButton.previousElementSibling) {
        buttonContainer.insertBefore(selectedButton, selectedButton.previousElementSibling);
        messageServer({type: 'button_update'});
    }
}

function moveButtonRight(selectedButton) {
    if (selectedButton && selectedButton.nextElementSibling) {
        buttonContainer.insertBefore(selectedButton.nextElementSibling, selectedButton);
        messageServer({type: 'button_update'});
    }
}

function openButtonForm(event, isNew) {
    event.preventDefault();

    callerButton = event.target;

    fetch('button-form.html')
        .then(response => response.text())
        .then(html => {
            const buttonForm = document.createElement('article');

            buttonForm.classList.add('message', 'is-fullwidth');
            buttonForm.innerHTML = html;
            buttonInfocontainer.innerHTML = '';
            buttonInfocontainer.appendChild(buttonForm);

            initColorPicker();
            populateIconGrid();

            const name = callerButton.getAttribute('data-name');
            const command = callerButton.getAttribute('data-command');
            const icon = callerButton.getAttribute('data-icon');
            const hexColor = callerButton.getAttribute('data-hexcolor');

            buttonForm.querySelectorAll('.positionButton').forEach(button => {
                button.style.display = isNew ? 'none' : 'block';
            });

            const formTitle = buttonForm.querySelector('#formTitle');
            const saveButton = buttonForm.querySelector('#saveButton');
            const cancelButton = buttonForm.querySelector('#cancelButton');
            const buttonNameInput = buttonForm.querySelector('.button-name');
            const buttonCommandOption = buttonForm.querySelector('.button-command');
            const leftButton = buttonForm.querySelector('.left');
            const rightButton = buttonForm.querySelector('.right');

            formTitle.textContent = isNew ? "Add button" : "Edit button";
            saveButton.textContent = isNew ? "Add" : "Save";
            cancelButton.textContent = isNew ? "Cancel" : "Delete";
            cancelButton.classList.add(isNew ? 'is-info' : 'is-danger');

            saveButton.addEventListener('click', () => {
                editButton(event, isNew);
                return false;
            });

            if (!isNew) {
                cancelButton.addEventListener('click', () => {
                    if (window.confirm("Are you sure? This can't be undone")) {
                        callerButton.remove();
                        messageServer({type: 'button_update'});
                    }
                });
            }

            buttonNameInput.value = name;
            buttonCommandOption.value = command;

            setTimeout(() => {
                const selectedIcon = icon || "icon-none";
                const iconButton = buttonForm.querySelector(`.icon-option[data-icon="${selectedIcon}"]`);
                if (iconButton) {
                    iconButton.classList.add('selected');
                }
            }, 100);

            setTimeout(() => {
                const selectedColor = hexColor || "none";
                const colorButton = buttonForm.querySelector(`.color-option[data-color="${selectedColor}"]`);
                if (colorButton) {
                    colorButton.classList.add('selected');
                }
            }, 100);

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

    const buttonName = buttonNameInput.value;
    const buttonCommand = buttonCommandInput.value;

    function getSelectedItem(itemType) {
        const selectedOption = document.querySelector(`#${itemType}Grid .selected`);
        if (!selectedOption) return null;
        return selectedOption.dataset[itemType] === 'none'
            ? 'none'
            : selectedOption.dataset[itemType];
    }

    const hexColor = getSelectedItem('color');
    const buttonIcon = getSelectedItem('icon');

    document.querySelector('.help').textContent = "";

    if (!buttonCommand) {
        document.querySelector('.help-command').textContent = 'Please provide a valid command name.';
        return;
    }

    if (!buttonName) {
        document.querySelector('.help-name').textContent = 'Please provide a valid name.';
        return;
    }

    if (isNew) {
        makeButton({
            name: buttonName,
            command: buttonCommand,
            icon: buttonIcon,
            hexcolor: hexColor
        });

        buttonInfocontainer.innerHTML = '';
        messageServer({type: 'button_update'});
        return;
    }

    let classesToRemove = [];
    const classesToKeep = ['is-large'];

    selectedButton.classList.forEach(className => {
        if ((/^is-|^icon-/).test(className) && !classesToKeep.includes(className)) {
            classesToRemove.push(className);
        }
    });

    classesToRemove.forEach(className => selectedButton.classList.remove(className));

    selectedButton.textContent = (buttonIcon === "icon-none") ? buttonName : '';

    // Add the selected classes
    // selectedButton.classList.add(buttonColor);
    if (buttonIcon !== "icon-none") {
        selectedButton.classList.add(buttonIcon);
    }

    // Update data attributes
    selectedButton.setAttribute('data-name', buttonName);
    selectedButton.setAttribute('data-command', buttonCommand);
    selectedButton.setAttribute('data-icon', buttonIcon);
    selectedButton.setAttribute('data-hexcolor', hexColor);

    if (hexColor !== 'none') {
        selectedButton.style.backgroundColor = hexColor;
    } else {
        selectedButton.style.removeProperty('background-color');
    }

    selectedButton.setAttribute('title', buttonName);
    messageServer({type: 'button_update'});
}

function makeButton(buttonData) {
    const buttonElement = document.createElement('button');
    buttonElement.classList.add('button', 'is-large', 'column', 'block', buttonData.icon);
    buttonElement.innerHTML = (buttonData.icon === "icon-none") ? buttonData.name : "";

    buttonElement.setAttribute('name', buttonData.name);
    buttonElement.setAttribute('data-name', buttonData.name);
    buttonElement.setAttribute('data-command', buttonData.command);
    buttonElement.setAttribute('data-icon', buttonData.icon);
    buttonElement.setAttribute('data-color', buttonData.color);
    buttonElement.setAttribute('data-hexcolor', buttonData.hexcolor);

    buttonElement.style.backgroundColor = buttonData.hexcolor;

    buttonElement.setAttribute('oncontextmenu', 'openButtonForm(event, false); return false;');
    buttonElement.setAttribute('title', buttonData.name);

    buttonElement.addEventListener('click', () => {
        buttonInfocontainer.innerHTML = '';
        const command = buttonElement.getAttribute('data-command');
        messageServer({type: 'button_command', command: command});
    });

    buttonContainer.appendChild(buttonElement);

}

function getButtonsFromPage() {
    const buttons = [];
    buttonContainer.querySelectorAll('button').forEach(buttonElement => {
        buttons.push({
            name: buttonElement.getAttribute('data-name'),
            command: buttonElement.getAttribute('data-command'),
            icon: buttonElement.getAttribute('data-icon'),
            hexcolor: buttonElement.getAttribute('data-hexcolor')
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
            color: button.color,
            hexcolor:button.hexcolor
        });

    });
}

resetButton.addEventListener('click', function() {
    if (window.confirm("Are you sure? This can't be undone")) {
        messageServer({type: 'button_defaults_request'});
    }
});

function initColorPicker() {
  const colorGrid = document.getElementById('colorGrid');
  const colorOptions = colorGrid.querySelectorAll('.color-option');

  colorOptions.forEach(option => {
    option.addEventListener('click', function() {
      colorOptions.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
    });
  });
}

function populateIconGrid() {
    const iconNames = [];
    const styleSheets = document.styleSheets;

    // Collect all icon names from stylesheets
    Array.from(styleSheets).forEach(styleSheet => {
        try {
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
        } catch (e) {
            console.warn('Could not access stylesheet:', e);
        }
    });

    const iconGrid = document.getElementById('iconGrid');
    iconGrid.innerHTML = '';

    // Create "none" option
    const noneOption = document.createElement('button');
    noneOption.type = 'button';
    noneOption.className = 'icon-option swatch none';
    noneOption.dataset.icon = 'icon-none';
    noneOption.innerHTML = '<div class="swatch-placeholder">×</div>';
    noneOption.title = "No icon";
    noneOption.addEventListener('click', selectIcon);
    iconGrid.appendChild(noneOption);

    let i = 0;

    // Create all icon options
    iconNames.forEach(iconName => {
        const iconOption = document.createElement('button');
        iconOption.type = 'button';
        iconOption.className = 'icon-option swatch';
        iconOption.dataset.icon = `icon-${iconName}`;
        iconOption.innerHTML = `<i class="icon-${iconName}"></i>`;
        iconOption.title = iconName;
        iconOption.addEventListener('click', selectIcon);
        iconGrid.appendChild(iconOption);
    });
}

function selectIcon(event) {
    // Remove selection from all buttons
    document.querySelectorAll('.icon-option').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Add selection to clicked button
    const selectedButton = event.currentTarget;
    selectedButton.classList.add('selected');
}
