const favoritesContainer = document.getElementById('favoritesContainer');
const noFavorites = document.getElementById('noFavorites');
const loading = document.getElementById('loading');

function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    favoritesContainer.style.display = show ? 'none' : 'grid';
}

function createFavoriteCard(program, favoriteId) {
    const card = document.createElement('article');
    card.className = 'favorite-card';

    card.innerHTML = `
        <div class="favorite-card__image">
            <img src="${program.image}" alt="${program.name}" onerror="this.src='images/placeholder-program.jpg'">
        </div>
        <div class="favorite-card__content">
            <div class="favorite-card__category">${program.categoryName}</div>
            <h3 class="favorite-card__title">${program.name}</h3>
            <p class="favorite-card__description">${program.description}</p>
            <div class="favorite-card__info">
                <div class="info-item">
                    <span class="info-label">💰</span>
                    <span class="info-value">${program.price.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div class="info-item">
                    <span class="info-label">⏱️</span>
                    <span class="info-value">${program.duration} ${program.durationUnit}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">⭐</span>
                    <span class="info-value">${program.rating}</span>
                </div>
            </div>
            <div class="favorite-card__actions">
                <a href="catalog.html" class="btn-details">Подробнее</a>
                <button class="btn-remove" data-id="${favoriteId}">❌ Удалить</button>
            </div>
        </div>
    `;

    const removeBtn = card.querySelector('.btn-remove');
    removeBtn.addEventListener('click', async () => {
        if (confirm('Удалить программу из избранного?')) {
            await removeFromFavorites(favoriteId);
        }
    });

    return card;
}

async function loadFavorites() {
    showLoading(true);
    noFavorites.style.display = 'none';

    try {
        const favorites = await API.getFavorites();

        if (!favorites || favorites.length === 0) {
            noFavorites.style.display = 'block';
            favoritesContainer.innerHTML = '';
            return;
        }

        favoritesContainer.innerHTML = '';

        for (const favorite of favorites) {
            try {
                const program = await API.getProgramById(favorite.programId);
                const card = createFavoriteCard(program, favorite.id);
                favoritesContainer.appendChild(card);
            } catch (error) {
                console.error('Ошибка загрузки программы:', error);
            }
        }

    } catch (error) {
        console.error('Ошибка загрузки избранного:', error);
        noFavorites.innerHTML = `
            <h3>⚠️ Ошибка</h3>
            <p>Не удалось загрузить избранное. Проверьте, запущен ли JSON Server.</p>
        `;
        noFavorites.style.display = 'block';
    } finally {
        showLoading(false);
    }
}

async function removeFromFavorites(favoriteId) {
    try {
        await API.removeFromFavorite(favoriteId);
        await loadFavorites();
        alert('✅ Удалено из избранного');
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('❌ Ошибка при удалении из избранного');
    }
}

document.addEventListener('DOMContentLoaded', loadFavorites);
