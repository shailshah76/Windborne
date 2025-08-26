# Windborne Constellation Explorer

An interactive web application that tracks real-time balloon positions from Windborne Systems' global sounding balloon constellation. The app visualizes balloon flight paths, analyzes movement patterns, and monitors air traffic safety concerns.

## 🎯 What We're Doing

This application provides real-time monitoring and analysis of Windborne's global balloon network. It tracks balloon positions, calculates movement statistics, and analyzes potential safety interactions with aircraft. The system helps understand balloon constellation behavior and ensures safe operations in shared airspace.

## 📊 How Balloon Stats Are Calculated

### Balloon Count
- **Data Source**: Fetches 6 most recent hours from Windborne API (`https://a.windbornesystems.com/treasure/{hour}.json`)
- **Tracking Algorithm**: Matches balloons across time periods using distance-based correlation
- **Distance Threshold**: 300km maximum distance for balloon matching between hours
- **Final Count**: Number of unique balloon tracks identified

### Speed Analysis
- **Calculation**: Distance traveled between consecutive positions divided by time
- **Categories**: 
  - Low: < 50 km/h
  - Medium: 50-150 km/h  
  - High: > 150 km/h

### Geographic Spread
- **Method**: Relative to average position of all balloons
- **Hemispheres**: Counts balloons in North/South and East/West relative to center

### Constellation Links
- **Definition**: Balloons within 500km of each other
- **Purpose**: Identifies potential communication networks

## 🚀 How to Run the Flight View

### Local Development
```bash
# Clone and setup
git clone <repository-url>
cd Windborne
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the application
python app.py
```

### Access the Application
1. **Open**: `http://localhost:5001`
2. **View Balloons**: Balloon markers appear on the map automatically
3. **Enable Air Traffic**: Check "Live Air Traffic" to see aircraft positions
4. **Toggle Features**: Use checkboxes to show/hide constellation links and balloons
5. **Refresh Data**: Click the refresh button for latest data

### Key Features
- **Balloon Analysis Panel**: Right side shows detailed balloon statistics
- **Safety Analysis**: When air traffic is enabled, shows balloon-aircraft interactions
- **Real-time Updates**: Data refreshes every 15 minutes automatically
