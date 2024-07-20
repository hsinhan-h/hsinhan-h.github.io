const map = L.map('map').setView([25.0462233, 121.5436429], 12);
const markers = L.markerClusterGroup();
const dataRows = document.querySelector('.data-rows');
let selectedCity;
let sAreas = [];
window.onload = function () {
    initMap();
}


function initMap() {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

}

const citySelector = document.querySelector('.select-city');
const loadingField = document.querySelector('.loading-field');
const sareaSelector = document.querySelector('.select-sarea')

citySelector.addEventListener('change', (e) => {
    sareaSelector.innerHTML = "<option selected>請先選擇縣市</option>";
    sAreas.splice(0, sAreas.length);
    if (e.target.value === "taipei" || e.target.value === "new-taipei") {
        loadingField.classList.remove('d-none');
        dataRows.innerHTML = "";
        markers.clearLayers();
        selectedCity = e.target.value;
        fetchYoubikeData().then((data) => {
            data.forEach((station) => {
                renderStationInfo(station);
                addMarker(station);
            })
        }).then(() => {
            loadingField.classList.add('d-none')
        }).then(() => {
            appendSAreasDropDown();
        });
    }
})

sareaSelector.addEventListener('change', () => {
    dataRows.querySelectorAll('tr').forEach((tr) => {
        if (tr.classList.contains('d-none')) {
            tr.classList.remove('d-none');
        }
    })
    const sareaTd = dataRows.querySelectorAll('tr td:nth-of-type(1)');
    if (sareaSelector.value !== "全部區域") {
        sareaTd.forEach((sarea) => {
            if (sarea.textContent !== sareaSelector.value) {
                sarea.parentNode.classList.add('d-none');
            }
        });
    }
})


const taipeiYoubikeDataUrl = "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json";
const newTaipeiYoubikeDataUrl = "https://data.ntpc.gov.tw/api/datasets/010E5B15-3823-4B20-B401-B1CF000550C5/json?page=0&size=1000";


function fetchYoubikeData() {
    switch (selectedCity) {
        case "taipei":
            return fetch(taipeiYoubikeDataUrl).then((res) => res.json());
        case "new-taipei":
            return fetch(newTaipeiYoubikeDataUrl).then((res) => res.json());
    }
}


function addMarker(station) {
    let marker;
    switch (selectedCity) {
        case "taipei":
            marker = L.marker([station.latitude, station.longitude]);
            marker.bindPopup(`
                <h6 class="fw-bold">${station.sna}</h6>
                剩餘/空位/總共: ${station.available_rent_bikes}/${station.available_return_bikes}/${station.total}`)
            break;
        case "new-taipei":
            marker = L.marker([station.lat, station.lng]);
            marker.bindPopup(`
                <h6 class="fw-bold">${station.sna}</h6>
                剩餘/空位/總共: ${station.sbi}/${station.bemp}/${station.tot}`)
            break;
    }
    markers.addLayer(marker);
    map.addLayer(markers);
}

function renderStationInfo(station) {

    // dataRows.innerHTML += `  
    // <tr>  
    //     <td>${station.sarea}</td>
    //     <td>${station.sna}</td>
    //     <td>${station.available_rent_bikes}/${station.available_return_bikes}/${station.total}</td>  
    //     <td class="map-icon"><i class="fa-solid fa-map"></i></td>
    //     <td class="info-icon"><i class="fa-solid fa-circle-info"></i></td>
    // </tr>
    // `;

    const dataTr = document.createElement('tr');
    const sareaTd = document.createElement('td');
    sareaTd.textContent = `${station.sarea}`;

    const snaTd = document.createElement('td');
    snaTd.textContent = `${station.sna}`;

    const infoTd = document.createElement('td');

    const mapTd = document.createElement('td');
    const mapIcon = document.createElement('i');
    mapIcon.classList.add('fa-solid', 'fa-map');
    mapTd.append(mapIcon);

    let latLng;
    switch (selectedCity) {
        case "taipei":
            latLng = [station.latitude, station.longitude];
            infoTd.textContent = `${station.available_rent_bikes}/${station.available_return_bikes}/${station.total}`;
            break;
        case "new-taipei":
            latLng = [station.lat, station.lng];
            infoTd.textContent = `${station.sbi}/${station.bemp}/${station.tot}`;
            break;
    }
    mapIcon.addEventListener('click', () => map.flyTo(latLng, 18));

    const latLngTd = document.createElement('td');
    const latLngIcon = document.createElement('i');
    latLngIcon.classList.add('fa-solid', 'fa-circle-info');
    latLngIcon.setAttribute('data-bs-toggle', 'tooltip');
    latLngIcon.setAttribute('data-bs-placement', 'top');
    latLngIcon.setAttribute('data-bs-title', `(${latLng})`);
    new bootstrap.Tooltip(latLngIcon);
    latLngTd.append(latLngIcon);

    dataTr.append(sareaTd, snaTd, infoTd, mapTd, latLngTd);
    dataRows.append(dataTr);
    if (!sAreas.includes(station.sarea)) { sAreas.push(station.sarea); }
}

function appendSAreasDropDown() {
    sareaSelector.innerHTML = "";
    const optionAreaDefault = document.createElement('option');
    optionAreaDefault.selected = true;
    optionAreaDefault.textContent = "全部區域";

    sareaSelector.append(optionAreaDefault);
    sAreas.forEach((area) => {
        const optionArea = document.createElement('option');
        optionArea.textContent = area;
        sareaSelector.append(optionArea);
    })
}
