function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeLink = document.getElementById('theme-link');

    const themeToUse = savedTheme || 'src/css/zapete-bulma-dark.css';

    themeLink.href = themeToUse;

    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.checked = (radio.value === themeToUse);
    });

}

function loadQRCodeFromURL() {
    const qrImg = document.getElementById('qrcode');

    const urlParams = new URLSearchParams(window.location.search);
    const encodedQR = urlParams.get('qrcode');

    if (encodedQR) {
        try {
            const qrDataURL = decodeURIComponent(encodedQR);

            qrImg.src = qrDataURL;
        } catch (error) {
            qrImg.alt = 'Error loading QR code';
        }
    } else {
        qrImg.alt = 'QR code not available';
    }
}

function saveTheme(radio) {
    console.log('saveTheme called with:', radio);
    console.log('Radio value:', radio.value);
    console.log('Radio checked:', radio.checked);

    const themeLink = document.getElementById('theme-link');

    if (radio.checked) {
        themeLink.href = radio.value;
        localStorage.setItem('theme', radio.value);
    }
}

function setupThemeListeners() {
    const themeRadios = document.querySelectorAll('input[name="theme"]');

    themeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            saveTheme(this);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    loadQRCodeFromURL();
    setupThemeListeners();
});
