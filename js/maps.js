document.addEventListener('DOMContentLoaded', () => {
    if (typeof ymaps === 'undefined') {
        console.warn('Yandex Maps API not loaded. Check your API key.');
        return;
    }

    ymaps.ready(initMap);
});

function initMap() {
    const mapElement = document.getElementById('yandexMap');
    if (!mapElement) return;

    const campusCoords = [55.751574, 37.573856];

    const myMap = new ymaps.Map('yandexMap', {
        center: campusCoords,
        zoom: 16,
        controls: ['zoomControl', 'fullscreenControl', 'typeSelector']
    }, {
        searchControlProvider: 'yandex#search'
    });

    const myPlacemark = new ymaps.Placemark(campusCoords, {
        hintContent: 'Школа дизайна НИУ ВШЭ',
        balloonContentHeader: 'Школа дизайна НИУ ВШЭ',
        balloonContentBody: `
            <strong>Адрес:</strong><br>
            Малая Пионерская ул., 12, Москва<br>
            <strong>Метро:</strong> Павелецкая<br>
            <strong>Телефон:</strong> +7 495 621-87-11
        `,
        balloonContentFooter: 'Открыто ежедневно 9:00-21:00'
    }, {
        preset: 'islands#blueEducationIcon',
        draggable: false
    });

    myMap.geoObjects.add(myPlacemark);

    myMap.setBounds(myPlacemark.geometry.getBounds(), {
        checkZoomRange: true,
        zoomMargin: [50, 50, 50, 50]
    });

    window.hseMap = myMap;
    window.hsePlacemark = myPlacemark;
}

function addMapMarker(coords, options = {}) {
    if (!window.hseMap) return null;

    const placemark = new ymaps.Placemark(coords, {
        hintContent: options.hint || '',
        balloonContent: options.balloon || ''
    }, {
        preset: options.preset || 'islands#blueCircleIcon',
        draggable: options.draggable || false
    });

    window.hseMap.geoObjects.add(placemark);
    return placemark;
}

function buildRouteToCampus() {
    if (!window.hseMap || !window.hsePlacemark) return;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userCoords = [
                position.coords.latitude,
                position.coords.longitude
            ];

            ymaps.route([userCoords, window.hsePlacemark.geometry.getCoordinates()], {
                mapStateAutoApply: true
            }).then((route) => {
                window.hseMap.geoObjects.add(route);
                route.getPaths().options.set({
                    strokeColor: '#0f2d6b',
                    strokeWidth: 4
                });
            }, (error) => {
                console.error('Ошибка построения маршрута:', error);
                showToast('❌ Не удалось построить маршрут', 'error');
            });
        }, (error) => {
            console.error('Ошибка геолокации:', error);
            showToast('⚠️ Не удалось определить ваше местоположение', 'warning');
        });
    } else {
        showToast('⚠️ Геолокация не поддерживается браузером', 'warning');
    }
}

window.addMapMarker = addMapMarker;
window.buildRouteToCampus = buildRouteToCampus;
