/*
Seed funcional para el módulo de mantenimiento sobre la compañía de pruebas PMC1.

Escenario ficticio:
- PMC1 representa "PlastiMaq Colombia", una planta demo de conversión de empaques flexibles.
- El script limpia solo los datos del módulo para PMC1 y vuelve a poblar catálogos y maestros consistentes.
- Se incluyen datos suficientes para probar:
  - máquinas
  - partes de máquina
  - repuestos
  - operarios
  - mantenimientos
  - causas
  - actividades
  - asociaciones de actividades/causas por mantenimiento
  - programaciones de mantenimiento

No se crean órdenes de servicio, pero el seed deja listas las relaciones necesarias para probarlas.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @CodiComp NVARCHAR(4) = N'PMC1';

BEGIN TRANSACTION;

/* =========================
   1. LIMPIEZA CONTROLADA PMC1
   ========================= */

DELETE OO
FROM Mant.tblmanOrdeOper OO
INNER JOIN Mant.tblmanOrdeMaqu OM
    ON OM.CodiOrdMaqu = OO.CodiOrdMaqu
WHERE OM.CodiComp = @CodiComp;

DELETE ORD
FROM Mant.tblmanOrdeRepuDet ORD
INNER JOIN Mant.tblmanOrdeRepu ORP
    ON ORP.idOrdeRepu = ORD.idOrdeRepu
INNER JOIN Mant.tblmanOrdeMaqu OM
    ON OM.idOrdeRepu = ORP.idOrdeRepu
WHERE OM.CodiComp = @CodiComp;

DELETE
FROM Mant.tblmanOrdeMaqu
WHERE CodiComp = @CodiComp;

DELETE ORP
FROM Mant.tblmanOrdeRepu ORP
WHERE NOT EXISTS (
    SELECT 1
    FROM Mant.tblmanOrdeMaqu OM
    WHERE OM.idOrdeRepu = ORP.idOrdeRepu
);

DELETE PM
FROM Mant.tblmanProgMant PM
INNER JOIN Mant.tblmanManten M
    ON M.idMantenimiento = PM.idMant
WHERE M.CodiComp = @CodiComp;

DELETE MAD
FROM Mant.tblmanMantActiDeta MAD
INNER JOIN Mant.tblmanManten M
    ON M.idMantenimiento = MAD.idMantenimiento
WHERE M.CodiComp = @CodiComp;

DELETE MCD
FROM Mant.tblmanMantCausDeta MCD
INNER JOIN Mant.tblmanManten M
    ON M.idMantenimiento = MCD.idMantenimiento
WHERE M.CodiComp = @CodiComp;

DELETE R
FROM Mant.tblmanRepues R
INNER JOIN Mant.tblmanPartMaqu P
    ON P.CodiPart = R.CodiPart
WHERE P.CodiComp = @CodiComp;

DELETE
FROM Mant.tblmanPartMaqu
WHERE CodiComp = @CodiComp;

DELETE
FROM Mant.tblmanManten
WHERE CodiComp = @CodiComp;

DELETE
FROM Mant.tblmanOperar
WHERE CodiComp = @CodiComp;

DELETE
FROM Mant.tblmanActiMant
WHERE CodiComp = @CodiComp;

DELETE
FROM Mant.tblmanCausMant
WHERE CodiComp = @CodiComp;

DELETE
FROM Mant.tblmanMaquin
WHERE CodiComp = @CodiComp;

DELETE
FROM Mant.tblmanTipoPart
WHERE CodiComp = @CodiComp;

/* =========================
   2. CATÁLOGOS BASE
   ========================= */

MERGE Mant.tblmanCritic AS target
USING (
    VALUES
        (N'Baja',    N'Falla o parada con bajo impacto en la operación.', 3, 1),
        (N'Media',   N'Falla que afecta parcialmente la operación o producción.', 2, 1),
        (N'Alta',    N'Falla que detiene procesos importantes o afecta producción crítica.', 1, 1),
        (N'Crítica', N'Falla que detiene completamente la operación o representa riesgo alto.', 0, 1)
) AS source (Nombre, Descri, Prioridad, Activo)
ON target.Nombre = source.Nombre
WHEN MATCHED THEN
    UPDATE SET
        Descri = source.Descri,
        Prioridad = source.Prioridad,
        Activo = source.Activo
