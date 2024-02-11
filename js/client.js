let ws;
const serverMessages = document.getElementById("serverMessages");
const buttonContainer = document.getElementById('buttonContainer');

function connect() {
    const serverAddress = document.getElementById("serverAddress").value;
    serverMessages.value = "Connecting to server";
    ws = new WebSocket(`ws://${serverAddress}`);

    ws.onopen = function() {
        serverMessages.value = "Connected to server";
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

function handleContextMenuOld(event) {
    event.preventDefault();

    const selectedButton = event.target;

    const command = selectedButton.getAttribute('data-command');
    const icon = selectedButton.getAttribute('data-icon');
    const color = selectedButton.getAttribute('data-color');
    const name = selectedButton.getAttribute('name');

    // Create the div container for button information
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('box');
    infoDiv.innerHTML = `
        <h3 class="h3">Button Information</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Icon:</strong> ${icon}</p>
        <p><strong>Color:</strong> ${color}</p>
        <p><strong>Command:</strong> ${command}</p>
        <div class="select is-primary">
            <select id="iconSelect"></select>
        </div>
        <div class="select is-primary">
            <select id="colorSelect">
                <option value="none">none</option>
                <option value="is-primary">primary</option>
                <option value="is-link">link</option>
                <option value="is-info">info</option>
                <option value="is-success">success</option>
                <option value="is-warning">warning</option>
                <option value="is-danger">danger</option>
            </select>
        </div>
    `;

    // Append the div container to the infoDiv
    const container = document.getElementById('button-info');
    container.innerHTML = ''; // Clear existing content
    container.appendChild(infoDiv);

    // Select the desired option in the color select menu
    const colorSelect = document.getElementById('colorSelect');
    colorSelect.value = "is-danger";
}

function handleContextMenu(event) {
    event.preventDefault();

    callerButton = event.target;

    const selectedButton = event.target;

    const command = selectedButton.getAttribute('data-command');
    const icon = selectedButton.getAttribute('data-icon');
    const color = selectedButton.getAttribute('data-color');
    const name = selectedButton.getAttribute('name');

    // Create the div container for button information
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('box');
    infoDiv.innerHTML = `
<h3 class="title is-4">Edit Button</h3>
<!-- <p><strong>Name:</strong> <span class="button-name"></span></p>
     <p><strong>Icon:</strong> <span class="button-icon"></span></p>
     <p><strong>Color:</strong> <span class="button-color"></span></p>
     <p><strong>Command:</strong> <span class="button-command"></span></p> -->
<form id="serverForm" onsubmit="editButton(event); return false;">
    
    <div class="field">
        <label class="label">Name</label>
        <div class="control">
            <input class="input button-name" type="text" placeholder="e.g Alex Smith">
        </div>
    </div>

    <div class="field">
        <label class="label">Command</label>
        <div class="control">
            <input class="input button-command" type="text" placeholder="e.g. alexsmith@gmail.com">
        </div>
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
                <option value="none" class="none">none</option>
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
            <a class="button">
                Cancel
            </a>
        </p>
    </div>

</form>
    `;
    
    // populateIconSelect();
    
    // Append the populated template to the infoDiv
    const container = document.getElementById('button-info');
    container.innerHTML = ''; // Clear existing content
    container.appendChild(infoDiv);

    // Populate the cloned template with button information
    const buttonNameOption = infoDiv.querySelector('.button-name');
    buttonNameOption.value = name;
    buttonNameOption.setAttribute('data-name', name);
    
    const buttonCommandOption = infoDiv.querySelector('.button-command');
    buttonCommandOption.value = command;
    buttonCommandOption.setAttribute('data-command', command);

    const colorSelect = document.getElementById('colorSelect');
    colorSelect.value = color;
    colorSelect.selected = true;

    populateIconSelect();

    
    const iconSelect = document.getElementById('iconSelect');
    iconSelect.value = icon;
    iconSelect.selected = true;

    console.log('icon: ', icon);
    
    // const selectMenu = document.getElementById('iconSelect');
    // if (selectMenu) {
    //     console.log('selectMenu: ', selectMenu);
    // }
    // const optionNone = document.createElement('option');
    // optionNone.textContent = "none";
    // optionNone.value = "none";
    // optionNone.classList.add("none");
    // selectMenu.appendChild(optionNone);
    // // iconNames.forEach(iconName => {
    // //     console.log('iconName: ', iconName);
    // //     const option = document.createElement('option');
    // //     // Remove the colon from the end of the icon name
    // //     const cleanedIconName = iconName.replace(/:$/, '');
    // //     option.textContent = iconName;
    // //     option.value = iconName;
    // //     selectMenu.appendChild(option);
    // // });

    
    // Add event listeners to left and right buttons
    const leftButton = infoDiv.querySelector('.left');
    const rightButton = infoDiv.querySelector('.right');
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
            name: buttonElement.getAttribute('name'),
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

    console.log('editButton: ');
    
    // Access the global variable to get the reference to the caller button
    const selectedButton = callerButton;
   
    // Select all input fields
    const buttonNameInput = document.querySelector('.button-name');
    const buttonCommandInput = document.querySelector('.button-command');
    const iconSelect = document.querySelector('#iconSelect');
    const colorSelect = document.querySelector('#colorSelect');

    // Get the values from the input fields
    const buttonName = buttonNameInput.value;
    const buttonCommand = buttonCommandInput.value;
    const buttonIcon = "icon-" + iconSelect.value;
    const buttonColor = "is-" + colorSelect.value;

    const selectedColorIndex = colorSelect.selectedIndex;
    const selectedColorOption = colorSelect.options[selectedColorIndex];
    const selectedColorOptionClass = selectedColorOption.className;
    
    const selectedIconIndex = iconSelect.selectedIndex;
    const selectedIconOption = iconSelect.options[selectedIconIndex];
    const selectedIconOptionClass = selectedIconOption.className;
    
    // Get the old values from the class fields
    const oldName = buttonNameInput.getAttribute("data-name");
    const oldCommand = buttonCommandInput.getAttribute("data-command");
    const oldIcon = selectedIconOptionClass;
    const oldColor = selectedColorOptionClass;

    console.log('buttonName, oldName: ', buttonName, oldName);
    console.log('buttonCommand, oldCommand: ', buttonCommand, oldCommand);
    console.log('buttonIcon, oldIcon: ', buttonIcon, oldIcon);
    console.log('buttonColor, oldColor: ', buttonColor, oldColor);

    // Log the values
    // console.log('Button Name:', buttonName);
    // console.log('Button Command:', buttonCommand);
    // console.log('Icon Value:', buttonIcon);
    // console.log('Color Value:', buttonColor);

    console.log('iconSelect: ', iconSelect);
    // console.log('selectedButton: ', selectedButton);
    
    if (selectedButton.classList.contains("is-" + buttonColor)) {
        selectedButton.classList.remove("is-" + buttonColor);
    }

    selectedButton.classList.add(buttonColor);
    selectedButton.setAttribute('data-color', buttonColor);

    // Reset the global variable
    // callerButton = null;

}

function setButtonsToPage(buttons) {

    console.log('yoo: ');
    
    buttonContainer.innerHTML = '';

    buttons.forEach(button => {

        const buttonElement = document.createElement('button');
        buttonElement.setAttribute('name', button.name);
        buttonElement.classList.add('button', 'is-large', 'column', button.color, button.icon);
        if (button.icon === "none") {
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
    optionNone.value = "none";
    optionNone.classList.add("none");
    selectMenu.appendChild(optionNone);
    iconNames.forEach(iconName => {
        const option = document.createElement('option');
        option.textContent = iconName;
        option.value = "icon-" + iconName;
        selectMenu.appendChild(option);
    });
}



