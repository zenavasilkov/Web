class Modal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        if (!this.modal) {
            console.warn(`Modal #${modalId} not found`);
            return;
        }

        this.overlay = this.modal.querySelector('.modal__overlay');
        this.closeBtn = this.modal.querySelector('.modal__close');
        this.body = this.modal.querySelector('.modal__body');

        this.init();
    }

    init() {
        this.overlay?.addEventListener('click', () => this.close());

        this.closeBtn?.addEventListener('click', () => this.close());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });

        this.modal.querySelector('.modal__content')?.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    open(content = '') {
        if (content && this.body) {
            this.body.innerHTML = content;
        }
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        this.closeBtn?.focus();
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';

        if (this.modal.classList.contains('video-modal')) {
            const iframe = this.modal.querySelector('iframe');
            if (iframe) iframe.src = '';
        }
    }

    static create(modalId) {
        return new Modal(modalId);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.programModal = Modal.create('programModal');

    window.videoModal = Modal.create('videoModal');

    document.querySelectorAll('.program-item[data-program-id]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const programId = item.dataset.programId;
            openProgramModal(programId);
        });
    });

    document.querySelectorAll('.video-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const videoUrl = trigger.dataset.video;
            if (videoUrl && window.videoModal) {
                const iframe = document.getElementById('videoFrame');
                if (iframe) {
                    const separator = videoUrl.includes('?') ? '&' : '?';
                    iframe.src = `${videoUrl}${separator}autoplay=1&rel=0`;
                }
                window.videoModal.open();
            }
        });
    });
});

async function openProgramModal(programId) {
    const API_BASE_URL = 'http://localhost:3000';

    try {
        const response = await fetch(`${API_BASE_URL}/programs/${programId}`);
        const program = await response.json();

        const content = `
            <img src="${program.image}" alt="${program.name}" 
                 class="modal__image" 
                 style="width:100%;height:200px;object-fit:cover;border-radius:8px;margin-bottom:20px;"
                 onerror="this.src='images/placeholder-program.jpg'">
            <h2 style="margin-bottom:15px;color:#0f2d6b;">${program.name}</h2>
            <p><strong>Категория:</strong> ${program.categoryName}</p>
            <p><strong>Уровень:</strong> ${program.level}</p>
            <p><strong>Длительность:</strong> ${program.duration} ${program.durationUnit}</p>
            <p><strong>Рейтинг:</strong> ${'⭐'.repeat(Math.round(program.rating))} (${program.rating})</p>
            <p><strong>Цена:</strong> ${program.price.toLocaleString('ru-RU')} ₽</p>
            <p style="margin-top:15px;"><strong>Описание:</strong><br>${program.description}</p>
            <button class="btn-black" style="margin-top:20px;width:100%;" 
                    onclick="addToCartFromModal(${program.id})">
                Добавить в корзину
            </button>
        `;

        if (window.programModal) {
            window.programModal.open(content);
        }
    } catch (error) {
        console.error('Ошибка загрузки программы:', error);
        showToast('❌ Не удалось загрузить информацию о программе', 'error');
    }
}

async function addToCartFromModal(programId) {
    const API_BASE_URL = 'http://localhost:3000';

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

        updateCartCounter();

        if (window.programModal) {
            window.programModal.close();
        }
        showToast('✅ Товар добавлен в корзину!', 'success');

    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
        showToast('❌ Ошибка при добавлении в корзину', 'error');
    }
}

async function updateCartCounter() {
    const API_BASE_URL = 'http://localhost:3000';
    const cartCountEl = document.getElementById('cartCount');

    if (!cartCountEl) return;

    try {
        const cart = await fetch(`${API_BASE_URL}/cart`).then(r => r.json());
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCountEl.textContent = totalItems;
    } catch (error) {
        console.error('Ошибка обновления счетчика:', error);
    }
}