WHEN NOT MATCHED THEN
    INSERT (Nombre, Descri, Prioridad, Activo)
    VALUES (source.Nombre, source.Descri, source.Prioridad, source.Activo);

UPDATE Mant.tblmanEstaOrde
SET NombEsta = N'Creada', Descri = N'Orden recién creada', Activo = 1
WHERE IdEsta = 1;

UPDATE Mant.tblmanEstaOrde
SET NombEsta = N'Activa', Descri = N'Orden en ejecución', Activo = 1
WHERE IdEsta = 2;

UPDATE Mant.tblmanEstaOrde
SET NombEsta = N'Pausada', Descri = N'Orden detenida temporalmente', Activo = 1
WHERE IdEsta = 3;

UPDATE Mant.tblmanEstaOrde
SET NombEsta = N'Finalizada', Descri = N'Orden completada', Activo = 1
WHERE IdEsta = 4;

UPDATE Mant.tblmanEstaOrde
SET NombEsta = N'Cancelada', Descri = N'Orden cancelada', Activo = 1
WHERE IdEsta = 5;

SET IDENTITY_INSERT Mant.tblmanEstaOrde ON;

IF NOT EXISTS (SELECT 1 FROM Mant.tblmanEstaOrde WHERE IdEsta = 1)
    INSERT INTO Mant.tblmanEstaOrde (IdEsta, NombEsta, Descri, Activo)
    VALUES (1, N'Creada', N'Orden recién creada', 1);

IF NOT EXISTS (SELECT 1 FROM Mant.tblmanEstaOrde WHERE IdEsta = 2)
    INSERT INTO Mant.tblmanEstaOrde (IdEsta, NombEsta, Descri, Activo)
    VALUES (2, N'Activa', N'Orden en ejecución', 1);

IF NOT EXISTS (SELECT 1 FROM Mant.tblmanEstaOrde WHERE IdEsta = 3)
    INSERT INTO Mant.tblmanEstaOrde (IdEsta, NombEsta, Descri, Activo)
    VALUES (3, N'Pausada', N'Orden detenida temporalmente', 1);

IF NOT EXISTS (SELECT 1 FROM Mant.tblmanEstaOrde WHERE IdEsta = 4)
    INSERT INTO Mant.tblmanEstaOrde (IdEsta, NombEsta, Descri, Activo)
    VALUES (4, N'Finalizada', N'Orden completada', 1);

IF NOT EXISTS (SELECT 1 FROM Mant.tblmanEstaOrde WHERE IdEsta = 5)
    INSERT INTO Mant.tblmanEstaOrde (IdEsta, NombEsta, Descri, Activo)
    VALUES (5, N'Cancelada', N'Orden cancelada', 1);

SET IDENTITY_INSERT Mant.tblmanEstaOrde OFF;

MERGE Mant.tblmanTipoMant AS target
USING (
    VALUES
        (N'Correctivo'),
        (N'Preventivo'),
        (N'Reactivo')
) AS source (Nombre)
ON target.Nombre = source.Nombre
WHEN NOT MATCHED THEN
    INSERT (Nombre)
    VALUES (source.Nombre);

/* =========================
   3. TIPOS DE PARTE PMC1
   ========================= */

DECLARE @TipoPart TABLE (
    Id INT NOT NULL,
    Nomb VARCHAR(50) NOT NULL
);

