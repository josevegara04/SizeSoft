CREATE PROCEDURE [Mant].[spSaveActiMant]
    @json NVARCHAR(MAX),
    @CodiComp NVARCHAR(4),
    @CodiUsua NVARCHAR(15),
    @Accion SMALLINT,
    @Messag NVARCHAR(200) OUTPUT
AS
BEGIN
    SET
    NOCOUNT ON;
    
    DECLARE
        @IdActiMant INT,
        @CodiActi NVARCHAR(20),
        @NombActi VARCHAR(100),
        @Descri VARCHAR(255),
        @TipoMant VARCHAR(20),
        @Activo BIT,
        @Existe INT,
        @Success BIT = 1;
BEGIN
    TRY
BEGIN
        TRAN;

SELECT
            @IdActiMant = IdActiMant,
            @CodiActi = CodiActi,
            @NombActi = NombActi,
            @Descri = Descri,
            @TipoMant = TipoMant,
            @Activo = ISNULL(Activo, 1)
FROM
    OPENJSON(@json)
        WITH (
            IdActiMant INT,
            CodiActi NVARCHAR(20),
            NombActi VARCHAR(100),
            Descri VARCHAR(255),
            TipoMant VARCHAR(20),
            Activo BIT
        );

SELECT
    @Existe = COUNT(*)
FROM
    Mant.tblmanActiMant
WHERE
    IdActiMant = ISNULL(@IdActiMant, 0)
    AND CodiComp = @CodiComp;

IF (@Accion IN (1, 3))
        BEGIN
            IF (NULLIF(LTRIM(RTRIM(@CodiActi)), '') IS NULL)
                THROW 51000,
'Debe informar el codigo de la actividad',
1;

IF (NULLIF(LTRIM(RTRIM(@NombActi)), '') IS NULL)
                THROW 51000,
'Debe informar el nombre de la actividad',
1;

IF (@TipoMant IS NOT NULL
    AND NOT EXISTS (
    SELECT
        1
    FROM
        Mant.tblmanTipoMant
    WHERE
        Nombre = @TipoMant
            ))
                THROW 51000,
'El tipo de mantenimiento no existe',
1;
END

        IF (@Accion = 1)
        BEGIN
            IF EXISTS (
SELECT
1
FROM
Mant.tblmanActiMant
WHERE
CodiComp = @CodiComp
AND CodiActi = @CodiActi
            )
                THROW 51000,
'La actividad ya existe',
1;

INSERT
    INTO
    Mant.tblmanActiMant (
                CodiComp,
    CodiActi,
    NombActi,
    Descri,
    TipoMant,
    Activo
            )
VALUES (
                @CodiComp,
@CodiActi,
@NombActi,
@Descri,
@TipoMant,
@Activo
            );

SET
@Messag = '{"success": true, "message": "Actividad creada"}';
END
ELSE IF (@Accion = 2)
BEGIN
            IF (@Existe = 0)
                THROW 51000,
'La actividad no existe',
1;

DELETE
FROM
    Mant.tblmanActiMant
WHERE
    IdActiMant = @IdActiMant
    AND CodiComp = @CodiComp;

SET
@Messag = '{"success": true, "message": "Actividad eliminada"}';
END
ELSE IF (@Accion = 3)
BEGIN
            IF (@Existe = 0)
                THROW 51000,
'La actividad no existe',
1;

IF EXISTS (
SELECT
    1
FROM
    Mant.tblmanActiMant
WHERE
    CodiComp = @CodiComp
    AND CodiActi = @CodiActi
    AND IdActiMant <> @IdActiMant
            )
                THROW 51000,
'Ya existe otra actividad con ese codigo',
1;

UPDATE
    Mant.tblmanActiMant
SET
    CodiActi = @CodiActi,
                NombActi = @NombActi,
                Descri = @Descri,
                TipoMant = @TipoMant,
                Activo = @Activo
WHERE
    IdActiMant = @IdActiMant
    AND CodiComp = @CodiComp;

SET
@Messag = '{"success": true, "message": "Actividad actualizada"}';
END
ELSE
BEGIN
            THROW 51000,
'Accion no valida',
1;
END

        COMMIT;
END TRY
BEGIN
CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;

SET
@Success = 0;

SET
@Messag = '{"success": false, "message": "' + REPLACE(ERROR_MESSAGE(), '"', '\"') + '"}';
END CATCH

    SELECT
    @Success AS success,
    @Messag AS message;
END;


CREATE PROCEDURE [Mant].[spSaveCausMant]
    @json NVARCHAR(MAX),
    @CodiComp NVARCHAR(4),
    @CodiUsua NVARCHAR(15),
    @Accion SMALLINT,
    @Messag NVARCHAR(200) OUTPUT
AS
BEGIN
    SET
    NOCOUNT ON;
    
    DECLARE
        @IdCausMant INT,
        @CodiCaus NVARCHAR(20),
        @NombCaus VARCHAR(100),
        @Descri VARCHAR(255),
        @TipoMant VARCHAR(20),
        @Activo BIT,
        @Existe INT,
        @Success BIT = 1;
BEGIN
    TRY
BEGIN
        TRAN;

SELECT
            @IdCausMant = IdCausMant,
            @CodiCaus = CodiCaus,
            @NombCaus = NombCaus,
            @Descri = Descri,
            @TipoMant = TipoMant,
            @Activo = ISNULL(Activo, 1)
FROM
    OPENJSON(@json)
        WITH (
            IdCausMant INT,
            CodiCaus NVARCHAR(20),
            NombCaus VARCHAR(100),
            Descri VARCHAR(255),
            TipoMant VARCHAR(20),
            Activo BIT
        );

SELECT
    @Existe = COUNT(*)
FROM
    Mant.tblmanCausMant
WHERE
    IdCausMant = ISNULL(@IdCausMant, 0)
    AND CodiComp = @CodiComp;

IF (@Accion IN (1, 3))
        BEGIN
            IF (NULLIF(LTRIM(RTRIM(@CodiCaus)), '') IS NULL)
                THROW 51000,
'Debe informar el codigo de la causa',
1;

IF (NULLIF(LTRIM(RTRIM(@NombCaus)), '') IS NULL)
                THROW 51000,
'Debe informar el nombre de la causa',
1;

IF (@TipoMant IS NOT NULL
    AND NOT EXISTS (
    SELECT
        1
    FROM
        Mant.tblmanTipoMant
    WHERE
        Nombre = @TipoMant
            ))
                THROW 51000,
'El tipo de mantenimiento no existe',
1;
END

        IF (@Accion = 1)
        BEGIN
            IF EXISTS (
SELECT
1
FROM
Mant.tblmanCausMant
WHERE
CodiComp = @CodiComp
AND CodiCaus = @CodiCaus
            )
                THROW 51000,
'La causa ya existe',
1;

INSERT
    INTO
    Mant.tblmanCausMant (
                CodiComp,
    CodiCaus,
    NombCaus,
    Descri,
    TipoMant,
    Activo
            )
VALUES (
                @CodiComp,
@CodiCaus,
@NombCaus,
@Descri,
@TipoMant,
@Activo
            );

SET
@Messag = '{"success": true, "message": "Causa creada"}';
END
ELSE IF (@Accion = 2)
BEGIN
            IF (@Existe = 0)
                THROW 51000,
'La causa no existe',
1;

DELETE
FROM
    Mant.tblmanCausMant
WHERE
    IdCausMant = @IdCausMant
    AND CodiComp = @CodiComp;

SET
@Messag = '{"success": true, "message": "Causa eliminada"}';
END
ELSE IF (@Accion = 3)
BEGIN
            IF (@Existe = 0)
                THROW 51000,
'La causa no existe',
1;

IF EXISTS (
SELECT
    1
FROM
    Mant.tblmanCausMant
WHERE
    CodiComp = @CodiComp
    AND CodiCaus = @CodiCaus
    AND IdCausMant <> @IdCausMant
            )
                THROW 51000,
'Ya existe otra causa con ese codigo',
1;

UPDATE
    Mant.tblmanCausMant
SET
    CodiCaus = @CodiCaus,
                NombCaus = @NombCaus,
                Descri = @Descri,
                TipoMant = @TipoMant,
                Activo = @Activo
