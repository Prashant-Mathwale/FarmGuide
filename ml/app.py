import pickle
import numpy as np
import pandas as pd
try:
    import tensorflow as tf
    from PIL import Image
    import io
except ImportError:
    tf = None
    Image = None
    io = None
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Price Data
price_df = None
try:
    print("Loading price dataset... (this may take a moment)")
    price_df = pd.read_csv('Agriculture_price_dataset.csv')
except Exception as e:
    print("Warning: Could not load Agriculture_price_dataset.csv:", e)

# Load Weather Normal Data
weather_df = None
try:
    print("Loading historical weather dataset...")
    weather_df = pd.read_csv('rainfall in india 1901-2015.csv')
except Exception as e:
    print("Warning: Could not load rainfall in india 1901-2015.csv:", e)

# Load Govt Schemes Data
schemes_df = None
try:
    print("Loading Government Schemes dataset...")
    sc_df = pd.read_csv('dataset/schemes.csv')
    
    col_mapping = {'detailed_description': 'details', 'categories': 'schemeCategory'}
    sc_df.rename(columns=col_mapping, inplace=True)
    
    # Fill NAs and force to string for easy searching
    for col in ['details', 'benefits', 'eligibility', 'schemeCategory', 'tags', 'scheme_name']:
        if col in sc_df.columns:
            sc_df[col] = sc_df[col].astype(str).fillna('')
            
    # Pre-filter specifically for Agriculture or Farmer related schemes
    keywords = ['agricultur', 'farm', 'crop', 'kisan', 'krishi', 'rural', 'horticulture', 'irrigation']
    pattern = '|'.join(keywords)
    
    agri_schemes = sc_df[
        sc_df['details'].str.contains(pattern, case=False) |
        sc_df['schemeCategory'].str.contains(pattern, case=False) |
        sc_df['scheme_name'].str.contains(pattern, case=False) |
        sc_df['tags'].str.contains(pattern, case=False)
    ].copy()
    
    # Drop duplicates and keep the richest 100 schemes
    agri_schemes = agri_schemes.drop_duplicates(subset=['scheme_name'])
    schemes_df = agri_schemes.head(100) 
except Exception as e:
    print("Warning: Could not load dataset/schemes.csv:", e)


# Load the trained model
try:
    with open('crop_model.pkl', 'rb') as f:
        crop_model = pickle.load(f)
except FileNotFoundError:
    print("Warning: crop_model.pkl not found.")
    crop_model = None

# Load Yield Model
try:
    with open('models/yield_model.pkl', 'rb') as f:
        yield_model = pickle.load(f)
    with open('models/area_encoder.pkl', 'rb') as f:
        area_encoder = pickle.load(f)
    with open('models/item_encoder.pkl', 'rb') as f:
        item_encoder = pickle.load(f)
except FileNotFoundError:
    print("Warning: yield_model.pkl or encoders not found. Please run train_yield_model.py first.")
    yield_model = None
    area_encoder = None
    item_encoder = None

# Load Cost Model
try:
    with open('models/cost_model.pkl', 'rb') as f:
        cost_model = pickle.load(f)
except FileNotFoundError:
    print("Warning: cost_model.pkl not found. Please run train_cost_model.py first.")
    cost_model = None

# Load Irrigation Model
try:
    with open('models/irrigation_model.pkl', 'rb') as f:
        irrigation_model = pickle.load(f)
except FileNotFoundError:
    print("Warning: irrigation_model.pkl not found. Please run train_irrigation_model.py first.")
    irrigation_model = None

# Load Pest Models
try:
    with open('models/pest_classifier.pkl', 'rb') as f:
        pest_classifier = pickle.load(f)
    with open('models/pest_regressor.pkl', 'rb') as f:
        pest_regressor = pickle.load(f)
    with open('models/pest_crop_encoder.pkl', 'rb') as f:
        pest_crop_encoder = pickle.load(f)
    with open('models/pest_location_encoder.pkl', 'rb') as f:
        pest_location_encoder = pickle.load(f)
except FileNotFoundError:
    print("Warning: Pest prediction models not found. Please run train_pest_model.py first.")
    pest_classifier = None
    pest_regressor = None
    pest_crop_encoder = None
    pest_location_encoder = None

