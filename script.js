"use strict";

/**
 * --- SYSTEM OBSŁUGI BŁĘDÓW (ERROR HANDLING) ---
 * Funkcja wyświetlająca błędy w widocznym dla użytkownika miejscu (na mapie).
 */
function showUserError(message) {
    // Sprawdź, czy kontener na błędy już istnieje
    let errorBox = document.getElementById('mars-error-box');

    // Jeśli nie, stwórz go dynamicznie
    if (!errorBox) {
        errorBox = document.createElement('div');
        errorBox.id = 'mars-error-box';
        // Style CSS wstrzyknięte bezpośrednio dla pewności wyświetlania
        errorBox.style.cssText = `
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            background-color: rgba(220, 53, 69, 0.95); /* Czerwony alarmowy */
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            pointer-events: none; /* Żeby nie blokował klikania w mapę pod spodem */
            transition: opacity 0.3s ease-in-out;
            text-align: center;
            max-width: 80%;
        `;
        
        // Spróbuj dodać do mapy, jeśli nie, to do body
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.appendChild(errorBox);
        } else {
            document.body.appendChild(errorBox);
        }
    }

    // Ustaw treść i pokaż
    errorBox.innerHTML = `<strong>⚠️ Błąd:</strong> ${message}`;
    errorBox.style.opacity = '1';

    // Loguj też do konsoli dla programisty
    console.error(message);

    // Ukryj komunikat po 5 sekundach
    setTimeout(() => {
        errorBox.style.opacity = '0';
    }, 5000);
}

// --- Definicja Warstw ---
const marsLayers = {
    global: L.tileLayer(
        'http://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/viking_mdim21_global/{z}/{x}/{y}.png',
        {
            maxZoom: 7,
            attribution: 'NASA/JPL/USGS | Mars Shaded Surface Texture',
            tms: true,
            noWrap: true
        }
    ),
    color: L.tileLayer(
        'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
        {
            maxZoom: 9,
            attribution: 'NASA/JPL/USGS | Mars MDIM 2.1 Color',
            tms: true,
            noWrap: true
        }
    ),
    topo: L.tileLayer(
        'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
        {
            maxZoom: 8,
            attribution: 'NASA/JPL/GSFC | MOLA Topography',
            tms: true,
            noWrap: true
        }
    )
};

// --- Nasłuchiwanie błędów ładowania kafelków ---
// To kluczowe dla map zewnętrznych (np. NASA), które mogą być niedostępne
Object.keys(marsLayers).forEach(key => {
    marsLayers[key].on('tileerror', (error) => {
        // Używamy debounce (prostego), żeby nie zalać użytkownika setkami błędów na raz
        if (!window.tileErrorShown) {
            showUserError('Nie udało się załadować części mapy. Sprawdź połączenie internetowe lub serwer NASA.');
            window.tileErrorShown = true;
            setTimeout(() => { window.tileErrorShown = false; }, 5000);
        }
    });
});

// --- Inicjalizacja Mapy ---
// Sprawdzamy czy kontener mapy istnieje
const mapContainer = document.getElementById('map');
let map;

