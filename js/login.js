const API_BASE_URL = 'http://localhost:3000';
const loginForm = document.getElementById('loginForm');
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');
const rememberMeCheckbox = document.getElementById('rememberMe');

window.addEventListener('DOMContentLoaded', () => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
        loginEmailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        window.location.href = 'catalog.html';
    }
});

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function validateLoginEmail() {
    const value = loginEmailInput.value.trim();
    const errorEl = document.getElementById('loginEmailError');

    if (value.length === 0) {
        errorEl.textContent = 'Введите email или номер телефона';
        loginEmailInput.classList.add('error');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?3?7?5?\d{9}$/;
    const phoneDigits = value.replace(/\D/g, '');

    if (!emailRegex.test(value) && !phoneRegex.test(phoneDigits)) {
        errorEl.textContent = 'Введите корректный email или номер телефона РБ';
        loginEmailInput.classList.add('error');
        return false;
    }

    errorEl.textContent = '';
    loginEmailInput.classList.remove('error');
    return true;
}

function validateLoginPassword() {
    const value = loginPasswordInput.value;
    const errorEl = document.getElementById('loginPasswordError');

    if (value.length === 0) {
        errorEl.textContent = 'Введите пароль';
        loginPasswordInput.classList.add('error');
        return false;
    }

    errorEl.textContent = '';
    loginPasswordInput.classList.remove('error');
    return true;
}

loginEmailInput.addEventListener('input', validateLoginEmail);
loginPasswordInput.addEventListener('input', validateLoginPassword);

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isEmailValid = validateLoginEmail();
    const isPasswordValid = validateLoginPassword();

    if (!isEmailValid || !isPasswordValid) {
        return;
    }

    const emailOrPhone = loginEmailInput.value.trim();
    const rawPassword = loginPasswordInput.value;

    const hashedInputPassword = await hashPassword(rawPassword);

    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const users = await response.json();

        const user = users.find(u =>
            u.email === emailOrPhone ||
            u.phone === emailOrPhone.replace(/\D/g, '')
        );

        if (!user) {
            document.getElementById('loginEmailError').textContent = 'Пользователь не найден';
            loginEmailInput.classList.add('error');
            return;
        }

        if (user.password !== hashedInputPassword) {
            document.getElementById('loginPasswordError').textContent = 'Неверный пароль';
            loginPasswordInput.classList.add('error');
            return;
        }

        const { password, ...safeUser } = user;
        localStorage.setItem('currentUser', JSON.stringify(safeUser));

        if (rememberMeCheckbox.checked) {
            localStorage.setItem('rememberedEmail', user.email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        alert(`✅ Добро пожаловать, ${user.firstName}!`);

        if (window.opener) {
            window.opener.postMessage('auth:login', '*');
        }

        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'catalog.html';
        }

    } catch (error) {
        console.error('Ошибка входа:', error);
        alert('❌ Ошибка при входе в систему');
    }
});
