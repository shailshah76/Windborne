# Windborne Constellation Explorer

An interactive web application that tracks real-time balloon positions from Windborne Systems' global sounding balloon constellation. Visualize balloon flight paths over 24 hours and optionally integrate weather data from Open-Meteo API to analyze how atmospheric conditions affect balloon trajectories.

## 🌟 Features

### Real-time Balloon Tracking
- **Live Constellation Data**: Fetches and displays the current positions of Windborne's global sounding balloons
- **24-Hour Flight History**: Tracks balloon movements over the past 24 hours with intelligent path reconstruction
- **Interactive Map**: Visualize balloon positions, flight paths, and constellation connections on an interactive world map

### Weather Integration
- **Real-time Weather Data**: Integrates OpenWeatherMap API to provide current weather conditions at balloon locations
- **Weather Impact Analysis**: Analyzes how atmospheric conditions affect balloon flight patterns
- **Weather Forecasting**: Provides 5-day weather forecasts for balloon positions

### Advanced Analytics
- **Flight Pattern Analysis**: Calculates speed distributions, geographic spread, and constellation density
- **Weather Correlation**: Correlates balloon behavior with local weather conditions
- **Interactive Charts**: Visual data representation with Chart.js for speed distribution and weather conditions

### Interactive Features
- **Material Design UI**: Clean, modern interface inspired by Google's Material Design
- **Single-Page Layout**: All elements visible in one viewport without scrolling
- **Dynamic Controls**: Toggle visibility of flight paths, constellation links, and weather data
- **Weather Toggle**: Enable/disable live weather data fetching with "Fetch Live Weather" button
- **Speed Filtering**: Filter balloons by speed categories (low, medium, high)
- **Real-time Updates**: Auto-refresh every 15 minutes with manual refresh option
- **Compact Stats Cards**: Key metrics displayed with intuitive icons
- **Improved Readability**: Better organized weather data and insights

## 🚀 Why Open-Meteo API?

I chose [Open-Meteo](https://open-meteo.com/) as the external dataset because it provides superior weather data that directly impacts balloon flight behavior. Open-Meteo offers several advantages over other weather APIs:

- **No API Key Required**: Completely free for non-commercial use, no registration needed
- **Higher Resolution**: 1-11km resolution vs other APIs' lower resolution
- **More Frequent Updates**: Hourly updates with real-time data from national weather services
- **Open-Source**: AGPLv3 licensed, transparent and community-driven
- **Better Data Quality**: Partners with national weather services for accurate forecasts
- **Comprehensive Coverage**: Global weather data with 80+ years of historical data

Atmospheric conditions like wind speed, direction, pressure, and temperature are crucial factors that influence balloon trajectories and flight patterns. By combining this high-quality weather data with the balloon tracking information, we can:

- **Predict Flight Paths**: Understand how weather conditions affect balloon movement
- **Optimize Operations**: Identify optimal weather conditions for balloon launches
- **Safety Analysis**: Monitor weather conditions that might impact balloon operations
- **Research Applications**: Study the relationship between atmospheric conditions and balloon behavior

This integration creates a powerful tool for atmospheric research, weather monitoring, and balloon flight optimization.

## 🛠️ Technology Stack

- **Backend**: Python Flask
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mapping**: Leaflet.js with OpenStreetMap
- **Charts**: Chart.js for data visualization
- **Weather API**: Open-Meteo API
- **Styling**: Custom CSS with glassmorphism design

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Windborne
   ```

2. **Set up Python virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**:
   ```bash
   python app.py
   ```

5. **Access the application**:
   Open your browser and navigate to `http://localhost:5001`

**Note**: No API key is required! Open-Meteo is completely free and doesn't require registration.

## 🔧 API Endpoints

- `GET /` - Main application interface
- `GET /api/data` - Get balloon data with weather information
- `GET /api/weather/<balloon_id>` - Get detailed weather data for a specific balloon
- `GET /api/insights` - Get comprehensive analytics and insights
- `POST /contact` - Submit contact form messages

## 📊 Data Sources

### Windborne Constellation API
- **Base URL**: `https://a.windbornesystems.com/treasure/`
- **Format**: JSON files for each hour (00.json to 23.json)
- **Data**: Balloon positions, timestamps, and flight history
- **Update Frequency**: Hourly updates

### Open-Meteo API
- **Current Weather**: Real-time weather conditions at balloon locations
- **7-Day Forecast**: Weather predictions for balloon positions
- **Data Points**: Temperature, apparent temperature, pressure, humidity, wind speed/direction/gusts, precipitation, cloud cover, weather codes
- **Resolution**: 1-11km high-resolution data from national weather services

## 🎯 Key Insights

The application provides several key insights:

1. **Flight Pattern Analysis**: Understanding how balloons move across different weather conditions
2. **Weather Impact Assessment**: Quantifying how atmospheric conditions affect balloon behavior
3. **Constellation Optimization**: Identifying optimal weather conditions for constellation operations
4. **Safety Monitoring**: Real-time weather monitoring for balloon operations
5. **Research Applications**: Data for atmospheric research and weather pattern analysis



## 📝 Notes

- The Windborne API data may sometimes be corrupted or incomplete - the application handles this robustly
- **Why Open-Meteo API?** We chose Open-Meteo because it provides free, high-resolution weather data (1-11km resolution) that directly impacts balloon flight behavior. Unlike other weather APIs that require keys and have rate limits, Open-Meteo is completely free, open-source, and provides real-time data from national weather services. This enables us to analyze how atmospheric conditions (wind speed, direction, pressure, temperature) affect balloon trajectories without any setup costs or limitations.
- Weather data is **disabled by default** to avoid API rate limiting - use the "Fetch Live Weather" toggle to enable
- The application automatically refreshes data every 15 minutes
- All weather calculations use metric units for consistency
- Weather data includes WMO weather codes for detailed condition analysis
- Coordinate validation automatically fixes swapped latitude/longitude values from the Windborne API

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application!

## 📞 Contact

Use the contact form in the application to reach out with questions or feedback about the Windborne Constellation Explorer.