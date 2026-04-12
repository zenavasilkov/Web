document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('.stat-number');
    if (counters.length === 0) return;

    function animateCounter(counter) {
        const target = +counter.getAttribute('data-target');
        const duration = 2000;
        const fps = 60;
        const steps = duration / (1000 / fps);
        const increment = target / steps;

        let current = 0;
        let step = 0;

        function update() {
            current += increment;
            step++;

            if (step < steps) {
                counter.textContent = Math.ceil(current).toLocaleString('ru-RU');
                requestAnimationFrame(update);
            } else {
                counter.textContent = target.toLocaleString('ru-RU') + '+';
            }
        }

        update();
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    counters.forEach(counter => {
        counter.textContent = '0';
        observer.observe(counter);
    });
});
