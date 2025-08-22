import requests
import os
from datetime import datetime, timedelta
import json

class WeatherDataCollector:
    def __init__(self):
        # Open-Meteo API - no API key required, free for non-commercial use
        self.base_url = "https://api.open-meteo.com/v1"
    
    def validate_coordinates(self, lat, lon):
        """Validate and fix coordinate ranges"""
        # Check if coordinates are swapped (latitude out of valid range)
        if lat < -90 or lat > 90:
            # Try swapping coordinates
            if lon >= -90 and lon <= 90:
                print(f"Swapping coordinates: lat={lat}, lon={lon} -> lat={lon}, lon={lat}")
                return lon, lat
            else:
                print(f"Invalid coordinates after swap attempt: lat={lat}, lon={lon}")
                return None, None
        
        # Check longitude range
        if lon < -180 or lon > 180:
            print(f"Invalid longitude: {lon}")
            return None, None
        
        return lat, lon
    
    def get_weather_at_location(self, lat, lon):
        """Get current weather data for a specific location using Open-Meteo"""
        try:
            # Validate and fix coordinate ranges
            lat, lon = self.validate_coordinates(lat, lon)
            if lat is None or lon is None:
                return None
                
            url = f"{self.base_url}/forecast"
            params = {
                'latitude': lat,
                'longitude': lon,
                'current': 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
                'hourly': 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
                'timezone': 'auto'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            current = data['current']
            
            # Map weather codes to descriptions
            weather_description = self.get_weather_description(current.get('weather_code', 0))
            
            return {
                'temperature': current.get('temperature_2m', 0),
                'apparent_temperature': current.get('apparent_temperature', 0),
                'pressure': current.get('pressure_msl', 1013.25),
                'surface_pressure': current.get('surface_pressure', 1013.25),
                'humidity': current.get('relative_humidity_2m', 0),
                'wind_speed': current.get('wind_speed_10m', 0),
                'wind_direction': current.get('wind_direction_10m', 0),
                'wind_gusts': current.get('wind_gusts_10m', 0),
                'weather_description': weather_description,
                'weather_code': current.get('weather_code', 0),
                'cloud_cover': current.get('cloud_cover', 0),
                'precipitation': current.get('precipitation', 0),
                'rain': current.get('rain', 0),
                'showers': current.get('showers', 0),
                'snowfall': current.get('snowfall', 0),
                'visibility': self.calculate_visibility(current.get('weather_code', 0), current.get('cloud_cover', 0))
            }
        except Exception as e:
            print(f"Open-Meteo API error for {lat}, {lon}: {e}")
            return None
    
    def get_weather_forecast(self, lat, lon):
        """Get 7-day weather forecast for a location using Open-Meteo"""
        try:
            # Validate and fix coordinate ranges
            lat, lon = self.validate_coordinates(lat, lon)
            if lat is None or lon is None:
                return None
                
            url = f"{self.base_url}/forecast"
            params = {
                'latitude': lat,
                'longitude': lon,
                'hourly': 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
                'timezone': 'auto',
                'forecast_days': 7
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            hourly = data['hourly']
            forecast = []
            
            for i in range(len(hourly['time'])):
                forecast.append({
                    'datetime': hourly['time'][i],
                    'temperature': hourly['temperature_2m'][i],
                    'apparent_temperature': hourly['apparent_temperature'][i],
                    'pressure': hourly['pressure_msl'][i],
                    'wind_speed': hourly['wind_speed_10m'][i],
                    'wind_direction': hourly['wind_direction_10m'][i],
                    'wind_gusts': hourly['wind_gusts_10m'][i],
                    'humidity': hourly['relative_humidity_2m'][i],
                    'weather_description': self.get_weather_description(hourly['weather_code'][i]),
                    'weather_code': hourly['weather_code'][i],
                    'cloud_cover': hourly['cloud_cover'][i],
                    'precipitation': hourly['precipitation'][i]
                })
            
            return forecast
        except Exception as e:
            print(f"Open-Meteo forecast API error for {lat}, {lon}: {e}")
            return None
    
    def get_weather_description(self, weather_code):
        """Convert WMO weather codes to human-readable descriptions"""
        weather_codes = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            56: "Light freezing drizzle",
            57: "Dense freezing drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            66: "Light freezing rain",
            67: "Heavy freezing rain",
            71: "Slight snow fall",
            73: "Moderate snow fall",
            75: "Heavy snow fall",
            77: "Snow grains",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            85: "Slight snow showers",
            86: "Heavy snow showers",
            95: "Thunderstorm",
            96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail"
        }
        return weather_codes.get(weather_code, "Unknown")
    
    def calculate_visibility(self, weather_code, cloud_cover):
        """Calculate visibility based on weather conditions"""
        # Base visibility in meters
        if weather_code in [0, 1, 2]:  # Clear to partly cloudy
            return 10000
        elif weather_code == 3:  # Overcast
            return 8000 - (cloud_cover * 50)  # Reduce visibility based on cloud cover
        elif weather_code in [45, 48]:  # Fog
            return 1000
        elif weather_code in [51, 53, 55]:  # Drizzle
            return 5000
        elif weather_code in [61, 63, 65]:  # Rain
            return 3000
        elif weather_code in [71, 73, 75]:  # Snow
            return 2000
        else:
            return 5000
    


def get_weather_data_for_balloons(balloon_data, fetch_weather=False):
    """Main function to get weather data for balloon positions using Open-Meteo"""
    # Return empty weather data if weather fetching is disabled
    if not fetch_weather:
        return {}
        
    collector = WeatherDataCollector()
    
    # Get weather data for current balloon positions (limit to first 5 balloons to avoid rate limiting)
    weather_data = {}
    
    # Only process first 5 balloons to avoid API rate limiting
    balloons_to_process = min(5, len(balloon_data))
    
    for balloon_id in range(balloons_to_process):
        balloon = balloon_data[balloon_id]
        if balloon['path'] and len(balloon['path']) > 0:
            current_pos = balloon['path'][0]  # Most recent position
            lat, lon = current_pos[0], current_pos[1]
            
            # Validate coordinates before making API call
            valid_lat, valid_lon = collector.validate_coordinates(lat, lon)
            if valid_lat is not None and valid_lon is not None:
                weather = collector.get_weather_at_location(valid_lat, valid_lon)
                if weather:
                    weather_data[balloon_id] = weather
    
    return weather_data
