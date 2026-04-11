const API_BASE_URL = 'http://localhost:3000';

const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser || currentUser.role !== 'admin') {
    alert('⚠️ Доступ только для администраторов');
    window.location.href = 'login.html';
}

const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const productForm = document.getElementById('productForm');
const productsList = document.getElementById('productsList');
const feedbacksList = document.getElementById('feedbacksList');
const usersList = document.getElementById('usersList');
const ordersList = document.getElementById('ordersList');
const logoutBtn = document.getElementById('logoutBtn');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}Tab`).classList.add('active');

        loadTabData(tab.dataset.tab);
    });
});

function loadTabData(tabName) {
    switch(tabName) {
        case 'products':
            loadProducts();
            break;
        case 'feedback':
            loadFeedbacks();
            break;
        case 'users':
            loadUsers();
            break;
        case 'orders':
            loadOrders();
            break;
    }
}

let editingProductId = null;

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/programs`);
        const products = await response.json();

        productsList.innerHTML = '';

        products.forEach(product => {
            const item = createProductItem(product);
            productsList.appendChild(item);
        });
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
    }
}

function createProductItem(product) {
    const item = document.createElement('div');
    item.className = 'list-item';

    item.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="list-item__image" onerror="this.src='images/placeholder.jpg'">
        <div class="list-item__info">
            <div class="list-item__title">${product.name}</div>
            <div class="list-item__meta">${product.price.toLocaleString()} ₽ | ⭐ ${product.rating}</div>
        </div>
        <div class="list-item__actions">
            <button class="btn-edit" data-id="${product.id}">✏️ Редактировать</button>
            <button class="btn-delete" data-id="${product.id}">🗑️ Удалить</button>
        </div>
    `;

    item.querySelector('.btn-edit').addEventListener('click', () => editProduct(product.id));
    item.querySelector('.btn-delete').addEventListener('click', () => deleteProduct(product.id));

    return item;
}

async function editProduct(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/programs/${id}`);
        const product = await response.json();

        editingProductId = id;

        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDuration').value = product.duration;
        document.getElementById('productRating').value = product.rating;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productLevel').value = product.level;
        document.getElementById('productLanguage').value = product.language;

        validateProductForm();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Ошибка загрузки товара:', error);
    }
}

async function deleteProduct(id) {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;

    try {
        await fetch(`${API_BASE_URL}/programs/${id}`, { method: 'DELETE' });
        alert('✅ Товар удалён');
        loadProducts();
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('❌ Ошибка при удалении');
    }
}

const productInputs = productForm.querySelectorAll('.form-input');
const productSubmitBtn = document.getElementById('productSubmitBtn');
const productCancelBtn = document.getElementById('productCancelBtn');

productInputs.forEach(input => {
    input.addEventListener('input', validateProductForm);
});

