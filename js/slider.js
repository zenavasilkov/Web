document.addEventListener('DOMContentLoaded', () => {
    if (typeof Swiper === 'undefined') {
        console.warn('Swiper.js не подключен');
        return;
    }

    window.heroSwiper = new Swiper('.hero-swiper', {
        loop: true,
        speed: 600,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },

        slidesPerView: 3,
        spaceBetween: 20,

        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true
        },

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },

        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 15
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 15
            },
            1200: {
                slidesPerView: 3,
                spaceBetween: 20
            }
        }
    });
});
