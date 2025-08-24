import requests
import json
from datetime import datetime, timedelta
import math

class AirQualityDataCollector:
    def __init__(self):
        # OpenAQ API - no API key required, free for non-commercial use
        self.base_url = "https://api.openaq.org/v3"
    
    def get_air_quality_near_location(self, lat, lon, radius_km=50):
        """Get air quality data near a specific location using OpenAQ API"""
        try:
            url = f"{self.base_url}/measurements"
            params = {
                'coordinates': f"{lat},{lon}",
                'radius': radius_km * 1000,  # Convert km to meters
                'limit': 10,  # Get up to 10 measurements
                'order_by': 'datetime',
                'sort': 'desc'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            results = data.get('results', [])
            
            if not results:
                return None
            
            # Aggregate the measurements
            aggregated_data = self._aggregate_measurements(results)
            return aggregated_data
            
        except Exception as e:
            print(f"OpenAQ API error for {lat}, {lon}: {e}")
            return None
    
    def _aggregate_measurements(self, measurements):
        """Aggregate multiple air quality measurements into a single data point"""
        if not measurements:
            return None
        
        # Initialize aggregation containers
        pollutants = {}
        total_count = len(measurements)
        
        for measurement in measurements:
            parameter = measurement.get('parameter', '').lower()
            value = measurement.get('value', 0)
            unit = measurement.get('unit', '')
            
            if parameter not in pollutants:
                pollutants[parameter] = {
                    'values': [],
                    'units': unit,
                    'sources': set()
                }
            
            pollutants[parameter]['values'].append(value)
            pollutants[parameter]['sources'].add(measurement.get('location', 'Unknown'))
        
        # Calculate averages and create aggregated result
        aggregated = {
            'timestamp': measurements[0].get('date', {}).get('utc', ''),
            'location': measurements[0].get('location', ''),
            'coordinates': measurements[0].get('coordinates', {}),
            'pollutants': {},
            'aqi': self._calculate_aqi(pollutants),
            'health_impact': self._assess_health_impact(pollutants),
            'measurement_count': total_count
        }
        
        # Calculate averages for each pollutant
        for parameter, data in pollutants.items():
            values = data['values']
            avg_value = sum(values) / len(values)
            
            aggregated['pollutants'][parameter] = {
                'value': round(avg_value, 2),
                'unit': data['units'],
                'min': min(values),
                'max': max(values),
                'sources': list(data['sources'])
            }
        
        return aggregated
    
    def _calculate_aqi(self, pollutants):
        """Calculate Air Quality Index based on pollutant levels"""
        # Simplified AQI calculation based on EPA standards
        aqi_values = []
        
        # PM2.5 AQI calculation
        if 'pm25' in pollutants:
            pm25_avg = sum(pollutants['pm25']['values']) / len(pollutants['pm25']['values'])
            aqi_values.append(self._pm25_to_aqi(pm25_avg))
        
        # PM10 AQI calculation
        if 'pm10' in pollutants:
            pm10_avg = sum(pollutants['pm10']['values']) / len(pollutants['pm10']['values'])
            aqi_values.append(self._pm10_to_aqi(pm10_avg))
        
        # O3 AQI calculation
        if 'o3' in pollutants:
            o3_avg = sum(pollutants['o3']['values']) / len(pollutants['o3']['values'])
            aqi_values.append(self._o3_to_aqi(o3_avg))
        
        # Return the highest AQI value (worst air quality)
        return max(aqi_values) if aqi_values else 0
    
    def _pm25_to_aqi(self, pm25):
        """Convert PM2.5 concentration to AQI"""
        if pm25 <= 12.0:
            return self._linear_aqi(pm25, 0, 12.0, 0, 50)
        elif pm25 <= 35.4:
            return self._linear_aqi(pm25, 12.1, 35.4, 51, 100)
        elif pm25 <= 55.4:
            return self._linear_aqi(pm25, 35.5, 55.4, 101, 150)
        elif pm25 <= 150.4:
            return self._linear_aqi(pm25, 55.5, 150.4, 151, 200)
        elif pm25 <= 250.4:
            return self._linear_aqi(pm25, 150.5, 250.4, 201, 300)
        else:
            return self._linear_aqi(pm25, 250.5, 500.4, 301, 500)
    
    def _pm10_to_aqi(self, pm10):
        """Convert PM10 concentration to AQI"""
        if pm10 <= 54:
            return self._linear_aqi(pm10, 0, 54, 0, 50)
        elif pm10 <= 154:
            return self._linear_aqi(pm10, 55, 154, 51, 100)
        elif pm10 <= 254:
            return self._linear_aqi(pm10, 155, 254, 101, 150)
        elif pm10 <= 354:
            return self._linear_aqi(pm10, 255, 354, 151, 200)
        elif pm10 <= 424:
            return self._linear_aqi(pm10, 355, 424, 201, 300)
        else:
            return self._linear_aqi(pm10, 425, 604, 301, 500)
    
    def _o3_to_aqi(self, o3):
        """Convert O3 concentration to AQI"""
        if o3 <= 0.054:
            return self._linear_aqi(o3, 0, 0.054, 0, 50)
        elif o3 <= 0.070:
            return self._linear_aqi(o3, 0.055, 0.070, 51, 100)
        elif o3 <= 0.085:
            return self._linear_aqi(o3, 0.071, 0.085, 101, 150)
        elif o3 <= 0.105:
            return self._linear_aqi(o3, 0.086, 0.105, 151, 200)
        elif o3 <= 0.200:
            return self._linear_aqi(o3, 0.106, 0.200, 201, 300)
        else:
            return self._linear_aqi(o3, 0.201, 0.404, 301, 500)
    
    def _linear_aqi(self, concentration, c_low, c_high, aqi_low, aqi_high):
        """Linear interpolation for AQI calculation"""
        return round(((aqi_high - aqi_low) / (c_high - c_low)) * (concentration - c_low) + aqi_low)
    
    def _assess_health_impact(self, pollutants):
        """Assess health impact based on pollutant levels"""
        aqi = self._calculate_aqi(pollutants)
        
        if aqi <= 50:
            return {
                'level': 'Good',
                'description': 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
                'color': '#00E400'
            }
        elif aqi <= 100:
            return {
                'level': 'Moderate',
                'description': 'Air quality is acceptable; however, some pollutants may be a concern for a small number of people.',
                'color': '#FFFF00'
            }
        elif aqi <= 150:
            return {
                'level': 'Unhealthy for Sensitive Groups',
                'description': 'Members of sensitive groups may experience health effects.',
                'color': '#FF7E00'
            }
        elif aqi <= 200:
            return {
                'level': 'Unhealthy',
                'description': 'Everyone may begin to experience health effects.',
                'color': '#FF0000'
            }
        elif aqi <= 300:
            return {
                'level': 'Very Unhealthy',
                'description': 'Health warnings of emergency conditions.',
                'color': '#8F3F97'
            }
        else:
            return {
                'level': 'Hazardous',
                'description': 'Health alert: everyone may experience more serious health effects.',
                'color': '#7E0023'
            }
    
    def get_air_quality_trends(self, lat, lon, days=7):
        """Get air quality trends over the past few days"""
        try:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            url = f"{self.base_url}/measurements"
            params = {
                'coordinates': f"{lat},{lon}",
                'radius': 50000,  # 50km radius
                'limit': 100,
                'date_from': start_date.isoformat() + 'Z',
                'date_to': end_date.isoformat() + 'Z',
                'order_by': 'datetime',
                'sort': 'desc'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            results = data.get('results', [])
            
            if not results:
                return None
            
            # Group measurements by day
            daily_data = {}
            for measurement in results:
                date_str = measurement.get('date', {}).get('utc', '')[:10]  # Get YYYY-MM-DD
                if date_str not in daily_data:
                    daily_data[date_str] = []
                daily_data[date_str].append(measurement)
            
            # Calculate daily averages
            trends = []
            for date, measurements in daily_data.items():
                aggregated = self._aggregate_measurements(measurements)
                if aggregated:
                    trends.append({
                        'date': date,
                        'aqi': aggregated['aqi'],
                        'health_impact': aggregated['health_impact'],
                        'pollutants': aggregated['pollutants']
                    })
            
            return sorted(trends, key=lambda x: x['date'])
            
        except Exception as e:
            print(f"OpenAQ trends API error for {lat}, {lon}: {e}")
            return None

def get_air_quality_for_balloons(balloon_data, fetch_air_quality=False):
    """Main function to get air quality data for balloon positions using OpenAQ"""
    # Return empty air quality data if fetching is disabled
    if not fetch_air_quality:
        return {}
        
    collector = AirQualityDataCollector()
    
    # Get air quality data for current balloon positions (limit to first 3 balloons to avoid rate limiting)
    air_quality_data = {}
    
    # Only process first 3 balloons to avoid API rate limiting
    balloons_to_process = min(3, len(balloon_data))
    
    for balloon_id in range(balloons_to_process):
        balloon = balloon_data[balloon_id]
        if balloon['path'] and len(balloon['path']) > 0:
            current_pos = balloon['path'][0]  # Most recent position
            lat, lon = current_pos[0], current_pos[1]
            
            # Get air quality data near the balloon location
            air_quality = collector.get_air_quality_near_location(lat, lon)
            if air_quality:
                air_quality_data[balloon_id] = air_quality
    
    return air_quality_data

def analyze_atmospheric_conditions(balloon_data, weather_data, air_quality_data):
    """Analyze the relationship between balloon behavior and air quality"""
    insights = {
        'atmospheric_correlation': {},
        'pollution_impact': {},
        'balloon_performance_metrics': {}
    }
    
    # Analyze air quality patterns
    if air_quality_data:
        aqi_values = [aq.get('aqi', 0) for aq in air_quality_data.values()]
        if aqi_values:
            insights['pollution_impact'] = {
                'avg_aqi': sum(aqi_values) / len(aqi_values),
                'max_aqi': max(aqi_values),
                'min_aqi': min(aqi_values),
                'poor_air_quality_count': len([aqi for aqi in aqi_values if aqi > 100]),
                'good_air_quality_count': len([aqi for aqi in aqi_values if aqi <= 50])
            }
    
    return insights
