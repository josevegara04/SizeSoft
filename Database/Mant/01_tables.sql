-- DROP SCHEMA Mant;

CREATE SCHEMA Mant;
-- ERPPruebas.Mant.tblmanCritic definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanCritic;

CREATE TABLE ERPPruebas.Mant.tblmanCritic (
	IdCritic int IDENTITY(1, 1) NOT NULL,
	Nombre varchar(50) COLLATE Modern_Spanish_CI_AS NOT NULL,
	Descri varchar(150) COLLATE Modern_Spanish_CI_AS NULL,
	Prioridad tinyint NOT NULL,
	Activo bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK_tblmanCritic PRIMARY KEY (IdCritic),
	CONSTRAINT UQ_tblmanCritic_Nombre UNIQUE (Nombre)
);
-- ERPPruebas.Mant.tblmanEstaOrde definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanEstaOrde;

CREATE TABLE ERPPruebas.Mant.tblmanEstaOrde (
	IdEsta int IDENTITY(1, 1) NOT NULL,
	NombEsta varchar(50) COLLATE Modern_Spanish_CI_AS NOT NULL,
	Descri varchar(100) COLLATE Modern_Spanish_CI_AS NULL,
	Activo bit DEFAULT 1 NULL,
	CONSTRAINT PK__tblmanEs__0F7EACE34856D317 PRIMARY KEY (IdEsta)
);
-- ERPPruebas.Mant.tblmanOperar definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanOperar;

CREATE TABLE ERPPruebas.Mant.tblmanOperar (
	IdOper int IDENTITY(1, 1) NOT NULL,
	Nombre varchar(50) COLLATE Modern_Spanish_CI_AS NOT NULL,
	Telefo varchar(20) COLLATE Modern_Spanish_CI_AS NOT NULL,
	Cedula varchar(20) COLLATE Modern_Spanish_CI_AS NOT NULL,
	Apellid varchar(50) COLLATE Modern_Spanish_CI_AS NOT NULL,
	Cargo varchar(50) COLLATE Modern_Spanish_CI_AS NOT NULL,
	Especi varchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	Email varchar(100) COLLATE Modern_Spanish_CI_AS NULL,
	Activo bit DEFAULT 1 NOT NULL,
	CodiComp nvarchar(4) COLLATE Modern_Spanish_CI_AS DEFAULT 'PMC1' NOT NULL,
	CONSTRAINT PK_tblmanOperar PRIMARY KEY (IdOper),
	CONSTRAINT UQ_tblmanOperar_Cedula UNIQUE (Cedula)
);
-- ERPPruebas.Mant.tblmanOrdeRepu definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanOrdeRepu;

CREATE TABLE ERPPruebas.Mant.tblmanOrdeRepu (
	idOrdeRepu int IDENTITY(1, 1) NOT NULL,
	CONSTRAINT PK_tblmanOrdeRepu PRIMARY KEY (idOrdeRepu)
);
-- ERPPruebas.Mant.tblmanTipoMant definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanTipoMant;

CREATE TABLE ERPPruebas.Mant.tblmanTipoMant (
	Nombre varchar(20) COLLATE Modern_Spanish_CI_AS NOT NULL,
	CONSTRAINT UQ_tblmanTipoMant_nombre UNIQUE (Nombre)
);
-- ERPPruebas.Mant.tblmanTipoPart definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanTipoPart;

CREATE TABLE ERPPruebas.Mant.tblmanTipoPart (
	Descripcion varchar(150) COLLATE Modern_Spanish_CI_AS NULL,
	Nomb varchar(50) COLLATE Modern_Spanish_CI_AS DEFAULT '' NOT NULL,
	Id int IDENTITY(1, 1) NOT NULL,
	CodiComp nvarchar(4) COLLATE Modern_Spanish_CI_AS DEFAULT '' NOT NULL,
	CONSTRAINT PK_tblmanTipoPart_Id PRIMARY KEY (Id)
);
-- ERPPruebas.Mant.tblmanActiMant definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanActiMant;

