# Windborne Constellation Explorer

An interactive web application that tracks real-time balloon positions from Windborne Systems' global sounding balloon constellation. Visualize balloon flight paths over 24 hours, analyze balloon movement patterns, and monitor air traffic safety concerns.

## 🌟 Features

### Real-time Balloon Tracking
- **Live Constellation Data**: Fetches and displays the current positions of Windborne's global sounding balloons
- **24-Hour Flight History**: Tracks balloon movements over the past 24 hours with intelligent path reconstruction
- **Interactive Map**: Visualize balloon positions and constellation connections on an interactive world map

### Air Traffic Integration
- **Live Aircraft Positions**: Integrates OpenSky Network API to show real-time aircraft positions
- **Safety Analysis**: Analyzes potential safety concerns between balloons and aircraft
- **Risk Assessment**: Classifies encounters as high, medium, or low risk based on proximity
- **Altitude Conflict Detection**: Identifies balloons in commercial flight corridors

### Advanced Analytics
- **Flight Pattern Analysis**: Calculates speed distributions, geographic spread, and constellation density
- **Movement Tracking**: Analyzes balloon movement patterns and trajectory analysis
- **Constellation Analysis**: Studies balloon constellation connections and network topology
- **Safety Monitoring**: Real-time analysis of balloon-aircraft proximity and collision risks
- **Interactive Charts**: Visual data representation with Chart.js for speed distribution

### Interactive Features
- **Material Design UI**: Clean, modern interface inspired by Google's Material Design
- **Single-Page Layout**: All elements visible in one viewport without scrolling
- **Dynamic Controls**: Toggle visibility of constellation links and aircraft
- **Air Traffic Toggle**: Enable/disable live air traffic data fetching
- **Speed Filtering**: Filter balloons by speed categories (low, medium, high)
- **Real-time Updates**: Auto-refresh every 15 minutes with manual refresh option
- **Compact Stats Cards**: Key metrics displayed with intuitive icons
- **Improved Readability**: Better organized balloon data and insights



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

### OpenSky Network API
- **Live Aircraft Positions**: Real-time aircraft tracking data
- **Aircraft Information**: Callsign, altitude, speed, heading, country
- **Coverage**: Global aircraft tracking from ADS-B receivers
- **Safety Analysis**: Proximity analysis and collision risk assessment

## 🎯 Key Insights

The application provides several key insights:

1. **Flight Pattern Analysis**: Understanding how balloons move across different atmospheric conditions
2. **Movement Tracking**: Quantifying balloon speed, direction, and trajectory patterns
3. **Constellation Analysis**: Studying balloon network topology and connection patterns
4. **Safety Monitoring**: Real-time analysis of balloon-aircraft proximity and collision risks
5. **Altitude Conflict Detection**: Identifying balloons in commercial flight corridors
6. **Risk Assessment**: Classifying encounters as high, medium, or low risk based on proximity
7. **Geographic Distribution**: Analyzing balloon spread and coverage across different regions
8. **Performance Metrics**: Tracking balloon speed distributions and operational efficiency



## 📝 Notes

- The Windborne API data may sometimes be corrupted or incomplete - the application handles this robustly
- **Why OpenSky Network API?** We chose OpenSky Network because it provides free, real-time aircraft tracking data from ADS-B receivers worldwide. This enables us to analyze potential safety concerns between balloons and aircraft, identify altitude conflicts, and monitor collision risks. The API provides comprehensive aircraft information including position, altitude, speed, and heading without requiring API keys for basic usage.
- Air traffic data is **disabled by default** to avoid API rate limiting - use the "Live Air Traffic" toggle to enable
- The application automatically refreshes data every 15 minutes
- All calculations use metric units for consistency
- Coordinate validation automatically fixes swapped latitude/longitude values from the Windborne API

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application!

## 📞 Contact

Use the contact form in the application to reach out with questions or feedback about the Windborne Constellation Explorer.