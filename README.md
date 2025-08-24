# Windborne Constellation Explorer

An interactive web application that tracks real-time balloon positions from Windborne Systems' global sounding balloon constellation. Visualize balloon flight paths over 24 hours and optionally integrate air quality data from OpenAQ API to analyze how atmospheric conditions affect balloon trajectories.

## 🌟 Features

### Real-time Balloon Tracking
- **Live Constellation Data**: Fetches and displays the current positions of Windborne's global sounding balloons
- **24-Hour Flight History**: Tracks balloon movements over the past 24 hours with intelligent path reconstruction
- **Interactive Map**: Visualize balloon positions, flight paths, and constellation connections on an interactive world map

### Air Quality Integration
- **Real-time Air Quality Data**: Integrates OpenAQ API to provide current air quality conditions at balloon locations
- **Air Quality Index (AQI)**: Calculates EPA-standard AQI values based on PM2.5, PM10, and O3 levels
- **Health Impact Assessment**: Provides health impact levels and descriptions for air quality conditions
- **Pollutant Analysis**: Tracks individual pollutant levels (PM2.5, PM10, O3) with detailed measurements

### Advanced Analytics
- **Flight Pattern Analysis**: Calculates speed distributions, geographic spread, and constellation density
- **Air Quality Impact**: Analyzes how air quality affects balloon performance and atmospheric conditions
- **Atmospheric Insights**: Provides comprehensive atmospheric analysis based on air quality data
- **Interactive Charts**: Visual data representation with Chart.js for speed distribution and air quality levels

### Interactive Features
- **Material Design UI**: Clean, modern interface inspired by Google's Material Design
- **Single-Page Layout**: All elements visible in one viewport without scrolling
- **Dynamic Controls**: Toggle visibility of flight paths, constellation links, and air quality data
- **Air Quality Toggle**: Enable/disable live air quality data fetching with "Fetch Live Air Quality" button
- **Speed Filtering**: Filter balloons by speed categories (low, medium, high)
- **Real-time Updates**: Auto-refresh every 15 minutes with manual refresh option
- **Compact Stats Cards**: Key metrics displayed with intuitive icons
- **Improved Readability**: Better organized air quality data and insights

## 🌬️ Why OpenAQ API?

I chose [OpenAQ](https://openaq.org/) as the second external dataset because air quality data provides crucial insights into atmospheric composition that affects balloon behavior and environmental monitoring. OpenAQ offers several advantages:

- **No API Key Required**: Completely free for non-commercial use, no registration needed
- **Global Coverage**: Air quality data from over 100 countries and 10,000+ locations
- **Real-time Data**: Live air quality measurements from government and research stations
- **Multiple Pollutants**: PM2.5, PM10, O3, NO2, SO2, CO, and more
- **Standardized Format**: Consistent data format across all sources
- **Historical Data**: Access to historical air quality trends and patterns

Air quality affects balloon performance in several ways:

- **Atmospheric Density**: Pollutants can affect air density and balloon buoyancy
- **Wind Patterns**: Air quality often correlates with weather patterns and wind conditions
- **Visibility**: Poor air quality can impact balloon visibility and tracking
- **Environmental Monitoring**: Balloons can serve as mobile air quality sensors
- **Research Applications**: Study the relationship between air quality and atmospheric conditions

By combining air quality data with weather and balloon tracking, we create a comprehensive atmospheric monitoring system that can:

- **Environmental Research**: Study pollution dispersion patterns and atmospheric chemistry
- **Health Impact Assessment**: Monitor air quality in areas where balloons operate
- **Climate Studies**: Analyze the relationship between weather, air quality, and atmospheric conditions
- **Operational Safety**: Ensure balloon operations in safe atmospheric conditions

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

### OpenAQ API
- **Current Air Quality**: Real-time air quality conditions at balloon locations
- **Air Quality Index**: EPA-standard AQI calculations based on pollutant levels
- **Data Points**: PM2.5, PM10, O3, NO2, SO2, CO, and other pollutants
- **Health Impact**: Health impact levels and descriptions for air quality conditions
- **Coverage**: Global air quality data from government and research stations

## 🎯 Key Insights

The application provides several key insights:

1. **Flight Pattern Analysis**: Understanding how balloons move across different atmospheric conditions
2. **Air Quality Impact Assessment**: Quantifying how air quality affects balloon behavior and performance
3. **Environmental Monitoring**: Tracking air quality patterns and pollution dispersion globally
4. **Atmospheric Research**: Comprehensive analysis of air quality and balloon behavior relationships
5. **Constellation Optimization**: Identifying optimal atmospheric conditions for constellation operations
6. **Safety Monitoring**: Real-time air quality monitoring for balloon operations
7. **Climate Studies**: Data for atmospheric research, pollution studies, and environmental pattern analysis



## 📝 Notes

- The Windborne API data may sometimes be corrupted or incomplete - the application handles this robustly
- **Why OpenAQ API?** We chose OpenAQ because it provides free, real-time air quality data from government and research stations worldwide. Air quality affects balloon behavior through atmospheric density changes, visibility impacts, and environmental monitoring capabilities. OpenAQ offers comprehensive pollutant data (PM2.5, PM10, O3, etc.) with EPA-standard AQI calculations, enabling environmental monitoring and atmospheric research without any API costs or rate limits.
- Air quality data is **disabled by default** to avoid API rate limiting - use the "Fetch Live Air Quality" toggle to enable
- The application automatically refreshes data every 15 minutes
- All calculations use metric units for consistency
- Air quality data includes EPA-standard AQI calculations and health impact assessments
- Coordinate validation automatically fixes swapped latitude/longitude values from the Windborne API

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application!

## 📞 Contact

Use the contact form in the application to reach out with questions or feedback about the Windborne Constellation Explorer.