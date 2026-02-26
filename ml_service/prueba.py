import pandas as pd

data = pd.read_csv("dataset_mantenimiento_30d.csv")

print(data.fallo_30d.value_counts())
print(len(data))