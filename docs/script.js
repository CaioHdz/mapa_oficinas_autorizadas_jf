// Dados das cidades e oficinas
const cities = {
    "(000069) TH TRATORES - SÃO JOSÉ DO RIO PRETO-SP": { lat: -20.84812032986367, lng: -49.376213235188864, contact: "17 98159-0002 - Thiago" }, 
    "(T00016) PROVIDÊNCIA - PASSOS-MG": { lat: -20.719, lng: -46.609, contact: "35 9981-6209 - Mateus" },
    "(000175) EDINHO- BOM DESPACHO-MG": { lat: -19.736, lng: -45.252, contact: "37 99667-7474 - Edinho" },
    "MARTINELLE (MM) - VILA RICA - MT": { lat: -10.01531, lng: -51.12049, contact: "(63) 99256-0996 - ELCIO"},
    "(000023) AGRONATA - ITUIUTABA-MG": { lat: -18.952717093136638, lng: -49.457231717922184, contact: "34 9973-3338 - Flavio" }, 
    "(000019) REAL MAQUINAS - BELO HORIZONTE": { lat: -19.8584383970395, lng: -43.908294174462426, contact: "31 9951-0031 - Eduardo" }, 
    "JF MÁQUINAS - ITAPIRA-SP": { lat: -22.44642625792153, lng: -46.806167884398754, contact: "19 97167-8420 - Evandro" }, 
    "(000164) IRINEU LUNKES - ÁGUA BOA -MT": { lat: -14.051, lng: -52.160, contact: "66 9922-7939 - Irineu" },
    "(000176) LOURIVALDO - ITAPIRA-SP": { lat: -22.435, lng: -46.822, contact: "(19) 98136-5631 - Lourivaldo" },
    "(000021) CLEISIOMAR - FORMOSA-GO": { lat: -15.547143287229915, lng: -47.31774824423258, contact: "(61) 99626-6404 - Cleisiomar" }, 
    "VALDIR MACHADO - CÁCERES-MT": { lat: -16.0765, lng: -57.6818, contact: "(65) 9610-1731 - Valdir Machado" },
    "(000020) NOCA - RAIZ - JUMIRIM-SP": { lat: -23.079400226188383, lng: -47.79320520355734, contact: "(15) 99782-7665 - Noca" },
    "EDUARTE - SÃO JOÃO DEL REI-MG": { lat: -21.081089911296907, lng: -44.22460941895275, contact: "(32) 9944-5164 - Fernando"}, 
    "(000089) - FORGE IMPLEMENTOS - SANTA RITA CALDAS- MG": { lat: -22.03338, lng: -46.34051, contact: "(35) 99902-8621- ANDERSON"},
    "(000192) - J&G (IGARAPAVA) - UBERABA - MG": { lat: -19.77943, lng: -47.96398, contact: "(34) 9877-6777- FERNANDO"},
    "(000179) - MERCADÃO - RONDONOPOLIS - MT": { lat: -16.46547, lng: -54.65765, contact: "(66) 9969-9590- DIEGO"},
    "(000180) - SODMEC - PARÁ DE MINAS - MG": { lat: -19.82894, lng: -44.62254, contact: "(37)99995-5774 - DENIS"},
    "(000040) - CRICO - ITAPIRA - SP": { lat: -22.45240, lng: -46.805598, contact: "(19) 97137-5641- VARTINHO"},
    "(000149) PJM MANUTENÇÕES - ARAXÁ-MG": { lat: -19.5902, lng: -46.9438, contact: "(34) 9986-1524 - Pablo Oliveira"}
};

let map, routeLayer;
const technicians = ["SILVIO", "RICARDO", "ISAAC", "JORGE"];
let technicianLocations = {};
let isSharedRouteMode = false; // Controle do modo rota compartilhada


// FUNÇÕES DE INICIALIZAÇÃO


