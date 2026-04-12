const STORAGE_KEYS = {
    USER: 'currentUser',
    LANG: 'lang',
    THEME: 'theme',
    FAVORITES: 'favorites',
    CART: 'cart'
};

class ProfileModal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        if (!this.modal) return;

        this.form = document.getElementById('profileForm');
        this.closeBtn = this.modal.querySelector('.modal__close');
        this.overlay = this.modal.querySelector('.modal__overlay');
        this.saveBtn = document.getElementById('profileSaveBtn');
        this.cancelBtn = document.getElementById('profileCancelBtn');
        this.resetBtn = document.getElementById('profileResetBtn');

        this.init();
    }

    init() {
        this.closeBtn?.addEventListener('click', () => this.close());

        this.overlay?.addEventListener('click', () => this.close());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });

        this.cancelBtn?.addEventListener('click', () => {
            this.loadUserData();
            this.close();
        });

        this.resetBtn?.addEventListener('click', () => this.resetSettings());

        this.form?.addEventListener('submit', (e) => this.handleSave(e));

        this.setupValidation();
    }

    open() {
        const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
        if (!currentUser) return;

        this.loadUserData();
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    loadUserData() {
        const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
        if (!user) return;

        document.getElementById('profileFirstName').value = user.firstName || '';
        document.getElementById('profileLastName').value = user.lastName || '';
        document.getElementById('profilePatronymic').value = user.patronymic || '';
        document.getElementById('profileEmail').value = user.email || '';
        document.getElementById('profilePhone').value = user.phone || '';
        document.getElementById('profileNickname').value = user.nickname || '';
    }

    setupValidation() {
        const fields = [
            { id: 'profileFirstName', validator: (v) => v.trim().length >= 2, message: 'Минимум 2 символа' },
            { id: 'profileLastName', validator: (v) => v.trim().length >= 2, message: 'Минимум 2 символа' },
            { id: 'profileEmail', validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: 'Некорректный email' },
            { id: 'profilePhone', validator: (v) => v.replace(/\D/g, '').length === 12, message: 'Номер должен содержать 12 цифр' }
        ];

        fields.forEach(field => {
            const input = document.getElementById(field.id);
            const errorEl = document.getElementById(`${field.id}Error`);

            input?.addEventListener('input', () => {
                const value = input.value;
                if (field.validator(value)) {
                    input.classList.remove('error');
                    input.classList.add('success');
                    if (errorEl) errorEl.textContent = '';
                } else {
                    input.classList.remove('success');
                    input.classList.add('error');
                    if (errorEl) errorEl.textContent = field.message;
                }
                this.updateSaveButton();
            });
        });
    }

    updateSaveButton() {
        const inputs = ['profileFirstName', 'profileLastName', 'profileEmail', 'profilePhone'];
        const isValid = inputs.every(id => {
            const input = document.getElementById(id);
            return input && !input.classList.contains('error') && input.value.trim().length > 0;
        });

        if (this.saveBtn) {
            this.saveBtn.disabled = !isValid;
        }
    }

    async handleSave(e) {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
        if (!user) return;

        const updatedUser = {
            ...user,
            firstName: document.getElementById('profileFirstName').value.trim(),
            lastName: document.getElementById('profileLastName').value.trim(),
            patronymic: document.getElementById('profilePatronymic').value.trim(),
            email: document.getElementById('profileEmail').value.trim(),
            phone: document.getElementById('profilePhone').value.replace(/\D/g, '')
        };

        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

        if (typeof updateAuthButtons === 'function') {
            updateAuthButtons();
        }

        if (typeof showToast === 'function') {
            showToast('✅ Профиль обновлён', 'success');
        } else {
            alert('✅ Профиль обновлён');
        }

        this.close();
    }

    resetSettings() {
        if (!confirm('Вы уверены, что хотите сбросить все настройки? Это действие нельзя отменить.')) {
            return;
        }

        localStorage.removeItem(STORAGE_KEYS.THEME);
        localStorage.removeItem(STORAGE_KEYS.LANG);

        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));

        if (typeof showToast === 'function') {
            showToast('✅ Настройки сброшены', 'success');
        } else {
            alert('✅ Настройки сброшены');
        }

        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

function initUserIcon() {
    const userIconBtn = document.getElementById('userIconBtn');
    const profileModal = new ProfileModal('profileModal');

    function updateUserIcon() {
        const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
        if (userIconBtn) {
            userIconBtn.style.display = currentUser ? 'flex' : 'none';
        }
    }

    userIconBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        profileModal.open();
    });

    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEYS.USER) {
            updateUserIcon();
        }
    });

    updateUserIcon();

    window.profileModal = profileModal;
    window.updateUserIcon = updateUserIcon;
}

document.addEventListener('DOMContentLoaded', initUserIcon);