CREATE TABLE ERPPruebas.Mant.tblmanActiMant (
	IdActiMant int IDENTITY(1, 1) NOT NULL,
	CodiComp nvarchar(4) COLLATE Modern_Spanish_CI_AS NOT NULL,
	CodiActi nvarchar(20) COLLATE Modern_Spanish_CI_AS NOT NULL,
	NombActi varchar(100) COLLATE Modern_Spanish_CI_AS NOT NULL,
	Descri varchar(255) COLLATE Modern_Spanish_CI_AS NULL,
	TipoMant varchar(20) COLLATE Modern_Spanish_CI_AS NULL,
	Activo bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK_tblmanActiMant PRIMARY KEY (IdActiMant),
	CONSTRAINT UQ_tblmanActiMant_CodiComp_CodiActi UNIQUE (CodiComp,
CodiActi),
	CONSTRAINT FK_tblmanActiMant_TipoMant FOREIGN KEY (TipoMant) REFERENCES ERPPruebas.Mant.tblmanTipoMant(Nombre)
);
-- ERPPruebas.Mant.tblmanCausMant definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanCausMant;

CREATE TABLE ERPPruebas.Mant.tblmanCausMant (
	IdCausMant int IDENTITY(1, 1) NOT NULL,
	CodiComp nvarchar(4) COLLATE Modern_Spanish_CI_AS NOT NULL,
	CodiCaus nvarchar(20) COLLATE Modern_Spanish_CI_AS NOT NULL,
	NombCaus varchar(100) COLLATE Modern_Spanish_CI_AS NOT NULL,
	Descri varchar(255) COLLATE Modern_Spanish_CI_AS NULL,
	TipoMant varchar(20) COLLATE Modern_Spanish_CI_AS NULL,
	Activo bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK_tblmanCausMant PRIMARY KEY (IdCausMant),
	CONSTRAINT UQ_tblmanCausMant_CodiComp_CodiCaus UNIQUE (CodiComp,
CodiCaus),
	CONSTRAINT FK_tblmanCausMant_TipoMant FOREIGN KEY (TipoMant) REFERENCES ERPPruebas.Mant.tblmanTipoMant(Nombre)
);
-- ERPPruebas.Mant.tblmanMaquin definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanMaquin;

CREATE TABLE ERPPruebas.Mant.tblmanMaquin (
	CodiComp nvarchar(4) COLLATE Modern_Spanish_CI_AS NOT NULL,
	CodiMaqu nvarchar(10) COLLATE Modern_Spanish_CI_AS NOT NULL,
	MarcMaqu nvarchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	DescMaqu nvarchar(150) COLLATE Modern_Spanish_CI_AS NULL,
	ProdFabr nvarchar(100) COLLATE Modern_Spanish_CI_AS NULL,
	FechComp smalldatetime NULL,
	ObseMaqu nvarchar(200) COLLATE Modern_Spanish_CI_AS NULL,
	UbicMaqu nvarchar(50) COLLATE Modern_Spanish_CI_AS NULL,
	IdCritic int NULL,
	CONSTRAINT PK_tblmanMaquin PRIMARY KEY (CodiComp,
CodiMaqu),
	CONSTRAINT FK_tblmanMaquin_tblmanCritic FOREIGN KEY (IdCritic) REFERENCES ERPPruebas.Mant.tblmanCritic(IdCritic)
);
-- ERPPruebas.Mant.tblmanPartMaqu definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanPartMaqu;

CREATE TABLE ERPPruebas.Mant.tblmanPartMaqu (
	CodiPart nvarchar(20) COLLATE Modern_Spanish_CI_AS NOT NULL,
	CodiComp nvarchar(4) COLLATE Modern_Spanish_CI_AS NOT NULL,
	CodiMaqu nvarchar(10) COLLATE Modern_Spanish_CI_AS NOT NULL,
	NombreParte nvarchar(100) COLLATE Modern_Spanish_CI_AS DEFAULT '' NOT NULL,
	IdTipoPart int NULL,
	CONSTRAINT PK_tblmanPartMaqu PRIMARY KEY (CodiPart),
	CONSTRAINT FK_tblmanPartMaqu_Maquina FOREIGN KEY (CodiComp,
CodiMaqu) REFERENCES ERPPruebas.Mant.tblmanMaquin(CodiComp,
CodiMaqu),
	CONSTRAINT FK_tblmanPartMaqu_TipoPart_Id FOREIGN KEY (IdTipoPart) REFERENCES ERPPruebas.Mant.tblmanTipoPart(Id)
);
-- ERPPruebas.Mant.tblmanRepues definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanRepues;

