// Page chrome: nav menu, scroll reveals, chart controls, clock, toast, sky theme.

var cityTimezone = null;

function setSky(main, isNight) {
    const map = { Clear: isNight ? 'clear-night' : 'clear-day', Clouds: 'clouds', Rain: 'rain',
        Snow: 'snow', Thunderstorm: 'thunder', Fog: 'fog', Mist: 'fog' };
    document.body.dataset.sky = map[main] || 'clouds';
}

function setLoading(on) {
    document.body.classList.toggle('is-loading', on);
}

let toastTimer;
function showToast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 4200);
}

function updateClock() {
    const el = document.getElementById('local-time');
    if (!el) return;
    const opts = { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' };
    if (cityTimezone) opts.timeZone = cityTimezone;
    try {
        el.textContent = new Intl.DateTimeFormat('en-GB', opts).format(new Date());
    } catch (e) {
        delete opts.timeZone;
        el.textContent = new Intl.DateTimeFormat('en-GB', opts).format(new Date());
    }
}
setInterval(updateClock, 1000 * 15);

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu
    const burger = document.querySelector('.burger');
    const closeMenu = () => {
        document.body.classList.remove('menu-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Open menu');
    };
    burger.addEventListener('click', () => {
        const open = document.body.classList.toggle('menu-open');
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    document.querySelectorAll('.menu-overlay a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    // Scroll reveals
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('in'));
    }

    // Search + location
    document.getElementById('search-form').addEventListener('submit', e => {
        e.preventDefault();
        searchByCity();
    });
    document.getElementById('locate-btn').addEventListener('click', () => getWeatherData());

    // Featured cities
    document.querySelectorAll('.city-card').forEach(card => {
        card.addEventListener('click', () => {
            featuredCity(card.dataset.city);
            document.getElementById('now').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Chart controls
    const bindSegmented = (attr, handler) => {
        const buttons = document.querySelectorAll(`[${attr}]`);
        buttons.forEach(btn => btn.addEventListener('click', () => {
            buttons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
            handler(btn.getAttribute(attr));
        }));
    };
    bindSegmented('data-chart-mode', mode => setChartMode(mode));
    bindSegmented('data-chart-type', type => setChartType(type));

    updateClock();
});
