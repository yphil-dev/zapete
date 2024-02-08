const PPS = (function () {
    let pages = [];
    let links = [];

    let versionNumber = '0.0.1';

    const versionNumberSpans = document.querySelectorAll('.version-number');

    versionNumberSpans.forEach(function(versionNumberSpan) {
        versionNumberSpan.textContent = versionNumber;
    });

    document.addEventListener("DOMContentLoaded", function(){
        pages = document.querySelectorAll('[data-page]');
        links = document.querySelectorAll('[data-role="link"]');
        //pages[0].className = "active";  - already done in the HTML
        [].forEach.call(links, function(link){
            link.addEventListener("click", navigate);
        });
    });

    function navigate(event) {

        event.preventDefault();
        let id = event.currentTarget.href.split("#")[1];

        let currentTargetId = event.currentTarget.id;
        var burger = document.querySelector('.navbar-burger');
        var menu = document.querySelector('#' + burger.dataset.target);

        [].forEach.call(links, function(link){
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

        [].forEach.call(pages, function(page){

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


    function openTab(event, tabName) {

        let i, tabcontent, tablinks;

        tabcontent = document.getElementsByClassName('content-container');
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = 'none';
        }

        tablinks = document.getElementsByClassName('tablinks');
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(' active', '');
            tablinks[i].parentNode.classList.remove('is-active');
        }

        document.getElementById(tabName).style.display = 'block';
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(' active', '');
            tablinks[i].parentNode.classList.remove('is-active');
        }

        event.currentTarget.parentNode.classList.add('is-active');
    }

    document.addEventListener("DOMContentLoaded", function() {
        var rsWidgetButton = document.querySelector('.rs-connect');
        var rsWidgetInput = document.querySelector('form.rs-sign-in-form input[type=text]');
        var rsSyncButtons = document.querySelectorAll('.rs-button');
        // var wIcon = document.querySelector('.rs-widget-icon');

        var element = document.querySelector("form.rs-sign-in-form input[name='rs-user-address']");

        const classesToRemove = ['rs-button', 'rs-button-small'];
        const classesToAdd = ['button', 'is-info'];

        rsSyncButtons.forEach(function(button) {
            button.classList.remove(...classesToRemove);
            button.classList.add(...classesToAdd);
        });

        if (element) {
            element.style.borderRadius = "0.4em";
            element.style.height = "2.5em";
        }

        // wIcon.style.display = 'none';

        // rsWidgetInput.classList.add('input');
        // rsWidgetButton.classList.add(...classesToAdd);
    });

    return {
        openTab
    };
})();
