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

        // Handle initial hash navigation
        const initialHash = window.location.hash.slice(1); // Remove #
        if (initialHash) {
            const targetPage = document.getElementById(initialHash + '-page');
            if (targetPage) {
                // Hide all pages
                pages.forEach(page => page.classList.remove('active'));
                // Show target page
                targetPage.classList.add('active');
                // Update nav links
                links.forEach(link => {
                    const linkHash = link.href.split("#")[1];
                    if (linkHash === initialHash) {
                        link.classList.add('active-link');
                    } else {
                        link.classList.remove('active-link');
                    }
                });
            }
        }

        links.forEach(link => {
            link.addEventListener("click", navigate);
        });
    });

    function navigate(event) {

        event.preventDefault();
        let id = event.currentTarget.href.split("#")[1] + '-page';

        let currentTargetId = event.currentTarget.id;
        var burger = document.querySelector('.navbar-burger');
        var menu = document.querySelector('#' + burger.dataset.target);

        links.forEach(link => {
            if (link.href.split("#")[1] === id){
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

    return {};
})();