CREATE TABLE ERPPruebas.Mant.tblmanRepues (
	idRepuesto int NOT NULL,
	Cantid int DEFAULT 1 NOT NULL,
	CodiPart nvarchar(20) COLLATE Modern_Spanish_CI_AS NOT NULL,
	CONSTRAINT PK_tblmanRepues PRIMARY KEY (idRepuesto),
	CONSTRAINT FK_tblmanRepues_PartMaqu FOREIGN KEY (CodiPart) REFERENCES ERPPruebas.Mant.tblmanPartMaqu(CodiPart)
);

ALTER TABLE ERPPruebas.Mant.tblmanRepues WITH NOCHECK ADD CONSTRAINT CK_tblmanRepues_Cantid_Positive CHECK (([Cantid]>(0)));
-- ERPPruebas.Mant.tblmanManten definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanManten;

CREATE TABLE ERPPruebas.Mant.tblmanManten (
	idMantenimiento int NOT NULL,
	nombre varchar(100) COLLATE Modern_Spanish_CI_AS NOT NULL,
	Descripcion varchar(255) COLLATE Modern_Spanish_CI_AS NOT NULL,
	CodiComp nvarchar(4) COLLATE Modern_Spanish_CI_AS NOT NULL,
	CodiMaqu nvarchar(10) COLLATE Modern_Spanish_CI_AS NOT NULL,
	tiempoDias int NOT NULL,
	TipoMant varchar(20) COLLATE Modern_Spanish_CI_AS NOT NULL,
	CONSTRAINT PK_tblmanManten PRIMARY KEY (idMantenimiento),
	CONSTRAINT FK_tblmanManten_Maquina FOREIGN KEY (CodiComp,
CodiMaqu) REFERENCES ERPPruebas.Mant.tblmanMaquin(CodiComp,
CodiMaqu),
	CONSTRAINT FK_tblmanManten_TipoMant FOREIGN KEY (TipoMant) REFERENCES ERPPruebas.Mant.tblmanTipoMant(Nombre)
);
-- ERPPruebas.Mant.tblmanOrdeMaqu definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanOrdeMaqu;

CREATE TABLE ERPPruebas.Mant.tblmanOrdeMaqu (
	CodiOrdMaqu nvarchar(20) COLLATE Modern_Spanish_CI_AS NOT NULL,
	CodiComp nvarchar(4) COLLATE Modern_Spanish_CI_AS NOT NULL,
	CodiMaqu nvarchar(10) COLLATE Modern_Spanish_CI_AS NOT NULL,
	Fecha_inicio datetime NOT NULL,
	TipoMant varchar(20) COLLATE Modern_Spanish_CI_AS NOT NULL,
	idMantenimiento int NOT NULL,
	fechaFin datetime NULL,
	idOrdeRepu int NOT NULL,
	IdEsta int NULL,
	FechaProgramada date NOT NULL,
	CONSTRAINT PK_tblmanOrdeMaqu PRIMARY KEY (CodiOrdMaqu),
	CONSTRAINT FK_tblmanOrdeMaqu_Estado FOREIGN KEY (IdEsta) REFERENCES ERPPruebas.Mant.tblmanEstaOrde(IdEsta),
	CONSTRAINT FK_tblmanOrdeMaqu_Mantenimiento FOREIGN KEY (idMantenimiento) REFERENCES ERPPruebas.Mant.tblmanManten(idMantenimiento),
	CONSTRAINT FK_tblmanOrdeMaqu_Maquina FOREIGN KEY (CodiComp,
CodiMaqu) REFERENCES ERPPruebas.Mant.tblmanMaquin(CodiComp,
CodiMaqu),
	CONSTRAINT FK_tblmanOrdeMaqu_Repuesto FOREIGN KEY (idOrdeRepu) REFERENCES ERPPruebas.Mant.tblmanOrdeRepu(idOrdeRepu),
	CONSTRAINT FK_tblmanOrdeMaqu_TipoMant FOREIGN KEY (TipoMant) REFERENCES ERPPruebas.Mant.tblmanTipoMant(Nombre)
);
-- ERPPruebas.Mant.tblmanOrdeOper definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanOrdeOper;

