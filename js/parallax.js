document.addEventListener('DOMContentLoaded', () => {
    const parallaxSection = document.querySelector('.parallax-section');
    if (!parallaxSection) return;

    const layers = parallaxSection.querySelectorAll('.parallax-layer');
    const content = parallaxSection.querySelector('.parallax-content');

    const layerSpeeds = [
        0.2,
        0.5,
        0.8,
        -0.3
    ];

    function updateParallax() {
        const scrolled = window.pageYOffset;
        const sectionTop = parallaxSection.offsetTop;
        const sectionHeight = parallaxSection.offsetHeight;

        const isVisible = scrolled + window.innerHeight > sectionTop &&
            scrolled < sectionTop + sectionHeight;

        if (!isVisible) return;

        const relativeScroll = scrolled - sectionTop + window.innerHeight / 2;

        layers.forEach((layer, index) => {
            const speed = layerSpeeds[index] || 0.5;
            const offset = relativeScroll * speed;

            if (speed < 0) {
                layer.style.transform = `translateY(${-offset}px) translateX(${offset * 0.2}px)`;
            } else {
                layer.style.transform = `translateY(${offset}px)`;
            }
        });

        if (content) {
            content.style.transform = `translateY(${relativeScroll * 0.1}px)`;
        }
    }

    let ticking = false;

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateParallax);

    updateParallax();

    if (window.innerWidth < 768) {
        window.removeEventListener('scroll', onScroll);
        layers.forEach(layer => {
            layer.style.transform = 'none';
        });
    }
});
