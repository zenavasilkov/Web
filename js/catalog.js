const ITEMS_PER_PAGE = 6;

const elements = {
    catalogContainer: document.getElementById('catalogContainer'),
    searchInput: document.getElementById('searchInput'),
    categoryFilter: document.getElementById('categoryFilter'),
    sortSelect: document.getElementById('sortSelect'),
    noResults: document.getElementById('noResults'),
    loading: document.getElementById('loading'),
    totalCount: document.getElementById('totalCount'),
    shownCount: document.getElementById('shownCount'),
    favoritesCount: document.getElementById('favoritesCount'),
    cartCount: document.getElementById('cartCount'),
    prevPageBtn: document.getElementById('prevPage'),
    nextPageBtn: document.getElementById('nextPage'),
    currentPageSpan: document.getElementById('currentPage'),
    totalPagesSpan: document.getElementById('totalPages'),
    priceMinInput: document.getElementById('priceMin'),
    priceMaxInput: document.getElementById('priceMax'),
    ratingMinInput: document.getElementById('ratingMin'),
    durationMinInput: document.getElementById('durationMin'),
    resetFiltersBtn: document.getElementById('resetFilters')
};

const state = {
    currentPage: 1,
    totalPages: 1,
    currentCategory: 'all',
    currentSort: 'default',
    searchQuery: ''
};

