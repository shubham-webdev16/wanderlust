// Init map (center India)
const map = L.map('map').setView([20.5937, 78.9629], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Red icon
const redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


// Geoapify API key
const apiKey = process.env.GEOAPIFY_API_KEY;

// Function to geocode an address using Geoapify
async function geocodeAddress(address) {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${apiKey}`;
    try {
        const res = await fetch(url);
        const data = await ress.json();
        if (data.features && data.features.length > 0) {
            const { lat, lon } = data.features[0].properties;
            return { lat, lng: lon };
        } else {
            console.warn(`No results for address: ${address}`);
            return null; // Handle no results gracefully
        }
    } catch (error) {
        console.error(`Geocoding error for ${address}:`, error);
        return null;
    }
}

// Function to process all listings and add markers
async function loadListings() {
    for (const listing of listings) {
        const coords = await geocodeAddress(listing.address);
        if (coords) {
            // Add a marker to the map
            let marker =L.marker([coords.lat, coords.lng], {icon: redIcon})
                .addTo(map)
                .bindPopup(`<b><h4>${listing.name}</h4></b><br>${listing.address},<p>Exact Location provided after booking</p>`);
        } else {
            console.log(`Failure Skipping ${listing.name}.Coordinates not find`);
            L.popup()
                .setLatLng(map.getCenter())
                .setContent(`<b>${listing.name}</b><br>Location not found`)
               .openOn(map);

        }
    }
}

// Call the function to load listings on page load
loadListings();