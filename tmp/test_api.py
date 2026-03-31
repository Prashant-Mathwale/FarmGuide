import requests
import os

api_key = "579b464db66ec23bdd0000013d11c46598f543ec560f2f522b38dd2e"
url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

params = {
    'api-key': api_key,
    'format': 'json',
    'limit': 10,
    'filters[commodity]': 'Wheat',
    'filters[district]': 'Pune'
}

try:
    response = requests.get(url, params=params)
    print(f"Status: {response.status_code}")
    print(response.json())
except Exception as e:
    print(f"Error: {e}")
