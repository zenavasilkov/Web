document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.header__menu-button');
    const headerNav = document.querySelector('.header__nav');
    const headerSubNav = document.querySelector('.header__sub-nav');

    if (menuButton) {
        menuButton.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';

            this.setAttribute('aria-expanded', !isExpanded);

            headerNav.classList.toggle('header__nav--open');
            headerSubNav.classList.toggle('header__sub-nav--open');

            document.body.style.overflow = !isExpanded ? 'hidden' : '';
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
                menuButton.click();
                menuButton.focus();
            }
        });

        document.addEventListener('click', function(e) {
            if (menuButton.getAttribute('aria-expanded') === 'true' &&
                !headerNav.contains(e.target) &&
                !headerSubNav.contains(e.target) &&
                !menuButton.contains(e.target)) {
                menuButton.click();
            }
        });
    }
});