function initMap() {
    map = L.map('map').setView([-20, -44], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    routeLayer = L.layerGroup().addTo(map);
}


// FUNÇÕES DE TÉCNICOS


async function getTechnicianLocationsFromInputs() {
    const loadingStatus = document.getElementById("loading-status");
    loadingStatus.textContent = "Buscando localizações dos técnicos...";
    
    for (const tech of technicians) {
        const input = document.getElementById(`city-${tech}`);
        if (input && input.value) {
            const city = input.value;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`);
                const data = await response.json();
                if (data.length) {
                    technicianLocations[tech] = {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon),
                        contact: `Contato: ${tech}`
                    };
                    loadingStatus.textContent = `✅ ${tech} localizado em ${city}`;
                } else {
                    loadingStatus.textContent = `⚠️ Cidade de ${tech} não encontrada, ele será ignorado.`;
                }
            } catch (error) {
                console.error(`Erro ao buscar ${tech}:`, error);
                loadingStatus.textContent = `❌ Erro ao localizar ${tech}`;
            }
        }
    }
    
    Object.assign(cities, technicianLocations);
    loadingStatus.textContent = "✅ Técnicos carregados com sucesso!";
    setTimeout(() => {
        loadingStatus.textContent = "";
    }, 2000);
    
    initMap();
}


// FUNÇÕES DE ROTA E DISTÂNCIA


async function calculateDistance() {
    // Se estiver em modo rota compartilhada, não permite calcular
    if (isSharedRouteMode) {
        showToastMessage("⚠️ Você está visualizando uma rota compartilhada. Clique em 'Calcular Nova Rota' para fazer uma nova busca.", "error");
        return;
    }
    
    const userCity = document.getElementById("cityInput").value;
    const calculateBtn = document.getElementById("calculateButton");
    const spinner = document.getElementById("spinner");
    const statusDiv = document.getElementById("loading-status");

    if (!userCity) {
        showToastMessage("Por favor, digite uma cidade!", "error");
        return;
    }

    calculateBtn.disabled = true;
    spinner.style.display = "inline-block";
    statusDiv.textContent = "🔍 Buscando cidade...";

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userCity)}&limit=1`);
        const data = await response.json();

        if (!data.length) {
            showToastMessage("Cidade não encontrada. Tente novamente.", "error");
            return;
        }

        const userCoords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        let results = [];

        const entries = Object.entries(cities);
        for (let i = 0; i < entries.length; i++) {
            const [city, coords] = entries[i];
            statusDiv.textContent = `🔄 Calculando rota ${i + 1} de ${entries.length}: ${city.substring(0, 30)}...`;

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
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        results.sort((a, b) => a.distance - b.distance);
        statusDiv.textContent = `✅ ${results.length} oficinas encontradas`;
        displayResults(userCoords, results);

    } catch (error) {
        showToastMessage("Erro ao buscar a cidade ou calcular as rotas.", "error");
        console.error(error);
    } finally {
        spinner.style.display = "none";
        calculateBtn.disabled = false;
        setTimeout(() => {
            if (statusDiv.textContent.includes("encontradas")) {
                setTimeout(() => {
                    statusDiv.textContent = "";
                }, 3000);
            }
        }, 1000);
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


// FUNÇÕES DE EXIBIÇÃO


function displayResults(userCoords, results) {
    const resultDiv = document.getElementById("result");
    if (results.length === 0) {
        resultDiv.innerHTML = "<p>Nenhuma oficina encontrada.</p>";
        return;
    }
    
    resultDiv.innerHTML = `
        <h3>📋 Oficinas mais próximas (${results.length} encontradas)</h3>
        <ul class="results-list">
            ${results.map((result, index) => `
                <li class="result-item" onclick="showRoute(${userCoords.lat}, ${userCoords.lng}, ${result.coords.lat}, ${result.coords.lng}, 
                '${escapeHtml(result.city)}', ${result.distance}, ${result.duration})">
                    <div class="result-rank">#${index + 1}</div>
                    <div class="result-content">
                        <strong>${escapeHtml(result.city)}</strong><br>
                        <span class="result-distance">🚗 ${result.distance.toFixed(2)} km</span>
                        <span class="result-time">⏱️ ${result.duration.toFixed(2)} h</span>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
}

// FUNÇÃO CORRIGIDA: Com ícone de pessoa (🧑‍🔧) em vez de bandeira
async function showRoute(lat1, lng1, lat2, lng2, cityName, distance = null, duration = null) {
    // Mostrar loading
    showToastMessage("🔄 Calculando rota...", "info");
    
    // Se não recebeu distância (caso do link compartilhado), calcula agora
    let finalDistance = distance;
    let finalDuration = duration;
    
    if (finalDistance === null || finalDistance === 0 || finalDuration === null || finalDuration === 0) {
        const start = { lat: lat1, lng: lng1 };
        const end = { lat: lat2, lng: lng2 };
        const routeData = await fetchRouteDistance(start, end);
        
        if (routeData) {
            finalDistance = routeData.distance;
            finalDuration = routeData.duration;
        } else {
            finalDistance = 0;
            finalDuration = 0;
        }
    }
    
    // Salvar rota atual para compartilhamento
    window.currentRoute = {
        start: { lat: lat1, lng: lng1 },
        end: { lat: lat2, lng: lng2 },
        cityName: cityName,
        distance: finalDistance,
        duration: finalDuration
    };
    
    routeLayer.clearLayers();

    // Ícone de carro para a oficina
    const carIcon = L.divIcon({
        html: '🚗',
        iconSize: [32, 32],
        className: 'custom-car-icon'
    });
    
    // Ícone de pessoa para o cliente (CORRIGIDO - agora é pessoa)
    const personIcon = L.divIcon({
        html: '🧑‍🔧',  // Ícone de pessoa/técnico
        iconSize: [32, 32],
        className: 'custom-person-icon'
    });
    
    const clientMarker = L.marker([lat1, lng1], { icon: personIcon }).addTo(routeLayer);
    clientMarker.bindPopup("<strong>🧑‍🔧 Localização do Cliente</strong>").openPopup();
    
    const techMarker = L.marker([lat2, lng2], { icon: carIcon }).addTo(routeLayer);
    techMarker.bindPopup(`<strong>🔧 ${escapeHtml(cityName)}</strong>`);

    // Buscar e desenhar a rota
    fetch(`https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?geometries=geojson&overview=full`)
        .then(response => response.json())
        .then(data => {
            if (data.routes && data.routes.length) {
                const route = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
                const polyline = L.polyline(route, { color: '#2196F3', weight: 5, opacity: 0.8 });
                polyline.addTo(routeLayer);
                map.fitBounds(routeLayer.getBounds());
                
                // Adicionar informações na polilinha
                polyline.bindPopup(`
                    <strong>🚗 Rota de Carro</strong><br>
                    📏 Distância: ${finalDistance.toFixed(2)} km<br>
                    ⏱️ Tempo: ${finalDuration.toFixed(2)} h
                `);
            }
        })
        .catch(error => console.error("Erro ao desenhar rota:", error));

    // Exibir informações de contato
    const cityData = cities[cityName];
    if (cityData && cityData.contact) {
        const rawContact = cityData.contact;
        const phoneNumbers = rawContact.match(/\d+/g);
        const phoneNumber = phoneNumbers ? phoneNumbers.join('') : '';
        
        document.getElementById("contact-info").innerHTML = `
            <div class="contact-card-content">
                <h3>🔧 Oficina Selecionada</h3>
                <p><strong>👤 Nome:</strong> ${escapeHtml(cityName)}</p>
                <p><strong>🚗 Distância:</strong> ${finalDistance.toFixed(2)} km</p>
                <p><strong>⏱️ Tempo estimado:</strong> ${finalDuration.toFixed(2)} h (${formatTime(finalDuration)})</p>
                <p><strong>📞 Contato:</strong> ${escapeHtml(rawContact)}</p>
                <div class="contact-buttons">
                    ${phoneNumber ? `<a href="https://wa.me/55${phoneNumber}" target="_blank" class="whatsapp-button">💬 Chamar no WhatsApp</a>` : ''}
                    <button onclick="shareRoute()" class="share-button">📤 Compartilhar Rota</button>
                    <button onclick="openGoogleMaps(${lat1}, ${lng1}, ${lat2}, ${lng2})" class="maps-button">🗺️ Abrir no Google Maps</button>
                </div>
            </div>
        `;
    }
    
    showToastMessage(`✅ Rota calculada: ${finalDistance.toFixed(2)} km`, "success");
}

// Função auxiliar para formatar tempo
function formatTime(hours) {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    if (h > 0) {
        return `${h}h ${m}min`;
    }
    return `${m}min`;
}

function openGoogleMaps(lat1, lng1, lat2, lng2) {
    const googleMapsUrl = `https://www.google.com/maps/dir/${lat1},${lng1}/${lat2},${lng2}`;
    window.open(googleMapsUrl, '_blank');
}


// FUNÇÕES DE COMPARTILHAMENTO


function generateShareableLink(userLat, userLng, techLat, techLng, cityName) {
    const routeData = {
        start: { lat: userLat, lng: userLng },
        end: { lat: techLat, lng: techLng },
        cityName: cityName,
        timestamp: Date.now(),
        version: '1.0'
    };
    const encoded = btoa(JSON.stringify(routeData));
    return `${window.location.origin}${window.location.pathname}?rota=${encoded}`;
}

async function shareRoute() {
    if (!window.currentRoute) {
        showToastMessage('❌ Nenhuma rota ativa para compartilhar', 'error');
        return;
    }
    
    const shareUrl = generateShareableLink(
        window.currentRoute.start.lat,
        window.currentRoute.start.lng,
        window.currentRoute.end.lat,
        window.currentRoute.end.lng,
        window.currentRoute.cityName
    );
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Rota para oficina mecânica',
                text: `Rota para ${window.currentRoute.cityName} - ${window.currentRoute.distance.toFixed(2)} km`,
                url: shareUrl
            });
            showToastMessage('✅ Rota compartilhada com sucesso!', 'success');
        } catch (err) {
            if (err.name !== 'AbortError') {
                await copyToClipboard(shareUrl);
            }
        }
    } else {
        await copyToClipboard(shareUrl);
    }
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToastMessage('✅ Link copiado! Envie para quem quiser', 'success');
    } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToastMessage('✅ Link copiado! Envie para quem quiser', 'success');
    }
}