class SoilData(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

@app.post("/predict_crop")
async def predict_crop(data: SoilData):
    if crop_model is None:
        return {"success": False, "message": "Model not loaded on server."}
    
    # Extract features in the exact order the model was trained on
    features = np.array([[
        data.N, 
        data.P, 
        data.K, 
        data.temperature, 
        data.humidity, 
        data.ph, 
        data.rainfall
    ]])

    # Get class names
    classes = crop_model.classes_
    
    # Get probabilities for all classes
    probabilities = crop_model.predict_proba(features)[0]
    
    # Get top 3 indices sorted by probability
    top_indices = np.argsort(probabilities)[::-1][:3]
    
    recommendations = []
    for idx in top_indices:
        recommendations.append({
            "name": str(classes[idx]),
            "confidence": float(probabilities[idx] * 100)
        })
    
    return {
        "success": True,
        "recommendations": recommendations
    }

class YieldData(BaseModel):
    Area: str
    Item: str
    average_rain_fall_mm_per_year: float
    pesticides_tonnes: float
    avg_temp: float

@app.post("/predict_yield")
async def predict_yield(data: YieldData):
    if yield_model is None or area_encoder is None or item_encoder is None:
        return {"success": False, "message": "Yield model not loaded on server."}
    
    try:
        # Encode categorical data. Fallback to 0 if unseen category.
        try:
            area_encoded = area_encoder.transform([data.Area])[0]
        except ValueError:
            area_encoded = 0 # Fallback
            
        try:
            item_encoded = item_encoder.transform([data.Item])[0]
        except ValueError:
            item_encoded = 0 # Fallback
        
        # Extract features (match exactly the training columns: Area_encoded, Item_encoded, average_rain_fall_mm_per_year, pesticides_tonnes, avg_temp)
        features = np.array([[
            area_encoded,
            item_encoded,
            data.average_rain_fall_mm_per_year,
            data.pesticides_tonnes,
            data.avg_temp
        ]])

        # Predict yield (tons/acre)
        predicted_yield = yield_model.predict(features)[0]
        
        return {
            "success": True,
            "predicted_yield_tons_per_acre": float(predicted_yield)
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

class CostData(BaseModel):
    crop: str
    state: str

@app.post("/predict_cost")
async def predict_cost(data: CostData):
    if cost_model is None:
         return {"success": False, "message": "Cost model not loaded on server."}
    
    try:
        # Create a dataframe using EXACT column names 'Crop' and 'State' from training
        input_data = pd.DataFrame([{
            'Crop': data.crop,
            'State': data.state
        }])
        
        # Predict Cost of Cultivation C2 per Hectare
        predicted_cost_hectare = cost_model.predict(input_data)[0]
        
        # Convert Hectare to Acre
        predicted_cost_acre = predicted_cost_hectare / 2.471
        
        return {
             "success": True,
             "predicted_cost_per_acre": float(predicted_cost_acre)
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

class IrrigationData(BaseModel):
    cropType: str
    cropDays: int
    soilMoisture: float
    temperature: float
    humidity: float

@app.post("/predict_irrigation")
async def predict_irrigation(data: IrrigationData):
    if irrigation_model is None:
        return {"success": False, "message": "Irrigation model not loaded on server."}
        
    try:
        input_data = pd.DataFrame([{
            'CropType': data.cropType,
            'CropDays': data.cropDays,
            'SoilMoisture': data.soilMoisture,
            'temperature': data.temperature,
            'Humidity': data.humidity
        }])
        
        prediction = irrigation_model.predict(input_data)[0]
        # Get probability of class '1' (irrigation needed)
        probability = irrigation_model.predict_proba(input_data)[0][1]
        
        return {
            "success": True,
            "irrigation_needed": bool(prediction == 1),
            "confidence": float(probability * 100)
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

class RiskData(BaseModel):
    state: str
    rainfall: float
    pesticides: float
    crop: str

class PestData(BaseModel):
    Temperature_C: float
    Humidity_percent: float
    Rainfall_mm: float
    Soil_pH: float
    Nitrogen_N: float
    Phosphorus_P: float
    Potassium_K: float
    Crop_Type: str
    Location: str

@app.post("/predict_pest")
async def predict_pest(data: PestData):
    if any(m is None for m in [pest_classifier, pest_regressor, pest_crop_encoder, pest_location_encoder]):
        return {"success": False, "message": "Pest prediction models not loaded."}
        
    try:
        # Encode categorical variables
        try:
            crop_encoded = pest_crop_encoder.transform([data.Crop_Type])[0]
        except ValueError:
            crop_encoded = 0 # Fallback
            
        try:
            location_encoded = pest_location_encoder.transform([data.Location])[0]
        except ValueError:
            location_encoded = 0 # Fallback
            
        features = np.array([[
            data.Temperature_C, data.Humidity_percent, data.Rainfall_mm,
            data.Soil_pH, data.Nitrogen_N, data.Phosphorus_P, data.Potassium_K,
            crop_encoded, location_encoded
        ]])
        
        # Predict pest class
        pest_class = pest_classifier.predict(features)[0]
        
        # Predict outbreak probability
        outbreak_prob = pest_regressor.predict(features)[0]
        
        return {
            "success": True,
            "pest": str(pest_class),
            "probability": float(outbreak_prob)
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.post("/predict_risk")
async def predict_risk(data: RiskData):
    weatherRisk = 0
    diseaseRisk = 0
    priceRisk = 0
    variance_val = 0

    try:
        if weather_df is not None:
            state_query = data.state.upper().strip()
            # The SUBDIVISION column contains region/state names
            state_data = weather_df[weather_df['SUBDIVISION'].str.upper().str.contains(state_query, na=False)]
            
            if not state_data.empty:
                normal_rainfall = state_data['ANNUAL'].mean()
            else:
                normal_rainfall = 1000 # Indian average fallback
                
            variance_val = ((data.rainfall - normal_rainfall) / normal_rainfall) * 100
            
            if variance_val < -40:
                weatherRisk = 45 # Severe Drought
            elif variance_val < -20:
                weatherRisk = 25 # Mild Drought
            elif variance_val > 40:
                weatherRisk = 45 # Severe Flood
            elif variance_val > 20:
                weatherRisk = 20 # Moderate Flood
            else:
                weatherRisk = 0  # Optimal Conditions (+/- 20% variance is great!)
        else:
            if data.rainfall < 500: weatherRisk = 40
            elif data.rainfall > 2000: weatherRisk = 30
            
        if data.pesticides > 100: 
            diseaseRisk = 5
        elif data.pesticides < 0.1:
             diseaseRisk = 25
        else:
            diseaseRisk = 12
            
        if data.crop.lower() in ['tomato', 'potato', 'onion']:
            priceRisk = 30
        else:
            priceRisk = 10
            
        totalRiskScore = min(100, max(0, weatherRisk + diseaseRisk + priceRisk))
        
        return {
            "success": True,
            "riskScore": totalRiskScore,
            "variance": variance_val
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

class PriceRequest(BaseModel):
    crop: str

@app.post("/predict_price")
async def predict_price(request: PriceRequest):
    if price_df is None:
        return {"success": False, "message": "Price dataset not loaded."}
    
    try:
        crop = request.crop.lower().strip()
        crop_data = price_df[price_df['Commodity'].str.lower().str.strip() == crop]
        
        if crop_data.empty:
            # Fallback average price if specific crop not found (e.g., 20,000 INR per Ton)
            return {"success": True, "predicted_price_per_ton": 20000.0}
        
        # Take the last 100 entries to compute a simple moving average
        recent_data = crop_data.tail(100)
        
        # Mandi prices are typically per Quintal (100kg). 1 Ton = 10 Quintals.
        sma_price_quintal = recent_data['Modal_Price'].mean()
        price_per_ton = float(sma_price_quintal * 10)
        
        return {
            "success": True,
            "predicted_price_per_ton": price_per_ton
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

class TrendRequest(BaseModel):
    crop: str

@app.post("/price_trend")
async def price_trend(request: TrendRequest):
    if price_df is None:
        return {"success": False, "message": "Price dataset not loaded."}
    
    try:
        crop = request.crop.lower()
        crop_data = price_df[price_df['Commodity'].str.lower() == crop]
        
        if crop_data.empty:
            return {"success": False, "message": "Crop not found in dataset."}
        
        # We need historical data to show a trend. Let's take the last 7 unique days of data.
        # Ensure data is sorted by date
        crop_data['Price Date'] = pd.to_datetime(crop_data['Price Date'], format='%d/%m/%Y', errors='coerce')
        crop_data = crop_data.dropna(subset=['Price Date'])
        crop_data = crop_data.sort_values(by='Price Date')
        
        recent_data = crop_data.tail(7)
        if len(recent_data) == 0:
             return {"success": False, "message": "No dated data found."}
             
        # Extract last 7 prices (Modal_Price)
        prices = recent_data['Modal_Price'].tolist()
        dates = recent_data['Price Date'].dt.strftime('%a').tolist() # like 'Mon', 'Tue'
        
        # Calculate moving average and volatility
        np_prices = np.array(prices)
        sma = np.mean(np_prices)
        std_dev = np.std(np_prices)
        current_price = float(np_prices[-1])
        
        # Determine Volatility (Coefficient of Variation)
        # If std_dev is more than 5% of the mean, consider it fluctuating
        cv = (std_dev / sma) * 100
        volatility_status = "Fluctuating" if cv > 5.0 else "Stable"
        
        # Recommendation
        if current_price > sma * 1.02: # 2% above average
            recommendation = "Good time to sell"
        elif current_price < sma * 0.98: # 2% below average
            recommendation = "Hold crop for better price"
        else:
            recommendation = "Market price is stable"
            
        # Format dataset for Recharts area graph
        chart_data = [{"name": day, "price": int(price)} for day, price in zip(dates, prices)]
            
        return {
            "success": True,
            "chart_data": chart_data,
            "volatility_status": volatility_status,
            "recommendation": recommendation,
            "current_price": int(current_price),
            "sma": int(sma)
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

class SchemeQuery(BaseModel):
    state: str = ""
    land_size: str = ""
    gender: str = ""
    caste: str = ""

@app.post("/schemes/search")
async def search_schemes(query: SchemeQuery):
    if schemes_df is None:
        return {"success": False, "message": "Schemes dataset not loaded on server."}
        
    try:
        results = schemes_df.copy()
        results['relevance_score'] = 0 # Initialize a ranking score
        
        # 1. Strict State Filter
        if query.state and query.state != "All India":
            state_search = query.state.lower()
            results = results[
                results['details'].str.contains(state_search, case=False) |
                results['level'].str.contains(state_search, case=False) |
                results['level'].str.contains('central', case=False)
            ]
            
        # 2. Intelligent Ranking (Bonus points for matching eligibility)
        if query.land_size:
            try:
                acres = float(query.land_size)
                if acres <= 5.0:  # < 5 acres is Small & Marginal in India
                    results.loc[results['eligibility'].str.contains('small|marginal|poor', case=False), 'relevance_score'] += 10
            except ValueError:
                pass
                
        if query.gender and query.gender == "Female":
            results.loc[results['eligibility'].str.contains('women|female|widow|girl', case=False), 'relevance_score'] += 15
            
        if query.caste and query.caste == "SC/ST":
            results.loc[results['eligibility'].str.contains('sc|st|scheduled|tribe|caste', case=False), 'relevance_score'] += 15
            
        # Sort by best matching relevance score, then return the highest 15
        results = results.sort_values(by='relevance_score', ascending=False)
        results = results.head(15) 
        
        formatted_schemes = []
        for _, row in results.iterrows():
            slug = str(row.get("slug", "")).strip()
            link = f"https://www.myscheme.gov.in/schemes/{slug}" if slug else "https://www.myscheme.gov.in/"
            
            clean_details = str(row.get("details", ""))
            if len(clean_details) > 300:
                clean_details = clean_details[:300] + "..."
                
            formatted_schemes.append({
                "name": str(row.get("scheme_name", "Unknown Scheme")),
                "details": clean_details,
                "benefits": str(row.get("benefits", ""))[:150] + "...",
                "eligibility": str(row.get("eligibility", ""))[:150] + "...",
                "category": str(row.get("schemeCategory", "Agriculture & Rural")),
                "level": str(row.get("level", "Central/State")),
                "link": link
            })
            
        return {
            "success": True,
            "count": len(formatted_schemes),
            "data": formatted_schemes
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

# --- Disease Detection Logic ---
disease_model = None
disease_classes = []

if tf is not None:
    try:
        print("Loading Disease CNN Model...")
        disease_model = tf.keras.models.load_model('models/disease_model.h5')
        
        with open('models/disease_classes.json', 'r') as f:
            disease_classes = json.load(f)
        print(f"Loaded {len(disease_classes)} disease classes.")
    except Exception as e:
        print("Warning: Could not load disease model or classes:", e)

def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224)) # Match MobileNetV2 input size
    img_array = np.array(img) / 255.0 # Rescale to [0, 1]
    img_array = np.expand_dims(img_array, axis=0) # Add batch dimension
    return img_array

@app.post("/predict_disease")
async def predict_disease(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        if tf is not None and disease_model is not None and disease_classes:
            # Real CNN Inference
            img_array = preprocess_image(contents)
            predictions = disease_model.predict(img_array)
            idx = np.argmax(predictions[0])
            confidence = float(predictions[0][idx] * 100)
            result = disease_classes[idx]
        else:
            return {"success": False, "message": "Disease ML Model is offline or TF is not installed."}
            
        return {
            "success": True,
            "disease": result.replace("___", " - ").replace("__", " - ").replace("_", " "),
            "confidence": float(confidence),
            "treatment": get_treatment(result)
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

def get_treatment(disease):
    treatments = {
        "Early_blight": "Apply Chlorothalonil or Mancozeb. Avoid overhead watering.",
        "Late_blight": "Use metalaxyl or mancozeb-based fungicides. Destroy infected plant debris.",
        "healthy": "Continue current care. Ensure balanced fertilization.",
        "Bacterial_spot": "Apply copper-based fungicides. Rotate crops annually.",
        "Apple_scab": "Apply Myclobutanil or sulfur-based sprays during the dormant season.",
        "Black_rot": "Prune infected branches and apply copper-based sprays."
    }
    # Find matching treatment or return a generic one
    for key, val in treatments.items():
        if key in disease:
            return val
    return "Ensure proper soil nutrition and apply appropriate organic fungicides."

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
