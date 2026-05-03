IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'Mant')
BEGIN
    EXEC('CREATE SCHEMA Mant');
END
GO

-- Tablas nuevas que vamos a trabajar de momento:
-- CausMant, ActiMant, MantActiDeta y Critic.
-- Se reutilizan las tablas existentes tblmanTipoMant y tblmanManten.

IF OBJECT_ID('Mant.tblmanCausMant', 'U') IS NULL
BEGIN
    CREATE TABLE Mant.tblmanCausMant (
        IdCausMant INT IDENTITY(1,1) NOT NULL,
        CodiComp NVARCHAR(4) COLLATE Modern_Spanish_CI_AS NOT NULL,
        CodiCaus NVARCHAR(20) COLLATE Modern_Spanish_CI_AS NOT NULL,
        NombCaus VARCHAR(100) COLLATE Modern_Spanish_CI_AS NOT NULL,
        Descri VARCHAR(255) COLLATE Modern_Spanish_CI_AS NULL,
        TipoMant VARCHAR(20) COLLATE Modern_Spanish_CI_AS NULL,
        Activo BIT NOT NULL CONSTRAINT DF_tblmanCausMant_Activo DEFAULT (1),
        CONSTRAINT PK_tblmanCausMant PRIMARY KEY (IdCausMant),
        CONSTRAINT UQ_tblmanCausMant_CodiComp_CodiCaus UNIQUE (CodiComp, CodiCaus),
        CONSTRAINT FK_tblmanCausMant_TipoMant
            FOREIGN KEY (TipoMant) REFERENCES Mant.tblmanTipoMant (Nombre)
    );
END
GO

IF OBJECT_ID('Mant.tblmanActiMant', 'U') IS NULL
BEGIN
    CREATE TABLE Mant.tblmanActiMant (
        IdActiMant INT IDENTITY(1,1) NOT NULL,
        CodiComp NVARCHAR(4) COLLATE Modern_Spanish_CI_AS NOT NULL,
        CodiActi NVARCHAR(20) COLLATE Modern_Spanish_CI_AS NOT NULL,
        NombActi VARCHAR(100) COLLATE Modern_Spanish_CI_AS NOT NULL,
        Descri VARCHAR(255) COLLATE Modern_Spanish_CI_AS NULL,
        TipoMant VARCHAR(20) COLLATE Modern_Spanish_CI_AS NULL,
        Activo BIT NOT NULL CONSTRAINT DF_tblmanActiMant_Activo DEFAULT (1),
        CONSTRAINT PK_tblmanActiMant PRIMARY KEY (IdActiMant),
        CONSTRAINT UQ_tblmanActiMant_CodiComp_CodiActi UNIQUE (CodiComp, CodiActi),
        CONSTRAINT FK_tblmanActiMant_TipoMant
            FOREIGN KEY (TipoMant) REFERENCES Mant.tblmanTipoMant (Nombre)
    );
END
GO

IF OBJECT_ID('Mant.tblmanMantActiDeta', 'U') IS NULL
BEGIN
    CREATE TABLE Mant.tblmanMantActiDeta (
        IdMantActiDeta INT IDENTITY(1,1) NOT NULL,
        idMantenimiento INT NOT NULL,
        IdActiMant INT NOT NULL,
        Orden INT NOT NULL,
        TiempoMin INT NULL,
        Obligatoria BIT NOT NULL CONSTRAINT DF_tblmanMantActiDeta_Obligatoria DEFAULT (1),
        Activo BIT NOT NULL CONSTRAINT DF_tblmanMantActiDeta_Activo DEFAULT (1),
        CONSTRAINT PK_tblmanMantActiDeta PRIMARY KEY (IdMantActiDeta),
        CONSTRAINT UQ_tblmanMantActiDeta UNIQUE (idMantenimiento, IdActiMant),
        CONSTRAINT FK_tblmanMantActiDeta_Mantenimiento
            FOREIGN KEY (idMantenimiento) REFERENCES Mant.tblmanManten (idMantenimiento),
        CONSTRAINT FK_tblmanMantActiDeta_Actividad
            FOREIGN KEY (IdActiMant) REFERENCES Mant.tblmanActiMant (IdActiMant)
    );
END
GO

IF OBJECT_ID('Mant.tblmanCritic', 'U') IS NULL
BEGIN
    CREATE TABLE Mant.tblmanCritic (
        IdCritic INT IDENTITY(1,1) NOT NULL,
        Nombre VARCHAR(50) COLLATE Modern_Spanish_CI_AS NOT NULL,
        Descri VARCHAR(150) COLLATE Modern_Spanish_CI_AS NULL,
        Prioridad TINYINT NOT NULL,
        Activo BIT NOT NULL CONSTRAINT DF_tblmanCritic_Activo DEFAULT (1),
        CONSTRAINT PK_tblmanCritic PRIMARY KEY (IdCritic),
        CONSTRAINT UQ_tblmanCritic_Nombre UNIQUE (Nombre)
    );
END
GO