function showToastMessage(message, type = 'info') {
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    
    let bgColor = '#333';
    if (type === 'error') bgColor = '#f44336';
    if (type === 'success') bgColor = '#4CAF50';
    if (type === 'info') bgColor = '#2196F3';
    
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        animation: fadeInOut 2s ease-in-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast && toast.remove) toast.remove();
    }, 2500);
}


// FUNÇÕES DE MODO ROTA COMPARTILHADA


// Função para ativar/desativar modo rota compartilhada
// Função para ativar/desativar modo rota compartilhada
function enableSharedRouteMode(enable) {
    isSharedRouteMode = enable;
    const container = document.querySelector('.container');
    const overlay = document.getElementById('sharedOverlay');
    
    if (enable) {
        // Mostrar overlay e bloquear inputs
        if (overlay) overlay.style.display = 'block';
        if (container) container.classList.add('shared-mode-active');
        
        // Desabilitar inputs específicos
        const cityInput = document.getElementById('cityInput');
        const calculateBtn = document.getElementById('calculateButton');
        const techInputs = document.querySelectorAll('#techInputs input');
        const loadTechBtn = document.getElementById('loadTechniciansButton');
        
        if (cityInput) cityInput.disabled = true;
        if (calculateBtn) calculateBtn.disabled = true;
        techInputs.forEach(input => input.disabled = true);
        if (loadTechBtn) loadTechBtn.disabled = true;
        
        // NÃO tem botão de "Calcular Nova Rota" - só o aviso
        
    } else {
        // Restaurar tudo
        if (overlay) overlay.style.display = 'none';
        if (container) container.classList.remove('shared-mode-active');
        
        // Reabilitar inputs
        const cityInput = document.getElementById('cityInput');
        const calculateBtn = document.getElementById('calculateButton');
        const techInputs = document.querySelectorAll('#techInputs input');
        const loadTechBtn = document.getElementById('loadTechniciansButton');
        
        if (cityInput) {
            cityInput.disabled = false;
            cityInput.value = '';
        }
        if (calculateBtn) calculateBtn.disabled = false;
        techInputs.forEach(input => {
            input.disabled = false;
            input.value = '';
        });
        if (loadTechBtn) loadTechBtn.disabled = false;
        
        // Resetar variáveis
        window.currentRoute = null;
    }
}