INSERT INTO Mant.tblmanTipoPart (Descripcion, Nomb, CodiComp)
OUTPUT inserted.Id, inserted.Nomb INTO @TipoPart (Id, Nomb)
VALUES
    (N'Componentes que transmiten movimiento y soportan carga, como ejes, poleas y rodamientos.', N'Mecánico',   @CodiComp),
    (N'Elementos encargados de eliminar impurezas en aire, aceite o fluidos del sistema.',         N'Filtración', @CodiComp),
    (N'Componentes que manejan energía eléctrica como motores, sensores y cableado.',               N'Eléctrico',  @CodiComp),
    (N'Dispositivos de medición y monitoreo de variables físicas del proceso.',                     N'Sensores',   @CodiComp),
    (N'Componentes que usan o controlan fluidos a presión, válvulas y cilindros.',                 N'Hidráulico', @CodiComp),
    (N'Elementos que operan con aire comprimido para generar movimiento o control.',                N'Neumático',  @CodiComp),
    (N'Partes asociadas a control térmico como ventiladores, intercambiadores y chillers.',        N'Térmico',    @CodiComp),
    (N'Elementos físicos de soporte, guardas, tapas y bastidores de máquina.',                      N'Estructural',@CodiComp),
    (N'Partes de recambio frecuente como correas, sellos, filtros y kits de servicio.',            N'Consumible', @CodiComp);

/* =========================
   4. MÁQUINAS PMC1
   ========================= */

INSERT INTO Mant.tblmanMaquin (
    CodiComp,
    CodiMaqu,
    MarcMaqu,
    DescMaqu,
    ProdFabr,
    FechComp,
    ObseMaqu,
    UbicMaqu,
    IdCritic
)
SELECT
    @CodiComp,
    src.CodiMaqu,
    src.MarcMaqu,
    src.DescMaqu,
    src.ProdFabr,
    src.FechComp,
    src.ObseMaqu,
    src.UbicMaqu,
    C.IdCritic
FROM (
    VALUES
        (N'M100', N'Windmoller', N'Extrusora de película soplada 3 capas', N'Línea film premium',      CAST('2022-03-15' AS SMALLDATETIME), N'Equipo principal de extrusión para línea premium.', N'Planta 1 - Extrusión',    N'Crítica'),
        (N'M110', N'Bobst',      N'Impresora flexográfica de 8 colores',    N'Impresión de empaques',   CAST('2021-07-10' AS SMALLDATETIME), N'Usada para tirajes medianos y largos.',               N'Planta 1 - Impresión',    N'Alta'),
        (N'M120', N'Comexi',     N'Laminadora solventless',                 N'Laminación de estructuras',CAST('2023-01-20' AS SMALLDATETIME), N'Opera con adhesivos de dos componentes.',               N'Planta 1 - Laminación',   N'Alta'),
        (N'M130', N'Karlville',  N'Cortadora rebobinadora duplex',          N'Conversión final de bobinas', CAST('2020-11-05' AS SMALLDATETIME), N'Crítica para despacho de producto terminado.',       N'Planta 2 - Conversión',   N'Alta'),
        (N'M140', N'Atlas Copco',N'Compresor de tornillo 75HP',             N'Compresor central',       CAST('2019-05-18' AS SMALLDATETIME), N'Suministra aire a válvulas y actuadores de planta.', N'Servicios industriales',  N'Crítica'),
        (N'M150', N'Trane',      N'Chiller industrial 120TR',               N'Chiller proceso central', CAST('2022-09-01' AS SMALLDATETIME), N'Soporta enfriamiento de extrusión y laminación.',     N'Servicios industriales',  N'Media')
) AS src (CodiMaqu, MarcMaqu, DescMaqu, ProdFabr, FechComp, ObseMaqu, UbicMaqu, Criticidad)
INNER JOIN Mant.tblmanCritic C
    ON C.Nombre = src.Criticidad;

/* =========================
   5. PARTES DE MÁQUINA PMC1
   ========================= */

INSERT INTO Mant.tblmanPartMaqu (
    CodiPart,
    CodiComp,
    CodiMaqu,
    NombreParte,
    IdTipoPart
)
SELECT
    src.CodiPart,
    @CodiComp,
    src.CodiMaqu,
    src.NombreParte,
    TP.Id
