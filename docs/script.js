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
    "(000214) - Gilson Soltovski - SINOP - MT": { lat:  -11.9102, lng: -55.5169, contact: "(66) 99713-5946 - Gilson"},
    "(000040) - CRICO - ITAPIRA - SP": { lat: -22.45240, lng: -46.805598, contact: "(19) 97137-5641- VARTINHO"},
    "(000149) PJM MANUTENÇÕES - ARAXÁ-MG": { lat: -19.5902, lng: -46.9438, contact: "(34) 9986-1524 - Pablo Oliveira"}
};

let map;
const routeMarkers = [];
const routeLineSourceId = 'active-route';
const routeLineLayerId = 'active-route-line';
let routeLineClickHandler = null;
const technicians = ["SILVIO", "RICARDO", "ISAAC", "JORGE"];
let technicianLocations = {};
let isSharedRouteMode = false; // Controle do modo rota compartilhada

const iconPaths = {
    pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    route: '<path d="M4 19V5m0 0 5 3 5-3 6 3v14l-6-3-5 3-5-3"/>',
    car: '<path d="m5 11 1.5-4h11L19 11"/><path d="M3 11h18v7H3zM6 18v2m12-2v2M6 14h.01M18 14h.01"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
    time: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    wrench: '<path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L15 12l-3-3 2.7-2.7Z"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.4 2.8a2 2 0 0 1-.6 1.7L7.5 9.6a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 1.7-.6l2.8.4a2 2 0 0 1 1.6 1.9Z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.7 6.8-4.4m-6.8 7 6.8 4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7"/>',
    arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>'
};

function icon(name, className = '') {
    return `<svg${className ? ` class="${className}"` : ''} viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] || iconPaths.pin}</svg>`;
}


// FUNÇÕES DE INICIALIZAÇÃO


function initMap() {
    map = new maplibregl.Map({
        container: 'map',
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: [-44, -20],
        zoom: 5.5,
        attributionControl: true
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
}

function clearRouteLayers() {
    routeMarkers.splice(0).forEach(marker => marker.remove());
    const removeLine = () => {
        if (map.getLayer(routeLineLayerId)) map.removeLayer(routeLineLayerId);
        if (map.getSource(routeLineSourceId)) map.removeSource(routeLineSourceId);
    };
    if (map.isStyleLoaded()) removeLine();
    else map.once('load', removeLine);
}

function addRouteMarker(lat, lng, markerType, label, open = false) {
    const element = document.createElement('div');
    element.className = `custom-${markerType}-icon`;
    element.innerHTML = icon(markerType === 'person' ? 'person' : 'car');
    const popup = new maplibregl.Popup({ offset: 20 }).setHTML(`<strong>${escapeHtml(label)}</strong>`);
    const marker = new maplibregl.Marker({ element, anchor: 'bottom' })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);
    routeMarkers.push(marker);
    if (open) marker.togglePopup();
}

function drawRouteLine(coordinates, distance, duration) {
    const addLine = () => {
        if (map.getLayer(routeLineLayerId)) map.removeLayer(routeLineLayerId);
        if (map.getSource(routeLineSourceId)) map.removeSource(routeLineSourceId);
        map.addSource(routeLineSourceId, {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } }
        });
        map.addLayer({
            id: routeLineLayerId,
            type: 'line',
            source: routeLineSourceId,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#d3aa00', 'line-width': 5, 'line-opacity': 0.92 }
        });
        const bounds = coordinates.reduce((result, coordinate) => result.extend(coordinate), new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
        map.fitBounds(bounds, { padding: 28, maxZoom: 12 });
        if (routeLineClickHandler) map.off('click', routeLineLayerId, routeLineClickHandler);
        routeLineClickHandler = event => {
            new maplibregl.Popup({ closeButton: true })
                .setLngLat(event.lngLat)
                .setHTML(`<strong>Trajeto estimado</strong><br>Distância: ${distance.toFixed(0)} km<br>Tempo: ${formatTime(duration)}`)
                .addTo(map);
        };
        map.on('click', routeLineLayerId, routeLineClickHandler);
    };
    if (map.isStyleLoaded()) addLine();
    else map.once('load', addLine);
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
                        city,
                        contact: `Contato: ${tech}`
                    };
                    loadingStatus.textContent = `${tech} localizado em ${city}`;
                } else {
                    loadingStatus.textContent = `Cidade de ${tech} não encontrada; ele será ignorado.`;
                }
            } catch (error) {
                console.error(`Erro ao buscar ${tech}:`, error);
                loadingStatus.textContent = `Erro ao localizar ${tech}.`;
            }
        }
    }
    
    Object.assign(cities, technicianLocations);
    loadingStatus.textContent = "Localizações dos técnicos atualizadas.";
    setTimeout(() => {
        loadingStatus.textContent = "";
    }, 2000);
    
}