// Função para carregar rota da URL
function loadRouteFromURL() {
    const params = new URLSearchParams(window.location.search);
    const routeParam = params.get('rota');
    
    if (!routeParam) return false;
    
    try {
        const routeData = JSON.parse(atob(routeParam));
        
        if (!routeData.start || !routeData.end) {
            throw new Error('Dados de rota inválidos');
        }
        
        const now = Date.now();
        const hoursSinceCreated = (now - routeData.timestamp) / (1000 * 60 * 60);
        if (hoursSinceCreated > 24) {
            showToastMessage('⚠️ Este link de rota expirou (mais de 24h)', 'error');
            return false;
        }
        
        // Ativar modo rota compartilhada
        enableSharedRouteMode(true);
        
        showSharedRouteBadge(routeData.cityName);
        
        setTimeout(async () => {
            if (!map) {
                initMap();
            }
            
            // Chamar showRoute sem distância para que ela calcule
            await showRoute(
                routeData.start.lat,
                routeData.start.lng,
                routeData.end.lat,
                routeData.end.lng,
                routeData.cityName,
                null,  // null para forçar cálculo
                null   // null para forçar cálculo
            );
            
            setTimeout(() => {
                if (routeLayer && routeLayer.getBounds && routeLayer.getBounds().isValid()) {
                    map.fitBounds(routeLayer.getBounds());
                }
            }, 1000);
        }, 500);
        
        return true;
    } catch (error) {
        console.error('Erro ao carregar rota compartilhada:', error);
        showToastMessage('❌ Link de rota inválido', 'error');
        return false;
    }
}

