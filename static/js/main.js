document.addEventListener('DOMContentLoaded', function () {
    // Initialize map
    var mymap = L.map('mapid').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);

    // Global variables
    let balloonMarkers = [];
    let constellationLines = [];
    let airQualityMarkers = [];
    let speedChart = null;
    let airQualityChart = null;
    let airQualityEnabled = false;
    let lastAirQualityData = {};
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
        const params = new URLSearchParams();
        if (airQualityEnabled) params.append('air_quality', 'true');
        const queryString = params.toString() ? `?${params.toString()}` : '';
        
        return fetch(`/api/data${queryString}`)
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
                lastAirQualityData = data.air_quality;
                
                // Process balloons
                processBalloons(data.balloons);
                
                // Process constellation links
                processConstellationLinks(data.constellation, data.balloons);
                
                // Process air quality data
                processAirQualityData(data.air_quality, data.balloons);
                
                // Update insights
                updateInsights(data.insights);
                
                // Update air quality summary
                updateAirQualitySummary(data.air_quality);
                
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
        constellationLines.forEach(line => mymap.removeLayer(line));
        airQualityMarkers.forEach(marker => mymap.removeLayer(marker));
        
        balloonMarkers = [];
        constellationLines = [];
        airQualityMarkers = [];
    }

    function processBalloons(balloons) {
            balloons.forEach(balloon => {
                const path = balloon.path;
                if (path.length > 0) {
                    // Add a marker for the latest position
                    const latestPosition = path[0];
                    const latestVelocity = balloon.velocities[0];
                    const speed = latestVelocity[0];
                    const direction = latestVelocity[1];

                // Create custom balloon icon
                const balloonIcon = L.divIcon({
                    className: 'balloon-marker',
                    html: `<div style="
                        width: 10px; 
                        height: 10px; 
                        background: #e74c3c; 
                        border-radius: 50%; 
                        border: 1.5px solid white;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                        transform: rotate(${direction}deg);
                    "></div>`,
                    iconSize: [10, 10],
                    iconAnchor: [5, 5]
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



    function processAirQualityData(airQualityData, balloons) {
        if (!document.getElementById('showAirQuality').checked) return;
        
        Object.keys(airQualityData).forEach(balloonId => {
            const balloon = balloons[balloonId];
            if (balloon && balloon.path.length > 0) {
                const position = balloon.path[0];
                const airQuality = airQualityData[balloonId];
                
                // Get AQI color based on level
                const aqiColor = airQuality.health_impact.color;
                
                // Create air quality icon
                const airQualityIcon = L.divIcon({
                    className: 'air-quality-marker',
                    html: `<div style="
                        width: 16px; 
                        height: 16px; 
                        background: ${aqiColor}; 
                        border-radius: 50%; 
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 8px;
                        color: white;
                        font-weight: bold;
                    ">A</div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                });

                const marker = L.marker(position, { icon: airQualityIcon }).addTo(mymap);
                
                // Build pollutants string
                const pollutants = Object.keys(airQuality.pollutants).map(pollutant => {
                    const data = airQuality.pollutants[pollutant];
                    return `${pollutant.toUpperCase()}: ${data.value} ${data.unit}`;
                }).join('<br>');
                
                const popupContent = `
                    <h3>Air Quality at Balloon ${balloonId}</h3>
                    <div class="popup-item">
                        <span class="popup-label">AQI:</span>
                        <span class="popup-value" style="color: ${aqiColor};">${airQuality.aqi}</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Level:</span>
                        <span class="popup-value" style="color: ${aqiColor};">${airQuality.health_impact.level}</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Location:</span>
                        <span class="popup-value">${airQuality.location}</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Measurements:</span>
                        <span class="popup-value">${airQuality.measurement_count}</span>
                    </div>
                    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
                        <strong>Pollutants:</strong><br>
                        ${pollutants}
                    </div>
                `;
                
                marker.bindPopup(popupContent);
                airQualityMarkers.push(marker);
            }
        });
    }

    function updateInsights(insights) {
        // Update stats cards
        if (insights) {
            document.getElementById('totalBalloons').textContent = insights.total_balloons || '-';
            document.getElementById('avgSpeed').textContent = insights.avg_speed ? `${insights.avg_speed.toFixed(1)} km/h` : '-';
            document.getElementById('airQualityStations').textContent = insights.air_quality_stations || '-';
            document.getElementById('constellationLinks').textContent = insights.constellation_links || '-';
        }
    }



    function updateAirQualitySummary(airQualityData) {
        if (!airQualityData || Object.keys(airQualityData).length === 0) {
            document.getElementById('avgAQI').textContent = '-';
            document.getElementById('avgPM25').textContent = '-';
            document.getElementById('avgPM10').textContent = '-';
            document.getElementById('avgO3').textContent = '-';
            return;
        }

        const airQualityValues = Object.values(airQualityData);
        const aqiValues = airQualityValues.map(aq => aq.aqi);
        const pm25Values = airQualityValues.map(aq => aq.pollutants.pm25?.value || 0);
        const pm10Values = airQualityValues.map(aq => aq.pollutants.pm10?.value || 0);
        const o3Values = airQualityValues.map(aq => aq.pollutants.o3?.value || 0);

        const avgAQI = aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length;
        const avgPM25 = pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length;
        const avgPM10 = pm10Values.reduce((a, b) => a + b, 0) / pm10Values.length;
        const avgO3 = o3Values.reduce((a, b) => a + b, 0) / o3Values.length;

        document.getElementById('avgAQI').textContent = `${avgAQI.toFixed(0)}`;
        document.getElementById('avgPM25').textContent = `${avgPM25.toFixed(1)} μg/m³`;
        document.getElementById('avgPM10').textContent = `${avgPM10.toFixed(1)} μg/m³`;
        document.getElementById('avgO3').textContent = `${avgO3.toFixed(3)} ppm`;
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

        // Air quality distribution chart
        const airQualityCtx = document.getElementById('airQualityChart').getContext('2d');
        airQualityChart = new Chart(airQualityCtx, {
            type: 'doughnut',
            data: {
                labels: ['Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy', 'Hazardous'],
                datasets: [{
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: ['#00E400', '#FFFF00', '#FF7E00', '#FF0000', '#8F3F97', '#7E0023'],
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

        // Update air quality chart
        if (Object.keys(data.air_quality).length > 0) {
            const airQualityValues = Object.values(data.air_quality);
            const aqiDistribution = [0, 0, 0, 0, 0, 0]; // Good, Moderate, USG, Unhealthy, VU, Hazardous
            
            airQualityValues.forEach(aq => {
                const aqi = aq.aqi;
                if (aqi <= 50) aqiDistribution[0]++;
                else if (aqi <= 100) aqiDistribution[1]++;
                else if (aqi <= 150) aqiDistribution[2]++;
                else if (aqi <= 200) aqiDistribution[3]++;
                else if (aqi <= 300) aqiDistribution[4]++;
                else aqiDistribution[5]++;
            });
            
            airQualityChart.data.datasets[0].data = aqiDistribution;
            airQualityChart.update();
        }
    }

    function setupControls() {
        document.getElementById('showConstellation').addEventListener('change', loadData);
        document.getElementById('showAirQuality').addEventListener('change', function() {
            // Only reload map display, don't fetch new data
            processAirQualityData(lastAirQualityData, lastBalloonsData);
        });
        
        // Add air quality fetch toggle
        document.getElementById('fetchAirQuality').addEventListener('change', function() {
            airQualityEnabled = this.checked;
            loadData();
        });
    }



    // Auto-refresh every 15 minutes to avoid API rate limiting
    setInterval(loadData, 15 * 60 * 1000);
});