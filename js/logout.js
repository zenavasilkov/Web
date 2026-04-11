const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (confirm('Вы действительно хотите выйти из аккаунта?')) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('rememberedEmail');

            window.location.href = 'index.html';
        }
    });
}

function updateAuthUI() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const logoutBtn = document.getElementById('logoutBtn');
    const loginLink = document.querySelector('a[href="login.html"]');

    if (currentUser) {
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (loginLink) loginLink.style.display = 'none';
    } else {
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (loginLink) loginLink.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', updateAuthUI);
