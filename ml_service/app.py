from fastapi import FastAPI
from typing import Union, List
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()

model = joblib.load("modelo.pkl")

class MachineData(BaseModel):
    horas_uso: float
    dias_sin_mantenimiento: int
    fallas_previas: int
    antiguedad: float
    horas_por_dia: float
    uso_proyectado_30d: float = None
    criticidad: int
    tipo_maquina: int

@app.post("/predict")
def predict(data: Union[MachineData, List[MachineData]]):
    if isinstance(data, MachineData):
        items = [data.model_dump()]
    else:
        items = [i.model_dump() for i in data]
    df = pd.DataFrame(items)
    
    mask = df["uso_proyectado_30d"].isna()
    df.loc[mask, "uso_proyectado_30d"] = df.loc[mask, "horas_por_dia"] * 30
        
    probs = model.predict_proba(df)[:, 1]
    
    results = [
        {
            "probabilidad_falla": float(prob),
            "prediccion": int(prob > 0.5)
        }
        for prob in probs
    ]
    
    return results[0] if isinstance(data, MachineData) else results