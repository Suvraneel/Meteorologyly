const ctx = document.getElementById('myChart');
var chartExist = false;
var myChart;
function getGraphData(data){
    var chartDataDay = [];
    var chartDataNight = [];
    var chartDataHumidity = [];
    console.log(data);
    console.log(data.daily);
    data.daily.forEach((day, idx) => {
        chartDataDay.push(day.temp.day);
        chartDataNight.push(day.temp.night);
        chartDataHumidity.push(day.humidity);
    })
    if(chartExist){
        myChart.destroy();
    }
    Chart.defaults.font.size = 18;
    Chart.defaults.font.family = 'Raleway';
    Chart.defaults.color = 'white';
    myChart = new Chart(ctx, {
    type: 'line',
    borderColor: 'rgb(75, 192, 192)',
    data: {
        labels: days,
        datasets: [
            {
            label: 'Temperature - Day',
            data: chartDataDay,
            backgroundColor: [
                'rgba(0, 247, 255, 0.2)',
            ],
            borderColor: [
                'rgba(0, 247, 255, 1)',
            ],
            borderWidth: 1
        },
            {
            label: 'Temperature - Night',
            data: chartDataNight,
            backgroundColor: [
                'rgba(254, 0, 255, 0.2)',
            ],
            borderColor: [
                'rgba(254, 0, 255, 1)',
            ],
            borderWidth: 1
        },
            {
            label: 'Humidity',
            data: chartDataHumidity,
            backgroundColor: [
                'rgba(0, 0, 255, 0.2)',
            ],
            borderColor: [
                'rgba(0, 0, 255, 1)',
            ],
            borderWidth: 1
        }
    ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Weather Forecast Chart'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
    chartExist = true;
}