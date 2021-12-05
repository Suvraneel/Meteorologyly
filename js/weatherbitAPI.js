// Query in JS - JQuery

const settings = {
	"async": true,
	"crossDomain": true,
	"url": "https://weatherbit-v1-mashape.p.rapidapi.com/forecast/minutely?lat=35.5&lon=-78.5",
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "weatherbit-v1-mashape.p.rapidapi.com",
		"x-rapidapi-key": "b3f60cc987msh034a89eb7669f57p1bca56jsncefb5f0f5363"
	}
};

$.ajax(settings).done(function (response) {
	console.log(response);
});