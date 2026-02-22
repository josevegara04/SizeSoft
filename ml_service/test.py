import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

data = pd.read_csv("dataset_balanceado.csv")

X = data.drop(columns=["fallo"])
y = data["fallo"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3)

model = RandomForestClassifier()
model.fit(X_train, y_train)
pred = model.predict(X_test)

print(classification_report(y_test, pred))
