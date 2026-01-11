const ZPT = (function () {
    let pages = [];
    let links = [];

    fetch('/package.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            document.querySelectorAll('.version-number').forEach(elt => elt.textContent = data.version);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    document.addEventListener("DOMContentLoaded", function(){
        pages = document.querySelectorAll('[data-page]');
        links = document.querySelectorAll('[data-role="link"]');

        // Add click event listeners to all navigation links
        links.forEach(link => {
            link.addEventListener("click", navigate);
        });

        // Check for hash on initial page load and navigate to it
        const hash = window.location.hash.substring(1);
        if (hash) {
            navigateToPage(hash);
        }
    });

    function navigate(event) {
        event.preventDefault();
        let id = event.currentTarget.href.split("#")[1] + '-page';

        let currentTargetId = event.currentTarget.id;
        var burger = document.querySelector('.navbar-burger');
        var menu = document.querySelector('#' + burger.dataset.target);

        links.forEach(link => {
            if (link.href.split("#")[1] + '-page' === id){
                link.classList.add('active-link');
            } else {
                link.classList.remove('active-link');
            }
        });

        if (event.currentTarget.id == 'burger' || event.currentTarget.id == 'logo') {
            burger.classList.toggle('is-active');
            menu.classList.toggle('is-active');
        }

        pages.forEach(page => {
            if (event.currentTarget.id !== 'logo') {
                burger.classList.toggle('is-active');
            }

            if (event.currentTarget.id !== 'burger') {
                if(page.id === id){
                    page.classList.add('active');
                    burger.classList.toggle('is-active');
                    menu.classList.toggle('is-active');
                } else {
                    page.classList.remove('active');
                }
            }
        });

        return false;
    }

    function navigateToPage(pageId) {
        const targetId = pageId + '-page';

        // Update active link
        links.forEach(link => {
            if (link.href.split("#")[1] === pageId) {
                link.classList.add('active-link');
            } else {
                link.classList.remove('active-link');
            }
        });

        // Show target page, hide others
        pages.forEach(page => {
            if (page.id === targetId) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });

        // Close mobile menu if open
        closeMobileMenu();
    }

    function closeMobileMenu() {
        var burger = document.querySelector('.navbar-burger');
        var menu = document.querySelector('#' + burger.dataset.target);

        if (burger && burger.classList.contains('is-active')) {
            burger.classList.remove('is-active');
        }
        if (menu && menu.classList.contains('is-active')) {
            menu.classList.remove('is-active');
        }
    }

    return {};
})();
