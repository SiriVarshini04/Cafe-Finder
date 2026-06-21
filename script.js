const params = new URLSearchParams(window.location.search);

const category = params.get("category") || "All";
const radius = Math.min(parseInt(params.get("radius")) || 5, 20);
const place = params.get("location") || "Vijayawada";

document.getElementById("title").textContent = `${category} near ${place} within ${radius} km`;

// Map initializing
const map = L.map('map');
map.setView([16.5062, 80.6480], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// Custom pink marker
const pinkIcon = L.divIcon({
    html: `<div style="width:13px;height:13px;background:#FB6F92;border:2.5px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(251,111,146,0.5)"></div>`,
    iconSize: [13, 13],
    iconAnchor: [6, 6],
    className: ''
});

const originIcon = L.divIcon({
    html: `<div style="width:17px;height:17px;background:transparent;border:2.5px solid #FB6F92;border-radius:50%;display:flex;align-items:center;justify-content:center"><div style="width:7px;height:7px;background:#FB6F92;border-radius:50%"></div></div>`,
    iconSize: [17, 17],
    iconAnchor: [8, 8],
    className: ''
});

let ulat, ulong;

fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`)
    .then(res => res.json())
    .then(data => {
        if (data.length === 0) {
            showError("Location not found 🌸");
            return;
        }
        ulat = parseFloat(data[0].lat);
        ulong = parseFloat(data[0].lon);

        map.setView([ulat, ulong], 13);

        L.marker([ulat, ulong], { icon: originIcon })
            .addTo(map)
            .bindPopup(`<b>📍 ${place}</b>`)
            .openPopup();

        fetchPlaces();
    });

function fetchPlaces() {
    let query = "";
    const r = radius * 1000;

    if (category === "Cafe") {
        query = `[out:json];(node["amenity"="cafe"](around:${r},${ulat},${ulong}););out;`;
    } else if (category === "Restaurant") {
        query = `[out:json];(node["amenity"="restaurant"](around:${r},${ulat},${ulong}););out;`;
    } else {
        query = `[out:json];(node["amenity"="cafe"](around:${r},${ulat},${ulong});node["amenity"="restaurant"](around:${r},${ulat},${ulong}););out;`;
    }

    fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
    })
    .then(res => res.json())
    .then(data => displayPlaces(data.elements))
    .catch(err => {
        console.error("Error fetching places", err);
        showError("Couldn't load places 🌸");
    });
}

function displayPlaces(places) {
    const resultsDiv = document.getElementById("results");
    const countEl = document.getElementById("count");
    resultsDiv.innerHTML = "";

    if (places.length === 0) {
        countEl.textContent = "";
        resultsDiv.innerHTML = `<div class="state-msg">
            <span class="state-icon">🌸</span>
            <p class="state-text">No places found here.</p>
        </div>`;
        return;
    }

    countEl.textContent = `${places.length} spot${places.length !== 1 ? "s" : ""} found`;

    places.forEach(p => {
        const name = p.tags?.name || "Unnamed Place";
        const type = p.tags?.amenity || category.toLowerCase();
        const lat = p.lat;
        const lon = p.lon;

        const marker = L.marker([lat, lon], { icon: pinkIcon })
            .addTo(map)
            .bindPopup(`<b>${name}</b>`);

        const card = document.createElement("div");
        card.classList.add("cafe-card");
        card.innerHTML = `
            <p class="place-name">${name}</p>
            <p class="place-type">📍 ${type}</p>
        `;

        card.addEventListener("click", () => {
            document.querySelectorAll(".cafe-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            map.setView([lat, lon], 16);
            marker.openPopup();
        });

        resultsDiv.appendChild(card);
    });
}

function showError(msg) {
    document.getElementById("results").innerHTML = `<div class="state-msg">
        <span class="state-icon">🌸</span>
        <p class="state-text">${msg}</p>
    </div>`;
}
