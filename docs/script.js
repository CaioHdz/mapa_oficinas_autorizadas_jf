const cities = {
    "TH TRATORES - SÃO JOSÉ DO RIO PRETO-SP": { lat: -20.811, lng: -49.376, contact: "17 98159-0002 - Thiago" },
    "PROVIDÊNCIA - PASSOS-MG": { lat: -20.719, lng: -46.609, contact: "35 9981-6209 - Mateus" },
    "JVL - SÃO JOÃO DEL REI-MG": { lat: -21.136, lng: -44.261, contact: "37 9923-5958 - Van" },
    "JVL - BOM DESPACHO-MG": { lat: -19.736, lng: -45.252, contact: "37 9923-5958 - Van" },
    "AGRONATA - ITUIUTABA-MG": { lat: -18.973, lng: -49.462, contact: "34 9973-3338 - Flavio" },
    "ROGÉRIO - MOCOCA-SP": { lat: -21.467, lng: -47.002, contact: "19 99316-4016 - Rogerio" },
    "JF MÁQUINAS - ITAPIRA-SP": { lat: -22.435, lng: -46.822, contact: "19 97167-8420 - Evandro" },
    "IRINEU LUNKES - ÁGUA BOA -MT": { lat: -14.051, lng: -52.160, contact: "66 9922-7939 - Irineu" },
    "NORTON - ÁGUA BOA-MG": { lat: -19.155, lng: -42.393, contact: "33 8844-9638 - Norton" },
    "CLEISIOMAR - FORMOSA-GO": { lat: -15.5636, lng: -47.3375, contact: "(61) 99626-6404 - Cleisiomar" },
    "VALDIR MACHADO - CÁCERES-MT": { lat: -16.0765, lng: -57.6818, contact: "(65) 9610-1731 - Valdir Machado" },
    "NOCA - RAIZ - JUMIRIM-SP": { lat: -23.0888, lng: -47.7879, contact: "(15) 99782-7665 - Noca" },
    "WEVOTECH - ITAPIRA-SP": { lat: -22.4357, lng: -46.8225, contact: "(19) 99251-7186 - William" }
};

let map, routeLayer;
const technicians = ["SILVIO", "JHONNY", "ISAAC", "JORGE"];
let technicianLocations = {};

async function getTechnicianLocationsFromInputs() {
    for (const tech of technicians) {
        const input = document.getElementById(`city-${tech}`);
        if (input && input.value) {
            const city = input.value;
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
            const data = await response.json();
            if (data.length) {
                technicianLocations[tech] = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                    contact: `Contato: ${tech}`
                };
            } else {
                alert(`Cidade de ${tech} não encontrada, ele será ignorado.`);
            }
        }
    }
    Object.assign(cities, technicianLocations);
    initMap();
}

function initMap() {
    map = L.map('map').setView([-20, -44], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
    }).addTo(map);
    routeLayer = L.layerGroup().addTo(map);
}

async function calculateDistance() {
    const userCity = document.getElementById("cityInput").value;
    if (!userCity) {
        alert("Por favor, digite uma cidade!");
        return;
    }

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userCity)}`);
        const data = await response.json();

        if (!data.length) {
            alert("Cidade não encontrada. Tente novamente.");
            return;
        }

        const userCoords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        let results = [];

        for (const [city, coords] of Object.entries(cities)) {
            const distanceData = await fetchRouteDistance(userCoords, coords);
            if (distanceData) {
                results.push({
                    city,
                    distance: distanceData.distance,
                    duration: distanceData.duration,
                    coords,
                    contact: cities[city].contact
                });
            }
        }

        results.sort((a, b) => a.distance - b.distance);
        displayResults(userCoords, results);
    } catch (error) {
        alert("Erro ao buscar a cidade ou calcular as rotas.");
        console.error(error);
    }
}

async function fetchRouteDistance(start, end) {
    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=false`;
    try {
        const response = await fetch(routeUrl);
        const data = await response.json();
        if (data.routes && data.routes.length) {
            const route = data.routes[0];
            return {
                distance: route.distance / 1000,
                duration: route.duration / 3600
            };
        }
    } catch (error) {
        console.error("Erro ao calcular rota:", error);
    }
    return null;
}

function displayResults(userCoords, results) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "<ul>" + results.map(result => `
        <li onclick="showRoute(${userCoords.lat}, ${userCoords.lng}, ${result.coords.lat}, ${result.coords.lng}, 
        '${result.city}', ${result.distance}, ${result.duration})">
            ${result.city} - ${result.distance.toFixed(2)} km
        </li>`).join('') + "</ul>";
}

function showRoute(lat1, lng1, lat2, lng2, cityName, distance, duration) {
    routeLayer.clearLayers();

    L.marker([lat1, lng1]).addTo(routeLayer).bindPopup("Localização do Cliente").openPopup();
    L.marker([lat2, lng2]).addTo(routeLayer).bindPopup(cityName).openPopup();

    fetch(`https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?geometries=geojson`)
        .then(response => response.json())
        .then(data => {
            if (data.routes && data.routes.length) {
                const route = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
                L.polyline(route, { color: 'blue', weight: 5 }).addTo(routeLayer);
                map.fitBounds(routeLayer.getBounds());
            }
        });

        const rawContact = cities[cityName].contact;
        const phoneNumber = rawContact.match(/\d+/g).join(''); // Extrai apenas os números
        const contactName = rawContact.split('-').pop().trim(); // Extrai o nome após o último hífen
        
        document.getElementById("contact-info").innerHTML = `
    <div class="contact-info">
        <p><strong>Oficina mais próxima:</strong> ${cityName}</p>
        <p><strong>Distância:</strong> ${distance.toFixed(2)} km</p>
        <p><strong>Tempo estimado:</strong> ${duration.toFixed(2)} h</p>
        <p><strong>Contato:</strong> ${rawContact}</p>
        <a href="https://wa.me/55${phoneNumber}" target="_blank" style="
            display: inline-block;
            margin: 10px 0;
            padding: 10px 15px;
            background-color: #ffcc00;
            color: #121212; /* Alterando a cor para preto */
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
        ">
             Chamar no WhatsApp
        </a><br>
        <button onclick="openGoogleMaps(${lat1}, ${lng1}, ${lat2}, ${lng2})">Abrir no Google Maps</button>
    </div>`;
        
}

function openGoogleMaps(lat1, lng1, lat2, lng2) {
    const googleMapsUrl = `https://www.google.com/maps/dir/${lat1},${lng1}/${lat2},${lng2}`;
    window.open(googleMapsUrl, '_blank');
}

document.getElementById("calculateButton").addEventListener("click", calculateDistance);
document.getElementById("cityInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
        calculateDistance();
    }
});
document.getElementById("loadTechniciansButton").addEventListener("click", getTechnicianLocationsFromInputs);
