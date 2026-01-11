ZPT.settings = (function () {

    // THEME

    function loadTheme() {
        let selectedTheme = localStorage.getItem('zapete-theme') || '../css/zapete-bulma-light.css';

        console.log("selectedTheme: ", selectedTheme);

        document.querySelector('input[name="theme"][value="' + selectedTheme + '"]').checked = true;
        switchTheme(selectedTheme);
    }

    loadTheme();

    function switchTheme(theme) {
        var themeLink = document.getElementById('theme-link');
        var newThemeLink = document.createElement('link');
        newThemeLink.id = 'theme-link';
        newThemeLink.rel = 'stylesheet';
        newThemeLink.href = theme;

        themeLink.parentNode.replaceChild(newThemeLink, themeLink);
    }

    function saveTheme(event) {
        let themeRadioButtons = document.getElementsByName('theme');
        let selectedTheme = '';

        for (let i = 0; i < themeRadioButtons.length; i++) {
            if (themeRadioButtons[i].checked) {
                selectedTheme = themeRadioButtons[i].value;
                break;
            }
        }

        switchTheme(selectedTheme);

        localStorage.setItem('zapete-theme', selectedTheme);
    }

    return {
        saveTheme
    };
})();
