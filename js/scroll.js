document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href === '#' || href.length === 1) return;

            e.preventDefault();

            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section');
    const animatedElements = document.querySelectorAll('.program-item, .news-item, .resource-item');

    function handleHeaderScroll() {
        if (!header) return;

        if (window.scrollY > 100) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    }

    function handleSectionAnimation() {
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const triggerPoint = window.innerHeight * 0.85;

            if (sectionTop < triggerPoint) {
                section.classList.add('section--visible');
            }
        });
    }

    function handleElementAnimation() {
        animatedElements.forEach((el, index) => {
            const elementTop = el.getBoundingClientRect().top;
            const triggerPoint = window.innerHeight * 0.9;

            if (elementTop < triggerPoint) {
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, index * 50);
            }
        });
    }

    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        if (counters.length === 0) return;

        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000;
            const increment = target / (duration / 16);

            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.ceil(current).toLocaleString('ru-RU');
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString('ru-RU') + '+';
                }
            };

            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    updateCounter();
                    observer.unobserve(counter);
                }
            }, { threshold: 0.5 });

            observer.observe(counter);
        });
    }

    function handleScroll() {
        handleHeaderScroll();
        handleSectionAnimation();
        handleElementAnimation();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();
    animateCounters();

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
});
