const API_BASE_URL = 'http://localhost:3000';

const feedbackForm = document.getElementById('feedbackForm');
const programSelect = document.getElementById('programSelect');
const feedbackText = document.getElementById('feedbackText');
const charCount = document.getElementById('charCount');
const feedbackSubmitBtn = document.getElementById('feedbackSubmitBtn');
const feedbackContainer = document.getElementById('feedbackContainer');
const logoutBtn = document.getElementById('logoutBtn');

const MIN_CHARS = 50;
let currentUser = null;
let purchasedPrograms = [];

async function initFeedbackPage() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        alert('⚠️ Для оставления отзыва необходимо авторизоваться');
        window.location.href = 'login.html';
        return;
    }

    const loginLink = document.querySelector('a[href="login.html"]');
    if (loginLink) {
        loginLink.style.display = 'none';
    }

    if (currentUser.role === 'admin') {
        alert('⚠️ Администраторы не могут оставлять отзывы');
        feedbackForm.style.display = 'none';
    }

    await loadPrograms();

    await loadUserOrders();

    await loadFeedbacks();

    setupEventListeners();

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Вы действительно хотите выйти из аккаунта?')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        });
    }
}

async function loadPrograms() {
    try {
        const response = await fetch(`${API_BASE_URL}/programs`);
        const programs = await response.json();

        programSelect.innerHTML = '<option value="">-- Выберите программу --</option>';

        programs.forEach(program => {
            const option = document.createElement('option');
            option.value = program.id;
            option.textContent = program.name;
            option.setAttribute('data-name', program.name);
            programSelect.appendChild(option);
        });

        updateProgramSelect();

    } catch (error) {
        console.error('Ошибка загрузки программ:', error);
    }
}


async function loadUserOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders?userId=${currentUser.id}`);
        const orders = await response.json();

        purchasedPrograms = [...new Set(orders.map(order => order.programId))];

        updateProgramSelect();
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
    }
}

function updateProgramSelect() {
    const options = programSelect.querySelectorAll('option');

    options.forEach(option => {
        if (option.value === '') return;

        const programId = parseInt(option.value);
        const originalName = option.getAttribute('data-name');

        if (!purchasedPrograms.includes(programId)) {
            option.disabled = true;
            const displayName = originalName || option.textContent.replace(' (не куплено)', '');
            option.textContent = `${displayName} (не куплено)`;
        } else {
            option.disabled = false;
            const displayName = originalName || option.textContent.replace(' (не куплено)', '');
            option.textContent = displayName;
        }
    });
}

async function loadFeedbacks() {
    try {
        const [feedbacksRes, programsRes, usersRes] = await Promise.all([
            fetch(`${API_BASE_URL}/feedback`),
            fetch(`${API_BASE_URL}/programs`),
            fetch(`${API_BASE_URL}/users`)
        ]);

        const feedbacks = await feedbacksRes.json();
        const programs = await programsRes.json();
        const users = await usersRes.json();

        feedbackContainer.innerHTML = '';

        if (feedbacks.length === 0) {
            feedbackContainer.innerHTML = '<p class="no-feedback">Пока нет отзывов</p>';
            return;
        }

        feedbacks.forEach(feedback => {
            const program = programs.find(p => p.id === feedback.programId);
            const user = users.find(u => u.id === feedback.userId);

            const card = createFeedbackCard(feedback, program, user);
            feedbackContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
    }
}

function createFeedbackCard(feedback, program, user) {
    const card = document.createElement('div');
    card.className = 'feedback-card';

    const stars = '⭐'.repeat(feedback.rating);
    const date = new Date(feedback.createdAt).toLocaleDateString('ru-RU');
    const authorName = user ? `${user.firstName} ${user.lastName}` : 'Аноним';

    card.innerHTML = `
        <div class="feedback-card__header">
            <div>
                <div class="feedback-card__author">${authorName} (${user?.nickname || ''})</div>
                <div class="feedback-card__program">${program?.name || 'Программа удалена'}</div>
            </div>
            <div class="feedback-card__rating">${stars}</div>
        </div>
        <p class="feedback-card__text">${feedback.text}</p>
        <div class="feedback-card__date">${date}</div>
    `;

    return card;
}

function setupEventListeners() {
    feedbackText.addEventListener('input', () => {
        charCount.textContent = feedbackText.value.length;
        validateFeedbackForm();
    });

    programSelect.addEventListener('change', validateFeedbackForm);

    document.querySelectorAll('input[name="rating"]').forEach(radio => {
        radio.addEventListener('change', validateFeedbackForm);
    });

    feedbackForm.addEventListener('submit', handleFeedbackSubmit);
}

function validateFeedbackForm() {
    const programId = programSelect.value;
    const text = feedbackText.value.trim();
    const rating = document.querySelector('input[name="rating"]:checked');

    const isProgramValid = programId !== '';
    const isTextValid = text.length >= MIN_CHARS;
    const isRatingValid = rating !== null;

    const programError = document.getElementById('programSelectError');
    const textError = document.getElementById('feedbackTextError');
    const ratingError = document.getElementById('ratingError');

    if (programError) {
        programError.textContent = !isProgramValid ? 'Выберите программу' : '';
    }

    if (textError) {
        textError.textContent = !isTextValid ? `Минимум ${MIN_CHARS} символов (сейчас: ${text.length})` : '';
    }

    if (ratingError) {
        ratingError.textContent = !isRatingValid ? 'Выберите оценку' : '';
    }

    feedbackSubmitBtn.disabled = !(isProgramValid && isTextValid && isRatingValid);

    return isProgramValid && isTextValid && isRatingValid;
}

async function handleFeedbackSubmit(e) {
    e.preventDefault();

    if (!validateFeedbackForm()) {
        return;
    }

    const feedbackData = {
        userId: currentUser.id,
        programId: parseInt(programSelect.value),
        text: feedbackText.value.trim(),
        rating: parseInt(document.querySelector('input[name="rating"]:checked').value),
        createdAt: new Date().toISOString()
    };

    try {
        const response = await fetch(`${API_BASE_URL}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedbackData)
        });

        if (response.ok) {
            alert('✅ Отзыв успешно отправлен!');
            feedbackForm.reset();
            charCount.textContent = '0';
            feedbackSubmitBtn.disabled = true;
            await loadFeedbacks();
        } else {
            alert('❌ Ошибка при отправке отзыва');
        }
    } catch (error) {
        console.error('Ошибка отправки отзыва:', error);
        alert('❌ Произошла ошибка при отправке отзыва');
    }
}

document.addEventListener('DOMContentLoaded', initFeedbackPage);
