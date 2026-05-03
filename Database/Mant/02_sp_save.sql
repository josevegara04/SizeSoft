SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [Mant].[spSaveCausMant]
    @json NVARCHAR(MAX),
    @CodiComp NVARCHAR(4),
    @CodiUsua NVARCHAR(15),
    @Accion SMALLINT,
    @Messag NVARCHAR(200) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE
        @IdCausMant INT,
        @CodiCaus NVARCHAR(20),
        @NombCaus VARCHAR(100),
        @Descri VARCHAR(255),
        @TipoMant VARCHAR(20),
        @Activo BIT,
        @Existe INT,
        @Success BIT = 1;

    BEGIN TRY
        BEGIN TRAN;

        SELECT
            @IdCausMant = IdCausMant,
            @CodiCaus = CodiCaus,
            @NombCaus = NombCaus,
            @Descri = Descri,
            @TipoMant = TipoMant,
            @Activo = ISNULL(Activo, 1)
        FROM OPENJSON(@json)
        WITH (
            IdCausMant INT,
            CodiCaus NVARCHAR(20),
            NombCaus VARCHAR(100),
            Descri VARCHAR(255),
            TipoMant VARCHAR(20),
            Activo BIT
        );

        SELECT @Existe = COUNT(*)
        FROM Mant.tblmanCausMant
        WHERE IdCausMant = ISNULL(@IdCausMant, 0)
          AND CodiComp = @CodiComp;

        IF (@Accion IN (1, 3))
        BEGIN
            IF (NULLIF(LTRIM(RTRIM(@CodiCaus)), '') IS NULL)
                THROW 51000, 'Debe informar el codigo de la causa', 1;

            IF (NULLIF(LTRIM(RTRIM(@NombCaus)), '') IS NULL)
                THROW 51000, 'Debe informar el nombre de la causa', 1;

            IF (@TipoMant IS NOT NULL AND NOT EXISTS (
                SELECT 1
                FROM Mant.tblmanTipoMant
                WHERE Nombre = @TipoMant
            ))
                THROW 51000, 'El tipo de mantenimiento no existe', 1;
        END

        IF (@Accion = 1)
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM Mant.tblmanCausMant
                WHERE CodiComp = @CodiComp
                  AND CodiCaus = @CodiCaus
            )
                THROW 51000, 'La causa ya existe', 1;

            INSERT INTO Mant.tblmanCausMant (
                CodiComp, CodiCaus, NombCaus, Descri, TipoMant, Activo
            )
            VALUES (
                @CodiComp, @CodiCaus, @NombCaus, @Descri, @TipoMant, @Activo
            );

            SET @Messag = '{"success": true, "message": "Causa creada"}';
        END
        ELSE IF (@Accion = 2)
        BEGIN
            IF (@Existe = 0)
                THROW 51000, 'La causa no existe', 1;

            DELETE FROM Mant.tblmanCausMant
            WHERE IdCausMant = @IdCausMant
              AND CodiComp = @CodiComp;

            SET @Messag = '{"success": true, "message": "Causa eliminada"}';
        END
        ELSE IF (@Accion = 3)
        BEGIN
            IF (@Existe = 0)
                THROW 51000, 'La causa no existe', 1;

            IF EXISTS (
                SELECT 1
                FROM Mant.tblmanCausMant
                WHERE CodiComp = @CodiComp
                  AND CodiCaus = @CodiCaus
                  AND IdCausMant <> @IdCausMant
            )
                THROW 51000, 'Ya existe otra causa con ese codigo', 1;

            UPDATE Mant.tblmanCausMant
            SET CodiCaus = @CodiCaus,
                NombCaus = @NombCaus,
                Descri = @Descri,
                TipoMant = @TipoMant,
                Activo = @Activo
            WHERE IdCausMant = @IdCausMant
              AND CodiComp = @CodiComp;

            SET @Messag = '{"success": true, "message": "Causa actualizada"}';
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

    SELECT @Success AS success, @Messag AS message;
END
GO

