document.addEventListener('DOMContentLoaded', () => {
    const burgerBtn = document.querySelector('.header__burger');
    const burgerMenu = document.querySelector('.burger-menu');
    const burgerOverlay = document.querySelector('.burger-overlay');
    const burgerClose = document.querySelector('.burger-menu__close');
    const burgerLinks = document.querySelectorAll('.burger-menu__list a');

    function openMenu() {
        burgerBtn?.classList.add('active');
        burgerMenu?.classList.add('active');
        burgerOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        burgerBtn?.classList.remove('active');
        burgerMenu?.classList.remove('active');
        burgerOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    burgerBtn?.addEventListener('click', openMenu);
    burgerClose?.addEventListener('click', closeMenu);
    burgerOverlay?.addEventListener('click', closeMenu);

    burgerLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && burgerMenu?.classList.contains('active')) {
            closeMenu();
            burgerBtn?.focus();
        }
    });
});
