const cartContainer = document.getElementById('cartContainer');
const noCart = document.getElementById('noCart');
const cartSummary = document.getElementById('cartSummary');
const totalPriceEl = document.getElementById('totalPrice');
const checkoutBtn = document.getElementById('checkoutBtn');
const loading = document.getElementById('loading');

function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

function createCartItem(program, cartItem) {
    const item = document.createElement('div');
    item.className = 'cart-item';

    const itemTotal = program.price * cartItem.quantity;

    item.innerHTML = `
        <div class="cart-item__image">
            <img src="${program.image}" alt="${program.name}" onerror="this.src='images/placeholder-program.jpg'">
        </div>
        <div class="cart-item__info">
            <div class="cart-item__category">${program.categoryName}</div>
            <h3 class="cart-item__title">${program.name}</h3>
            <p class="cart-item__price">${program.price.toLocaleString('ru-RU')} ₽</p>
        </div>
        <div class="cart-item__quantity">
            <button class="qty-btn decrease" data-id="${cartItem.id}">−</button>
            <span class="qty-value">${cartItem.quantity}</span>
            <button class="qty-btn increase" data-id="${cartItem.id}">+</button>
        </div>
        <div class="cart-item__total">
            ${itemTotal.toLocaleString('ru-RU')} ₽
        </div>
        <button class="btn-remove-cart" data-id="${cartItem.id}" title="Удалить">❌</button>
    `;

    const decreaseBtn = item.querySelector('.decrease');
    decreaseBtn.addEventListener('click', () => updateQuantity(cartItem.id, cartItem.quantity - 1));

    const increaseBtn = item.querySelector('.increase');
    increaseBtn.addEventListener('click', () => updateQuantity(cartItem.id, cartItem.quantity + 1));

    const removeBtn = item.querySelector('.btn-remove-cart');
    removeBtn.addEventListener('click', () => removeFromCart(cartItem.id));

    return item;
}

async function loadCart() {
    showLoading(true);
    noCart.style.display = 'none';
    cartSummary.style.display = 'none';
    cartContainer.innerHTML = '';

    try {
        const cart = await API.getCart();

        if (!cart || cart.length === 0) {
            noCart.style.display = 'block';
            return;
        }

        let total = 0;

        for (const item of cart) {
            try {
                const program = await API.getProgramById(item.programId);
                const itemTotal = program.price * item.quantity;
                total += itemTotal;

                const cartItem = createCartItem(program, item);
                cartContainer.appendChild(cartItem);
            } catch (error) {
                console.error('Ошибка загрузки товара:', error);
            }
        }

        totalPriceEl.textContent = total.toLocaleString('ru-RU') + ' ₽';
        cartSummary.style.display = 'block';

    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
        noCart.innerHTML = `
            <h3>⚠️ Ошибка</h3>
            <p>Не удалось загрузить корзину. Проверьте, запущен ли JSON Server.</p>
        `;
        noCart.style.display = 'block';
    } finally {
        showLoading(false);
    }
}

async function updateQuantity(id, newQuantity) {
    if (newQuantity < 1) {
        if (confirm('Удалить товар из корзины?')) {
            await removeFromCart(id);
        }
        return;
    }

    try {
        await API.updateCartItem(id, { quantity: newQuantity });
        await loadCart();
    } catch (error) {
        console.error('Ошибка обновления:', error);
        alert('❌ Ошибка при обновлении количества');
    }
}

async function removeFromCart(id) {
    try {
        await API.removeFromCart(id);
        await loadCart();
        alert('✅ Товар удален из корзины');
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('❌ Ошибка при удалении из корзины');
    }
}

checkoutBtn.addEventListener('click', async () => {
    if (confirm('Оформить покупку? После подтверждения корзина будет очищена.')) {
        try {
            await API.clearCart();
            await loadCart();
            alert('✅ Покупка успешно оформлена! Спасибо за заказ.');
        } catch (error) {
            console.error('Ошибка оформления:', error);
            alert('❌ Ошибка при оформлении покупки');
        }
    }
});

async function saveOrder() {
    try {
        const cart = await API.getCart();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!currentUser) {
            alert('⚠️ Для оформления заказа необходимо авторизоваться');
            window.location.href = 'login.html';
            return;
        }

        for (const item of cart) {
            await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    programId: item.programId,
                    quantity: item.quantity,
                    totalPrice: item.price * item.quantity,
                    status: 'completed',
                    createdAt: new Date().toISOString()
                })
            });
        }

        await API.clearCart();

        alert('✅ Заказ успешно оформлен! Спасибо за покупку.');
        loadCart();

    } catch (error) {
        console.error('Ошибка оформления заказа:', error);
        alert('❌ Ошибка при оформлении заказа');
    }
}

checkoutBtn.addEventListener('click', async () => {
    if (confirm('Оформить покупку? После подтверждения корзина будет очищена.')) {
        await saveOrder();
    }
});

document.addEventListener('DOMContentLoaded', loadCart);