if (!mapContainer) {
    showUserError("Krytyczny błąd: Nie znaleziono elementu o id 'map' w strukturze strony.");
} else {
    try {
        map = L.map('map', {
            center: [0, 0],
            zoom: 3,
            minZoom: 2,
            maxZoom: 9,
            zoomControl: true
        });

        let activeLayer = marsLayers.global;
        activeLayer.addTo(map);

        // --- Przełączanie Warstw ---
        const controls = document.querySelectorAll('#controls .btn');
        if (controls.length === 0) {
            console.warn("Nie znaleziono przycisków sterowania warstwami.");
        }

        controls.forEach(btn => {
            btn.addEventListener('click', () => {
                try {
                    document.querySelector('#controls .btn.active')?.classList.remove('active');
                    btn.classList.add('active');

                    const layerKey = btn.dataset.layer;
                    
                    if (!marsLayers[layerKey]) {
                        throw new Error(`Warstwa '${layerKey}' nie została zdefiniowana.`);
                    }

                    map.removeLayer(activeLayer);
                    activeLayer = marsLayers[layerKey];
                    activeLayer.addTo(map);
                } catch (e) {
                    showUserError(e.message);
                }
            });
        });

        // --- Wyświetlanie Współrzędnych ---
        const latEl = document.getElementById('lat');
        const lngEl = document.getElementById('lng');

        if (!latEl || !lngEl) {
            console.warn("Elementy 'lat' lub 'lng' nie istnieją. Współrzędne nie będą wyświetlane.");
        } else {
            map.on('mousemove', (e) => {
                latEl.textContent = e.latlng.lat.toFixed(4);
                lngEl.textContent = e.latlng.lng.toFixed(4);
            });
        }

        // --- Lądowiska / POI (Dane) ---
        const landingSites = [
            {
                name: 'Curiosity (MSL)',
                lat: -4.5895,
                lng: 137.4417,
                info: 'Krater Gale – lądowanie 6 sierpnia 2012. Łazik bada warunki dawnej habitowalności.',
                status: 'Aktywna'
            },
            {
                name: 'Perseverance (Mars 2020)',
                lat: 18.4447,
                lng: 77.4508,
                info: 'Krater Jezero – lądowanie 18 lutego 2021. Poszukiwanie śladów dawnego życia.',
                status: 'Aktywna'
            },
            {
                name: 'InSight',
                lat: 4.5024,
                lng: 135.6234,
                info: 'Elysium Planitia – lądowanie 26 listopada 2018. Badanie wnętrza Marsa.',
                status: 'Zakończona (2022)'
            },
            {
                name: 'Spirit (MER-A)',
                lat: -14.5684,
                lng: 175.4726,
                info: 'Krater Gusev – lądowanie 4 stycznia 2004.',
                status: 'Zakończona (2011)'
            },
            {
                name: 'Opportunity (MER-B)',
                lat: -1.9462,
                lng: 354.4734,
                info: 'Meridiani Planum – lądowanie 25 stycznia 2004. Odkrycie hematytu.',
                status: 'Zakończona (2018)'
            },
            {
                name: 'Viking 1',
                lat: 22.2699,
                lng: -47.9495,
                info: 'Chryse Planitia – lądowanie 20 lipca 1976. Pierwsza udana misja na Marsie.',
                status: 'Zakończona (1982)'
            },
            {
                name: 'Viking 2',
                lat: 47.9682,
                lng: 134.2894,
                info: 'Utopia Planitia – lądowanie 3 września 1976.',
                status: 'Zakończona (1980)'
            },
            {
                name: 'Phoenix',
                lat: 68.2188,
                lng: -125.7492,
                info: 'Green Valley (okolice bieguna północnego) – lądowanie 25 maja 2008. Potwierdzenie obecności lodu wodnego.',
                status: 'Zakończona (2008)'
            },
            {
                name: 'Zhurong (Tianwen-1)',
                lat: 25.066,
                lng: 109.925,
                info: 'Utopia Planitia – lądowanie 14 maja 2021. Pierwszy chiński łazik marsjański.',
                status: 'Uśpiona'
            }
        ];

        const markerIcon = L.divIcon({
            html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#ff6b35" fill-opacity="0.3" stroke="#ff6b35" stroke-width="2"/>
                <circle cx="12" cy="12" r="4" fill="#ff6b35"/>
            </svg>`,
            className: 'mars-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -14]
        });

        // Dodawanie markerów lądowisk
        landingSites.forEach(site => {
            const statusColor = site.status === 'Aktywna' ? '#4cff4c' :
                                site.status === 'Uśpiona' ? '#ffd700' : '#888';

            L.marker([site.lat, site.lng], { icon: markerIcon })
                .addTo(map)
                .bindPopup(`
                    <h4>${site.name}</h4>
                    <p>${site.info}</p>
                    <p style="margin-top:6px;">
                        Status: <strong style="color:${statusColor}">${site.status}</strong>
                    </p>
                    <p style="color:#999; font-size:0.75rem; margin-top:4px;">
                        ${site.lat.toFixed(4)}°, ${site.lng.toFixed(4)}°
                    </p>
                `);
        });

        // --- Punkty POI (Olympus Mons, etc.) ---
        const poiMarker = L.divIcon({
            html: `<svg width="18" height="18" viewBox="0 0 18 18">
                <polygon points="9,2 16,16 2,16" fill="#ff944d" fill-opacity="0.4" stroke="#ff944d" stroke-width="1.5"/>
            </svg>`,
            className: 'mars-marker',
            iconSize: [18, 18],
            iconAnchor: [9, 9],
            popupAnchor: [0, -10]
        });

        const pois = [
            {
                name: 'Olympus Mons',
                lat: 18.65,
                lng: -133.8,
                info: 'Największy wulkan w Układzie Słonecznym – 21,9 km wysokości, 600 km średnicy.'
            },
            {
                name: 'Valles Marineris',
                lat: -14.0,
                lng: -59.2,
                info: 'Gigantyczny kanion – 4000 km długości, do 7 km głębokości.'
            },
            {
                name: 'Hellas Planitia',
                lat: -42.4,
                lng: 70.5,
                info: 'Ogromny krater uderzeniowy – 2300 km średnicy, 7 km głębokości.'
            }
        ];

        pois.forEach(poi => {
            L.marker([poi.lat, poi.lng], { icon: poiMarker })
                .addTo(map)
                .bindPopup(`
                    <h4>📍 ${poi.name}</h4>
                    <p>${poi.info}</p>
                `);
        });

    } catch (e) {
        showUserError("Wystąpił nieoczekiwany błąd podczas inicjalizacji mapy: " + e.message);
    }
}