CREATE TABLE ERPPruebas.Mant.tblmanOrdeOper (
	IdOrdeOper int IDENTITY(1, 1) NOT NULL,
	CodiOrdMaqu nvarchar(20) COLLATE Modern_Spanish_CI_AS NOT NULL,
	IdOper int NOT NULL,
	CONSTRAINT PK_tblmanOrdeOper PRIMARY KEY (IdOrdeOper),
	CONSTRAINT FK_OrdeOper_Operario FOREIGN KEY (IdOper) REFERENCES ERPPruebas.Mant.tblmanOperar(IdOper),
	CONSTRAINT FK_OrdeOper_Orden FOREIGN KEY (CodiOrdMaqu) REFERENCES ERPPruebas.Mant.tblmanOrdeMaqu(CodiOrdMaqu)
);
-- ERPPruebas.Mant.tblmanOrdeRepuDet definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanOrdeRepuDet;

CREATE TABLE ERPPruebas.Mant.tblmanOrdeRepuDet (
	idDetalle int IDENTITY(1, 1) NOT NULL,
	idOrdeRepu int NOT NULL,
	idRepues int NOT NULL,
	cantid int NOT NULL,
	CONSTRAINT PK__tblmanOr__49CAE2FBA71B45FA PRIMARY KEY (idDetalle),
	CONSTRAINT FK_OrdeRepuDet_OrdeRepu FOREIGN KEY (idOrdeRepu) REFERENCES ERPPruebas.Mant.tblmanOrdeRepu(idOrdeRepu),
	CONSTRAINT FK_OrdeRepuDet_Repuesto FOREIGN KEY (idRepues) REFERENCES ERPPruebas.Mant.tblmanRepues(idRepuesto)
);
-- ERPPruebas.Mant.tblmanProgMant definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanProgMant;

CREATE TABLE ERPPruebas.Mant.tblmanProgMant (
	IdProgMant int IDENTITY(1, 1) NOT NULL,
	idMant int NOT NULL,
	FechInic date NOT NULL,
	FrecDias int NOT NULL,
	UltiFech date NULL,
	ProxFech date NOT NULL,
	Activo bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK_tblmanProgMant PRIMARY KEY (IdProgMant),
	CONSTRAINT UQ_tblmanProgMant_Mantenimiento UNIQUE (idMant),
	CONSTRAINT FK_tblmanProgMant_Mantenimiento FOREIGN KEY (idMant) REFERENCES ERPPruebas.Mant.tblmanManten(idMantenimiento)
);
-- ERPPruebas.Mant.tblmanMantActiDeta definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanMantActiDeta;

CREATE TABLE ERPPruebas.Mant.tblmanMantActiDeta (
	IdMantActiDeta int IDENTITY(1, 1) NOT NULL,
	idMantenimiento int NOT NULL,
	IdActiMant int NOT NULL,
	Orden int NOT NULL,
	TiempoMin int NULL,
	Obligatoria bit DEFAULT 1 NOT NULL,
	Activo bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK_tblmanMantActiDeta PRIMARY KEY (IdMantActiDeta),
	CONSTRAINT UQ_tblmanMantActiDeta UNIQUE (idMantenimiento,
IdActiMant),
	CONSTRAINT FK_tblmanMantActiDeta_Actividad FOREIGN KEY (IdActiMant) REFERENCES ERPPruebas.Mant.tblmanActiMant(IdActiMant),
	CONSTRAINT FK_tblmanMantActiDeta_Mantenimiento FOREIGN KEY (idMantenimiento) REFERENCES ERPPruebas.Mant.tblmanManten(idMantenimiento)
);
-- ERPPruebas.Mant.tblmanMantCausDeta definition
-- Drop table
-- DROP TABLE ERPPruebas.Mant.tblmanMantCausDeta;

CREATE TABLE ERPPruebas.Mant.tblmanMantCausDeta (
	IdMantCausDeta int IDENTITY(1, 1) NOT NULL,
	idMantenimiento int NOT NULL,
	IdCausMant int NOT NULL,
	Activo bit DEFAULT 1 NOT NULL,
	CONSTRAINT PK_tblmanMantCausDeta PRIMARY KEY (IdMantCausDeta),
	CONSTRAINT UQ_tblmanMantCausDeta UNIQUE (idMantenimiento,
IdCausMant),
	CONSTRAINT FK_tblmanMantCausDeta_Causa FOREIGN KEY (IdCausMant) REFERENCES ERPPruebas.Mant.tblmanCausMant(IdCausMant),
	CONSTRAINT FK_tblmanMantCausDeta_Mantenimiento FOREIGN KEY (idMantenimiento) REFERENCES ERPPruebas.Mant.tblmanManten(idMantenimiento)
);
