# Windborne Constellation Explorer

An interactive web application that tracks real-time balloon positions from Windborne Systems' global sounding balloon constellation. Visualize balloon flight paths over 24 hours, analyze balloon movement patterns, and monitor air traffic safety concerns with comprehensive position comparison and altitude analysis.

## 🌟 Features

### Real-time Balloon Tracking
- **Live Constellation Data**: Fetches and displays the current positions of Windborne's global sounding balloons
- **24-Hour Flight History**: Tracks balloon movements over the past 24 hours with intelligent path reconstruction
- **Interactive Map**: Visualize balloon positions and constellation connections on an interactive world map
- **Balloon Trajectories**: Display balloon movement patterns with velocity and direction indicators

### Air Traffic Integration & Safety Analysis
- **Live Aircraft Positions**: Integrates OpenSky Network API to show real-time aircraft positions
- **Comprehensive Safety Analysis**: Analyzes potential safety concerns between balloons and aircraft
- **Position Comparison**: Detailed comparison of balloon and aircraft positions with separation distance calculations
- **Altitude Analysis**: Monitors altitude conflicts and assesses impact of aircraft on balloon operations
- **Risk Assessment**: Classifies encounters as high, medium, or low risk based on proximity and altitude
- **Near Miss Detection**: Identifies critical encounters requiring immediate attention
- **Flight Corridor Monitoring**: Detects balloons in commercial flight corridors

### Advanced Analytics & Insights
- **Flight Pattern Analysis**: Calculates speed distributions, geographic spread, and constellation density
- **Movement Tracking**: Analyzes balloon movement patterns and trajectory analysis
- **Constellation Analysis**: Studies balloon constellation connections and network topology
- **Safety Monitoring**: Real-time analysis of balloon-aircraft proximity and collision risks
- **Comprehensive Reporting**: Detailed text-based analysis replacing charts with actionable insights
- **Performance Metrics**: Tracking balloon speed distributions and operational efficiency

### Interactive Features
- **Material Design UI**: Clean, modern interface inspired by Google's Material Design
- **Single-Page Layout**: All elements visible in one viewport without scrolling
- **Dynamic Controls**: Toggle visibility of constellation links and aircraft
- **Air Traffic Toggle**: Enable/disable live air traffic data fetching with comprehensive analysis
- **Real-time Updates**: Auto-refresh every 15 minutes with manual refresh option
- **Compact Stats Cards**: Key metrics displayed with intuitive icons
- **Safety Summary Panel**: Real-time safety metrics and risk indicators
- **Flight Data Analysis Panel**: Comprehensive text-based analysis of balloon-aircraft interactions



## 🛠️ Technology Stack

- **Backend**: Python Flask with RESTful API endpoints
- **Frontend**: HTML5, CSS3, JavaScript (ES6+) with modern async/await patterns
- **Mapping**: Leaflet.js with OpenStreetMap tiles and custom markers
- **Data Visualization**: Custom text-based analysis with real-time safety metrics
- **Air Traffic API**: OpenSky Network API for real-time aircraft tracking
- **Styling**: Custom CSS with Material Design principles and responsive layout
- **Data Processing**: Real-time geospatial calculations and safety analysis algorithms

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
- `GET /api/data` - Get balloon data with optional air traffic integration
  - Query parameter: `?air_traffic=true` - Enable live aircraft data and safety analysis
- `GET /api/data` (default) - Get balloon data without air traffic (faster response)

## 📊 Data Sources

### Windborne Constellation API
- **Base URL**: `https://a.windbornesystems.com/treasure/`
- **Format**: JSON files for each hour (00.json to 23.json)
- **Data**: Balloon positions, timestamps, and flight history
- **Update Frequency**: Hourly updates
- **Processing**: Intelligent path reconstruction and trajectory analysis

### OpenSky Network API
- **Live Aircraft Positions**: Real-time aircraft tracking data from ADS-B receivers
- **Aircraft Information**: Callsign, altitude, speed, heading, country, vertical rate
- **Coverage**: Global aircraft tracking with comprehensive safety analysis
- **Safety Analysis**: Proximity analysis, collision risk assessment, and altitude conflict detection
- **Fallback**: Mock data generation when API is unavailable for demonstration

## 🎯 Key Insights

The application provides comprehensive insights for balloon operations and safety:

### Balloon Operations
1. **Flight Pattern Analysis**: Understanding how balloons move across different atmospheric conditions
2. **Movement Tracking**: Quantifying balloon speed, direction, and trajectory patterns
3. **Constellation Analysis**: Studying balloon network topology and connection patterns
4. **Geographic Distribution**: Analyzing balloon spread and coverage across different regions
5. **Performance Metrics**: Tracking balloon speed distributions and operational efficiency

### Safety & Air Traffic
6. **Real-time Safety Monitoring**: Analysis of balloon-aircraft proximity and collision risks
7. **Position Comparison**: Detailed comparison of balloon and aircraft positions with separation calculations
8. **Altitude Analysis**: Monitoring altitude conflicts and assessing aircraft impact on balloon operations
9. **Risk Assessment**: Classifying encounters as high, medium, or low risk based on proximity and altitude
10. **Near Miss Detection**: Identifying critical encounters requiring immediate attention
11. **Flight Corridor Monitoring**: Detecting balloons in commercial flight corridors
12. **Safety Zone Violations**: Tracking violations of established safety separation distances



## 📝 Notes

- The Windborne API data may sometimes be corrupted or incomplete - the application handles this robustly
- **Air Traffic Integration**: The application integrates OpenSky Network API for real-time aircraft tracking data from ADS-B receivers worldwide. This enables comprehensive safety analysis between balloons and aircraft, including altitude conflict detection and collision risk assessment. The API provides detailed aircraft information including position, altitude, speed, and heading.
- **Safety Analysis**: The system uses established aviation safety standards with 5km horizontal and 300m vertical separation distances for safety zone calculations.
- **Live Air Traffic**: Air traffic data is **disabled by default** to avoid API rate limiting - use the "Live Air Traffic" toggle to enable comprehensive analysis
- **Mock Data**: When the OpenSky API is unavailable, the system generates realistic mock aircraft data for demonstration purposes
- **Real-time Updates**: The application automatically refreshes data every 15 minutes with manual refresh capability
- **Units**: All calculations use metric units for consistency
- **Data Processing**: Coordinate validation automatically fixes swapped latitude/longitude values from the Windborne API
- **Analysis Panel**: The right panel now displays comprehensive text-based analysis instead of charts, providing detailed insights into balloon-aircraft interactions

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application!

## 📞 Contact

Use the contact form in the application to reach out with questions or feedback about the Windborne Constellation Explorer.