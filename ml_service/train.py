import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib

data = pd.read_csv("dataset_balanceado.csv")

X = data.drop(columns=["fallo"])
y = data["fallo"]

model = RandomForestClassifier()
model = model.fit(X, y)

joblib.dump(model, "modelo.pkl")

print("Modelo entrenado y guardado.")
print(pd.Series(model.feature_importances_, index=X.columns).sort_values(ascending=False))