const ctx = document.getElementById('myChart');
let myChart = null;
let chartMode = 'temp';
let chartType = 'line';
let existingChartData = null;

// What each chart mode plots. 'accent' and 'cool' follow the current sky theme.
const CHART_MODES = {
    temp: { unit: '°C', tick: '°', series: [
        { label: 'High', value: d => d.temp.max, color: 'accent', fill: true },
        { label: 'Day', value: d => d.temp.day, color: 'rgba(244,246,251,0.6)', dash: [4, 4] },
        { label: 'Night', value: d => d.temp.night, color: 'rgba(244,246,251,0.32)', dash: [4, 4] },
        { label: 'Low', value: d => d.temp.min, color: 'cool' },
    ] },
    humid: { unit: '%', tick: '%', series: [
        { label: 'Humidity', value: d => d.humidity, color: 'accent', fill: true },
    ] },
    press: { unit: ' hPa', tick: '', series: [
        { label: 'Pressure', value: d => d.pressure, color: 'accent', fill: true },
    ] },
    wind: { unit: ' km/h', tick: '', series: [
        { label: 'Wind', value: d => d.wind_speed, color: 'accent', fill: true },
        { label: 'Gusts', value: d => d.wind_gust, color: 'cool', dash: [4, 4] },
    ] },
};

function cssVar(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function withAlpha(hex, a) {
    const n = parseInt(hex.replace('#', ''), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function resolveColor(c) {
    if (c === 'accent') return cssVar('--accent') || '#a9c4e4';
    if (c === 'cool') return cssVar('--cool') || '#7f9cc4';
    return c;
}

function setChartMode(mode) {
    chartMode = mode;
    if (existingChartData) getGraphData(existingChartData);
}

function setChartType(type) {
    chartType = type;
    if (existingChartData) getGraphData(existingChartData);
}

function getGraphData(data) {
    existingChartData = data;
    const mode = CHART_MODES[chartMode];
    const isBar = chartType === 'bar';
    let dayFmt;
    try { dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: data.timezone }); }
    catch (e) { dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short' }); }
    const labels = data.daily.map((d, i) => i === 0 ? 'Today' : dayFmt.format(new Date(d.dt * 1000)));

    const datasets = mode.series.map(s => {
        const color = resolveColor(s.color);
        const isHex = color.startsWith('#');
        let background = 'transparent';
        if (isBar) {
            background = isHex ? withAlpha(color, 0.6) : color;
        } else if (s.fill && isHex) {
            background = context => {
                const { ctx: c, chartArea } = context.chart;
                if (!chartArea) return withAlpha(color, 0.12);
                const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                g.addColorStop(0, withAlpha(color, 0.28));
                g.addColorStop(1, withAlpha(color, 0));
                return g;
            };
        }
        return {
            label: s.label,
            data: data.daily.map(s.value),
            borderColor: color,
            backgroundColor: background,
            fill: !isBar && s.fill ? 'start' : false,
            borderWidth: isBar ? 0 : (s.dash ? 1.25 : 2),
            borderDash: isBar ? [] : (s.dash || []),
            borderRadius: isBar ? 8 : 0,
            maxBarThickness: 16,
            tension: 0.4,
            cubicInterpolationMode: 'monotone',
            pointRadius: 0,
            pointHoverRadius: 5,
            pointBackgroundColor: color,
            pointBorderWidth: 0,
        };
    });

    if (myChart) myChart.destroy();
    Chart.defaults.font.family = "'Geist', 'Segoe UI', system-ui, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = 'rgba(244, 246, 251, 0.5)';

    myChart = new Chart(ctx, {
        type: chartType,
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            animation: { duration: 900, easing: 'easeOutQuart' },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 6, boxHeight: 6, padding: 16 },
                },
                tooltip: {
                    backgroundColor: 'rgba(12, 13, 18, 0.92)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 12,
                    titleColor: '#f4f6fb',
                    bodyColor: 'rgba(244, 246, 251, 0.8)',
                    usePointStyle: true,
                    callbacks: {
                        label: c => ` ${c.dataset.label}: ${Math.round(c.parsed.y)}${mode.unit}`,
                    },
                },
            },
            scales: {
                x: { grid: { display: false, drawBorder: false }, ticks: { maxRotation: 0, autoSkipPadding: 8 } },
                y: {
                    beginAtZero: isBar && chartMode !== 'press',
                    grid: { color: 'rgba(255, 255, 255, 0.06)', drawBorder: false },
                    ticks: { maxTicksLimit: 6, callback: v => Math.round(v) + mode.tick },
                },
            },
        },
    });
}