FROM (
    VALUES
        (N'PM100-ROD-01', N'M100', N'Rodamiento principal husillo',        N'Mecánico'),
        (N'PM100-FIL-01', N'M100', N'Filtro de aceite unidad hidráulica',  N'Filtración'),
        (N'PM100-SEN-01', N'M100', N'Sensor de temperatura cabezal',       N'Sensores'),
        (N'PM110-ANI-01', N'M110', N'Anilox estación 1',                   N'Mecánico'),
        (N'PM110-RAS-01', N'M110', N'Cuchilla rascadora doctor blade',     N'Consumible'),
        (N'PM110-MOT-01', N'M110', N'Motor servocontrol de registro',      N'Eléctrico'),
        (N'PM120-BOM-01', N'M120', N'Bomba dosificadora adhesivo A',       N'Hidráulico'),
        (N'PM120-FIL-01', N'M120', N'Filtro de solventes de cabina',       N'Filtración'),
        (N'PM130-COR-01', N'M130', N'Correa de transmisión principal',     N'Consumible'),
        (N'PM130-EJE-01', N'M130', N'Eje de rebobinado',                   N'Mecánico'),
        (N'PM140-VAL-01', N'M140', N'Válvula mínima de presión',           N'Neumático'),
        (N'PM140-FIL-01', N'M140', N'Filtro separador aire-aceite',        N'Filtración'),
        (N'PM150-VEN-01', N'M150', N'Ventilador axial condensador',        N'Térmico'),
        (N'PM150-SEN-01', N'M150', N'Sensor de presión circuito agua',     N'Sensores')
) AS src (CodiPart, CodiMaqu, NombreParte, TipoParte)
INNER JOIN @TipoPart TP
    ON TP.Nomb = src.TipoParte;

/* =========================
   6. REPUESTOS PMC1
   ========================= */

INSERT INTO Mant.tblmanRepues (idRepuesto, Cantid, CodiPart)
VALUES
    (9101,  6, N'PM100-ROD-01'),
    (9102, 12, N'PM100-FIL-01'),
    (9103,  4, N'PM100-SEN-01'),
    (9104,  3, N'PM110-ANI-01'),
    (9105, 18, N'PM110-RAS-01'),
    (9106,  2, N'PM110-MOT-01'),
    (9107,  4, N'PM120-BOM-01'),
    (9108, 10, N'PM120-FIL-01'),
    (9109, 14, N'PM130-COR-01'),
    (9110,  3, N'PM130-EJE-01'),
    (9111,  5, N'PM140-VAL-01'),
    (9112,  8, N'PM140-FIL-01'),
    (9113,  4, N'PM150-VEN-01'),
    (9114,  4, N'PM150-SEN-01');

/* =========================
   7. OPERARIOS PMC1
   ========================= */

INSERT INTO Mant.tblmanOperar (
    Nombre,
    Telefo,
    Cedula,
    Apellid,
    Cargo,
    Especi,
    Email,
    Activo,
    CodiComp
)
VALUES
    (N'Laura',   N'3001001001', N'PMC10001', N'Gómez',   N'Técnico mecánico',      N'Rodamientos y transmisión', N'laura.gomez@plastimaq.demo',   1, @CodiComp),
    (N'Diego',   N'3001001002', N'PMC10002', N'Ramírez', N'Técnico eléctrico',     N'Sensores y potencia',       N'diego.ramirez@plastimaq.demo', 1, @CodiComp),
    (N'Paula',   N'3001001003', N'PMC10003', N'Torres',  N'Planeador de mantenimiento', N'Programación semanal', N'paula.torres@plastimaq.demo',  1, @CodiComp),
    (N'Andrés',  N'3001001004', N'PMC10004', N'Castro',  N'Técnico de utilidades', N'Compresores y chillers',    N'andres.castro@plastimaq.demo', 1, @CodiComp),
    (N'Sandra',  N'3001001005', N'PMC10005', N'López',   N'Técnico de impresión',  N'Flexografía y laminación',  N'sandra.lopez@plastimaq.demo',  1, @CodiComp),
    (N'Miguel',  N'3001001006', N'PMC10006', N'Herrera', N'Auxiliar de mantenimiento', N'Lubricación y limpieza', N'miguel.herrera@plastimaq.demo',1, @CodiComp);

/* =========================
   8. ACTIVIDADES PMC1
   ========================= */

DECLARE @Acti TABLE (
    IdActiMant INT NOT NULL,
    CodiActi NVARCHAR(20) NOT NULL
);

