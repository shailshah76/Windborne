document.addEventListener('DOMContentLoaded', function () {
    // Initialize map
    var mymap = L.map('mapid').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);

    // Global variables
    let balloonMarkers = [];
    let constellationLines = [];
    let aircraftMarkers = [];
    let airTrafficEnabled = false;
    let lastAircraftData = [];
    let lastBalloonsData = [];
    let lastConstellationData = [];

    // Load initial data
    loadData();

    // Set up refresh button
    document.getElementById('refreshBtn').addEventListener('click', function() {
        this.classList.add('loading');
        loadData(true).finally(() => {  // Force refresh when button is clicked
            this.classList.remove('loading');
        });
    });

    // Set up controls
    setupControls();



    function loadData(forceRefresh = false) {
        const params = new URLSearchParams();
        if (airTrafficEnabled) params.append('air_traffic', 'true');
        if (forceRefresh) params.append('refresh', 'true');
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
                lastAircraftData = data.aircraft;
                lastConstellationData = data.constellation;
                
                // Process balloons
                processBalloons(data.balloons);
                
                // Process constellation links
                processConstellationLinks(data.constellation, data.balloons);
                
                // Process air traffic data
                processAirTrafficData(data.aircraft, data.safety_analysis);
                
                // Update insights
                updateInsights(data.insights);
                
                // Update air traffic safety summary
                updateAirTrafficSummary(data.safety_analysis);
                
                // Update flight analysis
                updateFlightAnalysis(data);
            })
            .catch(error => {
                console.error('Error loading data:', error);
                document.getElementById('lastUpdated').textContent = 'Error loading data';
            });
    }

    function clearMap() {
        balloonMarkers.forEach(marker => mymap.removeLayer(marker));
        constellationLines.forEach(line => mymap.removeLayer(line));
        aircraftMarkers.forEach(marker => mymap.removeLayer(marker));
        
        balloonMarkers = [];
        constellationLines = [];
        aircraftMarkers = [];
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

    function processAirTrafficData(aircraftData, safetyAnalysis) {
        if (!document.getElementById('showAirTraffic').checked) return;
        
        aircraftData.forEach(aircraft => {
            const position = [aircraft.latitude, aircraft.longitude];
            const altitude = aircraft.altitude || aircraft.geo_altitude || 0;
            const velocity = aircraft.velocity || 0;
            const track = aircraft.true_track || 0;
            
            // Determine if this aircraft is in a high-risk encounter
            const isHighRisk = safetyAnalysis.high_risk_encounters.some(encounter => 
                encounter.aircraft_callsign === aircraft.callsign
            );
            
            // Create aircraft icon with color based on risk level
            const aircraftColor = isHighRisk ? '#f44336' : '#2196f3';
            
            const aircraftIcon = L.divIcon({
                className: 'aircraft-marker',
                html: `<div style="
                    width: 16px; 
                    height: 16px; 
                    background: ${aircraftColor}; 
                    border-radius: 50%; 
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 8px;
                    color: white;
                    font-weight: bold;
                    transform: rotate(${track}deg);
                ">✈</div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });

            const marker = L.marker(position, { icon: aircraftIcon }).addTo(mymap);
            
            const popupContent = `
                <h3>Aircraft ${aircraft.callsign}</h3>
                ${aircraft.is_mock_data ? '<div style="background: #fff3cd; color: #856404; padding: 4px; margin-bottom: 8px; border-radius: 4px; font-size: 0.8em;"><i class="fas fa-info-circle"></i> Demo Data (API Unavailable)</div>' : ''}
                <div class="popup-item">
                    <span class="popup-label">Callsign:</span>
                    <span class="popup-value">${aircraft.callsign}</span>
                </div>
                <div class="popup-item">
                    <span class="popup-label">Altitude:</span>
                    <span class="popup-value">${Math.round(altitude)} m</span>
                </div>
                <div class="popup-item">
                    <span class="popup-label">Speed:</span>
                    <span class="popup-value">${Math.round(velocity)} m/s</span>
                </div>
                <div class="popup-item">
                    <span class="popup-label">Heading:</span>
                    <span class="popup-value">${Math.round(track)}°</span>
                </div>
                <div class="popup-item">
                    <span class="popup-label">Country:</span>
                    <span class="popup-value">${aircraft.origin_country}</span>
                </div>
                ${isHighRisk ? '<div style="background: #ffebee; color: #c62828; padding: 4px; margin-top: 8px; border-radius: 4px; font-size: 0.8em;"><i class="fas fa-exclamation-triangle"></i> HIGH RISK ENCOUNTER</div>' : ''}
            `;
            
            marker.bindPopup(popupContent);
            aircraftMarkers.push(marker);
        });
    }





    function updateInsights(insights) {
        // Update stats cards
        if (insights) {
            document.getElementById('totalBalloons').textContent = insights.total_balloons || '-';
            document.getElementById('avgSpeed').textContent = insights.avg_speed ? `${insights.avg_speed.toFixed(1)} km/h` : '-';
            document.getElementById('constellationLinks').textContent = insights.constellation_links || '-';
            document.getElementById('totalAircraft').textContent = insights.total_aircraft || '-';
        }
    }





    function updateFlightAnalysis(data) {
        const analysisContainer = document.getElementById('flightAnalysisText');
        
        // Always show balloon analysis, with air traffic if enabled
        if (!data.balloons || data.balloons.length === 0) {
            analysisContainer.innerHTML = `
                <div class="analysis-placeholder">
                    <i class="fas fa-info-circle"></i>
                    <p>No balloon data available</p>
                </div>
            `;
            return;
        }
        
        // Check if air traffic data is available
        if (!data.air_traffic_enabled || !data.aircraft || data.aircraft.length === 0) {
            // Show balloon-only analysis
            const analysis = generateBalloonAnalysis(data);
            analysisContainer.innerHTML = analysis;
            return;
        }
        
        // Generate analysis text
        const analysis = generateFlightAnalysis(data);
        analysisContainer.innerHTML = analysis;
    }
    
    function generateBalloonAnalysis(data) {
        const balloons = data.balloons || [];
        const insights = data.insights || {};
        
        let analysisHTML = '';
        
        // Overview section
        analysisHTML += `
            <div class="analysis-section">
                <h3>Balloon Overview</h3>
                <p><span class="highlight">${balloons.length}</span> balloons detected in the area</p>
                <p><span class="highlight">${insights.active_balloons || 0}</span> balloons with active tracking</p>
                <p><span class="highlight">${insights.avg_speed ? insights.avg_speed.toFixed(1) : 0}</span> km/h average speed</p>
            </div>
        `;
        
        // Speed analysis section
        if (insights.speed_distribution) {
            analysisHTML += `
                <div class="analysis-section">
                    <h3>Speed Distribution</h3>
                    <p>Low speed (< 50 km/h): <span class="info">${insights.speed_distribution.low || 0}</span> balloons</p>
                    <p>Medium speed (50-150 km/h): <span class="info">${insights.speed_distribution.medium || 0}</span> balloons</p>
                    <p>High speed (> 150 km/h): <span class="info">${insights.speed_distribution.high || 0}</span> balloons</p>
                </div>
            `;
        }
        
        // Geographic spread section
        if (insights.geographic_spread) {
            analysisHTML += `
                <div class="analysis-section">
                    <h3>Geographic Spread</h3>
                    <p>Northern hemisphere: <span class="info">${insights.geographic_spread.north || 0}</span> balloons</p>
                    <p>Southern hemisphere: <span class="info">${insights.geographic_spread.south || 0}</span> balloons</p>
                    <p>Eastern hemisphere: <span class="info">${insights.geographic_spread.east || 0}</span> balloons</p>
                    <p>Western hemisphere: <span class="info">${insights.geographic_spread.west || 0}</span> balloons</p>
                </div>
            `;
        }
        
        // Constellation analysis section
        if (data.constellation && data.constellation.length > 0) {
            analysisHTML += `
                <div class="analysis-section">
                    <h3>Constellation Analysis</h3>
                    <p><span class="highlight">${data.constellation.length}</span> constellation links detected</p>
                    <p>Balloons within 500km of each other</p>
                </div>
            `;
        }
        
        return analysisHTML;
    }
    
    function generateFlightAnalysis(data) {
        const balloons = data.balloons || [];
        const aircraft = data.aircraft || [];
        const safetyAnalysis = data.safety_analysis || {};
        
        let analysisHTML = '';
        
        // Overview section
        analysisHTML += `
            <div class="analysis-section">
                <h3>Overview</h3>
                <p><span class="highlight">${balloons.length}</span> balloons detected in the area</p>
                <p><span class="highlight">${aircraft.length}</span> aircraft detected in the area</p>
                <p><span class="highlight">${safetyAnalysis.total_balloons || 0}</span> balloons with active tracking</p>
            </div>
        `;
        
        // Position comparison section
        analysisHTML += `
            <div class="analysis-section">
                <h3>Position Comparison</h3>
        `;
        
        if (balloons.length > 0 && aircraft.length > 0) {
            // Calculate average positions
            const balloonLats = balloons.map(b => b.path[0]?.[0]).filter(lat => lat !== undefined);
            const balloonLons = balloons.map(b => b.path[0]?.[1]).filter(lon => lon !== undefined);
            const aircraftLats = aircraft.map(a => a.latitude).filter(lat => lat !== undefined);
            const aircraftLons = aircraft.map(a => a.longitude).filter(lon => lon !== undefined);
            
            if (balloonLats.length > 0 && aircraftLats.length > 0) {
                const avgBalloonLat = balloonLats.reduce((a, b) => a + b, 0) / balloonLats.length;
                const avgBalloonLon = balloonLons.reduce((a, b) => a + b, 0) / balloonLons.length;
                const avgAircraftLat = aircraftLats.reduce((a, b) => a + b, 0) / aircraftLats.length;
                const avgAircraftLon = aircraftLons.reduce((a, b) => a + b, 0) / aircraftLons.length;
                
                const distance = calculateDistance(avgBalloonLat, avgBalloonLon, avgAircraftLat, avgAircraftLon);
                
                analysisHTML += `
                    <p>Average balloon position: <span class="info">${avgBalloonLat.toFixed(4)}°, ${avgBalloonLon.toFixed(4)}°</span></p>
                    <p>Average aircraft position: <span class="info">${avgAircraftLat.toFixed(4)}°, ${avgAircraftLon.toFixed(4)}°</span></p>
                    <p>Average separation distance: <span class="highlight">${(distance/1000).toFixed(1)} km</span></p>
                `;
            }
        } else {
            analysisHTML += `<p>No position data available for comparison</p>`;
        }
        
        analysisHTML += `</div>`;
        
        // Altitude analysis section
        analysisHTML += `
            <div class="analysis-section">
                <h3>Altitude Analysis</h3>
        `;
        
        if (aircraft.length > 0) {
            const aircraftAltitudes = aircraft.map(a => a.altitude || a.geo_altitude || 0).filter(alt => alt > 0);
            const avgAircraftAltitude = aircraftAltitudes.length > 0 ? 
                aircraftAltitudes.reduce((a, b) => a + b, 0) / aircraftAltitudes.length : 0;
            
            // Assume balloon altitude (typical sounding balloon altitude ~20km)
            const balloonAltitude = 20000; // meters
            
            analysisHTML += `
                <p>Typical balloon altitude: <span class="info">${(balloonAltitude/1000).toFixed(1)} km</span></p>
                <p>Average aircraft altitude: <span class="info">${(avgAircraftAltitude/1000).toFixed(1)} km</span></p>
            `;
            
            const altitudeDifference = Math.abs(balloonAltitude - avgAircraftAltitude);
            if (altitudeDifference < 5000) {
                analysisHTML += `<p><span class="warning">⚠️ CRITICAL: Balloons and aircraft operating at similar altitudes!</span></p>`;
            } else if (altitudeDifference < 10000) {
                analysisHTML += `<p><span class="warning">⚠️ WARNING: Moderate altitude separation</span></p>`;
            } else {
                analysisHTML += `<p><span class="success">✅ Good altitude separation maintained</span></p>`;
            }
        } else {
            analysisHTML += `<p>No aircraft altitude data available</p>`;
        }
        
        analysisHTML += `</div>`;
        
        // Safety analysis section
        if (safetyAnalysis && Object.keys(safetyAnalysis).length > 0) {
            analysisHTML += `
                <div class="analysis-section">
                    <h3>Safety Analysis</h3>
            `;
            
            if (safetyAnalysis.high_risk_encounters && safetyAnalysis.high_risk_encounters.length > 0) {
                analysisHTML += `<p><span class="warning">⚠️ ${safetyAnalysis.high_risk_encounters.length} HIGH RISK encounters detected</span></p>`;
                
                safetyAnalysis.high_risk_encounters.slice(0, 3).forEach(encounter => {
                    analysisHTML += `
                        <div class="encounter-item">
                            <div class="encounter-header">Balloon ${encounter.balloon_id} ↔ ${encounter.aircraft_callsign}</div>
                            <div class="encounter-details">
                                Horizontal: ${(encounter.horizontal_distance/1000).toFixed(1)} km | 
                                Vertical: ${encounter.vertical_distance} m | 
                                Aircraft Alt: ${(encounter.aircraft_altitude/1000).toFixed(1)} km
                            </div>
                        </div>
                    `;
                });
            }
            
            if (safetyAnalysis.medium_risk_encounters && safetyAnalysis.medium_risk_encounters.length > 0) {
                analysisHTML += `<p><span class="info">ℹ️ ${safetyAnalysis.medium_risk_encounters.length} medium risk encounters</span></p>`;
            }
            
            if (safetyAnalysis.near_misses && safetyAnalysis.near_misses.length > 0) {
                analysisHTML += `<p><span class="warning">🚨 ${safetyAnalysis.near_misses.length} NEAR MISSES detected!</span></p>`;
            }
            
            if (safetyAnalysis.altitude_conflicts > 0) {
                analysisHTML += `<p><span class="warning">⚠️ ${safetyAnalysis.altitude_conflicts} altitude conflicts with flight corridors</span></p>`;
            }
            
            if (safetyAnalysis.high_risk_encounters.length === 0 && 
                safetyAnalysis.medium_risk_encounters.length === 0 && 
                safetyAnalysis.near_misses.length === 0) {
                analysisHTML += `<p><span class="success">✅ No safety concerns detected</span></p>`;
            }
            
            analysisHTML += `</div>`;
        }
        
        // Aircraft impact on balloons section
        analysisHTML += `
            <div class="analysis-section">
                <h3>Aircraft Impact on Balloons</h3>
        `;
        
        if (aircraft.length > 0) {
            const highAltitudeAircraft = aircraft.filter(a => (a.altitude || a.geo_altitude || 0) > 10000);
            const lowAltitudeAircraft = aircraft.filter(a => (a.altitude || a.geo_altitude || 0) < 5000);
            
            analysisHTML += `
                <p>High altitude aircraft (>10km): <span class="highlight">${highAltitudeAircraft.length}</span></p>
                <p>Low altitude aircraft (<5km): <span class="highlight">${lowAltitudeAircraft.length}</span></p>
            `;
            
            if (highAltitudeAircraft.length > 0) {
                analysisHTML += `<p><span class="warning">⚠️ High altitude aircraft may affect balloon operations</span></p>`;
            } else {
                analysisHTML += `<p><span class="success">✅ No high altitude aircraft detected</span></p>`;
            }
        } else {
            analysisHTML += `<p>No aircraft data available for impact analysis</p>`;
        }
        
        analysisHTML += `</div>`;
        
        return analysisHTML;
    }
    
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    function updateAirTrafficSummary(safetyAnalysis) {
        if (!safetyAnalysis || Object.keys(safetyAnalysis).length === 0) {
            document.getElementById('highRiskCount').textContent = '-';
            document.getElementById('mediumRiskCount').textContent = '-';
            document.getElementById('nearMissCount').textContent = '-';
            document.getElementById('altitudeConflicts').textContent = '-';
            return;
        }

        document.getElementById('highRiskCount').textContent = safetyAnalysis.high_risk_encounters.length;
        document.getElementById('mediumRiskCount').textContent = safetyAnalysis.medium_risk_encounters.length;
        document.getElementById('nearMissCount').textContent = safetyAnalysis.near_misses.length;
        document.getElementById('altitudeConflicts').textContent = safetyAnalysis.altitude_conflicts;
    }

    function setupControls() {
        document.getElementById('showConstellation').addEventListener('change', function() {
            // Only reload map display, don't fetch new data
            processConstellationLinks(lastConstellationData, lastBalloonsData);
        });
        
        document.getElementById('showAirTraffic').addEventListener('change', function() {
            // Only reload map display, don't fetch new data
            processAirTrafficData(lastAircraftData, {});
        });
        
        // Add air traffic fetch toggle
        document.getElementById('fetchAirTraffic').addEventListener('change', function() {
            airTrafficEnabled = this.checked;
            loadData(true);  // Force refresh when toggling air traffic
        });
    }



    // Auto-refresh every 15 minutes to avoid API rate limiting
    setInterval(loadData, 15 * 60 * 1000);
});