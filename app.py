from flask import Flask, render_template, jsonify, request
import Data
import AirTrafficData
import math
from datetime import datetime

app = Flask(__name__)

def haversine(lon1, lat1, lon2, lat2):
    R = 6371  # Radius of Earth in kilometers
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat / 2) * math.sin(dLat / 2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon / 2) * math.sin(dLon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance

def calculate_bearing(lon1, lat1, lon2, lat2):
    dLon = math.radians(lon2 - lon1)
    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)
    y = math.sin(dLon) * math.cos(lat2)
    x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dLon)
    bearing = math.degrees(math.atan2(y, x))
    return (bearing + 360) % 360

def track_balloons(data_24h):
    tracks = []
    if not data_24h or 0 not in data_24h:
        return []

    # Initialize tracks with the most recent data
    for balloon_data in data_24h[0]:
        tracks.append([balloon_data])

    for h in range(1, 24):
        if h not in data_24h:
            continue

        unmatched_balloons_current_hour = list(data_24h[h])
        if not unmatched_balloons_current_hour:
            continue

        new_tracks = []
        for track in tracks:
            if not track:
                continue
            last_balloon_in_track = track[-1]
            lon1, lat1 = last_balloon_in_track[2], last_balloon_in_track[1]
            
            closest_balloon_index = -1
            min_dist = float('inf')

            for i, balloon in enumerate(unmatched_balloons_current_hour):
                lon2, lat2 = balloon[2], balloon[1]
                dist = haversine(lon1, lat1, lon2, lat2)

                if dist < min_dist:
                    min_dist = dist
                    closest_balloon_index = i

            if min_dist < 300: # Threshold distance: 300 km/h for one hour
                matched_balloon = unmatched_balloons_current_hour.pop(closest_balloon_index)
                track.append(matched_balloon)
                new_tracks.append(track)
            else:
                # If no match found, we keep the track as is, it will not be extended
                new_tracks.append(track)

        # The remaining unmatched balloons are new tracks
        for balloon in unmatched_balloons_current_hour:
            new_tracks.append([balloon])

        tracks = new_tracks

    return tracks

def analyze_flight_patterns(balloons_data):
    """Analyze flight patterns and provide insights"""
    insights = {
        'total_balloons': len(balloons_data),
        'active_balloons': 0,
        'avg_speed': 0,
        'speed_distribution': {'low': 0, 'medium': 0, 'high': 0},
        'geographic_spread': {'north': 0, 'south': 0, 'east': 0, 'west': 0},
        'constellation_density': 0
    }
    
    total_speed = 0
    speeds = []
    latitudes = []
    longitudes = []
    
    for balloon in balloons_data:
        if balloon['path'] and len(balloon['path']) > 0:
            insights['active_balloons'] += 1
            
            # Analyze speed
            if balloon['velocities'] and len(balloon['velocities']) > 0:
                speed = balloon['velocities'][0][0]
                speeds.append(speed)
                total_speed += speed
                
                if speed < 50:
                    insights['speed_distribution']['low'] += 1
                elif speed < 150:
                    insights['speed_distribution']['medium'] += 1
                else:
                    insights['speed_distribution']['high'] += 1
            
            # Analyze geographic spread
            current_pos = balloon['path'][0]
            latitudes.append(current_pos[0])
            longitudes.append(current_pos[1])
    
    if insights['active_balloons'] > 0:
        insights['avg_speed'] = total_speed / insights['active_balloons']
        
        if latitudes:
            avg_lat = sum(latitudes) / len(latitudes)
            avg_lon = sum(longitudes) / len(longitudes)
            
            # Count balloons in different hemispheres
            for lat in latitudes:
                if lat > avg_lat:
                    insights['geographic_spread']['north'] += 1
                else:
                    insights['geographic_spread']['south'] += 1
            
            for lon in longitudes:
                if lon > avg_lon:
                    insights['geographic_spread']['east'] += 1
                else:
                    insights['geographic_spread']['west'] += 1
    
    return insights

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    # Check if air traffic data is requested
    fetch_air_traffic = request.args.get('air_traffic', 'false').lower() == 'true'
    
    data_24h = Data.get_24h_data()
    tracks = track_balloons(data_24h)

    balloons_data = []
    for i, track in enumerate(tracks):
        path = []
        velocities = []
        for j in range(len(track) - 1):
            current_point = track[j]
            previous_point = track[j+1]

            # Note: Windborne API format is [lat, lon, alt]
            lat1, lon1 = current_point[0], current_point[1]
            lat2, lon2 = previous_point[0], previous_point[1]

            path.append([lat1, lon1])

            distance = haversine(lon1, lat1, lon2, lat2)
            speed = distance
            direction = calculate_bearing(lon2, lat2, lon1, lat1)
            velocities.append([speed, direction])
        
        if track:
            last_point = track[-1]
            path.append([last_point[0], last_point[1]])  # [lat, lon]
            velocities.append([0, 0])

        balloons_data.append({
            "id": i,
            "path": path,
            "velocities": velocities
        })

    constellation_links = []
    latest_positions = []
    for balloon in balloons_data:
        if balloon['path']:
            latest_positions.append(balloon['path'][0])
        else:
            latest_positions.append(None)

    for i in range(len(latest_positions)):
        for j in range(i + 1, len(latest_positions)):
            pos_i = latest_positions[i]
            pos_j = latest_positions[j]
            if pos_i and pos_j:
                dist = haversine(pos_i[1], pos_i[0], pos_j[1], pos_j[0])
                if dist < 500: # 500 km threshold for constellation link
                    constellation_links.append([i, j])
    
    # Get air traffic data only if requested
    aircraft_data = AirTrafficData.get_air_traffic_for_balloons(balloons_data, fetch_air_traffic)
    
    # Analyze flight patterns
    insights = analyze_flight_patterns(balloons_data)
    
    # Analyze air traffic safety if aircraft data is available
    safety_analysis = {}
    if fetch_air_traffic and aircraft_data:
        safety_analysis = AirTrafficData.analyze_air_traffic_safety(balloons_data, aircraft_data)
    
    processed_data = {
        "balloons": balloons_data,
        "constellation": constellation_links,
        "aircraft": aircraft_data,
        "insights": insights,
        "safety_analysis": safety_analysis,
        "last_updated": datetime.now().isoformat(),
        "air_traffic_enabled": fetch_air_traffic,
        "data_quality": {
            "total_balloons": len(balloons_data),
            "total_aircraft": len(aircraft_data),
            "constellation_links": len(constellation_links)
        }
    }

    return jsonify(processed_data)





if __name__ == '__main__':
    app.run(debug=True, port=5001)