CREATE OR ALTER PROCEDURE [Mant].[spSaveActiMant]
    @json NVARCHAR(MAX),
    @CodiComp NVARCHAR(4),
    @CodiUsua NVARCHAR(15),
    @Accion SMALLINT,
    @Messag NVARCHAR(200) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE
        @IdActiMant INT,
        @CodiActi NVARCHAR(20),
        @NombActi VARCHAR(100),
        @Descri VARCHAR(255),
        @TipoMant VARCHAR(20),
        @Activo BIT,
        @Existe INT,
        @Success BIT = 1;

    BEGIN TRY
        BEGIN TRAN;

        SELECT
            @IdActiMant = IdActiMant,
            @CodiActi = CodiActi,
            @NombActi = NombActi,
            @Descri = Descri,
            @TipoMant = TipoMant,
            @Activo = ISNULL(Activo, 1)
        FROM OPENJSON(@json)
        WITH (
            IdActiMant INT,
            CodiActi NVARCHAR(20),
            NombActi VARCHAR(100),
            Descri VARCHAR(255),
            TipoMant VARCHAR(20),
            Activo BIT
        );

        SELECT @Existe = COUNT(*)
        FROM Mant.tblmanActiMant
        WHERE IdActiMant = ISNULL(@IdActiMant, 0)
          AND CodiComp = @CodiComp;

        IF (@Accion IN (1, 3))
        BEGIN
            IF (NULLIF(LTRIM(RTRIM(@CodiActi)), '') IS NULL)
                THROW 51000, 'Debe informar el codigo de la actividad', 1;

            IF (NULLIF(LTRIM(RTRIM(@NombActi)), '') IS NULL)
                THROW 51000, 'Debe informar el nombre de la actividad', 1;

            IF (@TipoMant IS NOT NULL AND NOT EXISTS (
                SELECT 1
                FROM Mant.tblmanTipoMant
                WHERE Nombre = @TipoMant
            ))
                THROW 51000, 'El tipo de mantenimiento no existe', 1;
        END

        IF (@Accion = 1)
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM Mant.tblmanActiMant
                WHERE CodiComp = @CodiComp
                  AND CodiActi = @CodiActi
            )
                THROW 51000, 'La actividad ya existe', 1;

            INSERT INTO Mant.tblmanActiMant (
                CodiComp, CodiActi, NombActi, Descri, TipoMant, Activo
            )
            VALUES (
                @CodiComp, @CodiActi, @NombActi, @Descri, @TipoMant, @Activo
            );

            SET @Messag = '{"success": true, "message": "Actividad creada"}';
        END
        ELSE IF (@Accion = 2)
        BEGIN
            IF (@Existe = 0)
                THROW 51000, 'La actividad no existe', 1;

            DELETE FROM Mant.tblmanActiMant
            WHERE IdActiMant = @IdActiMant
              AND CodiComp = @CodiComp;

            SET @Messag = '{"success": true, "message": "Actividad eliminada"}';
        END
        ELSE IF (@Accion = 3)
        BEGIN
            IF (@Existe = 0)
                THROW 51000, 'La actividad no existe', 1;

            IF EXISTS (
                SELECT 1
                FROM Mant.tblmanActiMant
                WHERE CodiComp = @CodiComp
                  AND CodiActi = @CodiActi
                  AND IdActiMant <> @IdActiMant
            )
                THROW 51000, 'Ya existe otra actividad con ese codigo', 1;

            UPDATE Mant.tblmanActiMant
            SET CodiActi = @CodiActi,
                NombActi = @NombActi,
                Descri = @Descri,
                TipoMant = @TipoMant,
                Activo = @Activo
            WHERE IdActiMant = @IdActiMant
              AND CodiComp = @CodiComp;

            SET @Messag = '{"success": true, "message": "Actividad actualizada"}';
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

    SELECT @Success AS success, @Messag AS message;
END
GO

CREATE OR ALTER PROCEDURE [Mant].[spSaveMantActiDeta]
    @json NVARCHAR(MAX),
    @CodiComp NVARCHAR(4),
    @CodiUsua NVARCHAR(15),
    @Accion SMALLINT,
    @Messag NVARCHAR(200) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE
        @idMantenimiento INT,
        @ExisteMant INT,
        @Success BIT = 1;

    DECLARE @Actividades TABLE (
        IdActiMant INT,
        Orden INT,
        TiempoMin INT NULL,
        Obligatoria BIT NOT NULL,
        Activo BIT NOT NULL
    );

    BEGIN TRY
        BEGIN TRAN;

        SELECT
            @idMantenimiento = idMantenimiento
        FROM OPENJSON(@json)
        WITH (
            idMantenimiento INT
        );

        INSERT INTO @Actividades (IdActiMant, Orden, TiempoMin, Obligatoria, Activo)
        SELECT
            IdActiMant,
            Orden,
            TiempoMin,
            ISNULL(Obligatoria, 1),
            ISNULL(Activo, 1)
        FROM OPENJSON(@json, '$.Actividades')
        WITH (
            IdActiMant INT,
            Orden INT,
            TiempoMin INT,
            Obligatoria BIT,
            Activo BIT
        );

        SELECT @ExisteMant = COUNT(*)
        FROM Mant.tblmanManten
        WHERE idMantenimiento = ISNULL(@idMantenimiento, 0)
          AND CodiComp = @CodiComp;

        IF (@idMantenimiento IS NULL OR @idMantenimiento = 0)
            THROW 51000, 'Debe informar el mantenimiento', 1;

        IF (@ExisteMant = 0)
            THROW 51000, 'El mantenimiento no existe', 1;

        IF (@Accion IN (1, 3))
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM @Actividades)
                THROW 51000, 'Debe asignar al menos una actividad', 1;

            IF EXISTS (
                SELECT 1
                FROM @Actividades a
                LEFT JOIN Mant.tblmanActiMant am
                    ON a.IdActiMant = am.IdActiMant
                   AND am.CodiComp = @CodiComp
                WHERE am.IdActiMant IS NULL
            )
                THROW 51000, 'Una o mas actividades no existen', 1;

            IF EXISTS (
                SELECT 1 FROM @Actividades WHERE Orden IS NULL OR Orden <= 0
            )
                THROW 51000, 'Debe informar el orden de cada actividad', 1;

            DELETE FROM Mant.tblmanMantActiDeta
            WHERE idMantenimiento = @idMantenimiento;

            INSERT INTO Mant.tblmanMantActiDeta (
                idMantenimiento, IdActiMant, Orden, TiempoMin, Obligatoria, Activo
            )
            SELECT
                @idMantenimiento, IdActiMant, Orden, TiempoMin, Obligatoria, Activo
            FROM @Actividades;

            SET @Messag = '{"success": true, "message": "Actividades asignadas al mantenimiento"}';
        END
        ELSE IF (@Accion = 2)
        BEGIN
            DELETE FROM Mant.tblmanMantActiDeta
            WHERE idMantenimiento = @idMantenimiento;

            SET @Messag = '{"success": true, "message": "Actividades eliminadas del mantenimiento"}';
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

    SELECT @Success AS success, @Messag AS message;
