const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const nowEl = document.getElementById('weather-now');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezonehead = document.getElementById('time-zone-header');
const weatherForecastEl = document.getElementById('weather-forecast');
// const currentTempEl = document.getElementById('current-temp');
var searchCity = "";
var main = "";

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// OpenWeather's One Call 2.5 API was retired, so weather data now comes from
// Open-Meteo (https://open-meteo.com), which is free and needs no API key.
// fetchWeather() converts its response into the same shape the old One Call
// API returned, so the rendering and chart code below is unchanged.
const DEFAULT_CITY = 'Kolkata';

// WMO weather code -> [main, description, OpenWeather icon code]
function wmoToWeather(code, isDay) {
    let w;
    if (code === 0) w = ['Clear', 'clear sky', '01'];
    else if (code === 1) w = ['Clear', 'mainly clear', '02'];
    else if (code === 2) w = ['Clouds', 'partly cloudy', '03'];
    else if (code === 3) w = ['Clouds', 'overcast', '04'];
    else if (code === 45 || code === 48) w = ['Fog', 'fog', '50'];
    else if (code >= 51 && code <= 57) w = ['Rain', 'drizzle', '09'];
    else if (code >= 61 && code <= 67) w = ['Rain', 'rain', '10'];
    else if (code >= 71 && code <= 77) w = ['Snow', 'snow', '13'];
    else if (code >= 80 && code <= 82) w = ['Rain', 'rain showers', '09'];
    else if (code === 85 || code === 86) w = ['Snow', 'snow showers', '13'];
    else if (code >= 95) w = ['Thunderstorm', 'thunderstorm', '11'];
    else w = ['Clouds', 'cloudy', '03'];
    return { main: w[0], description: w[1], icon: w[2] + (isDay === 0 ? 'n' : 'd') };
}

function fetchWeather(latitude, longitude) {
    const url = 'https://api.open-meteo.com/v1/forecast'
        + `?latitude=${latitude}&longitude=${longitude}`
        + '&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,weather_code,is_day'
        + '&hourly=temperature_2m,relative_humidity_2m,pressure_msl'
        + '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,wind_speed_10m_max,wind_gusts_10m_max'
        + '&timezone=auto&timeformat=unixtime&forecast_days=8';
    return fetch(url).then(res => {
        if (!res.ok) throw new Error('Weather request failed: ' + res.status);
        return res.json();
    }).then(om => {
        const offset = om.utc_offset_seconds;
        const dayKey = t => Math.floor((t + offset) / 86400);
        // Group hourly values by local day to get day/night temps and daily averages
        const hours = {};
        om.hourly.time.forEach((t, i) => {
            const k = dayKey(t);
            (hours[k] = hours[k] || []).push({
                hour: new Date((t + offset) * 1000).getUTCHours(),
                temp: om.hourly.temperature_2m[i],
                humidity: om.hourly.relative_humidity_2m[i],
                pressure: om.hourly.pressure_msl[i],
            });
        });
        const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
        const atHour = (arr, h) => { const x = arr.find(e => e.hour === h); return x ? x.temp : null; };

        const daily = om.daily.time.map((t, i) => {
            const hs = hours[dayKey(t)] || [];
            return {
                dt: t,
                sunrise: om.daily.sunrise[i],
                sunset: om.daily.sunset[i],
                temp: {
                    min: om.daily.temperature_2m_min[i],
                    max: om.daily.temperature_2m_max[i],
                    day: atHour(hs, 12),
                    night: atHour(hs, 0),
                },
                humidity: avg(hs.map(e => e.humidity)),
                pressure: avg(hs.map(e => e.pressure)),
                wind_speed: om.daily.wind_speed_10m_max[i],
                wind_gust: om.daily.wind_gusts_10m_max[i],
                weather: [wmoToWeather(om.daily.weather_code[i], 1)],
            };
        });

        return {
            lat: om.latitude,
            lon: om.longitude,
            timezone: om.timezone,
            current: {
                temp: om.current.temperature_2m,
                humidity: om.current.relative_humidity_2m,
                pressure: Math.round(om.current.pressure_msl),
                wind_speed: om.current.wind_speed_10m,
                sunrise: daily[0].sunrise,
                sunset: daily[0].sunset,
                weather: [wmoToWeather(om.current.weather_code, om.current.is_day)],
            },
            daily: daily,
        };
    });
}

function geocodeCity(city) {
    return fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)
        .then(res => res.json())
        .then(data => {
            if (!data.results || !data.results.length) throw new Error('City not found: ' + city);
            return data.results[0];
        });
}

function loadCity(city) {
    return geocodeCity(city)
        .then(place => fetchWeather(place.latitude, place.longitude))
        .then(data => {
            searchCity = city;
            showWeatherData(data);
            getGraphData(data);
        })
        .catch(err => {
            console.error(err);
            alert('Could not load weather for "' + city + '". Check the spelling and try again.');
        });
}

setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12HrFormat = hour >= 13 ? hour %12: hour
    const minutes = time.getMinutes();
    const ampm = hour >=12 ? 'PM' : 'AM'

    timeEl.innerHTML = (hoursIn12HrFormat < 10? '0'+hoursIn12HrFormat : hoursIn12HrFormat) + ':' + (minutes < 10? '0'+minutes: minutes)+ ' ' + `<span id="am-pm">${ampm}</span>`

    dateEl.innerHTML = days[day] + ', ' + date+ ' ' + months[month]

}, 1000);

getWeatherData()
function getWeatherData () {
    if (!navigator.geolocation) {
        loadCity(DEFAULT_CITY);
        return;
    }
    navigator.geolocation.getCurrentPosition((success) => {

        let {latitude, longitude } = success.coords;

        fetchWeather(latitude, longitude).then(data => {
            searchCity = data.timezone.split('/').pop().replace(/_/g, ' ');
            showWeatherData(data);
            getGraphData(data);
        }).catch(err => {
            console.error(err);
            loadCity(DEFAULT_CITY);
        })
    }, () => loadCity(DEFAULT_CITY)) // location denied/unavailable -> fall back to a default city
}

var input = document.getElementById("search-input");
  input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
  event.preventDefault();
  searchByCity();
  }
});

function searchByCity() {
    const city = document.getElementById('search-input').value.trim();
    if (city) loadCity(city);
}

function featuredCity(carouselCity) {
    loadCity(carouselCity);
}

function showWeatherData (data){
    mapUpdateIframe(searchCity, data.lat, data.lon);
    let {temp, humidity, pressure, sunrise, sunset, wind_speed} = data.current;
    main = data.current.weather[0].main;
    // Backgrounds
    switch (main) {
        case "Snow":
          document.getElementById("wrapper-bg").style.backgroundImage =
            "url('img/gifs/snow.gif')";
          break;
        case "Clouds":
          document.getElementById("wrapper-bg").style.backgroundImage =
            "url('https://mdbgo.io/ascensus/mdb-advanced/img/clouds.gif')";
          break;
        case "Mist":
        case "Fog":
          document.getElementById("wrapper-bg").style.backgroundImage =
            "url('img/gifs/fog.gif')";
          break;
        case "Rain":
          document.getElementById("wrapper-bg").style.backgroundImage =
            "url('img/gifs/rain.gif')";
          break;
        case "Clear":
          document.getElementById("wrapper-bg").style.backgroundImage =
            "url('img/gifs/clear.gif')";
          break;
        case "Thunderstorm":
          document.getElementById("wrapper-bg").style.backgroundImage =
            "url('https://mdbgo.io/ascensus/mdb-advanced/img/thunderstorm.gif')";
          break;
        default:
          document.getElementById("wrapper-bg").style.backgroundImage =
            "url('https://mdbgo.io/ascensus/mdb-advanced/img/clouds.gif')";
          break;
      }

    timezonehead.innerHTML = searchCity;
    var coordsEl = data.lat + 'N ' + ", " + data.lon+'E'

    currentWeatherItemsEl.innerHTML = 
    `
    <div class="d-flex justify-content-around"><span class="h2 fw-bold">${temp>0?'+'+temp:temp}&#176C</span></div>
    <div class="h4 d-flex justify-content-around">${searchCity}</div>
    <div class="small d-flex justify-content-around">(${coordsEl})</div>
    <div class="weather-item d-flex justify-content-between">
        <div class="h6">Time Zone</div>
        <div class="small">${data.timezone} </div>
    </div>
    <div class="weather-item d-flex justify-content-between">
        <div class="h6">Humidity</div>
        <div class="small">${humidity}%</div>
    </div>
    <div class="progress">
      <div class="progress-bar" role="progressbar" style="width: ${humidity}%" aria-valuenow="${humidity}" aria-valuemin="0" aria-valuemax="100">
      </div>
    </div>
    <p></p>
    <div class="weather-item d-flex justify-content-between">
    <div class="h6">Wind Speed</div>
    <div class="small">${wind_speed} km/h</div>
    </div>
    <div class="weather-item d-flex justify-content-between">
        <div class="h6">Pressure</div>
        <div class="small">${pressure}</div>
    </div>
    <div class="weather-item d-flex justify-content-between">
        <div class="h6">Sunrise</div>
        <div class="small">${window.moment(sunrise * 1000).format('HH:mm a')}</div>
        <div class="small">${window.moment(sunset*1000).format('HH:mm a')}</div>
        <div class="h6">Sunset</div>
    </div>
    
    `;

    let otherDayForcast = ''
    data.daily.forEach((day, idx) => {
            otherDayForcast += `
            <div class="weather-forecast-item d-flex flex-column align-items-center">
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
            <div class="temp">${day.temp.min}&#176;C/${day.temp.max}&#176;C</div>
            <div class="day">${window.moment(day.dt*1000).format('DD ddd')}</div>
            </div>
            
            `
    })

    weatherForecastEl.innerHTML = otherDayForcast;
    nowEl.innerHTML = 
    `<img id="weather-now" src="https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png" alt="weather icon" title="${capitalizeFirstLetter(data.current.weather[0].description)}" class="w-icon">
    `
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}