WHERE
    IdCausMant = @IdCausMant
    AND CodiComp = @CodiComp;

SET
@Messag = '{"success": true, "message": "Causa actualizada"}';
END
ELSE
BEGIN
            THROW 51000,
'Accion no valida',
1;
END

        COMMIT;
END TRY
BEGIN
CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;

SET
@Success = 0;

SET
@Messag = '{"success": false, "message": "' + REPLACE(ERROR_MESSAGE(), '"', '\"') + '"}';
END CATCH

    SELECT
    @Success AS success,
    @Messag AS message;
END;


CREATE PROCEDURE [Mant].[spSaveMantActiDeta]
    @json NVARCHAR(MAX),
    @CodiComp NVARCHAR(4),
    @CodiUsua NVARCHAR(15),
    @Accion SMALLINT,
    @Messag NVARCHAR(200) OUTPUT
AS
BEGIN
    SET
    NOCOUNT ON;
    
    DECLARE
        @Payload NVARCHAR(MAX),
        @IdMantActiDeta INT,
        @idMantenimiento INT,
        @IdActiMant INT,
        @Orden INT,
        @TiempoMin INT,
        @Obligatoria BIT,
        @Activo BIT,
        @Success BIT = 1;

DECLARE @Actividades TABLE (
        IdActiMant INT NOT NULL,
        Orden INT NOT NULL,
        TiempoMin INT NULL,
        Obligatoria BIT NOT NULL,
        Activo BIT NOT NULL
    );
BEGIN
    TRY
BEGIN
        TRAN;

SET
@Payload = CASE
            WHEN ISJSON(@json) = 1
    AND LEFT(LTRIM(@json), 1) = '['
                THEN (
    SELECT
        TOP 1 [value]
    FROM
        OPENJSON(@json))
    ELSE @json
END;

SELECT
            @IdMantActiDeta = IdMantActiDeta,
            @idMantenimiento = idMantenimiento,
            @IdActiMant = IdActiMant,
            @Orden = Orden,
            @TiempoMin = TiempoMin,
            @Obligatoria = ISNULL(Obligatoria, 1),
            @Activo = ISNULL(Activo, 1)
FROM
    OPENJSON(@Payload)
        WITH (
            IdMantActiDeta INT,
            idMantenimiento INT,
            IdActiMant INT,
            Orden INT,
            TiempoMin INT,
            Obligatoria BIT,
            Activo BIT
        );

IF EXISTS (
SELECT
    1
FROM
    OPENJSON(@Payload, '$.Actividades'))
        BEGIN
            INSERT
    INTO
    @Actividades (
                IdActiMant,
                Orden,
                TiempoMin,
                Obligatoria,
                Activo
            )
            SELECT
                IdActiMant,
                Orden,
                TiempoMin,
                ISNULL(Obligatoria, 1),
                ISNULL(Activo, 1)
FROM
    OPENJSON(@Payload, '$.Actividades')
            WITH (
                IdActiMant INT,
                Orden INT,
                TiempoMin INT,
                Obligatoria BIT,
                Activo BIT
            );
END
ELSE IF (@IdActiMant IS NOT NULL)
        BEGIN
            INSERT
    INTO
    @Actividades (
                IdActiMant,
                Orden,
                TiempoMin,
                Obligatoria,
                Activo
            )
VALUES (
                @IdActiMant,
                @Orden,
                @TiempoMin,
                ISNULL(@Obligatoria, 1),
                ISNULL(@Activo, 1)
            );
END

        IF (@Accion IN (1, 2, 3))
BEGIN
            IF (@idMantenimiento IS NULL
    OR @idMantenimiento <= 0)
                THROW 51000,
'Debe informar el mantenimiento',
1;

IF NOT EXISTS (
SELECT
    1
FROM
    Mant.tblmanManten
WHERE
    idMantenimiento = @idMantenimiento
    AND CodiComp = @CodiComp
            )
                THROW 51000,
'El mantenimiento no existe para la compañia indicada',
1;

IF NOT EXISTS (
SELECT
    1
FROM
    @Actividades)
                THROW 51000,
'Debe informar al menos una actividad',
1;
END

        IF (@Accion IN (1, 3))
        BEGIN
            IF EXISTS (
SELECT
1
FROM
@Actividades
WHERE
IdActiMant IS NULL
OR IdActiMant <= 0
            )
                THROW 51000,
'Debe informar actividades validas',
1;

IF EXISTS (
SELECT
    1
FROM
    @Actividades
WHERE
    Orden IS NULL
    OR Orden <= 0
            )
                THROW 51000,
'Debe informar un orden mayor a cero para cada actividad',
1;

IF EXISTS (
SELECT
    1
FROM
    @Actividades
WHERE
    TiempoMin IS NOT NULL
    AND TiempoMin < 0
            )
                THROW 51000,
'El tiempo en minutos no puede ser negativo',
1;

IF EXISTS (
SELECT
    IdActiMant
FROM
    @Actividades
GROUP BY
    IdActiMant
HAVING
    COUNT(*) > 1
            )
                THROW 51000,
'No puede repetir actividades en la misma asignacion',
1;

IF EXISTS (
SELECT
    Orden
FROM
    @Actividades
WHERE
    Activo = 1
GROUP BY
    Orden
HAVING
    COUNT(*) > 1
            )
                THROW 51000,
'No puede repetir el orden en actividades activas',
1;

IF EXISTS (
SELECT
    1
FROM
    @Actividades A
LEFT JOIN Mant.tblmanActiMant AM
                    ON
    AM.IdActiMant = A.IdActiMant
    AND AM.CodiComp = @CodiComp
    AND AM.Activo = 1
WHERE
    AM.IdActiMant IS NULL
            )
                THROW 51000,
'Una o mas actividades no existen o no estan activas para la compañia indicada',
1;
END

        IF (@Accion = 1)
        BEGIN
            IF EXISTS (
SELECT
1
FROM
@Actividades A
INNER JOIN Mant.tblmanMantActiDeta MAD
                    ON
MAD.idMantenimiento = @idMantenimiento
AND MAD.IdActiMant = A.IdActiMant
            )
                THROW 51000,
'Una o mas actividades ya estan asignadas a este mantenimiento',
1;

IF EXISTS (
SELECT
    1
FROM
    @Actividades A
INNER JOIN Mant.tblmanMantActiDeta MAD
                    ON
    MAD.idMantenimiento = @idMantenimiento
    AND MAD.Orden = A.Orden
    AND MAD.Activo = 1
WHERE
    A.Activo = 1
            )
                THROW 51000,
'Uno o mas ordenes ya estan usados en este mantenimiento',
1;

INSERT
    INTO
    Mant.tblmanMantActiDeta (
                idMantenimiento,
                IdActiMant,
                Orden,
                TiempoMin,
                Obligatoria,
                Activo
            )
            SELECT
                @idMantenimiento,
                IdActiMant,
                Orden,
                TiempoMin,
                Obligatoria,
                Activo
FROM
    @Actividades;

SET
@Messag = '{"success": true, "message": "Actividades asignadas al mantenimiento"}';
END
ELSE IF (@Accion = 2)
        BEGIN
            IF EXISTS (
SELECT
1
FROM
@Actividades A
LEFT JOIN Mant.tblmanMantActiDeta MAD
                    ON
MAD.idMantenimiento = @idMantenimiento
AND MAD.IdActiMant = A.IdActiMant
WHERE
MAD.IdMantActiDeta IS NULL
            )
                THROW 51000,
'Una o mas actividades no estan asignadas a este mantenimiento',
1;

DELETE
    MAD
FROM
    Mant.tblmanMantActiDeta MAD
INNER JOIN @Actividades A
                ON
    A.IdActiMant = MAD.IdActiMant
WHERE
    MAD.idMantenimiento = @idMantenimiento;

SET
@Messag = '{"success": true, "message": "Actividades removidas del mantenimiento"}';
END
ELSE IF (@Accion = 3)
BEGIN
            DELETE
FROM
    Mant.tblmanMantActiDeta
WHERE
    idMantenimiento = @idMantenimiento;

