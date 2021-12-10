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

const API_KEY ='219f94686b292bb4b014c8f2219b3c82';
// API key for `bsuvraneel@gmail.com`

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
    navigator.geolocation.getCurrentPosition((success) => {
        
        let {latitude, longitude } = success.coords;

        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`).then(res => res.json()).then(data => {

        console.log(data)
        searchCity = data.timezone.split('/')[1];
        showWeatherData(data);
        getGraphData(data);
        mapUpdateIframe(data.timezone.split('/')[1]);
        })
    })
}

function searchByCity() {
    searchCity = document.getElementById('search-input').value;
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}`).then(res => res.json()).then(data => {
        console.log(data)
        let latitude = data.coord.lat;
        let longitude = data.coord.lon;
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`).then(res => res.json()).then(data => {

            console.log(data)
            showWeatherData(data);
            getGraphData(data);
            mapUpdateIframe(searchCity);
        })
    })

}

function featuredCity(carouselCity) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${carouselCity}&appid=${API_KEY}`).then(res => res.json()).then(data => {
        console.log(data)
        let latitude = data.coord.lat;
        let longitude = data.coord.lon;
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`).then(res => res.json()).then(data => {

            console.log(data)
            searchCity = carouselCity;
            showWeatherData(data);
            getGraphData(data);
            mapUpdateIframe(carouselCity);
        })
    })

}

function showWeatherData (data){
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
    `<img id="weather-now" src="http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png" alt="weather icon" title="${capitalizeFirstLetter(data.current.weather[0].description)}" class="w-icon">
    `
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}