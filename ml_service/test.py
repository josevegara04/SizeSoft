# test.py

import joblib
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report

# 1. Cargar modelo
model = joblib.load("modelo.pkl")

# 2. Cargar test ya separado
X_test, y_test = joblib.load("test_data.pkl")

# 3. Predecir
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

print("=== EVALUACIÓN DESDE TEST.PY ===")
print("Accuracy:", accuracy_score(y_test, y_pred))
print("AUC:", roc_auc_score(y_test, y_prob))
print("\nClassification report:\n")
print(classification_report(y_test, y_pred))