// FUNÇÕES DE ROTA E DISTÂNCIA


async function calculateDistance() {
    // Se estiver em modo rota compartilhada, não permite calcular
    if (isSharedRouteMode) {
        showToastMessage("Esta rota compartilhada está em modo de visualização.", "error");
        return;
    }
    
    const userCity = document.getElementById("cityInput").value;
    const calculateBtn = document.getElementById("calculateButton");
    const spinner = document.getElementById("spinner");
    const statusDiv = document.getElementById("loading-status");

    if (!userCity) {
        showToastMessage("Digite a cidade do atendimento.", "error");
        return;
    }

    calculateBtn.disabled = true;
    spinner.style.display = "inline-block";
    statusDiv.textContent = "Buscando cidade...";

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userCity)}&limit=1`);
        const data = await response.json();

        if (!data.length) {
            showToastMessage("Cidade não encontrada. Tente novamente.", "error");
            return;
        }

        const userCoords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        window.currentClientCity = userCity;
        let results = [];

        const entries = Object.entries(cities);
        for (let i = 0; i < entries.length; i++) {
            const [city, coords] = entries[i];
            statusDiv.textContent = `Calculando trajeto ${i + 1} de ${entries.length}: ${city.substring(0, 30)}...`;

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
        statusDiv.textContent = `${results.length} opções encontradas`;
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
        resultDiv.innerHTML = `<div class="empty-state"><strong>Nenhuma opção encontrada</strong><p>Tente outra cidade ou confira a grafia informada.</p></div>`;
        return;
    }
    
    resultDiv.innerHTML = `
        <h3>Opções mais próximas <span class="result-count">${results.length}</span></h3>
        <ul class="results-list">
            ${results.map((result, index) => `
                <li class="result-item" role="button" tabindex="0" data-result-index="${index}">
                    <div class="result-rank">#${index + 1}</div>
                    <div class="result-content">
                        <strong>${escapeHtml(result.city)}</strong><br>
                        <span class="result-distance">${icon('car')} ${result.distance.toFixed(0)} km</span>
                        <span class="result-time">${icon('time')} ${formatTime(result.duration)}</span>
                    </div>
                    ${icon('arrow', 'result-arrow')}
                </li>
            `).join('')}
        </ul>
    `;

    resultDiv.querySelectorAll('[data-result-index]').forEach(item => {
        const selectResult = () => {
            resultDiv.querySelectorAll('.result-item').forEach(row => row.classList.remove('is-selected'));
            item.classList.add('is-selected');
            const result = results[Number(item.dataset.resultIndex)];
            showRoute(userCoords.lat, userCoords.lng, result.coords.lat, result.coords.lng, result.city, result.distance, result.duration);
        };
        item.addEventListener('click', selectResult);
        item.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectResult(); }
        });
    });
}

async function showRoute(lat1, lng1, lat2, lng2, cityName, distance = null, duration = null) {
    showToastMessage("Calculando trajeto...", "info");
    
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
    
    clearRouteLayers();
    addRouteMarker(lat1, lng1, 'person', 'Localização do cliente', true);
    addRouteMarker(lat2, lng2, 'car', cityName);

    // Buscar e desenhar a rota
    fetch(`https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?geometries=geojson&overview=full`)
        .then(response => response.json())
        .then(data => {
            if (data.routes && data.routes.length) {
                drawRouteLine(data.routes[0].geometry.coordinates, finalDistance, finalDuration);
            }
        })
        .catch(error => console.error("Erro ao desenhar rota:", error));

    // Exibir informações de contato
    const cityData = cities[cityName];
    if (cityData && cityData.contact) {
        const rawContact = cityData.contact;
        const phoneNumbers = rawContact.match(/\d+/g);
        const phoneNumber = phoneNumbers ? phoneNumbers.join('') : '';
        
        const isMobileTechnician = technicians.includes(cityName);
        const locationLabel = isMobileTechnician ? 'Técnico móvel' : 'Oficina autorizada';
        document.getElementById("contact-info").innerHTML = `
            <div class="contact-card-content">
                <div class="contact-heading">
                    <span class="contact-heading-icon">${icon(isMobileTechnician ? 'person' : 'wrench')}</span>
                    <span><h3>${escapeHtml(cityName)}</h3><span class="contact-subtitle">${locationLabel}</span></span>
                </div>
                <div class="contact-details">
                    <div class="detail-item"><span class="detail-label">Distância</span><span class="detail-value">${finalDistance.toFixed(0)} km</span></div>
                    <div class="detail-item"><span class="detail-label">Tempo estimado</span><span class="detail-value">${formatTime(finalDuration)}</span></div>
                    <div class="detail-item" style="grid-column:1/-1"><span class="detail-label">Contato</span><span class="detail-value">${escapeHtml(rawContact)}</span></div>
                </div>
                <div class="contact-buttons">
                    ${phoneNumber ? `<a href="https://wa.me/55${phoneNumber}" target="_blank" rel="noopener" class="action-link whatsapp-button">${icon('phone')} WhatsApp</a>` : ''}
                    <button type="button" onclick="shareRoute()" class="action-link share-button">${icon('share')} Compartilhar</button>
                    <button type="button" onclick="openGoogleMaps(${lat1}, ${lng1}, ${lat2}, ${lng2})" class="action-link maps-button">${icon('route')} Google Maps</button>
                </div>
                ${renderAppointmentForm(cityName, isMobileTechnician)}
            </div>
        `;
        document.getElementById('calendarBookingButton')?.addEventListener('click', () => {
            createCalendarEvent(cityName, isMobileTechnician, rawContact, finalDistance, finalDuration);
        });
    }
    
    showToastMessage(`Trajeto calculado: ${finalDistance.toFixed(0)} km`, "success");
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

function defaultAppointmentDateTime() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setMinutes(0, 0, 0);
    date.setHours(date.getHours() + 1);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
}

function renderAppointmentForm(providerName, isMobileTechnician) {
    return `
        <section class="appointment" aria-labelledby="appointment-title">
            <h4 id="appointment-title">${icon('calendar')} Reservar horário</h4>
            <p class="appointment-provider">${isMobileTechnician ? 'Técnico selecionado' : 'Oficina selecionada'}: <strong>${escapeHtml(providerName)}</strong></p>
            <div class="appointment-form">
                <div><label for="appointmentDate">Data e horário</label><input id="appointmentDate" type="datetime-local" value="${defaultAppointmentDateTime()}" required></div>
                <div><label for="appointmentDuration">Duração prevista</label><select id="appointmentDuration" class="appointment-select"><option value="1">1 hora</option><option value="2">2 horas</option><option value="3">3 horas</option><option value="4">4 horas</option></select></div>
                <div class="wide"><label for="appointmentCustomer">Cliente (opcional)</label><input id="appointmentCustomer" type="text" placeholder="Nome do cliente"></div>
                <div class="wide"><label for="appointmentLocation">Local do atendimento</label><input id="appointmentLocation" type="text" value="${escapeHtml(window.currentClientCity || '')}" placeholder="Endereço ou cidade do cliente"></div>
                <div class="wide"><label for="appointmentDetails">Serviço solicitado</label><textarea id="appointmentDetails" placeholder="Descreva brevemente o serviço"></textarea></div>
            </div>
            <button type="button" id="calendarBookingButton" class="button appointment-submit">${icon('calendar')} Abrir Google Agenda e reservar</button>
            <p class="calendar-note">O evento abre preenchido na sua conta Google. Revise e salve; isso não confirma a disponibilidade do técnico.</p>
        </section>`;
}

function createCalendarEvent(providerName, isMobileTechnician, providerContact, distance, estimatedDuration) {
    const startInput = document.getElementById('appointmentDate');
    if (!startInput || !startInput.value) {
        showToastMessage('Escolha a data e o horário do atendimento.', 'error');
        startInput?.focus();
        return;
    }
    const start = new Date(startInput.value);
    if (Number.isNaN(start.getTime()) || start.getTime() < Date.now()) {
        showToastMessage('Escolha um horário futuro para o atendimento.', 'error');
        startInput.focus();
        return;
    }
    const duration = Number(document.getElementById('appointmentDuration').value || 1);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
    const customer = document.getElementById('appointmentCustomer').value.trim();
    const location = document.getElementById('appointmentLocation').value.trim();
    const service = document.getElementById('appointmentDetails').value.trim();
    const formatCalendarDate = date => [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('') + 'T' + [
        String(date.getHours()).padStart(2, '0'),
        String(date.getMinutes()).padStart(2, '0'),
        '00'
    ].join('');
    const title = `${isMobileTechnician ? 'Atendimento técnico' : 'Serviço em oficina'} - ${providerName}${customer ? ` - ${customer}` : ''}`;
    const details = [
        `${isMobileTechnician ? 'Técnico' : 'Oficina'} selecionado(a): ${providerName}`,
        isMobileTechnician && technicianLocations[providerName]?.city ? `Base atual do técnico: ${technicianLocations[providerName].city}` : '',
        `Contato: ${providerContact}`,
        `Trajeto estimado: ${Number(distance).toFixed(0)} km, ${formatTime(Number(estimatedDuration))}`,
        service ? `Serviço: ${service}` : '',
        'Agendamento criado pelo localizador de oficinas autorizadas.'
    ].filter(Boolean).join('\n');
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${formatCalendarDate(start)}/${formatCalendarDate(end)}`,
        details,
        location,
        ctz: 'America/Sao_Paulo'
    });
    const calendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;
    const calendarWindow = window.open(calendarUrl, '_blank');
    if (calendarWindow) {
        calendarWindow.opener = null;
    } else {
        window.location.assign(calendarUrl);
    }
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
        showToastMessage('Nenhuma rota ativa para compartilhar.', 'error');
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
            showToastMessage('Rota compartilhada com sucesso.', 'success');
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
        showToastMessage('Link copiado. Envie para quem quiser.', 'success');
    } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToastMessage('Link copiado. Envie para quem quiser.', 'success');
    }
}

function showToastMessage(message, type = 'info') {
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-message${type === 'error' ? ' toast-error' : type === 'success' ? ' toast-success' : ''}`;
    toast.textContent = message;
    
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
            showToastMessage('Este link de rota expirou (mais de 24 horas).', 'error');
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
            
        }, 500);
        
        return true;
    } catch (error) {
        console.error('Erro ao carregar rota compartilhada:', error);
        showToastMessage('Link de rota inválido.', 'error');
        return false;
    }
}

function showSharedRouteBadge(cityName) {
    const existingBadge = document.querySelector('.shared-route-badge');
    if (existingBadge) existingBadge.remove();
    
    const badge = document.createElement('div');
    badge.className = 'shared-route-badge';
    badge.innerHTML = `${icon('link')} Rota compartilhada<br><small style="opacity:0.9">${escapeHtml(cityName)}</small>`;
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
