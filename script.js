// --- Mars Tile Layers (USGS / OpenPlanetary) ---
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

// --- Initialize Map ---
const map = L.map('map', {
    center: [0, 0],
    zoom: 3,
    minZoom: 2,
    maxZoom: 9,
    zoomControl: true
});

let activeLayer = marsLayers.global;
activeLayer.addTo(map);

// --- Layer Switching ---
document.querySelectorAll('#controls .btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('#controls .btn.active').classList.remove('active');
        btn.classList.add('active');

        const layerKey = btn.dataset.layer;
        map.removeLayer(activeLayer);
        activeLayer = marsLayers[layerKey];
        activeLayer.addTo(map);
    });
});

// --- Coordinate Display ---
const latEl = document.getElementById('lat');
const lngEl = document.getElementById('lng');

map.on('mousemove', (e) => {
    latEl.textContent = e.latlng.lat.toFixed(4);
    lngEl.textContent = e.latlng.lng.toFixed(4);
});

// --- Landing Sites / Points of Interest ---
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

// --- Olympus Mons & Valles Marineris labels ---
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