function showSharedRouteBadge(cityName) {
    const existingBadge = document.querySelector('.shared-route-badge');
    if (existingBadge) existingBadge.remove();
    
    const badge = document.createElement('div');
    badge.className = 'shared-route-badge';
    badge.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 18px;
        border-radius: 12px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.5s ease-out;
        font-size: 14px;
    `;
    badge.innerHTML = `🔗 Rota Compartilhada<br><small style="opacity:0.9">${escapeHtml(cityName)}</small>`;
    document.body.appendChild(badge);
    
    setTimeout(() => {
        if (badge && badge.remove) badge.remove();
    }, 8000);
}

function cleanURL() {
    if (window.history && window.history.replaceState) {
        const newURL = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newURL);
    }
}


// FUNÇÕES UTILITÁRIAS


function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// EVENT LISTENERS E INICIALIZAÇÃO


document.getElementById("calculateButton").addEventListener("click", calculateDistance);
document.getElementById("cityInput").addEventListener("keypress", event => {
    if (event.key === "Enter") {
        calculateDistance();
    }
});
document.getElementById("loadTechniciansButton").addEventListener("click", getTechnicianLocationsFromInputs);

initMap();

document.addEventListener("DOMContentLoaded", () => {
    const routeLoaded = loadRouteFromURL();
    if (routeLoaded) {
        setTimeout(() => cleanURL(), 5000);
    }
    
    const reveals = document.querySelectorAll(".reveal");
    if (reveals.length > 0) {
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
        revealOnScroll();
    }
});

// Exportar funções para uso global
window.showRoute = showRoute;
window.shareRoute = shareRoute;
window.openGoogleMaps = openGoogleMaps;