function validateProductForm() {
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value.trim();
    const price = document.getElementById('productPrice').value;
    const duration = document.getElementById('productDuration').value;
    const rating = document.getElementById('productRating').value;
    const image = document.getElementById('productImage').value.trim();
    const level = document.getElementById('productLevel').value;
    const language = document.getElementById('productLanguage').value.trim();

    let isValid = true;

    validateField('productName', name.length >= 2, 'Минимум 2 символа');
    validateField('productCategory', category !== '', 'Выберите категорию');
    validateField('productDescription', description.length >= 10, 'Минимум 10 символов');
    validateField('productPrice', price > 0, 'Цена должна быть больше 0');
    validateField('productDuration', duration > 0, 'Длительность должна быть больше 0');
    validateField('productRating', rating >= 0 && rating <= 5, 'Рейтинг от 0 до 5');
    validateField('productImage', isValidUrl(image), 'Введите корректный URL');
    validateField('productLevel', level !== '', 'Выберите уровень');
    validateField('productLanguage', language.length >= 2, 'Минимум 2 символа');

    function validateField(id, condition, message) {
        const input = document.getElementById(id);
        const errorEl = document.getElementById(`${id}Error`);

        if (!condition) {
            input.classList.add('error');
            input.classList.remove('success');
            if (errorEl) errorEl.textContent = message;
            isValid = false;
        } else {
            input.classList.remove('error');
            input.classList.add('success');
            if (errorEl) errorEl.textContent = '';
        }
    }

    productSubmitBtn.disabled = !isValid;
    return isValid;
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateProductForm()) return;

    const productData = {
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        categoryName: getCategoryName(document.getElementById('productCategory').value),
        description: document.getElementById('productDescription').value.trim(),
        price: parseInt(document.getElementById('productPrice').value),
        duration: parseInt(document.getElementById('productDuration').value),
        durationUnit: 'месяцев',
        rating: parseFloat(document.getElementById('productRating').value),
        image: document.getElementById('productImage').value.trim(),
        level: document.getElementById('productLevel').value,
        language: document.getElementById('productLanguage').value.trim()
    };

    try {
        if (editingProductId) {
            await fetch(`${API_BASE_URL}/programs/${editingProductId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            alert('✅ Товар обновлён');
            editingProductId = null;
        } else {
            await fetch(`${API_BASE_URL}/programs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            alert('✅ Товар добавлен');
        }

        productForm.reset();
        productSubmitBtn.disabled = true;
        loadProducts();
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('❌ Ошибка при сохранении');
    }
});

function getCategoryName(category) {
    const names = {
        'design': 'Дизайн',
        'art': 'Искусство',
        'tech': 'Технологии',
        'media': 'Медиа'
    };
    return names[category] || category;
}

productCancelBtn.addEventListener('click', () => {
    productForm.reset();
    editingProductId = null;
    productSubmitBtn.disabled = true;
    productInputs.forEach(input => {
        input.classList.remove('error', 'success');
    });
    productForm.querySelectorAll('.error-message').forEach(el => el.textContent = '');
});

function formatPhone(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 12) {
        return `+${digits.slice(0, 3)} (${digits.slice(3, 5)}) ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10, 12)}`;
    }
    return phone;
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

        const programFilter = document.getElementById('feedbackProgramFilter');
        const userFilter = document.getElementById('feedbackUserFilter');

        if (programFilter && programFilter.options.length === 1) {
            programs.forEach(p => {
                const option = document.createElement('option');
                option.value = p.id;
                option.textContent = p.name;
                programFilter.appendChild(option);
            });
        }

        if (userFilter && userFilter.options.length === 1) {
            users.forEach(u => {
                const option = document.createElement('option');
                option.value = u.id;
                option.textContent = `${u.firstName} ${u.lastName}`;
                userFilter.appendChild(option);
            });
        }

        displayFeedbacks(feedbacks, programs, users);

        programFilter?.addEventListener('change', () => filterFeedbacks());
        userFilter?.addEventListener('change', () => filterFeedbacks());

    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
    }
}

function filterFeedbacks() {
    const programId = document.getElementById('feedbackProgramFilter').value;
    const userId = document.getElementById('feedbackUserFilter').value;

    loadFeedbacks().then(() => {
    });
}

function displayFeedbacks(feedbacks, programs, users) {
    feedbacksList.innerHTML = '';

    if (feedbacks.length === 0) {
        feedbacksList.innerHTML = '<p>Отзывов пока нет</p>';
        return;
    }

    feedbacks.forEach(feedback => {
        const program = programs.find(p => p.id === feedback.programId);
        const user = users.find(u => u.id === feedback.userId);

        const card = document.createElement('div');
        card.className = 'feedback-card';

        const stars = '⭐'.repeat(feedback.rating);
        const date = new Date(feedback.createdAt).toLocaleDateString('ru-RU');

        card.innerHTML = `
            <div class="feedback-card__header">
                <div>
                    <div class="feedback-card__author">${user?.firstName || 'Аноним'} ${user?.lastName || ''}</div>
                    <div class="feedback-card__meta">${program?.name || 'Товар удалён'}</div>
                </div>
                <div class="feedback-card__rating">${stars}</div>
            </div>
            <p class="feedback-card__text">${feedback.text}</p>
            <div class="feedback-card__meta">${date}</div>
            <button class="btn-delete" style="margin-top: 10px;" data-id="${feedback.id}">🗑️ Удалить отзыв</button>
        `;

        card.querySelector('.btn-delete').addEventListener('click', () => deleteFeedback(feedback.id));
        feedbacksList.appendChild(card);
    });
}

