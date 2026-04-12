function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.warn('Toast container not found');
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    toast.innerHTML = `
        <span class="toast__icon">${icons[type] || icons.info}</span>
        <span class="toast__message">${message}</span>
        <button class="toast__close" aria-label="Закрыть">×</button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast__close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    const timeoutId = setTimeout(() => {
        removeToast(toast);
    }, duration);

    toast.addEventListener('click', (e) => {
        if (e.target === closeBtn) {
            clearTimeout(timeoutId);
        }
    });
}

function removeToast(toast) {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
        toast.remove();
    }, 300);
}

function showNotification(message, type = 'success') {
    showToast(message, type);
}

window.showToast = showToast;
window.showNotification = showNotification;
window.removeToast = removeToast;
