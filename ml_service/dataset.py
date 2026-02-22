import numpy as np
import pandas as pd

np.random.seed(42)

n = 4000
tipos = 5

data_list = []

for tipo in range(1, tipos + 1):

    # Cada tipo tiene un perfil diferente
    if tipo == 1:  # maquinaria ligera
        horas_uso = np.random.randint(100, 2500, n // tipos)
        horas_por_dia = np.random.uniform(4, 10, n // tipos)
        criticidad = np.random.choice([1,2], n // tipos, p=[0.7,0.3])

    elif tipo == 2:  # maquinaria pesada
        horas_uso = np.random.randint(1000, 6000, n // tipos)
        horas_por_dia = np.random.uniform(8, 20, n // tipos)
        criticidad = np.random.choice([2,3], n // tipos, p=[0.4,0.6])

    elif tipo == 3:  # maquinaria intermedia
        horas_uso = np.random.randint(500, 4000, n // tipos)
        horas_por_dia = np.random.uniform(6, 14, n // tipos)
        criticidad = np.random.choice([1,2,3], n // tipos)

    elif tipo == 4:  # maquinaria crítica pero poco usada
        horas_uso = np.random.randint(200, 3000, n // tipos)
        horas_por_dia = np.random.uniform(3, 8, n // tipos)
        criticidad = np.random.choice([3], n // tipos)

    else:  # maquinaria vieja heredada
        horas_uso = np.random.randint(2000, 7000, n // tipos)
        horas_por_dia = np.random.uniform(6, 16, n // tipos)
        criticidad = np.random.choice([2,3], n // tipos)

    dias_sin_mantenimiento = np.random.randint(0, 365, n // tipos)
    fallas_previas = np.random.poisson(1.5, n // tipos)
    antiguedad = np.random.randint(1, 20, n // tipos)

    # Score lógico (más balanceado)
    score = (
        0.00008 * horas_uso +
        0.003 * dias_sin_mantenimiento +
        0.35 * fallas_previas +
        0.04 * antiguedad +
        0.04 * horas_por_dia +
        0.4 * criticidad +
        np.random.normal(0, 0.5, n // tipos)
    )

    prob = 1 / (1 + np.exp(-score))

    df_temp = pd.DataFrame({
        "horas_uso": horas_uso,
        "dias_sin_mantenimiento": dias_sin_mantenimiento,
        "fallas_previas": fallas_previas,
        "antiguedad": antiguedad,
        "horas_por_dia": horas_por_dia,
        "criticidad": criticidad,
        "tipo_maquina": tipo,
        "prob": prob
    })

    data_list.append(df_temp)

data = pd.concat(data_list)

# Ahora forzamos balance 50/50 usando la probabilidad
data = data.sort_values("prob")

mitad = len(data) // 2
data["fallo"] = 0
data.iloc[mitad:, data.columns.get_loc("fallo")] = 1

data = data.drop(columns=["prob"])

print("Media de fallo: ", data["fallo"].mean())

data.to_csv("dataset_balanceado.csv", index=False)