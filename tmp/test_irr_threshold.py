import requests

def test_irrigation(moisture):
    payload = {
        "cropType": "Wheat",
        "cropDays": 45,
        "soilMoisture": moisture,
        "temperature": 38,
        "humidity": 30
    }
    try:
        res = requests.post("http://127.0.0.1:8000/predict_irrigation", json=payload)
        return res.json()
    except Exception as e:
        return str(e)

for m in [150, 100, 50, 20]:
    print(f"Moisture {m}: {test_irrigation(m)}")
