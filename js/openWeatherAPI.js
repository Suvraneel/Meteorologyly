const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('time-zone');
const timezonehead = document.getElementById('time-zone-header');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');
var searchCity = "";


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
        showWeatherData(data);
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
        })
    })

}

// function featuredCity() {
//     searchCity = document.getElementById('search-input').value;
//     fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}`).then(res => res.json()).then(data => {
//         console.log(data)
//         let latitude = data.coord.lat;
//         let longitude = data.coord.lon;
//         fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`).then(res => res.json()).then(data => {

//             console.log(data)
//             showWeatherData(data);
//         })
//     })

// }

function showWeatherData (data){
    let {humidity, pressure, sunrise, sunset, wind_speed} = data.current;

    timezone.innerHTML = data.timezone;
    timezonehead.innerHTML = data.timezone;
    countryEl.innerHTML = data.lat + 'N ' + " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; " + data.lon+'E'

    currentWeatherItemsEl.innerHTML = 
    `<div class="weather-item d-flex justify-content-between">
        <div class="h6">Humidity</div>
        <div class="small">${humidity}%</div>
    </div>
    <div class="weather-item d-flex justify-content-between">
        <div class="h6">Pressure</div>
        <div class="small">${pressure}</div>
    </div>
    <div class="weather-item d-flex justify-content-between">
        <div class="h6">Wind Speed</div>
        <div class="small">${wind_speed}</div>
    </div>
    <div class="weather-item d-flex justify-content-between">
        <div class="h6">Sunrise</div>
        <div class="small">${window.moment(sunrise * 1000).format('HH:mm a')}</div>
    </div>
    <div class="weather-item d-flex justify-content-between">
        <div class="h6">Sunset</div>
        <div class="small">${window.moment(sunset*1000).format('HH:mm a')}</div>
    </div>
    
    
    `;

    let otherDayForcast = ''
    data.daily.forEach((day, idx) => {
        if(idx == 0){
            currentTempEl.innerHTML = `
            <img src="http://openweathermap.org/img/wn//${day.weather[0].icon}@4x.png" alt="weather icon" class="w-icon">
            <div class="other small"><br/>
                <div class="day h5">${window.moment(day.dt*1000).format('dddd')}</div>
                <div class="temp">Night - ${day.temp.night}&#176;C</div>
                <div class="temp">Day - ${day.temp.day}&#176;C</div>
            </div>
            
            `
        }else{
            otherDayForcast += `
            <div class="weather-forecast-item">
                <div class="day">${window.moment(day.dt*1000).format('ddd')}</div>
                <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                <div class="temp">Night - ${day.temp.night}&#176;C</div>
                <div class="temp">Day - ${day.temp.day}&#176;C</div>
            </div>
            
            `
        }
    })


    weatherForecastEl.innerHTML = otherDayForcast;
}