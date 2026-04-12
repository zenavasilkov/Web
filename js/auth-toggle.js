document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminBtn = document.getElementById('adminBtn');

    function updateAuthButtons() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (currentUser) {
            document.body.classList.add('logged-in');

            if (currentUser.role === 'admin') {
                document.body.classList.add('admin-role');
            } else {
                document.body.classList.remove('admin-role');
            }

            if (loginBtn) {
                loginBtn.style.display = 'none';
            }

            if (logoutBtn) {
                logoutBtn.style.display = 'inline-block';
            }

            if (adminBtn) {
                adminBtn.style.display = (currentUser.role === 'admin') ? 'inline-block' : 'none';
            }
        } else {
            document.body.classList.remove('logged-in');
            document.body.classList.remove('admin-role');

            if (loginBtn) {
                loginBtn.style.display = 'inline-block';
                loginBtn.innerHTML = '🚪 <span class="header__actions_text">Войти</span>';
                loginBtn.href = 'login.html';
                loginBtn.onclick = null;
            }

            if (logoutBtn) {
                logoutBtn.style.display = 'none';
            }

            if (adminBtn) {
                adminBtn.style.display = 'none';
            }
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Вы действительно хотите выйти из аккаунта?')) {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('rememberedEmail');
                updateAuthButtons();
                window.location.href = 'index.html';
            }
        });
    }

    updateAuthButtons();
});

window.addEventListener('message', (event) => {
    if (event.data === 'auth:login') {
        updateAuthButtons();
    }
});