INSERT
    INTO
    Mant.tblmanMantActiDeta (
                idMantenimiento,
                IdActiMant,
                Orden,
                TiempoMin,
                Obligatoria,
                Activo
            )
            SELECT
                @idMantenimiento,
                IdActiMant,
                Orden,
                TiempoMin,
                Obligatoria,
                Activo
FROM
    @Actividades;

SET
@Messag = '{"success": true, "message": "Actividades del mantenimiento actualizadas"}';
END
ELSE
        BEGIN
            THROW 51000,
'Accion no valida',
1;
END

        COMMIT;
END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;

SET
@Success = 0;

SET
@Messag = '{"success": false, "message": "' + REPLACE(ERROR_MESSAGE(), '"', '\"') + '"}';
END CATCH

    SELECT
    @Success AS success,
    @Messag AS message;
END;


CREATE PROCEDURE [Mant].[spSaveMantCausDeta]
    @json NVARCHAR(MAX),
    @CodiComp NVARCHAR(4),
    @CodiUsua NVARCHAR(15),
    @Accion SMALLINT,
    @Messag NVARCHAR(200) OUTPUT
AS
BEGIN
    SET
    NOCOUNT ON;
    
    DECLARE
        @Payload NVARCHAR(MAX),
        @IdMantCausDeta INT,
        @idMantenimiento INT,
        @IdCausMant INT,
        @Activo BIT,
        @Existe INT,
        @Success BIT = 1;

DECLARE @Causas TABLE (
        IdCausMant INT NOT NULL,
        Activo BIT NOT NULL
    );
BEGIN
    TRY
BEGIN
        TRAN;

SET
@Payload = CASE
            WHEN ISJSON(@json) = 1
    AND LEFT(LTRIM(@json), 1) = '['
                THEN (
    SELECT
        TOP 1 [value]
    FROM
        OPENJSON(@json))
    ELSE @json
END;

SELECT
            @IdMantCausDeta = IdMantCausDeta,
            @idMantenimiento = idMantenimiento,
            @IdCausMant = IdCausMant,
            @Activo = ISNULL(Activo, 1)
FROM
    OPENJSON(@Payload)
        WITH (
            IdMantCausDeta INT,
            idMantenimiento INT,
            IdCausMant INT,
            Activo BIT
        );

IF EXISTS (
SELECT
    1
FROM
    OPENJSON(@Payload, '$.Causas'))
        BEGIN
            INSERT
    INTO
    @Causas (IdCausMant,
    Activo)
            SELECT
    IdCausMant,
    ISNULL(Activo, 1)
FROM
    OPENJSON(@Payload, '$.Causas')
            WITH (
                IdCausMant INT,
                Activo BIT
            );
END
ELSE IF (@IdCausMant IS NOT NULL)
        BEGIN
            INSERT
    INTO
    @Causas (IdCausMant,
    Activo)
VALUES (@IdCausMant,
ISNULL(@Activo, 1));
END

        SELECT
    @Existe = COUNT(*)
FROM
    Mant.tblmanMantCausDeta MCD
INNER JOIN Mant.tblmanManten M
            ON
    M.idMantenimiento = MCD.idMantenimiento
WHERE
    MCD.IdMantCausDeta = ISNULL(@IdMantCausDeta, 0)
    AND M.CodiComp = @CodiComp;

IF (@Accion IN (1, 3))
        BEGIN
            IF (@idMantenimiento IS NULL
    OR @idMantenimiento <= 0)
                THROW 51000,
'Debe informar el mantenimiento',
1;

IF NOT EXISTS (
SELECT
    1
FROM
    Mant.tblmanManten
WHERE
    idMantenimiento = @idMantenimiento
    AND CodiComp = @CodiComp
            )
                THROW 51000,
'El mantenimiento no existe para la compañia indicada',
1;

IF NOT EXISTS (
SELECT
    1
FROM
    @Causas)
                THROW 51000,
'Debe informar al menos una causa',
1;

IF EXISTS (
SELECT
    IdCausMant
FROM
    @Causas
GROUP BY
    IdCausMant
HAVING
    COUNT(*) > 1
            )
                THROW 51000,
'No puede repetir causas en la misma asignacion',
1;

IF EXISTS (
SELECT
    1
FROM
    @Causas C
LEFT JOIN Mant.tblmanCausMant CM
                    ON
    CM.IdCausMant = C.IdCausMant
    AND CM.CodiComp = @CodiComp
    AND CM.Activo = 1
WHERE
    CM.IdCausMant IS NULL
            )
                THROW 51000,
'Una o mas causas no existen o no estan activas para la compañia indicada',
1;
END

        IF (@Accion = 1)
        BEGIN
            IF EXISTS (
SELECT
1
FROM
@Causas C
INNER JOIN Mant.tblmanMantCausDeta MCD
                    ON
MCD.idMantenimiento = @idMantenimiento
AND MCD.IdCausMant = C.IdCausMant
            )
                THROW 51000,
'Una o mas causas ya estan asignadas a este mantenimiento',
1;

INSERT
    INTO
    Mant.tblmanMantCausDeta (idMantenimiento,
    IdCausMant,
    Activo)
            SELECT
    @idMantenimiento,
    IdCausMant,
    Activo
FROM
    @Causas;

SET
@Messag = '{"success": true, "message": "Causas asignadas al mantenimiento"}';
END
ELSE IF (@Accion = 2)
		BEGIN
		    IF (@idMantenimiento IS NULL
OR @idMantenimiento <= 0)
		        THROW 51000,
'Debe informar el mantenimiento',
1;

IF NOT EXISTS (
SELECT
    1
FROM
    Mant.tblmanManten
WHERE
    idMantenimiento = @idMantenimiento
    AND CodiComp = @CodiComp
		    )
		        THROW 51000,
'El mantenimiento no existe para la compañia indicada',
1;

IF NOT EXISTS (
SELECT
    1
FROM
    @Causas)
		        THROW 51000,
'Debe informar al menos una causa para eliminar',
1;

IF EXISTS (
SELECT
    1
FROM
    @Causas C
LEFT JOIN Mant.tblmanMantCausDeta MCD
		            ON
    MCD.idMantenimiento = @idMantenimiento
    AND MCD.IdCausMant = C.IdCausMant
WHERE
    MCD.IdMantCausDeta IS NULL
		    )
		        THROW 51000,
'Una o mas causas no estan asignadas a este mantenimiento',
1;

DELETE
    MCD
FROM
    Mant.tblmanMantCausDeta MCD
INNER JOIN @Causas C
		        ON
    C.IdCausMant = MCD.IdCausMant
WHERE
    MCD.idMantenimiento = @idMantenimiento;

SET
@Messag = '{"success": true, "message": "Causas removidas del mantenimiento"}';
END
ELSE IF (@Accion = 3)
BEGIN
		    IF (@idMantenimiento IS NULL
    OR @idMantenimiento <= 0)
		        THROW 51000,
'Debe informar el mantenimiento',
1;

IF NOT EXISTS (
SELECT
    1
FROM
    Mant.tblmanManten
WHERE
    idMantenimiento = @idMantenimiento
    AND CodiComp = @CodiComp
		    )
		        THROW 51000,
'El mantenimiento no existe para la compañia indicada',
1;

IF NOT EXISTS (
SELECT
    1
FROM
    @Causas)
		        THROW 51000,
'Debe informar al menos una causa',
1;

DELETE
FROM
    Mant.tblmanMantCausDeta
WHERE
    idMantenimiento = @idMantenimiento;

INSERT
    INTO
    Mant.tblmanMantCausDeta (
		        idMantenimiento,
    IdCausMant,
    Activo
		    )
		    SELECT
    @idMantenimiento,
    IdCausMant,
    Activo
FROM
    @Causas;

SET
@Messag = '{"success": true, "message": "Causas del mantenimiento actualizadas"}';
END
ELSE
        BEGIN
            THROW 51000,
'Accion no valida',
1;
END

        COMMIT;
END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;

SET
@Success = 0;

SET
@Messag = '{"success": false, "message": "' + REPLACE(ERROR_MESSAGE(), '"', '\"') + '"}';
END CATCH

    SELECT
    @Success AS success,
    @Messag AS message;
