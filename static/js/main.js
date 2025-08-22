document.addEventListener('DOMContentLoaded', function () {
    // Initialize map
    var mymap = L.map('mapid').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);

    // Global variables
    let balloonMarkers = [];
    let pathLines = [];
    let constellationLines = [];
    let weatherMarkers = [];
    let speedChart = null;
    let weatherChart = null;
    let weatherEnabled = false;
    let lastWeatherData = {};
    let lastBalloonsData = [];

    // Initialize charts
    initializeCharts();

    // Load initial data
    loadData();

    // Set up refresh button
    document.getElementById('refreshBtn').addEventListener('click', function() {
        this.classList.add('loading');
        loadData().finally(() => {
            this.classList.remove('loading');
        });
    });

    // Set up controls
    setupControls();



    function loadData() {
        const weatherParam = weatherEnabled ? '?weather=true' : '';
        return fetch(`/api/data${weatherParam}`)
        .then(response => response.json())
        .then(data => {
                console.log('Data loaded:', data);
                
                // Update last updated time
                const lastUpdated = new Date(data.last_updated);
                document.getElementById('lastUpdated').textContent = 
                    `Last updated: ${lastUpdated.toLocaleTimeString()}`;
                
                // Clear existing markers and lines
                clearMap();
                
                // Store data for later use
                lastBalloonsData = data.balloons;
                lastWeatherData = data.weather;
                
                // Process balloons
                processBalloons(data.balloons);
                
                // Process constellation links
                processConstellationLinks(data.constellation, data.balloons);
                
                // Process weather data
                processWeatherData(data.weather, data.balloons);
                
                // Update insights
                updateInsights(data.insights);
                
                // Update weather summary
                updateWeatherSummary(data.weather);
                
                // Update charts
                updateCharts(data);
            })
            .catch(error => {
                console.error('Error loading data:', error);
                document.getElementById('lastUpdated').textContent = 'Error loading data';
            });
    }

    function clearMap() {
        balloonMarkers.forEach(marker => mymap.removeLayer(marker));
        pathLines.forEach(line => mymap.removeLayer(line));
        constellationLines.forEach(line => mymap.removeLayer(line));
        weatherMarkers.forEach(marker => mymap.removeLayer(marker));
        
        balloonMarkers = [];
        pathLines = [];
        constellationLines = [];
        weatherMarkers = [];
    }

    function processBalloons(balloons) {
            balloons.forEach(balloon => {
                const path = balloon.path;
                if (path.length > 0) {
                    // Draw the path as a line
                if (document.getElementById('showPaths').checked && path.length > 1) {
                    const line = L.polyline(path, {
                        color: '#3498db',
                        weight: 3,
                        opacity: 0.7
                    }).addTo(mymap);
                    pathLines.push(line);
                }

                    // Add a marker for the latest position
                    const latestPosition = path[0];
                    const latestVelocity = balloon.velocities[0];
                    const speed = latestVelocity[0];
                    const direction = latestVelocity[1];

                // Create custom balloon icon
                const balloonIcon = L.divIcon({
                    className: 'balloon-marker',
                    html: `<div style="
                        width: 14px; 
                        height: 14px; 
                        background: #e74c3c; 
                        border-radius: 50%; 
                        border: 2px solid white;
                        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
                        transform: rotate(${direction}deg);
                    "></div>`,
                    iconSize: [14, 14],
                    iconAnchor: [7, 7]
                });

                const marker = L.marker(latestPosition, { icon: balloonIcon }).addTo(mymap);
                
                // Create popup content
                const popupContent = `
                    <h3>Balloon ${balloon.id}</h3>
                    <div class="popup-item">
                        <span class="popup-label">Speed:</span>
                        <span class="popup-value">${speed.toFixed(2)} km/h</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Direction:</span>
                        <span class="popup-value">${direction.toFixed(1)}°</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Position:</span>
                        <span class="popup-value">${latestPosition[0].toFixed(4)}, ${latestPosition[1].toFixed(4)}</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Path Length:</span>
                        <span class="popup-value">${path.length} points</span>
                    </div>
                `;
                
                marker.bindPopup(popupContent);
                balloonMarkers.push(marker);
            }
        });
    }

    function processConstellationLinks(constellation, balloons) {
        if (!document.getElementById('showConstellation').checked) return;

            constellation.forEach(link => {
                const balloon1 = balloons[link[0]];
                const balloon2 = balloons[link[1]];

                if (balloon1.path.length > 0 && balloon2.path.length > 0) {
                    const pos1 = balloon1.path[0];
                    const pos2 = balloon2.path[0];
                const line = L.polyline([pos1, pos2], {
                    color: '#9b59b6',
                    weight: 2,
                    opacity: 0.6,
                    dashArray: '5, 10'
                }).addTo(mymap);
                constellationLines.push(line);
            }
        });
    }

    function processWeatherData(weatherData, balloons) {
        if (!document.getElementById('showWeather').checked) return;
        
        Object.keys(weatherData).forEach(balloonId => {
            const balloon = balloons[balloonId];
            if (balloon && balloon.path.length > 0) {
                const position = balloon.path[0];
                const weather = weatherData[balloonId];
                
                // Create weather icon
                const weatherIcon = L.divIcon({
                    className: 'weather-marker',
                    html: `<div style="
                        width: 16px; 
                        height: 16px; 
                        background: #f39c12; 
                        border-radius: 50%; 
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 8px;
                        color: white;
                        font-weight: bold;
                    ">W</div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                });

                const marker = L.marker(position, { icon: weatherIcon }).addTo(mymap);
                
                const popupContent = `
                    <h3>Weather at Balloon ${balloonId}</h3>
                    <div class="popup-item">
                        <span class="popup-label">Temperature:</span>
                        <span class="popup-value">${weather.temperature}°C</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Feels Like:</span>
                        <span class="popup-value">${weather.apparent_temperature}°C</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Wind Speed:</span>
                        <span class="popup-value">${weather.wind_speed} m/s</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Wind Direction:</span>
                        <span class="popup-value">${weather.wind_direction}°</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Wind Gusts:</span>
                        <span class="popup-value">${weather.wind_gusts} m/s</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Pressure:</span>
                        <span class="popup-value">${weather.pressure} hPa</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Humidity:</span>
                        <span class="popup-value">${weather.humidity}%</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Cloud Cover:</span>
                        <span class="popup-value">${weather.cloud_cover}%</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Precipitation:</span>
                        <span class="popup-value">${weather.precipitation} mm</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Conditions:</span>
                        <span class="popup-value">${weather.weather_description}</span>
                    </div>
                `;
                
                marker.bindPopup(popupContent);
                weatherMarkers.push(marker);
            }
        });
    }

    function updateInsights(insights) {
        // Update stats cards
        if (insights) {
            document.getElementById('totalBalloons').textContent = insights.total_balloons || '-';
            document.getElementById('avgSpeed').textContent = insights.avg_speed ? `${insights.avg_speed.toFixed(1)} km/h` : '-';
            document.getElementById('weatherStations').textContent = insights.weather_stations || '-';
            document.getElementById('constellationLinks').textContent = insights.constellation_links || '-';
        }
    }

    function updateWeatherSummary(weatherData) {
        if (!weatherData || Object.keys(weatherData).length === 0) {
            document.getElementById('avgTemp').textContent = '-';
            document.getElementById('avgWind').textContent = '-';
            document.getElementById('avgPressure').textContent = '-';
            document.getElementById('avgHumidity').textContent = '-';
            return;
        }

        const weatherCount = Object.keys(weatherData).length;
        const temperatures = Object.values(weatherData).map(w => w.temperature);
        const windSpeeds = Object.values(weatherData).map(w => w.wind_speed);
        const pressures = Object.values(weatherData).map(w => w.pressure);
        const humidities = Object.values(weatherData).map(w => w.humidity);

        const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
        const avgWind = windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length;
        const avgPressure = pressures.reduce((a, b) => a + b, 0) / pressures.length;
        const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;

        document.getElementById('avgTemp').textContent = `${avgTemp.toFixed(1)}°C`;
        document.getElementById('avgWind').textContent = `${avgWind.toFixed(1)} m/s`;
        document.getElementById('avgPressure').textContent = `${avgPressure.toFixed(0)} hPa`;
        document.getElementById('avgHumidity').textContent = `${avgHumidity.toFixed(0)}%`;
    }

    function initializeCharts() {
        // Speed distribution chart
        const speedCtx = document.getElementById('speedChart').getContext('2d');
        speedChart = new Chart(speedCtx, {
            type: 'doughnut',
            data: {
                labels: ['Low Speed', 'Medium Speed', 'High Speed'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#27ae60', '#f39c12', '#e74c3c'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 12 }
                        }
                    }
                }
            }
        });

        // Weather conditions chart
        const weatherCtx = document.getElementById('weatherChart').getContext('2d');
        weatherChart = new Chart(weatherCtx, {
            type: 'bar',
            data: {
                labels: ['Temperature (°C)', 'Wind Speed (m/s)', 'Pressure (hPa)', 'Humidity (%)'],
                datasets: [{
                    label: 'Average Values',
                    data: [0, 0, 0, 0],
                    backgroundColor: ['#3498db', '#e74c3c', '#9b59b6', '#f39c12'],
                    borderWidth: 1,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: { size: 12 }
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 10 }
                        }
                    }
                }
            }
        });
    }

    function updateCharts(data) {
        // Update speed chart
        const speedData = data.insights.speed_distribution;
        speedChart.data.datasets[0].data = [
            speedData.low,
            speedData.medium,
            speedData.high
        ];
        speedChart.update();

        // Update weather chart
        if (Object.keys(data.weather).length > 0) {
            const weatherValues = Object.values(data.weather);
            const avgTemp = weatherValues.reduce((sum, w) => sum + w.temperature, 0) / weatherValues.length;
            const avgWind = weatherValues.reduce((sum, w) => sum + w.wind_speed, 0) / weatherValues.length;
            const avgPressure = weatherValues.reduce((sum, w) => sum + w.pressure, 0) / weatherValues.length;
            const avgHumidity = weatherValues.reduce((sum, w) => sum + w.humidity, 0) / weatherValues.length;

            weatherChart.data.datasets[0].data = [avgTemp, avgWind, avgPressure / 10, avgHumidity]; // Scale pressure for better visualization
            weatherChart.update();
        }
    }

    function setupControls() {
        document.getElementById('showPaths').addEventListener('change', loadData);
        document.getElementById('showConstellation').addEventListener('change', loadData);
        document.getElementById('showWeather').addEventListener('change', function() {
            // Only reload map display, don't fetch new data
            processWeatherData(lastWeatherData, lastBalloonsData);
        });
        
        // Add weather fetch toggle
        document.getElementById('fetchWeather').addEventListener('change', function() {
            weatherEnabled = this.checked;
            loadData();
        });
        

    }



    // Auto-refresh every 15 minutes to avoid API rate limiting
    setInterval(loadData, 15 * 60 * 1000);
});