const cities = {
    "(000069) TH TRATORES - SÃO JOSÉ DO RIO PRETO-SP": { lat: -20.84812032986367, lng: -49.376213235188864, contact: "17 98159-0002 - Thiago" }, 
    "(T00016) PROVIDÊNCIA - PASSOS-MG": { lat: -20.719, lng: -46.609, contact: "35 9981-6209 - Mateus" },
    //"JVL - SÃO JOÃO DEL REI-MG": { lat: -21.136, lng: -44.261, contact: "37 9923-5958 - Van" },
    "(000175) EDINHO- BOM DESPACHO-MG": { lat: -19.736, lng: -45.252, contact: "37 99667-7474 - Edinho" },
    "(000023) AGRONATA - ITUIUTABA-MG": { lat: -18.952717093136638, lng: -49.457231717922184, contact: "34 9973-3338 - Flavio" }, 
    "(000019) REAL MAQUINAS  - BELO HORIZONTE ": { lat: -19.8584383970395, lng: -43.908294174462426, contact: "31 9951-0031 - Eduardo" }, 
    "JF MÁQUINAS - ITAPIRA-SP": { lat: -22.44642625792153, lng: -46.806167884398754, contact: "19 97167-8420 - Evandro" }, 
    "(000164) IRINEU LUNKES - ÁGUA BOA -MT": { lat: -14.051, lng: -52.160, contact: "66 9922-7939 - Irineu" },
    "(000176) LOURIVALDO - ITAPIRA-SP": { lat: -22.435, lng: -46.822, contact: "(19) 98136-5631 - Lourivaldo" },
    "(000021) CLEISIOMAR - FORMOSA-GO": { lat: -15.547143287229915, lng: -47.31774824423258, contact: "(61) 99626-6404 - Cleisiomar" }, 
    "VALDIR MACHADO - CÁCERES-MT": { lat: -16.0765, lng: -57.6818, contact: "(65) 9610-1731 - Valdir Machado" },
    "(000020) NOCA - RAIZ - JUMIRIM-SP": { lat: -23.079400226188383, lng: -47.79320520355734, contact: "(15) 99782-7665 - Noca" },
    "EDUARTE - SÃO JOÃO DEL REI-MG": { lat: -21.081089911296907, lng: -44.22460941895275, contact: "(32) 9944-5164 - Fernando"}, 
    "(000180) - SODMEC - PARA DE MINAS - MG " : { lat: -19.828916513580793, lng: -44.62242964836367, contact:" (37) 9995-5774"},
    
    "(000149) PJM MANUTENÇÕES - ARAXÁ-MG": { lat: -19.5902, lng: -46.9438, contact: "(34) 9986-1524 - Pablo Oliveira" }
};

let map, routeLayer;
const technicians = ["SILVIO", "RICARDO", "ISAAC", "JORGE"];
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
    const calculateBtn = document.getElementById("calculateButton");
    const spinner = document.getElementById("spinner");
    const statusDiv = document.getElementById("loading-status");

    if (!userCity) {
        alert("Por favor, digite uma cidade!");
        return;
    }

    // UX: inicia loading
    calculateBtn.disabled = true;
    spinner.style.display = "inline-block";
    statusDiv.textContent = "Calculando rotas...";

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userCity)}`);
        const data = await response.json();

        if (!data.length) {
            alert("Cidade não encontrada. Tente novamente.");
            return;
        }

        const userCoords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        let results = [];

        const entries = Object.entries(cities);
        for (let i = 0; i < entries.length; i++) {
            const [city, coords] = entries[i];
            statusDiv.textContent = `Calculando rota ${i + 1} de ${entries.length}...`;

            const distanceData = await fetchRouteDistance(userCoords, coords);
            if (distanceData) {
                results.push({
                    city,
                    distance: distanceData.distance,
                    duration: distanceData.duration,
                    coords,
                    contact: coords.contact
                });
            }
        }

        results.sort((a, b) => a.distance - b.distance);
        statusDiv.textContent = `${results.length} técnicos encontrados`;
        displayResults(userCoords, results);

    } catch (error) {
        alert("Erro ao buscar a cidade ou calcular as rotas.");
        console.error(error);
    } finally {
        // UX: encerra loading
        spinner.style.display = "none";
        calculateBtn.disabled = false;
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
document.addEventListener("DOMContentLoaded", () => {
    const reveals = document.querySelectorAll(".reveal");

    function revealOnScroll() {
        for (const el of reveals) {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            const revealPoint = 150;

            if (elementTop < windowHeight - revealPoint) {
                el.classList.add("active");
            }
        }
    }

    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll(); // caso já esteja visível no carregamento
});
