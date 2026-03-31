import requests

api_key = "579b464db66ec23bdd0000013d11c46598f543ec560f2f522b38dd2e"
url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

# Query for Maharashtra
params = {
    'api-key': api_key,
    'format': 'json',
    'limit': 10,
    'filters[state]': 'Maharashtra'
}

response = requests.get(url, params=params)
if response.status_code == 200:
    data = response.json()
    print(f"Total results for Maharashtra: {data['total']}")
    for record in data['records']:
        print(f"{record['commodity']} at {record['market']} in {record['district']} - {record['modal_price']}")
else:
    print(f"Status: {response.status_code}")
