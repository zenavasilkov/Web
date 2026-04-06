const catalogContainer = document.getElementById('catalogContainer');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortSelect = document.getElementById('sortSelect');
const noResults = document.getElementById('noResults');
const totalCount = document.getElementById('totalCount');
const shownCount = document.getElementById('shownCount');
const methodResult = document.getElementById('methodResult');

let currentPrograms = [...programsData];

function createProgramCard(program) {
    const card = document.createElement('article');
    card.className = 'program-card';
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
            <button class="program-card__btn">Подробнее</button>
        </div>
    `;
    return card;
}

function renderCatalog(programs) {
    catalogContainer.innerHTML = '';

    if (programs.length === 0) {
        noResults.style.display = 'block';
        shownCount.textContent = '0';
        return;
    }

    noResults.style.display = 'none';
    programs.forEach(program => {
        const card = createProgramCard(program);
        catalogContainer.appendChild(card);
    });

    shownCount.textContent = programs.length;
}

function initCatalog() {
    totalCount.textContent = programsData.length;
    renderCatalog(currentPrograms);
}

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (searchTerm === '') {
        currentPrograms = [...programsData];
    } else {
        currentPrograms = programsData.filter(program =>
            program.name.toLowerCase().includes(searchTerm) ||
            program.description.toLowerCase().includes(searchTerm) ||
            program.categoryName.toLowerCase().includes(searchTerm)
        );
    }

    applyFiltersAndSort();
});

categoryFilter.addEventListener('change', (e) => {
    applyFiltersAndSort();
});

sortSelect.addEventListener('change', (e) => {
    applyFiltersAndSort();
});

function applyFiltersAndSort() {
    let filtered = [...currentPrograms];

    const selectedCategory = categoryFilter.value;
    if (selectedCategory !== 'all') {
        filtered = filtered.filter(program => program.category === selectedCategory);
    }

    const sortValue = sortSelect.value;
    switch(sortValue) {
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filtered.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'duration':
            filtered.sort((a, b) => b.duration - a.duration);
            break;
    }

    renderCatalog(filtered);
}

document.querySelectorAll('.method-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const method = btn.dataset.method;
        handleArrayMethod(method);
    });
});

function handleArrayMethod(method) {
    let result = '';

    switch(method) {
        case 'filter-expensive':
            const expensive = programsData.filter(p => p.price > 50000);
            result = `<h4>💰 Дорогие программы (>50000₽): ${expensive.length} шт.</h4>
                     <ul>${expensive.map(p => `<li>${p.name} - ${p.price.toLocaleString()}₽</li>`).join('')}</ul>`;
            renderCatalog(expensive);
            break;

        case 'with-highlights':
            const withHighlights = programsData.flatMap(p => {
                if (p.rating >= 4.7) {
                    return [{ ...p, isHighlighted: true }];
                }
                return [p];
            });
            result = `<h4>⭐ Программы с выделением (рейтинг ≥4.7)</h4>`;
            renderCatalog(withHighlights);
            break;

        case 'map-names':
            const names = programsData.map(p => p.name);
            result = `<h4>📝 Названия всех программ:</h4>
                     <ul>${names.map(n => `<li>${n}</li>`).join('')}</ul>`;
            break;

        case 'all-premium':
            const allPremium = programsData.every(p => p.level !== 'beginner')
                ? programsData
                : programsData.filter(p => p.level === 'premium' || p.level === 'advanced');
            result = `<h4>✨ Премиум-программы: ${allPremium.length} шт.</h4>`;
            renderCatalog(allPremium);
            break;

        case 'sort-by-rating':
            const byRating = [...programsData].sort((a, b) => b.rating - a.rating);
            result = `<h4>⭐ Программы по рейтингу:</h4>
                     <ul>${byRating.map(p => `<li>${p.name} - ${p.rating}⭐</li>`).join('')}</ul>`;
            renderCatalog(byRating);
            break;

        case 'reverse-order':
            const reversed = programsData.toReversed();
            result = `<h4>🔁 Каталог в обратном порядке</h4>`;
            renderCatalog(reversed);
            break;

        case 'reduce-total':
            const total = programsData.reduce((sum, p) => sum + p.price, 0);
            result = `<h4>📊 Общая стоимость всех программ:</h4>
                     <p class="highlight">${total.toLocaleString('ru-RU')} ₽</p>
                     <p>Средняя стоимость: ${(total / programsData.length).toLocaleString('ru-RU')} ₽</p>`;
            break;

        case 'from-top-rated':
            const startIndex = programsData.findIndex(p => p.rating >= 4.5);
            const fromTop = startIndex !== -1 ? programsData.slice(startIndex) : [];
            result = `<h4>🚀 Программы с рейтингом ≥4.5 (начиная с индекса ${startIndex}): ${fromTop.length} шт.</h4>`;
            renderCatalog(fromTop);
            break;

        case 'find-program':
            const found = programsData.find(p => p.rating === 4.9);
            result = `<h4>🔍 Программа с наивысшим рейтингом:</h4>
                     <p><strong>${found.name}</strong></p>
                     <p>Рейтинг: ${found.rating}⭐ | Цена: ${found.price.toLocaleString()}₽</p>`;
            break;

        case 'some-long':
            const hasLong = programsData.some(p => p.duration > 6);
            result = `<h4>⚡ Есть ли программы длительнее 6 месяцев?</h4>
                     <p class="highlight">${hasLong ? '✅ Да' : '❌ Нет'}</p>
                     <p>Длительных программ: ${programsData.filter(p => p.duration > 6).length} из ${programsData.length}</p>`;
            break;
    }

    methodResult.innerHTML = result;
    methodResult.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', initCatalog);