INSERT INTO Mant.tblmanActiMant (
    CodiComp,
    CodiActi,
    NombActi,
    Descri,
    TipoMant,
    Activo
)
OUTPUT inserted.IdActiMant, inserted.CodiActi INTO @Acti (IdActiMant, CodiActi)
VALUES
    (@CodiComp, N'ACT_PRE_LUB',  N'Lubricar tren de arrastre',        N'Aplicar lubricante técnico en puntos de fricción definidos por ficha de mantenimiento.', N'Preventivo', 1),
    (@CodiComp, N'ACT_PRE_LIMP', N'Limpiar filtros y guardas',        N'Retirar suciedad y residuos en filtros, guardas y superficies críticas.',                  N'Preventivo', 1),
    (@CodiComp, N'ACT_PRE_INS',  N'Inspección visual general',        N'Verificar estado general, fijaciones, ruidos, fugas y vibración anormal.',               N'Preventivo', 1),
    (@CodiComp, N'ACT_PRE_TERM', N'Medir variables térmicas',         N'Registrar temperatura de operación y comparar contra parámetros nominales.',             N'Preventivo', 1),
    (@CodiComp, N'ACT_PRE_AJU',  N'Ajustar tornillería estructural',  N'Aplicar torque y reapriete sobre uniones críticas del equipo.',                          N'Preventivo', 1),
    (@CodiComp, N'ACT_COR_CAMB', N'Reemplazar componente desgastado', N'Sustituir el componente que presenta falla o desgaste por uno nuevo en inventario.',    N'Correctivo', 1),
    (@CodiComp, N'ACT_COR_PRU',  N'Probar funcionamiento postreparo', N'Validar que el equipo opere de forma estable luego de la intervención.',                 N'Correctivo', 1),
    (@CodiComp, N'ACT_COR_CAL',  N'Calibrar sensor o actuador',       N'Recalibrar sensor, variador o actuador luego de reparación o cambio.',                   N'Correctivo', 1),
    (@CodiComp, N'ACT_REA_DIAG', N'Diagnóstico reactivo de emergencia', N'Atender evento no programado y aislar causa raíz para restablecer operación.',          N'Reactivo',   1),
    (@CodiComp, N'ACT_REA_REST', N'Restablecer servicio crítico',     N'Realizar maniobras mínimas seguras para devolver el servicio al proceso.',               N'Reactivo',   1);

/* =========================
   9. CAUSAS PMC1
   ========================= */

DECLARE @Caus TABLE (
    IdCausMant INT NOT NULL,
    CodiCaus NVARCHAR(20) NOT NULL
);

INSERT INTO Mant.tblmanCausMant (
    CodiComp,
    CodiCaus,
    NombCaus,
    Descri,
    TipoMant,
    Activo
)
OUTPUT inserted.IdCausMant, inserted.CodiCaus INTO @Caus (IdCausMant, CodiCaus)
VALUES
    (@CodiComp, N'CAU_PRE_DESG', N'Desgaste natural de componente', N'Deterioro esperado por horas de uso que exige intervención periódica.',            N'Preventivo', 1),
    (@CodiComp, N'CAU_PRE_CONT', N'Contaminación de filtros',       N'Acumulación de partículas o suciedad que reduce eficiencia del sistema.',         N'Preventivo', 1),
    (@CodiComp, N'CAU_PRE_AJUS', N'Desajuste mecánico',             N'Pérdida de alineación o ajuste por vibración y operación continua.',             N'Preventivo', 1),
    (@CodiComp, N'CAU_COR_FUGA', N'Fuga de fluido',                 N'Pérdida de aceite, aire o refrigerante por sello, manguera o conexión dañada.',N'Correctivo', 1),
    (@CodiComp, N'CAU_COR_FALL', N'Falla de sensor o motor',        N'Componente eléctrico o electrónico fuera de rango o sin respuesta.',            N'Correctivo', 1),
    (@CodiComp, N'CAU_REA_PARO', N'Parada súbita de línea',         N'Detención inesperada del equipo por condición crítica del proceso.',             N'Reactivo',   1),
    (@CodiComp, N'CAU_REA_PRES', N'Pérdida de presión de servicio', N'Caída abrupta de presión neumática o hidráulica que impide operar.',            N'Reactivo',   1);

