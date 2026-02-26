import numpy as np
import pandas as pd

np.random.seed(42)

# Número total de registros simulados
n = 4000
tipos = 5
horizonte_dias = 30

data_list = []

# Tasa base de fallo en 30 días por tipo de máquina
# (valores razonables, pero ajustables si quieres)
base_failure_rate = {
    1: 0.03,  # máquinas poco críticas / ligeras
    2: 0.06,
    3: 0.05,
    4: 0.10,  # muy críticas
    5: 0.12,
}

for tipo in range(1, tipos + 1):
    size = n // tipos

    # --- Perfil de uso y criticidad por tipo de máquina ---
    if tipo == 1:
        horas_uso = np.random.randint(200, 2500, size)
        horas_por_dia = np.random.uniform(4, 10, size)
        criticidad = np.random.choice([1, 2], size, p=[0.7, 0.3])

    elif tipo == 2:
        horas_uso = np.random.randint(1000, 6000, size)
        horas_por_dia = np.random.uniform(8, 20, size)
        criticidad = np.random.choice([2, 3], size, p=[0.4, 0.6])

    elif tipo == 3:
        horas_uso = np.random.randint(500, 4000, size)
        horas_por_dia = np.random.uniform(6, 14, size)
        criticidad = np.random.choice([1, 2, 3], size)

    elif tipo == 4:
        horas_uso = np.random.randint(200, 3000, size)
        horas_por_dia = np.random.uniform(3, 8, size)
        criticidad = np.full(size, 3)

    else:  # tipo 5
        horas_uso = np.random.randint(2000, 7000, size)
        horas_por_dia = np.random.uniform(6, 16, size)
        criticidad = np.random.choice([2, 3], size)

    # Antigüedad de la máquina (en años)
    antiguedad = np.random.randint(1, 20, size)

    # Horas que se espera que trabaje en los próximos 30 días
    uso_proyectado_30d = horas_por_dia * horizonte_dias

    # --- Historial de fallas: aumenta con el uso y la antigüedad ---
    lambda_fallas = 0.2 + 0.0004 * horas_uso + 0.1 * (antiguedad / 10)
    lambda_fallas = np.clip(lambda_fallas, 0.1, 8.0)
    fallas_previas = np.random.poisson(lambda_fallas)

    # --- Días desde el último mantenimiento: correlacionado con antigüedad y fallas ---
    dias_sin_mantenimiento_media = 30 + antiguedad * 8 + fallas_previas * 5
    dias_sin_mantenimiento = np.random.normal(
        dias_sin_mantenimiento_media, 40
    )
    dias_sin_mantenimiento = np.clip(dias_sin_mantenimiento, 0, 365).astype(int)

    # --- Probabilidad de fallo en los próximos 30 días ---
    base = base_failure_rate[tipo]
    logit_base = np.log(base / (1 - base))

    # Score logístico: combina factores con ruido
    score = (
        logit_base
        + 0.00025 * (horas_uso - 2500)           # mucho uso acumulado → más riesgo
        + 0.004 * (dias_sin_mantenimiento - 120) # mucho tiempo sin mantenimiento → más riesgo
        + 0.6 * fallas_previas                   # muchas fallas históricas → más riesgo
        + 0.08 * (antiguedad - 8)                # máquinas viejas → más riesgo
        + 0.03 * (uso_proyectado_30d - 300)      # alto uso futuro → más riesgo
        + 0.5 * (criticidad - 2)                 # más críticas → más riesgo
        + np.random.normal(0, 0.7, size)         # variabilidad no explicada
    )

    prob_30d = 1 / (1 + np.exp(-score))
    fallo_30d = np.random.binomial(1, prob_30d)

    df_temp = pd.DataFrame({
        "horas_uso": horas_uso,
        "dias_sin_mantenimiento": dias_sin_mantenimiento,
        "fallas_previas": fallas_previas,
        "antiguedad": antiguedad,
        "horas_por_dia": horas_por_dia,
        "uso_proyectado_30d": uso_proyectado_30d,
        "criticidad": criticidad,
        "tipo_maquina": tipo,
        "fallo_30d": fallo_30d
    })

    data_list.append(df_temp)

data = pd.concat(data_list, ignore_index=True)

print("Tasa global de fallo en 30 días:", data["fallo_30d"].mean())
print("\nTasa de fallo por tipo de máquina:")
print(data.groupby("tipo_maquina")["fallo_30d"].mean())

data.to_csv("dataset_mantenimiento_30d.csv", index=False)