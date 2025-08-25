import requests
import json
from datetime import datetime, timedelta
import math

class AirTrafficDataCollector:
    def __init__(self):
        # OpenSky Network API - free tier with signup
        self.base_url = "https://opensky-network.org/api"
        # Note: For production use, you'd need to sign up for API credentials
        # For demo purposes, we'll use the public endpoint with limitations
        self.username = None  # Add your OpenSky username here
        self.password = None  # Add your OpenSky password here
    
    def get_aircraft_in_area(self, lat_min, lat_max, lon_min, lon_max, altitude_min=0, altitude_max=50000):
        """Get aircraft positions in a specific area using OpenSky Network API"""
        try:
            url = f"{self.base_url}/states/all"
            params = {
                'lamin': lat_min,
                'lamax': lat_max,
                'lomin': lon_min,
                'lomax': lon_max,
                'time': int(datetime.now().timestamp())
            }
            
            # Use basic authentication if credentials are provided
            auth = None
            if self.username and self.password:
                auth = (self.username, self.password)
            
            response = requests.get(url, params=params, auth=auth, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            states = data.get('states', [])
            
            if not states:
                return []
            
            # Filter and process aircraft data
            aircraft_list = []
            for state in states:
                if len(state) >= 17:  # Ensure we have enough data fields
                    aircraft = self._parse_aircraft_state(state)
                    if aircraft and self._is_valid_aircraft(aircraft, altitude_min, altitude_max):
                        aircraft_list.append(aircraft)
            
            return aircraft_list
            
        except Exception as e:
            print(f"OpenSky API error: {e}")
            # Return mock data for demonstration
            return self._create_mock_aircraft_data(lat_min, lat_max, lon_min, lon_max)
    
    def _parse_aircraft_state(self, state):
        """Parse aircraft state data from OpenSky API response"""
        try:
            return {
                'icao24': state[0],  # ICAO24 address
                'callsign': state[1],  # Callsign
                'origin_country': state[2],  # Country
                'time_position': state[3],  # Unix timestamp
                'time_velocity': state[4],  # Unix timestamp
                'longitude': state[5],  # WGS84 longitude
                'latitude': state[6],  # WGS84 latitude
                'altitude': state[7],  # Geometric altitude in meters
                'on_ground': state[8],  # Boolean
                'velocity': state[9],  # Velocity in m/s
                'true_track': state[10],  # True track in degrees
                'vertical_rate': state[11],  # Vertical rate in m/s
                'sensors': state[12],  # Sensor IDs
                'geo_altitude': state[13],  # Geometric altitude in meters
                'squawk': state[14],  # Squawk code
                'spi': state[15],  # Special purpose indicator
                'position_source': state[16]  # Position source
            }
        except (IndexError, TypeError):
            return None
    
    def _is_valid_aircraft(self, aircraft, altitude_min, altitude_max):
        """Check if aircraft data is valid and within altitude range"""
        if not aircraft:
            return False
        
        # Check if we have valid position data
        if aircraft.get('latitude') is None or aircraft.get('longitude') is None:
            return False
        
        # Check altitude range
        altitude = aircraft.get('altitude') or aircraft.get('geo_altitude')
        if altitude is None:
            return False
        
        return altitude_min <= altitude <= altitude_max
    
    def _create_mock_aircraft_data(self, lat_min, lat_max, lon_min, lon_max):
        """Create mock aircraft data for demonstration when API is unavailable"""
        import random
        
        aircraft_list = []
        num_aircraft = random.randint(3, 8)  # Random number of aircraft
        
        for i in range(num_aircraft):
            # Generate random position within the area
            lat = random.uniform(lat_min, lat_max)
            lon = random.uniform(lon_min, lon_max)
            
            # Generate realistic aircraft data
            altitude = random.randint(3000, 12000)  # 3-12 km altitude
            velocity = random.uniform(150, 250)  # 150-250 m/s (typical cruising speed)
            track = random.uniform(0, 360)  # Random heading
            
            aircraft = {
                'icao24': f"mock{i:06x}",
                'callsign': f"DEMO{i:03d}",
                'origin_country': 'Demo',
                'time_position': int(datetime.now().timestamp()),
                'time_velocity': int(datetime.now().timestamp()),
                'longitude': lon,
                'latitude': lat,
                'altitude': altitude,
                'on_ground': False,
                'velocity': velocity,
                'true_track': track,
                'vertical_rate': random.uniform(-10, 10),
                'sensors': [],
                'geo_altitude': altitude,
                'squawk': f"{random.randint(1000, 7777)}",
                'spi': False,
                'position_source': 0,
                'is_mock_data': True
            }
            
            aircraft_list.append(aircraft)
        
        return aircraft_list
    
    def analyze_safety_concerns(self, balloons_data, aircraft_data):
        """Analyze potential safety concerns between balloons and aircraft"""
        safety_analysis = {
            'total_balloons': len(balloons_data),
            'total_aircraft': len(aircraft_data),
            'near_misses': [],
            'high_risk_encounters': [],
            'medium_risk_encounters': [],
            'low_risk_encounters': [],
            'safety_zones_violated': 0,
            'altitude_conflicts': 0
        }
        
        # Define safety thresholds
        HORIZONTAL_SAFETY_DISTANCE = 5000  # 5 km horizontal separation
        VERTICAL_SAFETY_DISTANCE = 300  # 300 meters vertical separation
        HIGH_RISK_DISTANCE = 2000  # 2 km for high risk
        MEDIUM_RISK_DISTANCE = 3500  # 3.5 km for medium risk
        
        for balloon_idx, balloon in enumerate(balloons_data):
            if not balloon['path'] or len(balloon['path']) == 0:
                continue
            
            balloon_pos = balloon['path'][0]  # Current balloon position
            balloon_lat, balloon_lon = balloon_pos[0], balloon_pos[1]
            balloon_altitude = 20000  # Assume balloon altitude ~20km (typical sounding balloon)
            
            for aircraft in aircraft_data:
                aircraft_lat = aircraft['latitude']
                aircraft_lon = aircraft['longitude']
                aircraft_altitude = aircraft['altitude'] or aircraft['geo_altitude'] or 0
                
                # Calculate horizontal distance
                horizontal_distance = self._calculate_distance(
                    balloon_lat, balloon_lon, 
                    aircraft_lat, aircraft_lon
                )
                
                # Calculate vertical distance
                vertical_distance = abs(balloon_altitude - aircraft_altitude)
                
                # Check for safety violations
                if horizontal_distance <= HORIZONTAL_SAFETY_DISTANCE and vertical_distance <= VERTICAL_SAFETY_DISTANCE:
                    safety_analysis['safety_zones_violated'] += 1
                    
                    # Classify risk level
                    if horizontal_distance <= HIGH_RISK_DISTANCE:
                        risk_level = 'HIGH'
                        safety_analysis['high_risk_encounters'].append({
                            'balloon_id': balloon_idx,
                            'aircraft_callsign': aircraft['callsign'],
                            'horizontal_distance': horizontal_distance,
                            'vertical_distance': vertical_distance,
                            'aircraft_altitude': aircraft_altitude,
                            'balloon_altitude': balloon_altitude
                        })
                    elif horizontal_distance <= MEDIUM_RISK_DISTANCE:
                        risk_level = 'MEDIUM'
                        safety_analysis['medium_risk_encounters'].append({
                            'balloon_id': balloon_idx,
                            'aircraft_callsign': aircraft['callsign'],
                            'horizontal_distance': horizontal_distance,
                            'vertical_distance': vertical_distance,
                            'aircraft_altitude': aircraft_altitude,
                            'balloon_altitude': balloon_altitude
                        })
                    else:
                        risk_level = 'LOW'
                        safety_analysis['low_risk_encounters'].append({
                            'balloon_id': balloon_idx,
                            'aircraft_callsign': aircraft['callsign'],
                            'horizontal_distance': horizontal_distance,
                            'vertical_distance': vertical_distance,
                            'aircraft_altitude': aircraft_altitude,
                            'balloon_altitude': balloon_altitude
                        })
                    
                    # Check for altitude conflicts (balloons in flight corridors)
                    if 8000 <= aircraft_altitude <= 12000:  # Typical commercial flight corridor
                        safety_analysis['altitude_conflicts'] += 1
                
                # Record near misses (very close encounters)
                if horizontal_distance <= 1000 and vertical_distance <= 100:
                    safety_analysis['near_misses'].append({
                        'balloon_id': balloon_idx,
                        'aircraft_callsign': aircraft['callsign'],
                        'horizontal_distance': horizontal_distance,
                        'vertical_distance': vertical_distance,
                        'aircraft_altitude': aircraft_altitude,
                        'balloon_altitude': balloon_altitude
                    })
        
        return safety_analysis
    
    def _calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two points using Haversine formula"""
        R = 6371000  # Earth's radius in meters
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_lat / 2) * math.sin(delta_lat / 2) +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(delta_lon / 2) * math.sin(delta_lon / 2))
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance = R * c
        
        return distance

def get_air_traffic_for_balloons(balloons_data, fetch_air_traffic=False):
    """Main function to get air traffic data for balloon areas"""
    if not fetch_air_traffic:
        return []
    
    collector = AirTrafficDataCollector()
    
    # Calculate bounding box for all balloons
    if not balloons_data:
        return []
    
    latitudes = []
    longitudes = []
    
    for balloon in balloons_data:
        if balloon['path'] and len(balloon['path']) > 0:
            pos = balloon['path'][0]
            latitudes.append(pos[0])
            longitudes.append(pos[1])
    
    if not latitudes or not longitudes:
        return []
    
    # Add some buffer around the balloon area
    lat_min = min(latitudes) - 1.0  # 1 degree buffer
    lat_max = max(latitudes) + 1.0
    lon_min = min(longitudes) - 1.0
    lon_max = max(longitudes) + 1.0
    
    # Get aircraft in the area
    aircraft_data = collector.get_aircraft_in_area(lat_min, lat_max, lon_min, lon_max)
    
    return aircraft_data

def analyze_air_traffic_safety(balloons_data, aircraft_data):
    """Analyze safety concerns between balloons and aircraft"""
    if not aircraft_data:
        return {}
    
    collector = AirTrafficDataCollector()
    return collector.analyze_safety_concerns(balloons_data, aircraft_data)