END
GO

CREATE OR ALTER PROCEDURE [Mant].[spSaveCritic]
    @json NVARCHAR(MAX),
    @CodiComp NVARCHAR(4),
    @CodiUsua NVARCHAR(15),
    @Accion SMALLINT,
    @Messag NVARCHAR(200) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE
        @IdCritic INT,
        @Nombre VARCHAR(50),
        @Descri VARCHAR(150),
        @Prioridad TINYINT,
        @Activo BIT,
        @Existe INT,
        @Success BIT = 1;

    BEGIN TRY
        BEGIN TRAN;

        SELECT
            @IdCritic = IdCritic,
            @Nombre = Nombre,
            @Descri = Descri,
            @Prioridad = Prioridad,
            @Activo = ISNULL(Activo, 1)
        FROM OPENJSON(@json)
        WITH (
            IdCritic INT,
            Nombre VARCHAR(50),
            Descri VARCHAR(150),
            Prioridad TINYINT,
            Activo BIT
        );

        SELECT @Existe = COUNT(*)
        FROM Mant.tblmanCritic
        WHERE IdCritic = ISNULL(@IdCritic, 0);

        IF (@Accion IN (1, 3))
        BEGIN
            IF (NULLIF(LTRIM(RTRIM(@Nombre)), '') IS NULL)
                THROW 51000, 'Debe informar el nombre de la criticidad', 1;

            IF (@Prioridad IS NULL OR @Prioridad = 0)
                THROW 51000, 'Debe informar la prioridad', 1;
        END

        IF (@Accion = 1)
        BEGIN
            IF EXISTS (SELECT 1 FROM Mant.tblmanCritic WHERE Nombre = @Nombre)
                THROW 51000, 'La criticidad ya existe', 1;

            INSERT INTO Mant.tblmanCritic (Nombre, Descri, Prioridad, Activo)
            VALUES (@Nombre, @Descri, @Prioridad, @Activo);

            SET @Messag = '{"success": true, "message": "Criticidad creada"}';
        END
        ELSE IF (@Accion = 2)
        BEGIN
            IF (@Existe = 0)
                THROW 51000, 'La criticidad no existe', 1;

            DELETE FROM Mant.tblmanCritic
            WHERE IdCritic = @IdCritic;

            SET @Messag = '{"success": true, "message": "Criticidad eliminada"}';
        END
        ELSE IF (@Accion = 3)
        BEGIN
            IF (@Existe = 0)
                THROW 51000, 'La criticidad no existe', 1;

            IF EXISTS (
                SELECT 1
                FROM Mant.tblmanCritic
                WHERE Nombre = @Nombre
                  AND IdCritic <> @IdCritic
            )
                THROW 51000, 'Ya existe otra criticidad con ese nombre', 1;

            UPDATE Mant.tblmanCritic
            SET Nombre = @Nombre,
                Descri = @Descri,
                Prioridad = @Prioridad,
                Activo = @Activo
            WHERE IdCritic = @IdCritic;

            SET @Messag = '{"success": true, "message": "Criticidad actualizada"}';
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

    SELECT @Success AS success, @Messag AS message;
END
GO