/* =========================
   10. MANTENIMIENTOS PMC1
   ========================= */

INSERT INTO Mant.tblmanManten (
    idMantenimiento,
    nombre,
    Descripcion,
    CodiComp,
    CodiMaqu,
    tiempoDias,
    TipoMant
)
VALUES
    (8101, N'PM Preventivo extrusora M100',   N'Rutina preventiva integral de la extrusora principal de película soplada.', @CodiComp, N'M100', 30, N'Preventivo'),
    (8102, N'PM Preventivo impresora M110',   N'Rutina preventiva de estaciones, anilox y servocontroles.',                @CodiComp, N'M110', 21, N'Preventivo'),
    (8103, N'PM Preventivo laminadora M120',  N'Inspección de bombas, filtros y control de adhesivo.',                     @CodiComp, N'M120', 30, N'Preventivo'),
    (8104, N'PM Preventivo rebobinadora M130',N'Inspección de ejes, corte y transmisión.',                                 @CodiComp, N'M130', 15, N'Preventivo'),
    (8201, N'CM Correctivo compresor M140',   N'Atención de fugas, presión inestable o alarmas de compresión.',            @CodiComp, N'M140',  3, N'Correctivo'),
    (8202, N'CM Correctivo chiller M150',     N'Intervención correctiva por alarmas térmicas o pérdida de capacidad.',     @CodiComp, N'M150',  2, N'Correctivo'),
    (8301, N'EM Reactivo extrusora M100',     N'Respuesta inmediata ante parada no programada de extrusión.',              @CodiComp, N'M100',  1, N'Reactivo');

/* =========================
   11. DETALLE ACTIVIDADES POR MANTENIMIENTO
   ========================= */

INSERT INTO Mant.tblmanMantActiDeta (
    idMantenimiento,
    IdActiMant,
    Orden,
    TiempoMin,
    Obligatoria,
    Activo
)
SELECT
    src.idMantenimiento,
    A.IdActiMant,
    src.Orden,
    src.TiempoMin,
    src.Obligatoria,
    1
FROM (
    VALUES
        (8101, N'ACT_PRE_INS',  1, 20, 1),
        (8101, N'ACT_PRE_LIMP', 2, 25, 1),
        (8101, N'ACT_PRE_LUB',  3, 30, 1),
        (8101, N'ACT_PRE_TERM', 4, 15, 1),
        (8102, N'ACT_PRE_INS',  1, 20, 1),
        (8102, N'ACT_PRE_AJU',  2, 30, 1),
        (8102, N'ACT_PRE_LIMP', 3, 20, 1),
        (8103, N'ACT_PRE_INS',  1, 15, 1),
        (8103, N'ACT_PRE_LIMP', 2, 20, 1),
        (8103, N'ACT_PRE_TERM', 3, 15, 1),
        (8104, N'ACT_PRE_INS',  1, 15, 1),
        (8104, N'ACT_PRE_AJU',  2, 20, 1),
        (8201, N'ACT_COR_CAMB', 1, 60, 1),
        (8201, N'ACT_COR_PRU',  2, 20, 1),
        (8202, N'ACT_COR_CAL',  1, 45, 1),
        (8202, N'ACT_COR_PRU',  2, 25, 1),
        (8301, N'ACT_REA_DIAG', 1, 20, 1),
        (8301, N'ACT_REA_REST', 2, 40, 1)
) AS src (idMantenimiento, CodiActi, Orden, TiempoMin, Obligatoria)
INNER JOIN @Acti A
    ON A.CodiActi = src.CodiActi;

/* =========================
   12. DETALLE CAUSAS POR MANTENIMIENTO
   ========================= */

INSERT INTO Mant.tblmanMantCausDeta (
    idMantenimiento,
    IdCausMant,
    Activo
)
SELECT
    src.idMantenimiento,
    C.IdCausMant,
    1