async function deleteFeedback(id) {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return;

    try {
        await fetch(`${API_BASE_URL}/feedback/${id}`, { method: 'DELETE' });
        alert('✅ Отзыв удалён');
        loadFeedbacks();
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('❌ Ошибка при удалении');
    }
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const users = await response.json();

        usersList.innerHTML = '';

        if (users.length === 0) {
            usersList.innerHTML = '<p class="no-data">Пользователей пока нет</p>';
            return;
        }

        users.forEach(user => {
            const item = document.createElement('div');
            item.className = 'user-card';

            const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
            const roleClass = user.role === 'admin' ? 'admin' : 'user';
            const roleLabel = user.role === 'admin' ? 'Администратор' : 'Пользователь';

            item.innerHTML = `
                <div class="user-avatar">${initials}</div>
                <div class="user-info">
                    <div class="user-name">${user.firstName} ${user.lastName}</div>
                    <div class="user-nickname">@${user.nickname}</div>
                    
                    <div class="user-detail">
                        <span class="user-detail-label">Email</span>
                        <span>${user.email}</span>
                    </div>
                    
                    <div class="user-detail">
                        <span class="user-detail-label">Телефон</span>
                        <span>${formatPhone(user.phone)}</span>
                    </div>
                    
                    <div class="user-detail">
                        <span class="user-detail-label">Роль</span>
                        <span class="role-badge ${roleClass}">${roleLabel}</span>
                    </div>
                </div>
            `;
            usersList.appendChild(item);
        });
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
    }
}

async function loadOrders() {
    try {
        const [ordersRes, usersRes, programsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/orders`),
            fetch(`${API_BASE_URL}/users`),
            fetch(`${API_BASE_URL}/programs`)
        ]);

        const orders = await ordersRes.json();
        const users = await usersRes.json();
        const programs = await programsRes.json();

        ordersList.innerHTML = '';

        if (orders.length === 0) {
            ordersList.innerHTML = '<p class="no-data">Заказов пока нет</p>';
            return;
        }

        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        orders.forEach(order => {
            const user = users.find(u => u.id === order.userId);
            const program = programs.find(p => p.id === order.programId);

            const item = document.createElement('div');
            item.className = 'order-card';

            const total = (program?.price || 0) * (order.quantity || 1);
            const date = new Date(order.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const userName = user ? `${user.firstName} ${user.lastName}` : 'Удален';
            const programName = program ? program.name : 'Товар удален';
            const programImage = program ? program.image : 'images/placeholder.jpg';

            item.innerHTML = `
                <img src="${programImage}" alt="${programName}" class="order-image" onerror="this.src='images/placeholder.jpg'">
                <div class="order-info">
                    <div class="order-title">${programName}</div>
                    <div class="order-meta">
                        <div class="order-meta-item">
                            <span class="order-meta-icon">👤</span>
                            <span>${userName}</span>
                        </div>
                        <div class="order-meta-item">
                            <span class="order-meta-icon">📦</span>
                            <span>${order.quantity || 1} шт.</span>
                        </div>
                        <div class="order-meta-item">
                            <span class="order-meta-icon">📅</span>
                            <span>${date}</span>
                        </div>
                    </div>
                    <div class="order-status">✅ Выполнен</div>
                </div>
                <div class="order-summary">
                    <div class="order-total">${total.toLocaleString('ru-RU')} ₽</div>
                    <div class="order-date">ID заказа: #${order.id}</div>
                </div>
            `;
            ordersList.appendChild(item);
        });
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
    }
}

logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Выйти из системы?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});
