const mapIfrm = document.getElementById('mapIframe');
// Keyless Google Maps embed (the old Embed API key was hardcoded in the repo).
function mapUpdateIframe(city, lat, lon) {
    const q = (lat !== undefined && lon !== undefined) ? `${lat},${lon}` : encodeURIComponent(city);
    mapIfrm.innerHTML =
        `<iframe src="https://maps.google.com/maps?q=${q}&z=10&output=embed" title="Map of ${encodeURIComponent(city)}" loading="lazy"></iframe>`;
}
