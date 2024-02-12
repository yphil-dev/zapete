const ZPT = (function () {
    let pages = [];
    let links = [];

    let versionNumber = '0.1.2';

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
})();
