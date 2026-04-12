document.addEventListener('DOMContentLoaded', () => {
    const galleryData = {
        design: {
            images: [
                'images/gallery/design1.jpg',
                'images/gallery/design2.jpg',
                'images/gallery/design3.jpg',
                'images/gallery/design4.jpg'
            ],
            sound: 'audio/design-sound.mp3',
            title: 'Коммуникационный дизайн',
            description: 'Проекты в области графического дизайна, брендинга и визуальных коммуникаций'
        },
        art: {
            images: [
                'images/gallery/art1.jpg',
                'images/gallery/art2.jpg',
                'images/gallery/art3.jpg',
                'images/gallery/art4.jpg'
            ],
            sound: 'audio/art-sound.mp3',
            title: 'Современное искусство',
            description: 'Художественные проекты, инсталляции и выставки студентов'
        },
        tech: {
            images: [
                'images/gallery/tech1.jpg',
                'images/gallery/tech2.jpg',
                'images/gallery/tech3.jpg',
                'images/gallery/tech4.jpg'
            ],
            sound: 'audio/tech-sound.mp3',
            title: 'Гейм-дизайн и технологии',
            description: 'Интерактивные проекты, игры и цифровые продукты'
        }
    };

    const galleryImage = document.getElementById('galleryImage');
    const galleryIndicator = document.getElementById('galleryIndicator');
    const galleryTitle = document.getElementById('galleryTitle');
    const galleryDescription = document.getElementById('galleryDescription');
    const volumeControl = document.getElementById('volumeControl');
    const galleryButtons = document.querySelectorAll('.gallery-btn');

    let currentAudio = null;
    let currentCategory = null;
    let isPlaying = false;

    if (galleryButtons.length > 0) {
        initGallery();
    }

    function initGallery() {
        galleryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.sound;
                loadGalleryContent(category);
            });
        });

        if (volumeControl) {
            volumeControl.addEventListener('input', (e) => {
                if (currentAudio) {
                    currentAudio.volume = e.target.value / 100;
                }
            });
        }
    }

    function loadGalleryContent(category) {
        const data = galleryData[category];
        if (!data) return;

        currentCategory = category;

        if (galleryImage) {
            galleryImage.classList.add('fade');

            setTimeout(() => {
                const randomIndex = Math.floor(Math.random() * data.images.length);
                galleryImage.src = data.images[randomIndex];
                galleryImage.classList.remove('fade');
            }, 300);
        }

        if (galleryTitle) galleryTitle.textContent = data.title;
        if (galleryDescription) galleryDescription.textContent = data.description;

        playGallerySound(data.sound);
    }

    function playGallerySound(soundPath) {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        currentAudio = new Audio(soundPath);
        currentAudio.volume = volumeControl ? volumeControl.value / 100 : 0.7;

        currentAudio.onplay = () => {
            isPlaying = true;
            updateIndicator('playing');
        };

        currentAudio.onpause = () => {
            isPlaying = false;
            updateIndicator('paused');
        };

        currentAudio.onended = () => {
            isPlaying = false;
            updateIndicator('ended');
        };

        currentAudio.onerror = () => {
            console.warn(`Couldn't load audio file: ${soundPath}`);
            updateIndicator('error');
        };

        currentAudio.play().catch(error => {
            console.warn('Autoplay is blocked:', error);
            updateIndicator('blocked');
        });
    }

    function updateIndicator(state) {
        if (!galleryIndicator) return;

        const icon = galleryIndicator.querySelector('.indicator-icon');
        const text = galleryIndicator.querySelector('.indicator-text');

        const states = {
            playing: { icon: '🔊', text: 'Воспроизводится...' },
            paused: { icon: '⏸️', text: 'На паузе' },
            ended: { icon: '✅', text: 'Завершено' },
            error: { icon: '❌', text: 'Ошибка загрузки' },
            blocked: { icon: '🔇', text: 'Нажмите для воспроизведения' }
        };

        const config = states[state] || states.playing;
        icon.textContent = config.icon;
        text.textContent = config.text;

        if (state === 'playing') {
            icon.classList.add('playing');
        } else {
            icon.classList.remove('playing');
        }
    }

    if (galleryIndicator) {
        galleryIndicator.addEventListener('click', () => {
            if (currentAudio) {
                if (isPlaying) {
                    currentAudio.pause();
                } else {
                    currentAudio.play().catch(() => {
                        showToast('⚠️ Нажмите на страницу для воспроизведения звука', 'warning');
                    });
                }
            }
        });
    }

    window.gallery = {
        loadCategory: loadGalleryContent,
        play: () => currentAudio?.play(),
        pause: () => currentAudio?.pause(),
        isPlaying: () => isPlaying
    };
});
