import requests as req
import json
from datetime import datetime

def parse_data(data_string):
    # Clean the data
    data_string = data_string.strip()
    
    # Replace NaN with null
    data_string = data_string.replace('NaN', 'null')
    
    # Try parsing as-is first (for format 1 with brackets)
    try:
        return json.loads(data_string)
    except json.JSONDecodeError:
        pass
    
    # Try adding opening bracket (for format 2 missing opening bracket)
    try:
        return json.loads('[' + data_string)
    except json.JSONDecodeError:
        pass
    
    # Try adding both brackets (for format 3 missing both)
    try:
        return json.loads('[' + data_string + ']')
    except json.JSONDecodeError:
        # If all fail, try to extract valid JSON arrays from the corrupted data
        try:
            # Look for array patterns in the corrupted data
            import re
            array_pattern = r'\[[^\]]*\]'
            matches = re.findall(array_pattern, data_string)
            if matches:
                # Try to parse the first valid-looking array
                for match in matches:
                    try:
                        return json.loads(match)
                    except json.JSONDecodeError:
                        continue
        except:
            pass
        
        # If all parsing attempts fail, return None
        return None

def fetch_data(url):
    try:
        # Add timeout to prevent hanging requests
        response = req.get(url, timeout=10)
        
        # Don't raise exception for 404s, just return None
        if response.status_code == 404:
            return None
            
        response.raise_for_status() # Raise an exception for other bad status codes
        
        # Check if response looks like HTML (error page)
        if response.text.strip().startswith('<html'):
            return None
            
        return parse_data(response.text)
    except req.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

def get_24h_data():
    all_data = {}
    successful_fetches = 0
    
    # Only fetch the most recent 6 hours to reduce API calls
    current_hour = datetime.now().hour
    hours_to_fetch = [(current_hour - i) % 24 for i in range(6)]
    
    for i in hours_to_fetch:
        hour_str = f"{i:02}"
        url = f"https://a.windbornesystems.com/treasure/{hour_str}.json"
        data = fetch_data(url)
        if data is not None:
            all_data[i] = data
            successful_fetches += 1
            print(f"Hour {hour_str}: {len(data) if isinstance(data, list) else 'data'} records")
        else:
            print(f"Failed to fetch data for hour {hour_str}")
    
    print(f"Successfully fetched data for {successful_fetches}/6 recent hours")
    
    # Return data even if some hours failed
    return all_data

if __name__ == '__main__':
    full_data = get_24h_data()
    print(json.dumps(full_data, indent=4))
