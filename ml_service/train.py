import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report

data = pd.read_csv("dataset_mantenimiento_30d.csv")

X = data.drop(columns=["fallo_30d"])
y = data["fallo_30d"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    class_weight="balanced"
)

model.fit(X_train, y_train)

y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

print("=== MÉTRICAS EN TEST ===")
print("Accuracy:", accuracy_score(y_test, y_pred))
print("AUC:", roc_auc_score(y_test, y_prob))
print("\nClassification report:\n")
print(classification_report(y_test, y_pred))

joblib.dump(model, "modelo.pkl")

joblib.dump((X_test, y_test), "test_data.pkl")

print("\nModelo y test guardados correctamente.")