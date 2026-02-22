from fastapi import FastAPI
import joblib
import pandas as pd

app = FastAPI()

model = joblib.load("modelo.pkl")

@app.post("/predict")
def predict(data: dict):
    df = pd.DataFrame([data])
    prob = model.predict_proba(df)[0][1]
    return {"probabilidad_falla": prob}