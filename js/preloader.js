document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');

    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hidden');

                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }, 800);
        });
    }
});
