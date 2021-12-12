const ctx = document.getElementById('myChart');
var chartExist = false;
var myChart;
function getGraphData(data){
    var chartDataDay = [];
    var chartDataNight = [];
    var chartDataHumidity = [];
    var chartDataMax = [];
    var chartDataMin = [];
    console.log(data);
    console.log(data.daily);
    data.daily.forEach((day, idx) => {
        chartDataDay.push(day.temp.day);
        chartDataNight.push(day.temp.night);
        chartDataMax.push(day.temp.max);
        chartDataMin.push(day.temp.min);
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
            label: 'Temp - Max',
            data: chartDataMax,
            backgroundColor: [
                'rgba(242, 242, 242, 0.2)',
            ],
            borderColor: [
                'rgba(242, 242, 242, 1)',
            ],
            borderWidth: 1,
            fill: '-1',
            pointStyle: 'rectRot',
            pointRadius: 5,
            cubicInterpolationMode: 'monotone',
            tension: 0.3,
        },
            {
            label: 'Temp - Day',
            data: chartDataDay,
            backgroundColor: [
                'rgba(255, 204, 0, 0.2)',
            ],
            borderColor: [
                'rgba(255, 204, 0, 1)',
            ],
            borderWidth: 1,
            fill: '-1',
            pointStyle: 'rectRot',
            pointRadius: 5,
            cubicInterpolationMode: 'monotone',
            tension: 0.3,
        },
            {
            label: 'Temp - Night',
            data: chartDataNight,
            backgroundColor: [
                'rgba(255, 0, 102, 0.5)',
            ],
            borderColor: [
                'rgba(255, 0, 102, 1)',
            ],
            borderWidth: 1,
            fill: '-1',
            pointStyle: 'rectRot',
            pointRadius: 5,
            cubicInterpolationMode: 'monotone',
            tension: 0.25,
        },
            {
            label: 'Temp - Min',
            data: chartDataMin,
            backgroundColor: [
                'rgba(0, 255, 0, 0.2)',
            ],
            borderColor: [
                'rgba(0, 255, 0, 1)',
            ],
            borderWidth: 1,
            fill: 1,
            pointStyle: 'rectRot',
            pointRadius: 5,
            cubicInterpolationMode: 'monotone',
            tension: 0.3,
        },
            {
            label: 'Humidity',
            data: chartDataHumidity,
            backgroundColor: [
                'rgba(0, 255, 255, 0.5)',
            ],
            borderColor: [
                'rgba(0, 255, 255, 1)',
            ],
            borderWidth: 1,
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.3,
            hidden: true,
        }
    ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                },
            },
            title: {
                display: true,
                text: 'Weather Forecast Chart'
            },
        },
        interaction: {
            mode: 'nearest',
            intersect: false,
          },
        animations: {
        radius: {
            duration: 400,
            easing: 'quad',
            loop: (context) => context.active
            }
        },
        hoverRadius: 12,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
    chartExist = true;
}