const categoriesSet = new Set();

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/programs`);
        const programs = await response.json();

        programs.forEach(program => {
            categoriesSet.add(program.category);
        });

        const categorySelect = document.getElementById('categoryFilter');

        categorySelect.innerHTML = '<option value="all">Все категории</option>';

        categoriesSet.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = getCategoryName(category);
            categorySelect.appendChild(option);
        });

    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
    }
}

function getCategoryName(category) {
    const names = {
        'design': 'Дизайн',
        'art': 'Искусство',
        'tech': 'Технологии',
        'media': 'Медиа'
    };
    return names[category] || category;
}

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    if (elements.catalogContainer) {
        renderCatalog();
    }
});

function createProgramCard(program) {
    const card = document.createElement('article');
    card.className = 'program-card';
    card.dataset.id = program.id;

    card.innerHTML = `
        <div class="program-card__image">
            <img src="${program.image}" alt="${program.name}" onerror="this.src='images/placeholder-program.jpg'">
            <div class="program-card__badge">${program.level}</div>
        </div>
        <div class="program-card__content">
            <div class="program-card__category">${program.categoryName}</div>
            <h3 class="program-card__title">${program.name}</h3>
            <p class="program-card__description">${program.description}</p>
            <div class="program-card__info">
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
            <div class="program-card__actions">
                <button class="program-card__btn btn-details">Подробнее</button>
                <button class="program-card__btn btn-favorite" data-id="${program.id}">❤️</button>
                <button class="program-card__btn btn-cart" data-id="${program.id}">🛒</button>
            </div>
        </div>
    `;

    return card;
}

function showLoading(show) {
    if (elements.loading) {
        elements.loading.style.display = show ? 'block' : 'none';
    }
    if (elements.catalogContainer) {
        elements.catalogContainer.style.display = show ? 'none' : 'grid';
    }
}

function showError(message) {
    if (elements.noResults) {
        elements.noResults.innerHTML = `
            <h3>⚠️ Ошибка</h3>
            <p>${message}</p>
        `;
        elements.noResults.style.display = 'block';
    }
}

async function renderCatalog() {
    showLoading(true);
    if (elements.noResults) elements.noResults.style.display = 'none';

    try {
        const params = {
            _page: state.currentPage,
            _limit: ITEMS_PER_PAGE
        };

        if (state.searchQuery) params.q = state.searchQuery;
        if (state.currentCategory !== 'all') params.category = state.currentCategory;

        if (state.currentSort !== 'default') {
            const [sortField, sortOrder] = state.currentSort.split('-');
            params._sort = sortField;
            params._order = sortOrder;
        }

        if (elements.priceMinInput && elements.priceMinInput.value) {
            params.price_gte = elements.priceMinInput.value;
        }
        if (elements.priceMaxInput && elements.priceMaxInput.value) {
            params.price_lte = elements.priceMaxInput.value;
        }
        if (elements.ratingMinInput && elements.ratingMinInput.value) {
            params.rating_gte = elements.ratingMinInput.value;
        }
        if (elements.durationMinInput && elements.durationMinInput.value) {
            params.duration_gte = elements.durationMinInput.value;
        }

        const { programs, totalCount } = await API.getPrograms(params);

        state.totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

        if (elements.catalogContainer) {
            elements.catalogContainer.innerHTML = '';
        }

        if (!programs || programs.length === 0) {
            if (elements.noResults) {
                elements.noResults.style.display = 'block';
            }
            if (elements.shownCount) {
                elements.shownCount.textContent = '0';
            }
        } else {
            if (elements.noResults) {
                elements.noResults.style.display = 'none';
            }
            programs.forEach(program => {
                const card = createProgramCard(program);
                if (elements.catalogContainer) {
                    elements.catalogContainer.appendChild(card);
                }
            });
            if (elements.shownCount) {
                elements.shownCount.textContent = programs.length;
            }
        }

        if (elements.totalCount) {
            elements.totalCount.textContent = totalCount;
        }
        if (elements.currentPageSpan) {
            elements.currentPageSpan.textContent = state.currentPage;
        }
        if (elements.totalPagesSpan) {
            elements.totalPagesSpan.textContent = state.totalPages || 1;
        }

        if (elements.prevPageBtn) {
            elements.prevPageBtn.disabled = state.currentPage === 1;
        }
        if (elements.nextPageBtn) {
            elements.nextPageBtn.disabled = state.currentPage === state.totalPages || state.totalPages === 0;
        }

        await updateCounters();

        attachCardListeners();

    } catch (error) {
        console.error('Ошибка загрузки каталога:', error);
        showError('Не удалось загрузить программы. Проверьте, запущен ли JSON Server.');
    } finally {
        showLoading(false);
    }
}

async function updateCounters() {
    try {
        if (API.getFavorites && elements.favoritesCount) {
            const favorites = await API.getFavorites();
            elements.favoritesCount.textContent = favorites.length;
        }

        if (API.getCart && elements.cartCount) {
            const cart = await API.getCart();
            const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            elements.cartCount.textContent = totalItems;
        }
    } catch (error) {
        console.error('Ошибка обновления счетчиков:', error);
    }
}

function attachCardListeners() {
    document.querySelectorAll('.btn-favorite').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await handleAddToFavorite(parseInt(btn.dataset.id));
        });
    });

    document.querySelectorAll('.btn-cart').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await handleAddToCart(parseInt(btn.dataset.id));
        });
    });
}

async function handleAddToFavorite(programId) {
    try {
        if (!API.getFavorites || !API.addToFavorite) return;

        const favorites = await API.getFavorites();
        const exists = favorites.some(item => item.programId === programId);

        if (exists) {
            alert('Программа уже в избранном!');
            return;
        }

        await API.addToFavorite({
            programId,
            addedAt: new Date().toISOString()
        });

        await updateCounters();
        alert('✅ Добавлено в избранное!');
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Ошибка при добавлении в избранное');
    }
}

async function handleAddToCart(programId) {
    try {
        if (!API.getProgramById || !API.getCart || !API.addToCart || !API.updateCartItem) return;

        const program = await API.getProgramById(programId);
        const cart = await API.getCart();
        const existingItem = cart.find(item => item.programId === programId);

        if (existingItem) {
            await API.updateCartItem(existingItem.id, {
                quantity: (existingItem.quantity || 1) + 1
            });
        } else {
            await API.addToCart({
                programId,
                name: program.name,
                price: program.price,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }

        await updateCounters();
        alert('✅ Добавлено в корзину!');
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Ошибка при добавлении в корзину');
    }
}

if (elements.searchInput) {
    elements.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        state.currentPage = 1;
        renderCatalog();
    });
}

if (elements.categoryFilter) {
    elements.categoryFilter.addEventListener('change', (e) => {
        state.currentCategory = e.target.value;
        state.currentPage = 1;
        renderCatalog();
    });
}

if (elements.sortSelect) {
    elements.sortSelect.addEventListener('change', (e) => {
        state.currentSort = e.target.value;
        state.currentPage = 1;
        renderCatalog();
    });
}

[elements.priceMinInput, elements.priceMaxInput, elements.ratingMinInput, elements.durationMinInput]
    .filter(el => el)
    .forEach(input => {
        input.addEventListener('change', () => {
            state.currentPage = 1;
            renderCatalog();
        });
    });

if (elements.resetFiltersBtn) {
    elements.resetFiltersBtn.addEventListener('click', () => {
        if (elements.priceMinInput) elements.priceMinInput.value = '';
        if (elements.priceMaxInput) elements.priceMaxInput.value = '';
        if (elements.ratingMinInput) elements.ratingMinInput.value = '';
        if (elements.durationMinInput) elements.durationMinInput.value = '';
        state.currentPage = 1;
        renderCatalog();
    });
}

if (elements.prevPageBtn) {
    elements.prevPageBtn.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            renderCatalog();
        }
    });
}

if (elements.nextPageBtn) {
    elements.nextPageBtn.addEventListener('click', () => {
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            renderCatalog();
        }
    });
}