END;


CREATE PROCEDURE [Mant].[spSaveManten]
    @json NVARCHAR(MAX),
    @CodiComp NVARCHAR(4),
    @CodiUsua NVARCHAR(15),
    @Accion SMALLINT,
    @Messag NVARCHAR(200) OUTPUT
AS
BEGIN
    SET
    NOCOUNT ON;
    
    DECLARE
        @idMantenimiento INT,
        @nombre VARCHAR(100),
        @Descripcion VARCHAR(255),
        @CodiMaqu NVARCHAR(10),
        @tiempoDias INT,
        @TipoMant VARCHAR(20),
        @Existe INT;
BEGIN
    TRY
BEGIN
        TRAN
        -- Leer JSON
        SELECT 
            @idMantenimiento = idMantenimiento,
            @nombre = nombre,
            @Descripcion = Descripcion,
            @CodiMaqu = CodiMaqu,
            @tiempoDias = tiempoDias,
            @TipoMant = TipoMant
FROM
    OPENJSON(@json)
        WITH (
            idMantenimiento INT,
            nombre VARCHAR(100),
            Descripcion VARCHAR(255),
            CodiMaqu NVARCHAR(10),
            tiempoDias INT,
            TipoMant VARCHAR(20)
        );
-- 🔍 Validar máquina
        IF NOT EXISTS (
SELECT
    1
FROM
    Mant.tblmanMaquin
WHERE
    CodiComp = @CodiComp
    AND CodiMaqu = @CodiMaqu
        )
            THROW 51000,
'La máquina no existe',
1;
-- 🔍 Validar tipo mantenimiento
        IF NOT EXISTS (
SELECT
    1
FROM
    Mant.tblmanTipoMant
WHERE
    Nombre = @TipoMant
        )
            THROW 51000,
'El tipo de mantenimiento no existe',
1;
-- 🔍 Validar nombre
        IF (@nombre IS NULL
    OR LEN(@nombre) = 0)
            THROW 51000,
'El nombre es obligatorio',
1;
-- 🔍 Validar descripción
        IF (@Descripcion IS NULL
    OR LEN(@Descripcion) = 0)
            THROW 51000,
'La descripción es obligatoria',
1;
-- 🔍 Validar tiempo
        IF (@tiempoDias IS NULL
    OR @tiempoDias <= 0)
            THROW 51000,
'El tiempo en días debe ser mayor a 0',
1;
-- Verificar existencia
        SELECT
    @Existe = COUNT(*)
FROM
    Mant.tblmanManten
WHERE
    idMantenimiento = @idMantenimiento;
-- 🗑️ ELIMINAR
        IF (@Accion = 2)
        BEGIN
            IF (@Existe = 0)
                SET
@Messag = 'El mantenimiento no existe'
ELSE
            BEGIN
                DELETE
FROM
    Mant.tblmanManten
WHERE
    idMantenimiento = @idMantenimiento;

SET
@Messag = 'Mantenimiento eliminado';
END
END
-- 💾 INSERT / UPDATE
ELSE IF (@Accion = 1)
BEGIN
            IF (@Existe > 0)
BEGIN
-- UPDATE
                UPDATE
    Mant.tblmanManten
SET 
                    nombre = @nombre,
                    Descripcion = @Descripcion,
                    CodiMaqu = @CodiMaqu,
                    tiempoDias = @tiempoDias,
                    TipoMant = @TipoMant
WHERE
    idMantenimiento = @idMantenimiento;

SET
@Messag = 'Mantenimiento actualizado';
END
ELSE
BEGIN
-- INSERT
                INSERT
    INTO
    Mant.tblmanManten (
                    idMantenimiento,
                    nombre,
                    Descripcion,
                    CodiComp,
                    CodiMaqu,
                    tiempoDias,
                    TipoMant
                )
VALUES (
                    @idMantenimiento,
                    @nombre,
                    @Descripcion,
                    @CodiComp,
                    @CodiMaqu,
                    @tiempoDias,
                    @TipoMant
                );

SET
@Messag = 'Mantenimiento creado';
END
END

        COMMIT
END TRY
BEGIN
CATCH
        ROLLBACK

        IF (ERROR_NUMBER() = 547)
            SET
@Messag = 'No se puede eliminar el mantenimiento porque tiene relaciones'
ELSE
            SET
@Messag = ERROR_MESSAGE()
END CATCH
END;


CREATE PROCEDURE [Mant].[spSaveMantMaqu]
    @json NVARCHAR(MAX),
    @CodiComp NVARCHAR(4),
    @CodiUsua NVARCHAR(15),
    @Accion SMALLINT,
    @Messag NVARCHAR(200) OUTPUT
AS
BEGIN
    SET
    NOCOUNT ON;
    
    DECLARE
        @CodiMaqu NVARCHAR(10),
        @MarcMaqu NVARCHAR(50),
        @DescMaqu NVARCHAR(150),
        @ProdFabr NVARCHAR(100),
        @FechComp SMALLDATETIME,
        @ObseMaqu NVARCHAR(200),
        @UbicMaqu NVARCHAR(50),
        @Existe INT,
        @Success BIT = 1;
BEGIN
    TRY
BEGIN
        TRAN
        -- =========================
        -- LEER JSON
        -- =========================
        SELECT 
            @CodiMaqu = CodiMaqu,
            @MarcMaqu = MarcMaqu,
            @DescMaqu = DescMaqu,
            @ProdFabr = ProdFabr,
            @FechComp = FechComp,
            @ObseMaqu = ObseMaqu,
            @UbicMaqu = UbicMaqu
FROM
    OPENJSON(@json)
        WITH (
            CodiMaqu NVARCHAR(10),
            MarcMaqu NVARCHAR(50),
            DescMaqu NVARCHAR(150),
            ProdFabr NVARCHAR(100),
            FechComp SMALLDATETIME,
            ObseMaqu NVARCHAR(200),
            UbicMaqu NVARCHAR(50)
        );
-- =========================
-- EXISTENCIA (POR EMPRESA)
-- =========================
        SELECT
    @Existe = COUNT(*)
FROM
    Mant.tblmanMaquin
WHERE
    CodiComp = @CodiComp
    AND CodiMaqu = @CodiMaqu;
-- =========================
-- VALIDACIONES (INSERT / UPDATE)
-- =========================
        IF (@Accion = 1)
        BEGIN
            IF (@CodiMaqu IS NULL
    OR LEN(@CodiMaqu) = 0)
                THROW 51000,
'El código de máquina es obligatorio',
1;

IF (@DescMaqu IS NULL
    OR LEN(@DescMaqu) = 0)
                THROW 51000,
'La descripción es obligatoria',
1;

IF (@UbicMaqu IS NULL
    OR LEN(@UbicMaqu) = 0)
                THROW 51000,
'La ubicación es obligatoria',
1;
END
-- =========================
-- ACCION 2: ELIMINAR
-- =========================
        IF (@Accion = 2)
        BEGIN
            IF (@Existe = 0)
                THROW 51000,
'La máquina no existe en esta compañía',
1;

DELETE
FROM
    Mant.tblmanMaquin
WHERE
    CodiComp = @CodiComp
    AND CodiMaqu = @CodiMaqu;

SET
@Messag = '{"success": true, "message": "Máquina eliminada"}';
END
-- =========================
-- ACCION 1: INSERT / UPDATE
-- =========================
ELSE IF (@Accion = 1)
BEGIN
            IF (@Existe > 0)
BEGIN
    -- UPDATE
                UPDATE
    Mant.tblmanMaquin
SET 
                    MarcMaqu = @MarcMaqu,
                    DescMaqu = @DescMaqu,
                    ProdFabr = @ProdFabr,
                    FechComp = @FechComp,
                    ObseMaqu = @ObseMaqu,
                    UbicMaqu = @UbicMaqu
WHERE
    CodiComp = @CodiComp
    AND CodiMaqu = @CodiMaqu;

SET
@Messag = '{"success": true, "message": "Máquina actualizada"}';
END
ELSE
BEGIN
-- INSERT
                INSERT
    INTO
    Mant.tblmanMaquin (
                    CodiComp,
                    CodiMaqu,
                    MarcMaqu,
                    DescMaqu,
                    ProdFabr,
                    FechComp,
                    ObseMaqu,
                    UbicMaqu
                )
