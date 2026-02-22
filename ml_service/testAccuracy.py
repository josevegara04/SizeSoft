from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
import pandas as pd
import joblib

data = pd.read_csv("dataset_balanceado.csv")

X = data.drop(columns=["fallo"])
y = data["fallo"]

model = joblib.load("modelo.pkl")

predicted_fallo = model.predict(X)
print(mean_absolute_error(y, predicted_fallo))
