const AppConfig = {
    API_BASE_URL: 'http://localhost:3000',
    ITEMS_PER_PAGE: 6,
    TOAST_DURATION: 3000
};

const Utils = {
    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    },
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('currentUser'));
        } catch {
            return null;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 HSE Design School - Инициализация завершена');

    if (!('fetch' in window)) {
        console.error('❌ Ваш браузер не поддерживает Fetch API');
        showToast('⚠️ Для полной функциональности обновите браузер', 'warning');
    }

    initGlobalHandlers();

    updateHeaderCounters();
});

function initGlobalHandlers() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-cart')) {
            const btn = e.target.closest('.btn-cart');
            const programId = parseInt(btn.dataset.id);
            if (programId) {
                handleAddToCart(programId);
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-favorite')) {
            const btn = e.target.closest('.btn-favorite');
            const programId = parseInt(btn.dataset.id);
            if (programId) {
                handleAddToFavorite(programId);
            }
        }
    });
}

async function updateHeaderCounters() {
    const API_BASE_URL = AppConfig.API_BASE_URL;

    try {
        const cartCountEl = document.getElementById('cartCount');
        if (cartCountEl) {
            const cart = await fetch(`${API_BASE_URL}/cart`).then(r => r.json());
            cartCountEl.textContent = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        }

        const favoritesCountEl = document.getElementById('favoritesCount');
        if (favoritesCountEl) {
            const favorites = await fetch(`${API_BASE_URL}/favorites`).then(r => r.json());
            favoritesCountEl.textContent = favorites.length;
        }
    } catch (error) {
        console.error('Ошибка обновления счетчиков:', error);
    }
}

async function handleAddToCart(programId) {
    const API_BASE_URL = AppConfig.API_BASE_URL;

    try {
        const program = await fetch(`${API_BASE_URL}/programs/${programId}`).then(r => r.json());
        const cart = await fetch(`${API_BASE_URL}/cart`).then(r => r.json());

        const existingItem = cart.find(item => item.programId === programId);

        if (existingItem) {
            await fetch(`${API_BASE_URL}/cart/${existingItem.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: (existingItem.quantity || 1) + 1 })
            });
        } else {
            await fetch(`${API_BASE_URL}/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    programId,
                    name: program.name,
                    price: program.price,
                    quantity: 1,
                    addedAt: new Date().toISOString()
                })
            });
        }

        await updateHeaderCounters();
        showToast('✅ Добавлено в корзину!', 'success');

    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
        showToast('❌ Ошибка при добавлении в корзину', 'error');
    }
}

async function handleAddToFavorite(programId) {
    const API_BASE_URL = AppConfig.API_BASE_URL;

    try {
        const favorites = await fetch(`${API_BASE_URL}/favorites`).then(r => r.json());
        const exists = favorites.some(item => item.programId === programId);

        if (exists) {
            showToast('⚠️ Уже в избранном', 'warning');
            return;
        }

        await fetch(`${API_BASE_URL}/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                programId,
                addedAt: new Date().toISOString()
            })
        });

        await updateHeaderCounters();
        showToast('✅ Добавлено в избранное!', 'success');

    } catch (error) {
        console.error('Ошибка добавления в избранное:', error);
        showToast('❌ Ошибка при добавлении в избранное', 'error');
    }
}

window.AppConfig = AppConfig;
window.Utils = Utils;
window.showToast = typeof showToast === 'function' ? showToast : () => {};
window.handleAddToCart = handleAddToCart;
window.handleAddToFavorite = handleAddToFavorite;
