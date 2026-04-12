const STORAGE_KEYS = {
    THEME: 'theme',
    LANG: 'lang',
    USER: 'currentUser'
};

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }

    updateThemeImages(theme);

    localStorage.setItem(STORAGE_KEYS.THEME, theme);

    if (typeof showToast === 'function') {
        showToast(theme === 'dark' ? '🌙 Тёмная тема' : '☀️ Светлая тема', 'info', 2000);
    }
}

function updateThemeImages(theme) {
    const themeImages = document.querySelectorAll('.theme-image');

    themeImages.forEach(img => {
        if (theme === 'dark' && img.dataset.darkTheme) {
            img.src = img.dataset.darkTheme;
        } else if (theme === 'light' && img.dataset.lightTheme) {
            img.src = img.dataset.lightTheme;
        }
    });
}

function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}

function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);

    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleTheme();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            toggleTheme();
        }
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}

window.applyTheme = applyTheme;
window.toggleTheme = toggleTheme;
window.initTheme = initTheme;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof initTheme === 'function') {
        initTheme();
    }
    if (typeof initTranslation === 'function') {
        initTranslation();
    }
});