VALUES (
                    @CodiComp,
                    @CodiMaqu,
                    @MarcMaqu,
                    @DescMaqu,
                    @ProdFabr,
                    @FechComp,
                    @ObseMaqu,
                    @UbicMaqu
                );

SET
@Messag = '{"success": true, "message": "Máquina creada"}';
END
END

        COMMIT
END TRY
BEGIN
CATCH
        ROLLBACK

        SET
@Success = 0;

SET
@Messag = 
        '{"success": false, "message": "' 
        + REPLACE(ERROR_MESSAGE(), '"', '\"') 
        + '"}';
END CATCH
-- =========================
-- RESPUESTA FINAL
-- =========================
    SELECT 
        @Success AS success,
        @Messag AS message;
END;


CREATE PROCEDURE [Mant].[spSaveOperar]
    @json NVARCHAR(MAX),
    @CodiComp NVARCHAR(4),
    @CodiUsua NVARCHAR(15),
    @Accion SMALLINT,
    @Messag NVARCHAR(200) OUTPUT
AS
BEGIN
    SET
    NOCOUNT ON;
    
    DECLARE
        @IdOper INT,
        @Nombre VARCHAR(50),
        @Telefo VARCHAR(20),
        @Cedula VARCHAR(20),
        @Apellid VARCHAR(50),
        @Cargo VARCHAR(50),
        @Especi VARCHAR(50),
        @Email VARCHAR(100),
        @Activo BIT,
        @Existe INT,
        @Success BIT = 1;
BEGIN
    TRY
BEGIN
        TRAN
        -- =========================
        -- LEER JSON
        -- =========================
        SELECT 
            @IdOper = IdOper,
            @Nombre = Nombre,
            @Telefo = Telefo,
            @Cedula = Cedula,
            @Apellid = Apellid,
            @Cargo = Cargo,
            @Especi = Especi,
            @Email = Email,
            @Activo = Activo
FROM
    OPENJSON(@json)
        WITH (
            IdOper INT,
            Nombre VARCHAR(50),
            Telefo VARCHAR(20),
            Cedula VARCHAR(20),
            Apellid VARCHAR(50),
            Cargo VARCHAR(50),
            Especi VARCHAR(50),
            Email VARCHAR(100),
            Activo BIT
        );
-- =========================
-- EXISTENCIA (POR COMPAÑÍA)
-- =========================
        SELECT
    @Existe = COUNT(*)
FROM
    Mant.tblmanOperar
WHERE
    IdOper = @IdOper
    AND CodiComp = @CodiComp;
-- =========================
-- VALIDACIONES (INSERT / UPDATE)
-- =========================
        IF (@Accion = 1)
        BEGIN
            IF (@Nombre IS NULL
    OR LEN(@Nombre) = 0)
                THROW 51000,
'El nombre es obligatorio',
1;

IF (@Apellid IS NULL
    OR LEN(@Apellid) = 0)
                THROW 51000,
'El apellido es obligatorio',
1;

IF (@Cedula IS NULL
    OR LEN(@Cedula) = 0)
                THROW 51000,
'La cédula es obligatoria',
1;

IF (@Cargo IS NULL
    OR LEN(@Cargo) = 0)
                THROW 51000,
'El cargo es obligatorio',
1;
-- VALIDAR CÉDULA ÚNICA POR COMPAÑÍA
            IF EXISTS (
SELECT
    1
FROM
    Mant.tblmanOperar
WHERE
    Cedula = @Cedula
    AND CodiComp = @CodiComp
    AND (@IdOper IS NULL
        OR IdOper <> @IdOper)
            )
                THROW 51000,
'Ya existe un operario con esa cédula en esta compañía',
1;
END
-- =========================
-- ACCION 2: ELIMINAR
-- =========================
        IF (@Accion = 2)
        BEGIN
            IF (@Existe = 0)
                THROW 51000,
'El operario no existe en esta compañía',
1;

DELETE
FROM
    Mant.tblmanOperar
WHERE
    IdOper = @IdOper
    AND CodiComp = @CodiComp;

SET
@Messag = '{"success": true, "message": "Operario eliminado"}';
END
-- =========================
-- ACCION 1: INSERT / UPDATE
-- =========================
ELSE IF (@Accion = 1)
BEGIN
            IF (@Existe > 0)
BEGIN
    -- UPDATE
                UPDATE
    Mant.tblmanOperar
SET 
                    Nombre = @Nombre,
                    Telefo = @Telefo,
                    Cedula = @Cedula,
                    Apellid = @Apellid,
                    Cargo = @Cargo,
                    Especi = @Especi,
                    Email = @Email,
                    Activo = ISNULL(@Activo, 1)
WHERE
    IdOper = @IdOper
    AND CodiComp = @CodiComp;

