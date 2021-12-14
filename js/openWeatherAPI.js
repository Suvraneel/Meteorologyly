var searchCity = "";
var searchCountry = "";

// OpenWeather's One Call 2.5 API was retired, so weather data now comes from
// Open-Meteo (https://open-meteo.com), which is free and needs no API key.
// fetchWeather() converts its response into a simple shape (modelled on the
// old One Call response) that the rendering and chart code work from.
const DEFAULT_CITY = 'Kolkata';

// WMO weather code -> { main, description, OpenWeather-style icon code, Phosphor icon name }
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
    const night = isDay === 0;
    const ph = { '01': night ? 'moon' : 'sun', '02': night ? 'cloud-moon' : 'cloud-sun', '03': 'cloud', '04': 'cloud',
        '09': 'cloud-rain', '10': 'cloud-rain', '11': 'cloud-lightning', '13': 'cloud-snow', '50': 'cloud-fog' }[w[2]];
    return { main: w[0], description: w[1], icon: w[2] + (night ? 'n' : 'd'), ph: ph };
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

function render(data) {
    showWeatherData(data);
    getGraphData(data);
}

function loadCity(city) {
    setLoading(true);
    return geocodeCity(city)
        .then(place => fetchWeather(place.latitude, place.longitude).then(data => {
            searchCity = place.name;
            searchCountry = place.country || '';
            render(data);
        }))
        .catch(err => {
            console.error(err);
            showToast(`Couldn't find weather for "${city}". Check the spelling and try again.`);
        })
        .finally(() => setLoading(false));
}

getWeatherData()
function getWeatherData() {
    if (!navigator.geolocation) {
        loadCity(DEFAULT_CITY);
        return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition((success) => {
        let { latitude, longitude } = success.coords;
        fetchWeather(latitude, longitude).then(data => {
            searchCity = data.timezone.split('/').pop().replace(/_/g, ' ');
            searchCountry = '';
            render(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            loadCity(DEFAULT_CITY);
        });
    }, () => loadCity(DEFAULT_CITY)); // location denied/unavailable -> fall back to a default city
}

function searchByCity() {
    const input = document.getElementById('search-input');
    const city = input.value.trim();
    if (city) {
        loadCity(city);
        input.blur();
    }
}

function featuredCity(carouselCity) {
    loadCity(carouselCity);
}

// ---------- Rendering ----------

function formatInZone(unixSeconds, options) {
    try {
        return new Intl.DateTimeFormat('en-GB', { ...options, timeZone: cityTimezone || undefined })
            .format(new Date(unixSeconds * 1000));
    } catch (e) {
        return new Intl.DateTimeFormat('en-GB', options).format(new Date(unixSeconds * 1000));
    }
}

function formatCoords(lat, lon) {
    const f = (v, pos, neg) => Math.abs(v).toFixed(2) + '°' + (v >= 0 ? pos : neg);
    return f(lat, 'N', 'S') + ' ' + f(lon, 'E', 'W');
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showWeatherData(data) {
    const $ = id => document.getElementById(id);
    const c = data.current;
    const w = c.weather[0];
    const today = data.daily[0];

    cityTimezone = data.timezone;
    setSky(w.main, w.icon.endsWith('n'));
    updateClock();

    $('city-name').textContent = searchCity;
    $('country').textContent = searchCountry;
    $('coords').textContent = formatCoords(data.lat, data.lon);
    $('temp-now').textContent = Math.round(c.temp) + '°';
    $('icon-now').className = 'ph-light ph-' + w.ph + ' hero-icon';
    $('condition').textContent = capitalizeFirstLetter(w.description);
    $('hi').textContent = Math.round(today.temp.max) + '°';
    $('lo').textContent = Math.round(today.temp.min) + '°';

    $('humidity').textContent = c.humidity + '%';
    $('humidity-meter').style.transform = `scaleX(${c.humidity / 100})`;
    $('wind').textContent = Math.round(c.wind_speed) + ' km/h';
    $('pressure').textContent = c.pressure + ' hPa';

    renderSun(today.sunrise, today.sunset);
    renderForecast(data.daily);

    $('map-title').textContent = searchCity;
    mapUpdateIframe(searchCity, data.lat, data.lon);
}

function renderSun(sunrise, sunset) {
    const timeOpts = { hour: 'numeric', minute: '2-digit' };
    document.getElementById('sunrise').textContent = formatInZone(sunrise, timeOpts);
    document.getElementById('sunset').textContent = formatInZone(sunset, timeOpts);
    const mins = Math.round((sunset - sunrise) / 60);
    document.getElementById('daylength').textContent = `${Math.floor(mins / 60)}h ${mins % 60}m`;

    // Position the sun along the arc (centre 100,100, radius 90)
    const now = Date.now() / 1000;
    const raw = (now - sunrise) / (sunset - sunrise);
    const p = Math.min(Math.max(raw, 0), 1);
    const angle = Math.PI * (1 - p);
    const x = (100 + 90 * Math.cos(angle)).toFixed(2);
    const y = (100 - 90 * Math.sin(angle)).toFixed(2);
    const dot = document.getElementById('sun-dot');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    dot.style.opacity = raw >= 0 && raw <= 1 ? 1 : 0.35;
    document.getElementById('sun-progress').setAttribute('d', p > 0 ? `M10 100 A90 90 0 0 1 ${x} ${y}` : 'M10 100');
}

function renderForecast(daily) {
    const lows = daily.map(d => d.temp.min);
    const highs = daily.map(d => d.temp.max);
    const lo = Math.min(...lows);
    const span = (Math.max(...highs) - lo) || 1;

    document.getElementById('weather-forecast').innerHTML = daily.map((d, i) => {
        const from = ((d.temp.min - lo) / span * 100).toFixed(1);
        const to = ((d.temp.max - lo) / span * 100).toFixed(1);
        const name = i === 0 ? 'Today' : formatInZone(d.dt, { weekday: 'short' });
        const desc = capitalizeFirstLetter(d.weather[0].description);
        return `
        <li class="day">
            <span class="day-name">${name}</span>
            <i class="ph-light ph-${d.weather[0].ph}" title="${desc}" aria-label="${desc}"></i>
            <span class="t-lo">${Math.round(d.temp.min)}°</span>
            <span class="range"><span class="range-fill" style="--from:${from}%;--to:${to}%"></span></span>
            <span class="t-hi">${Math.round(d.temp.max)}°</span>
        </li>`;
    }).join('');
}