FROM (
    VALUES
        (8101, N'CAU_PRE_DESG'),
        (8101, N'CAU_PRE_CONT'),
        (8102, N'CAU_PRE_AJUS'),
        (8102, N'CAU_PRE_DESG'),
        (8103, N'CAU_PRE_CONT'),
        (8104, N'CAU_PRE_AJUS'),
        (8201, N'CAU_COR_FUGA'),
        (8201, N'CAU_REA_PRES'),
        (8202, N'CAU_COR_FALL'),
        (8301, N'CAU_REA_PARO'),
        (8301, N'CAU_REA_PRES')
    ) AS src (idMantenimiento, CodiCaus)
INNER JOIN @Caus C
    ON C.CodiCaus = src.CodiCaus;

/* =========================
   13. PROGRAMACIÓN DE MANTENIMIENTOS
   ========================= */

INSERT INTO Mant.tblmanProgMant (
    idMant,
    FechInic,
    FrecDias,
    UltiFech,
    ProxFech,
    Activo
)
VALUES
    (8101, CAST('2026-01-05' AS DATE), 30, CAST('2026-05-01' AS DATE), CAST('2026-05-31' AS DATE), 1),
    (8102, CAST('2026-01-08' AS DATE), 21, CAST('2026-05-08' AS DATE), CAST('2026-05-29' AS DATE), 1),
    (8103, CAST('2026-01-10' AS DATE), 30, CAST('2026-04-28' AS DATE), CAST('2026-05-28' AS DATE), 1),
    (8104, CAST('2026-01-03' AS DATE), 15, CAST('2026-05-10' AS DATE), CAST('2026-05-25' AS DATE), 1),
    (8201, CAST('2026-02-01' AS DATE),  3, CAST('2026-05-16' AS DATE), CAST('2026-05-19' AS DATE), 1),
    (8202, CAST('2026-02-01' AS DATE),  2, CAST('2026-05-17' AS DATE), CAST('2026-05-19' AS DATE), 1),
    (8301, CAST('2026-02-01' AS DATE),  1, CAST('2026-05-18' AS DATE), CAST('2026-05-19' AS DATE), 1);

COMMIT TRANSACTION;

/* =========================
   14. VALIDACIÓN RÁPIDA
   ========================= */

SELECT 'tblmanTipoPart'  AS Tabla, COUNT(*) AS Registros FROM Mant.tblmanTipoPart  WHERE CodiComp = @CodiComp
UNION ALL
SELECT 'tblmanMaquin',          COUNT(*) FROM Mant.tblmanMaquin    WHERE CodiComp = @CodiComp
UNION ALL
SELECT 'tblmanPartMaqu',        COUNT(*) FROM Mant.tblmanPartMaqu  WHERE CodiComp = @CodiComp
UNION ALL
SELECT 'tblmanRepues',          COUNT(*) FROM Mant.tblmanRepues R INNER JOIN Mant.tblmanPartMaqu P ON P.CodiPart = R.CodiPart WHERE P.CodiComp = @CodiComp
UNION ALL
SELECT 'tblmanOperar',          COUNT(*) FROM Mant.tblmanOperar    WHERE CodiComp = @CodiComp
UNION ALL
SELECT 'tblmanActiMant',        COUNT(*) FROM Mant.tblmanActiMant  WHERE CodiComp = @CodiComp
UNION ALL
SELECT 'tblmanCausMant',        COUNT(*) FROM Mant.tblmanCausMant  WHERE CodiComp = @CodiComp
UNION ALL
SELECT 'tblmanManten',          COUNT(*) FROM Mant.tblmanManten    WHERE CodiComp = @CodiComp
UNION ALL
SELECT 'tblmanProgMant',        COUNT(*) FROM Mant.tblmanProgMant PM INNER JOIN Mant.tblmanManten M ON M.idMantenimiento = PM.idMant WHERE M.CodiComp = @CodiComp
UNION ALL
SELECT 'tblmanMantActiDeta',    COUNT(*) FROM Mant.tblmanMantActiDeta MAD INNER JOIN Mant.tblmanManten M ON M.idMantenimiento = MAD.idMantenimiento WHERE M.CodiComp = @CodiComp
UNION ALL
SELECT 'tblmanMantCausDeta',    COUNT(*) FROM Mant.tblmanMantCausDeta MCD INNER JOIN Mant.tblmanManten M ON M.idMantenimiento = MCD.idMantenimiento WHERE M.CodiComp = @CodiComp;