SET
@Messag = '{"success": true, "message": "Operario actualizado"}';
END
ELSE
BEGIN
-- INSERT
                INSERT
    INTO
    Mant.tblmanOperar (
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
VALUES (
                    @Nombre,
                    @Telefo,
                    @Cedula,
                    @Apellid,
                    @Cargo,
                    @Especi,
                    @Email,
                    ISNULL(@Activo, 1),
                    @CodiComp
                );

SET
@Messag = '{"success": true, "message": "Operario creado"}';
END
END

        COMMIT
END TRY
BEGIN
CATCH
        ROLLBACK

        SET
@Success = 0;

SET
@Messag = 
        '{"success": false, "message": "' 
        + REPLACE(ERROR_MESSAGE(), '"', '\"') 
        + '"}';
END CATCH
-- =========================
-- RESPUESTA FINAL
-- =========================
    SELECT 
        @Success AS success,
        @Messag AS message;
END;


CREATE PROCEDURE [Mant].[spSaveOrdeMaqu]
    @json NVARCHAR(MAX),
    @CodiComp NVARCHAR(4),
    @CodiUsua NVARCHAR(15),
    @Accion SMALLINT,
    @Messag NVARCHAR(200) OUTPUT
AS
BEGIN
    SET
    NOCOUNT ON;
    
    DECLARE
        @CodiOrdMaqu NVARCHAR(20),
        @CodiMaqu NVARCHAR(10),
        @Fecha_inicio DATETIME,
        @FechaProgramada DATE,
        @TipoMant VARCHAR(20),
        @idMantenimiento INT,
        @fechaFin DATETIME,
        @idOrdeRepu INT,
        @Existe INT,
        @IdEsta INT,
        @Success BIT = 1;

DECLARE @Operarios TABLE (IdOper INT);

DECLARE @Repuestos TABLE (idRepues INT,
cantid INT);
BEGIN
    TRY
BEGIN
        TRAN;

SELECT 
            @CodiOrdMaqu = CodiOrdMaqu,
            @CodiMaqu = CodiMaqu,
            @Fecha_inicio = Fecha_inicio,
            @FechaProgramada = FechaProgramada,
            @TipoMant = TipoMant,
            @idMantenimiento = idMantenimiento,
            @fechaFin = fechaFin
FROM
    OPENJSON(@json)
        WITH (
            CodiOrdMaqu NVARCHAR(20),
            CodiMaqu NVARCHAR(10),
            Fecha_inicio DATETIME,
            FechaProgramada DATE,
            TipoMant VARCHAR(20),
            idMantenimiento INT,
            fechaFin DATETIME
        );

IF (@FechaProgramada IS NULL
    AND @Fecha_inicio IS NOT NULL)
            SET
@FechaProgramada = CAST(@Fecha_inicio AS DATE);

INSERT
    INTO
    @Operarios (IdOper)
        SELECT
    value
FROM
    OPENJSON(@json, '$.Operarios');

INSERT
    INTO
    @Repuestos (idRepues,
    cantid)
        SELECT
    idRepues,
    cantid
FROM
    OPENJSON(@json, '$.Repuestos')
        WITH (
            idRepues INT,
            cantid INT
        );

SELECT
    @Existe = COUNT(*)
FROM
    Mant.tblmanOrdeMaqu
WHERE
    CodiOrdMaqu = @CodiOrdMaqu;

IF (@Existe > 0)
        BEGIN
            SELECT
    @IdEsta = IdEsta,
    @idOrdeRepu = idOrdeRepu
FROM
    Mant.tblmanOrdeMaqu
WHERE
    CodiOrdMaqu = @CodiOrdMaqu;
END

        IF (@Accion IN (1, 3))
        BEGIN
            IF (NULLIF(LTRIM(RTRIM(@CodiOrdMaqu)), '') IS NULL)
                THROW 51000,
'Debe informar el codigo de la orden',
1;

IF (NULLIF(LTRIM(RTRIM(@CodiMaqu)), '') IS NULL)
                THROW 51000,
'Debe informar la maquina',
1;

IF (@Fecha_inicio IS NULL)
                THROW 51000,
'Debe informar la fecha de inicio',
1;

IF (@FechaProgramada IS NULL)
                THROW 51000,
'Debe informar la fecha programada',
1;

IF (@fechaFin IS NOT NULL
    AND @fechaFin < @Fecha_inicio)
                THROW 51000,
'La fecha final no puede ser menor a la fecha de inicio',
1;

IF NOT EXISTS (
SELECT
    1
FROM
    Mant.tblmanMaquin
WHERE
    CodiComp = @CodiComp
    AND CodiMaqu = @CodiMaqu
            )
                THROW 51000,
'La maquina no existe',
1;

IF NOT EXISTS (
SELECT
    1
FROM
    Mant.tblmanManten
WHERE
    idMantenimiento = @idMantenimiento
    AND CodiComp = @CodiComp
    AND CodiMaqu = @CodiMaqu
            )
                THROW 51000,
'El mantenimiento no existe para la maquina indicada',
1;

IF NOT EXISTS (
SELECT
    1
FROM
    Mant.tblmanTipoMant
WHERE
    Nombre = @TipoMant
            )
                THROW 51000,
'El tipo de mantenimiento no existe',
1;

IF NOT EXISTS (
SELECT
    1
FROM
    @Operarios)
                THROW 51000,
'Debe asignar al menos un operario',
1;

IF EXISTS (
SELECT
    1
FROM
    @Operarios o
LEFT JOIN Mant.tblmanOperar op ON
    o.IdOper = op.IdOper
WHERE
    op.IdOper IS NULL
            )
                THROW 51000,
'Operarios invalidos',
1;

IF NOT EXISTS (
SELECT
    1
FROM
    @Repuestos)
                THROW 51000,
'Debe asignar al menos un repuesto',
1;

IF EXISTS (
SELECT
    1
FROM
    @Repuestos r
LEFT JOIN Mant.tblmanRepues rp ON
    r.idRepues = rp.idRepuesto
WHERE
    rp.idRepuesto IS NULL
            )
                THROW 51000,
'Repuestos invalidos',
1;

IF EXISTS (
SELECT
    1
FROM
    @Repuestos
WHERE
    cantid IS NULL
    OR cantid <= 0
            )
                THROW 51000,
'La cantidad de repuestos debe ser mayor a cero',
1;

IF EXISTS (
SELECT
    1
FROM
    @Repuestos r
JOIN Mant.tblmanRepues rp ON
    r.idRepues = rp.idRepuesto
WHERE
    rp.Cantid < r.cantid
            )
                THROW 51000,
'Stock insuficiente',
1;
END

        IF (@Accion = 1)
        BEGIN
            IF (@Existe > 0)
                THROW 51000,
'La orden ya existe',
1;

IF EXISTS (
SELECT
    1
FROM
    Mant.tblmanOrdeMaqu
WHERE
    idMantenimiento = @idMantenimiento
    AND FechaProgramada = @FechaProgramada
    AND IdEsta <> 5
            )
                THROW 51000,
'Ya existe una orden para ese mantenimiento en esa fecha programada',
1;

INSERT
    INTO
    Mant.tblmanOrdeRepu DEFAULT
VALUES;

SET
@idOrdeRepu = SCOPE_IDENTITY();

INSERT
    INTO
    Mant.tblmanOrdeRepuDet (idOrdeRepu,
    idRepues,
    cantid)
            SELECT
    @idOrdeRepu,
    idRepues,
    cantid
FROM
    @Repuestos;

UPDATE
    rp
SET
    rp.Cantid = rp.Cantid - r.cantid
FROM
    Mant.tblmanRepues rp
JOIN @Repuestos r ON
    rp.idRepuesto = r.idRepues;

INSERT
    INTO
    Mant.tblmanOrdeMaqu (
                CodiOrdMaqu,
    CodiComp,
    CodiMaqu,
                Fecha_inicio,
    FechaProgramada,
    TipoMant,
                idMantenimiento,
    fechaFin,
                idOrdeRepu,
    IdEsta
            )
VALUES (
                @CodiOrdMaqu,
@CodiComp,
@CodiMaqu,
                @Fecha_inicio,
@FechaProgramada,
@TipoMant,
                @idMantenimiento,
@fechaFin,
                @idOrdeRepu,
1
            );

INSERT
    INTO
    Mant.tblmanOrdeOper (CodiOrdMaqu,
    IdOper)
            SELECT
    @CodiOrdMaqu,
    IdOper
FROM
    @Operarios;

SET
@Messag = '{"success": true, "message": "Orden creada"}';
END
ELSE IF (@Accion = 2)
        BEGIN
            IF (@Existe = 0)
                THROW 51000,
'La orden no existe',
1;

IF (@IdEsta NOT IN (1, 5))
                THROW 51000,
'Solo se puede eliminar creada o cancelada',
1;

UPDATE
    rp
SET
    rp.Cantid = rp.Cantid + d.cantid
FROM
    Mant.tblmanRepues rp
JOIN Mant.tblmanOrdeRepuDet d ON
    rp.idRepuesto = d.idRepues
WHERE
    d.idOrdeRepu = @idOrdeRepu;

DELETE
FROM
    Mant.tblmanOrdeRepuDet
WHERE
    idOrdeRepu = @idOrdeRepu;

DELETE
FROM
    Mant.tblmanOrdeOper
WHERE
    CodiOrdMaqu = @CodiOrdMaqu;

DELETE
FROM
    Mant.tblmanOrdeMaqu
WHERE
    CodiOrdMaqu = @CodiOrdMaqu;

DELETE
FROM
    Mant.tblmanOrdeRepu
WHERE
    idOrdeRepu = @idOrdeRepu;

SET
@Messag = '{"success": true, "message": "Orden eliminada"}';
END
ELSE IF (@Accion = 3)
BEGIN
            IF (@Existe = 0)
                THROW 51000,
'La orden no existe',
1;

IF (@IdEsta NOT IN (1, 3))
                THROW 51000,
'Solo se puede editar creada o pausada',
1;

IF EXISTS (
SELECT
    1
FROM
    Mant.tblmanOrdeMaqu
WHERE
    idMantenimiento = @idMantenimiento
    AND FechaProgramada = @FechaProgramada
    AND CodiOrdMaqu <> @CodiOrdMaqu
    AND IdEsta <> 5
            )
                THROW 51000,
'Ya existe otra orden para ese mantenimiento en esa fecha programada',
1;

UPDATE
    rp
SET
    rp.Cantid = rp.Cantid + d.cantid
FROM
    Mant.tblmanRepues rp
JOIN Mant.tblmanOrdeRepuDet d ON
    rp.idRepuesto = d.idRepues
WHERE
    d.idOrdeRepu = @idOrdeRepu;

DELETE
FROM
    Mant.tblmanOrdeRepuDet
WHERE
    idOrdeRepu = @idOrdeRepu;

INSERT
    INTO
    Mant.tblmanOrdeRepuDet (idOrdeRepu,
    idRepues,
    cantid)
            SELECT
    @idOrdeRepu,
    idRepues,
    cantid
FROM
    @Repuestos;

UPDATE
    rp
SET
    rp.Cantid = rp.Cantid - r.cantid
FROM
    Mant.tblmanRepues rp
JOIN @Repuestos r ON
    rp.idRepuesto = r.idRepues;

UPDATE
    Mant.tblmanOrdeMaqu
SET
    CodiMaqu = @CodiMaqu,
                Fecha_inicio = @Fecha_inicio,
                FechaProgramada = @FechaProgramada,
                TipoMant = @TipoMant,
                idMantenimiento = @idMantenimiento,
                fechaFin = @fechaFin
WHERE
    CodiOrdMaqu = @CodiOrdMaqu;

DELETE
FROM
    Mant.tblmanOrdeOper
WHERE
    CodiOrdMaqu = @CodiOrdMaqu;

INSERT
    INTO
    Mant.tblmanOrdeOper (CodiOrdMaqu,
    IdOper)
            SELECT
    @CodiOrdMaqu,
    IdOper
FROM
    @Operarios;

SET
@Messag = '{"success": true, "message": "Orden actualizada"}';
END
ELSE IF (@Accion = 4)
        BEGIN
            IF (@Existe = 0)
                THROW 51000,
'La orden no existe',
1;

IF (@IdEsta <> 2)
                THROW 51000,
'Solo se puede pausar activa',
1;

UPDATE
    Mant.tblmanOrdeMaqu
SET
    IdEsta = 3
WHERE
    CodiOrdMaqu = @CodiOrdMaqu;

SET
@Messag = '{"success": true, "message": "Orden pausada"}';
END
ELSE IF (@Accion = 5)
BEGIN
            IF (@Existe = 0)
                THROW 51000,
'La orden no existe',
1;

IF (@IdEsta = 4)
                THROW 51000,
'No se puede cancelar finalizada',
1;

UPDATE
    Mant.tblmanOrdeMaqu
SET
    IdEsta = 5
WHERE
    CodiOrdMaqu = @CodiOrdMaqu;

SET
@Messag = '{"success": true, "message": "Orden cancelada"}';
END
ELSE IF (@Accion = 6)
BEGIN
            IF (@Existe = 0)
                THROW 51000,
'La orden no existe',
1;

IF (@IdEsta <> 2)
                THROW 51000,
'Solo se puede finalizar activa',
1;

UPDATE
    Mant.tblmanOrdeMaqu
SET
    IdEsta = 4,
                fechaFin = ISNULL(@fechaFin, GETDATE())
WHERE
    CodiOrdMaqu = @CodiOrdMaqu;

SET
@Messag = '{"success": true, "message": "Orden finalizada"}';
END
ELSE IF (@Accion = 7)
BEGIN
            IF (@Existe = 0)
                THROW 51000,
'La orden no existe',
1;

IF (@IdEsta NOT IN (1, 3))
                THROW 51000,
'Solo se puede activar creada o pausada',
1;

UPDATE
    Mant.tblmanOrdeMaqu
SET
    IdEsta = 2
WHERE
    CodiOrdMaqu = @CodiOrdMaqu;

SET
@Messag = '{"success": true, "message": "Orden activada"}';
END
ELSE
BEGIN
            THROW 51000,
'Accion no valida',
1;
END

        COMMIT;
END TRY
BEGIN
CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;

SET
@Success = 0;

SET
@Messag = '{"success": false, "message": "' + REPLACE(ERROR_MESSAGE(), '"', '\"') + '"}';
END CATCH

    SELECT
    @Success AS success,
    @Messag AS message;
END;


CREATE PROCEDURE [Mant].[spSavePartMaqu]
    @json NVARCHAR(MAX),
    @CodiComp NVARCHAR(4),
    @CodiUsua NVARCHAR(15),
    @Accion SMALLINT,
    @Messag NVARCHAR(200) OUTPUT
AS
BEGIN
    SET
    NOCOUNT ON;
    
    DECLARE
        @CodiPart NVARCHAR(20),
        @NombreParte NVARCHAR(100),
        @IdTipoPart INT,
        @CodiMaqu NVARCHAR(10),
        @Existe INT,
        @Success BIT = 1;
BEGIN
    TRY
BEGIN
        TRAN
        -- =========================
        -- LEER JSON
        -- =========================
        SELECT 
            @CodiPart = CodiPart,
            @NombreParte = NombreParte,
            @IdTipoPart = IdTipoPart,
            @CodiMaqu = CodiMaqu
FROM
    OPENJSON(@json)
        WITH (
            CodiPart NVARCHAR(20),
            NombreParte NVARCHAR(100),
            IdTipoPart INT,
            CodiMaqu NVARCHAR(10)
        );
-- =========================
-- VALIDAR MAQUINA
-- =========================
        IF NOT EXISTS (
SELECT
    1
FROM
    Mant.tblmanMaquin
WHERE
    CodiComp = @CodiComp
    AND CodiMaqu = @CodiMaqu
        )
            THROW 51000,
'La máquina no existe',
1;
-- =========================
-- EXISTENCIA (POR COMPAÑIA)
-- =========================
        SELECT
    @Existe = COUNT(*)
FROM
    Mant.tblmanPartMaqu
WHERE
    CodiPart = @CodiPart
    AND CodiComp = @CodiComp;
-- =========================
-- VALIDACIONES INSERT / UPDATE
-- =========================
        IF (@Accion = 1)
        BEGIN
            IF (@NombreParte IS NULL
    OR LEN(@NombreParte) = 0)
                THROW 51000,
'El nombre de la parte es obligatorio',
1;

IF (@CodiPart IS NULL
    OR LEN(@CodiPart) = 0)
                THROW 51000,
'El código de la parte es obligatorio',
1;

IF (@IdTipoPart IS NOT NULL)
            BEGIN
                IF NOT EXISTS (
SELECT
    1
FROM
    Mant.tblmanTipoPart
WHERE
    Id = @IdTipoPart
                )
                    THROW 51000,
'El tipo de parte no existe',
1;
END
END
-- =========================
-- ACCION 2: ELIMINAR
-- =========================
        IF (@Accion = 2)
        BEGIN
            IF (@Existe = 0)
                THROW 51000,
'La parte no existe en esta compañía',
1;

DELETE
FROM
    Mant.tblmanPartMaqu
WHERE
    CodiPart = @CodiPart
    AND CodiComp = @CodiComp;

SET
@Messag = '{"success": true, "message": "Parte eliminada"}';
END
-- =========================
-- ACCION 1: INSERT / UPDATE
-- =========================
ELSE IF (@Accion = 1)
BEGIN
            IF (@Existe > 0)
BEGIN
    -- UPDATE
                UPDATE
    Mant.tblmanPartMaqu
SET 
                    NombreParte = @NombreParte,
                    IdTipoPart = @IdTipoPart,
                    CodiMaqu = @CodiMaqu
WHERE
    CodiPart = @CodiPart
    AND CodiComp = @CodiComp;

SET
@Messag = '{"success": true, "message": "Parte actualizada"}';
END
ELSE
BEGIN
-- INSERT
                INSERT
    INTO
    Mant.tblmanPartMaqu (
                    CodiPart,
                    NombreParte,
                    IdTipoPart,
                    CodiComp,
                    CodiMaqu
                )
VALUES (
                    @CodiPart,
                    @NombreParte,
                    @IdTipoPart,
                    @CodiComp,
                    @CodiMaqu
                );

SET
@Messag = '{"success": true, "message": "Parte creada"}';
END
END

        COMMIT
END TRY
BEGIN
CATCH
        ROLLBACK

        SET
@Success = 0;

SET
@Messag = 
        '{"success": false, "message": "' 
        + REPLACE(ERROR_MESSAGE(), '"', '\"') 
        + '"}';
END CATCH
-- =========================
-- RESPUESTA FINAL
-- =========================
    SELECT 
        @Success AS success,
        @Messag AS message;
END;


CREATE PROCEDURE [Mant].[spSaveProgMant]
    @json NVARCHAR(MAX),
    @CodiComp NVARCHAR(4),
    @CodiUsua NVARCHAR(15),
    @Accion SMALLINT,
    @Messag NVARCHAR(200) OUTPUT
AS
BEGIN
    SET
    NOCOUNT ON;
    
    DECLARE
        @IdProgMant INT,
        @idMant INT,
        @FechInic DATE,
        @FrecDias INT,
        @UltiFech DATE,
        @ProxFech DATE,
        @Activo BIT,
        @Existe INT,
        @Success BIT = 1;
BEGIN
    TRY
BEGIN
        TRAN;

SELECT
            @IdProgMant = IdProgMant,
            @idMant = idMant,
            @FechInic = FechInic,
            @FrecDias = FrecDias,
            @UltiFech = UltiFech,
            @ProxFech = ProxFech,
            @Activo = ISNULL(Activo, 1)
FROM
    OPENJSON(@json)
        WITH (
            IdProgMant INT,
            idMant INT,
            FechInic DATE,
            FrecDias INT,
            UltiFech DATE,
            ProxFech DATE,
            Activo BIT
        );

SELECT
    @Existe = COUNT(*)
FROM
    Mant.tblmanProgMant PM
INNER JOIN Mant.tblmanManten M
            ON
    M.idMantenimiento = PM.idMant
WHERE
    PM.IdProgMant = ISNULL(@IdProgMant, 0)
    AND M.CodiComp = @CodiComp;

IF (@Accion IN (1, 3))
        BEGIN
            IF (@idMant IS NULL
    OR @idMant <= 0)
                THROW 51000,
'Debe informar el mantenimiento',
1;

IF NOT EXISTS (
SELECT
    1
FROM
    Mant.tblmanManten
WHERE
    idMantenimiento = @idMant
    AND CodiComp = @CodiComp
            )
                THROW 51000,
'El mantenimiento no existe para la compañia indicada',
1;

IF (@FechInic IS NULL)
                THROW 51000,
'Debe informar la fecha inicial',
1;

IF (@FrecDias IS NULL
    OR @FrecDias <= 0)
                THROW 51000,
'La frecuencia en dias debe ser mayor a cero',
1;

IF (@ProxFech IS NULL)
                THROW 51000,
'Debe informar la proxima fecha',
1;

IF (@ProxFech < @FechInic)
                THROW 51000,
'La proxima fecha no puede ser menor a la fecha inicial',
1;

IF (@UltiFech IS NOT NULL
    AND @UltiFech < @FechInic)
                THROW 51000,
'La ultima fecha no puede ser menor a la fecha inicial',
1;
END

        IF (@Accion = 1)
        BEGIN
            IF EXISTS (
SELECT
1
FROM
Mant.tblmanProgMant
WHERE
idMant = @idMant
            )
                THROW 51000,
'El mantenimiento ya tiene una programacion registrada',
1;

INSERT
    INTO
    Mant.tblmanProgMant (
                idMant,
                FechInic,
                FrecDias,
                UltiFech,
                ProxFech,
                Activo
            )
VALUES (
                @idMant,
                @FechInic,
                @FrecDias,
                @UltiFech,
                @ProxFech,
                @Activo
            );

SET
@Messag = '{"success": true, "message": "Programacion de mantenimiento creada"}';
END
ELSE IF (@Accion = 2)
BEGIN
            IF (@Existe = 0)
                THROW 51000,
'La programacion de mantenimiento no existe',
1;

DELETE
FROM
    Mant.tblmanProgMant
WHERE
    IdProgMant = @IdProgMant;

SET
@Messag = '{"success": true, "message": "Programacion de mantenimiento eliminada"}';
END
ELSE IF (@Accion = 3)
BEGIN
            IF (@Existe = 0)
                THROW 51000,
'La programacion de mantenimiento no existe',
1;

IF EXISTS (
SELECT
    1
FROM
    Mant.tblmanProgMant
WHERE
    idMant = @idMant
    AND IdProgMant <> @IdProgMant
            )
                THROW 51000,
'Ya existe otra programacion para ese mantenimiento',
1;

UPDATE
    Mant.tblmanProgMant
SET
    idMant = @idMant,
                FechInic = @FechInic,
                FrecDias = @FrecDias,
                UltiFech = @UltiFech,
                ProxFech = @ProxFech,
                Activo = @Activo
WHERE
    IdProgMant = @IdProgMant;

SET
@Messag = '{"success": true, "message": "Programacion de mantenimiento actualizada"}';
END
ELSE
BEGIN
            THROW 51000,
'Accion no valida',
1;
END

        COMMIT;
END TRY
BEGIN
CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;

SET
@Success = 0;

SET
@Messag = '{"success": false, "message": "' + REPLACE(ERROR_MESSAGE(), '"', '\"') + '"}';
END CATCH

    SELECT
    @Success AS success,
    @Messag AS message;
END;


CREATE OR ALTER PROCEDURE [Mant].[spSaveRepues]
    @json NVARCHAR(MAX),
    @CodiComp NVARCHAR(4),
    @CodiUsua NVARCHAR(15),
    @Accion SMALLINT,
    @Messag NVARCHAR(200) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE
        @idRepuesto INT,
        @Cantid INT,
        @CodiPart NVARCHAR(20),
        @Existe INT,
        @Success BIT = 1;

    BEGIN TRY
        BEGIN TRAN;

        SELECT
            @idRepuesto = idRepuesto,
            @Cantid = Cantid,
            @CodiPart = CodiPart
        FROM OPENJSON(@json)
        WITH (
            idRepuesto INT,
            Cantid INT,
            CodiPart NVARCHAR(20)
        );

        SELECT
            @Existe = COUNT(*)
        FROM Mant.tblmanRepues R
        INNER JOIN Mant.tblmanPartMaqu P
            ON P.CodiPart = R.CodiPart
        WHERE R.idRepuesto = ISNULL(@idRepuesto, 0)
          AND P.CodiComp = @CodiComp;

        IF (@Accion IN (1, 3))
        BEGIN
            IF (@idRepuesto IS NULL OR @idRepuesto <= 0)
                THROW 51000, 'Debe informar el id del repuesto', 1;

            IF (NULLIF(LTRIM(RTRIM(@CodiPart)), '') IS NULL)
                THROW 51000, 'Debe informar el codigo de la parte', 1;

            IF (@Cantid IS NULL OR @Cantid <= 0)
                THROW 51000, 'La cantidad debe ser mayor a cero', 1;

            IF NOT EXISTS (
                SELECT 1
                FROM Mant.tblmanPartMaqu
                WHERE CodiPart = @CodiPart
                  AND CodiComp = @CodiComp
            )
                THROW 51000, 'La parte no existe en esta compañía', 1;
        END

        IF (@Accion = 1)
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM Mant.tblmanRepues
                WHERE idRepuesto = @idRepuesto
            )
                THROW 51000, 'El repuesto ya existe', 1;

            INSERT INTO Mant.tblmanRepues (
                idRepuesto,
                Cantid,
                CodiPart
            )
            VALUES (
                @idRepuesto,
                @Cantid,
                @CodiPart
            );

            SET @Messag = '{"success": true, "message": "Repuesto creado"}';
        END
        ELSE IF (@Accion = 2)
        BEGIN
            IF (@Existe = 0)
                THROW 51000, 'El repuesto no existe en esta compañía', 1;

            DELETE R
            FROM Mant.tblmanRepues R
            INNER JOIN Mant.tblmanPartMaqu P
                ON P.CodiPart = R.CodiPart
            WHERE R.idRepuesto = @idRepuesto
              AND P.CodiComp = @CodiComp;

            SET @Messag = '{"success": true, "message": "Repuesto eliminado"}';
        END
        ELSE IF (@Accion = 3)
        BEGIN
            IF (@Existe = 0)
                THROW 51000, 'El repuesto no existe en esta compañía', 1;

            UPDATE R
            SET
                R.Cantid = @Cantid,
                R.CodiPart = @CodiPart
            FROM Mant.tblmanRepues R
            INNER JOIN Mant.tblmanPartMaqu P
                ON P.CodiPart = R.CodiPart
            WHERE R.idRepuesto = @idRepuesto
              AND P.CodiComp = @CodiComp;

            SET @Messag = '{"success": true, "message": "Repuesto actualizado"}';
        END
        ELSE
        BEGIN
            THROW 51000, 'Accion no valida', 1;
        END

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;

        SET @Success = 0;
        SET @Messag = '{"success": false, "message": "' + REPLACE(ERROR_MESSAGE(), '"', '\"') + '"}';
    END CATCH

    SELECT
        @Success AS success,
        @Messag AS message;
END;