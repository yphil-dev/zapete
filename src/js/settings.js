
// Initialize localStorage theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeLink = document.getElementById('theme-link');

    if (savedTheme) {
        themeLink.href = savedTheme;
        console.log('Loaded saved theme:', savedTheme);
    } else {
        console.log('No saved theme, using default');
    }
}

// Display localStorage values for debugging
function displayLocalStorage() {
    const themeValue = localStorage.getItem('theme') || 'not set';
    const radioValue = document.querySelector('input[name="theme"]:checked')?.value || 'not checked';

    document.getElementById('themeValue').textContent = themeValue;
    document.getElementById('radioValue').textContent = radioValue;

    console.log('localStorage debug:', {
        theme: themeValue,
        radio: radioValue
    });
}

// Initialize localStorage display
document.addEventListener('DOMContentLoaded', function() {
    initTheme();

    const qrImg = document.getElementById('qrcode');

    // Get QR code from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const encodedQR = urlParams.get('qrcode');

    if (encodedQR) {
        try {
            // Decode the URL-encoded data URL
            const qrDataURL = decodeURIComponent(encodedQR);

            // Set it as the image source
            qrImg.src = qrDataURL;
            console.log('QR code loaded from URL parameter');
        } catch (error) {
            console.error('Error decoding QR code:', error);
            qrImg.alt = 'Error loading QR code';
        }
    } else {
        console.log('No QR code found in URL parameters');
        qrImg.alt = 'QR code not available';
    }

    /* displayLocalStorage(); */
});

// Update display when theme changes
function saveTheme(radio) {
    console.log('saveTheme called with:', radio);
    console.log('Radio value:', radio.value);
    console.log('Radio checked:', radio.checked);

    const themeLink = document.getElementById('theme-link');
    console.log('Current theme href:', themeLink.href);

    if (radio.checked) {
        themeLink.href = radio.value;
        console.log('Theme switched to:', radio.value);

        // Save to localStorage
        localStorage.setItem('theme', radio.value);
        console.log('Saved theme to localStorage:', radio.value);

        /* displayLocalStorage(); */
    }
};
