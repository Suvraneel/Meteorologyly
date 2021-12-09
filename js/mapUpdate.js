const mapIfrm = document.getElementById('mapIframe');
const googleMapAPI = 'AIzaSyAPPopCJHxOtwtsGokOpoKNRnWCq4XRH-k';
function mapUpdateIframe(city) {
    mapIfrm.innerHTML = 
    `<iframe id="mapIframe" src="https://www.google.com/maps/embed/v1/place?key=${googleMapAPI}&q=${city}" width="100%" height="600" style="filter: invert(100%)"></iframe>
    `;
    // console.log(latitude, longitude);
}