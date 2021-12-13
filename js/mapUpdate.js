const mapIfrm = document.getElementById('mapIframe');
// Keyless Google Maps embed (the old Embed API key was hardcoded in the repo).
function mapUpdateIframe(city, lat, lon) {
    const q = (lat !== undefined && lon !== undefined) ? `${lat},${lon}` : encodeURIComponent(city);
    mapIfrm.innerHTML =
    `<iframe id="mapIframe" src="https://maps.google.com/maps?q=${q}&z=10&output=embed" width="100%" height="600" style="filter: invert(100%); border: 0;" loading="lazy"></iframe>
    `;
}
