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
from pydantic import BaseModel
import json

app = FastAPI()

# Load Price Data
price_df = None
try:
    print("Loading price dataset... (this may take a moment)")
    price_df = pd.read_csv('Agriculture_price_dataset.csv')
except Exception as e:
    print("Warning: Could not load Agriculture_price_dataset.csv:", e)

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
    if model is None:
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
    classes = model.classes_
    
    # Get probabilities for all classes
    probabilities = model.predict_proba(features)[0]
    
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

class PriceRequest(BaseModel):
    crop: str

@app.post("/predict_price")
async def predict_price(request: PriceRequest):
    if price_df is None:
        return {"success": False, "message": "Price dataset not loaded."}
    
    try:
        crop = request.crop.lower()
        crop_data = price_df[price_df['Commodity'].str.lower() == crop]
        
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
