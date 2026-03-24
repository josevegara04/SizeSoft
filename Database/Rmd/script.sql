-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`tblpdnPlan`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`tblpdnPlan` (
  `idPlanta` INT NOT NULL,
  `Descripcion` VARCHAR(45) NULL,
  `Responsable` VARCHAR(45) NULL,
  `Direccion` VARCHAR(45) NULL,
  `Ciudad` VARCHAR(45) NULL,
  `Telefono` VARCHAR(45) NULL,
  PRIMARY KEY (`idPlanta`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Vendedor`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Vendedor` (
  `idVendedor` INT NOT NULL,
  PRIMARY KEY (`idVendedor`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`tlbpdnMaqu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`tlbpdnMaqu` (
  `idMaquina` INT NOT NULL,
  `Marca` VARCHAR(45) NULL,
  `idPlanta` INT NULL,
  `idProducto` INT NULL,
  `Observaciones` VARCHAR(45) NULL,
  `Unidad_Medida` VARCHAR(45) NULL,
  `idVendedor` INT NULL,
  `Estado` VARCHAR(45) NULL,
  `Fecha_Compra` DATETIME NULL,
  PRIMARY KEY (`idMaquina`),
  INDEX `idPlanta_idx` (`idPlanta` ASC) VISIBLE,
  UNIQUE INDEX `Unidad_Medida_UNIQUE` (`Unidad_Medida` ASC) VISIBLE,
  INDEX `IdVendedor_idx` (`idVendedor` ASC) VISIBLE,
  CONSTRAINT `idPlanta`
    FOREIGN KEY (`idPlanta`)
    REFERENCES `mydb`.`tblpdnPlan` (`idPlanta`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `IdVendedor`
    FOREIGN KEY (`idVendedor`)
    REFERENCES `mydb`.`Vendedor` (`idVendedor`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`tblmanOperar`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`tblmanOperar` (
  `idOperario` INT NOT NULL,
  `Perfil` VARCHAR(45) NULL,
  `tipoOperario` VARCHAR(45) NULL,
  PRIMARY KEY (`idOperario`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`tblmanTipoPart`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`tblmanTipoPart` (
  `idTipoParte` INT NOT NULL,
  `Descripcion` VARCHAR(45) NULL,
  PRIMARY KEY (`idTipoParte`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`tblmanPartMaqu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`tblmanPartMaqu` (
  `NumeroParte` INT NOT NULL,
  `idTipoParte` INT NOT NULL,
  `idMaquina` INT NOT NULL,
  PRIMARY KEY (`NumeroParte`),
  INDEX `idMaquina_idx` (`idMaquina` ASC) VISIBLE,
  INDEX `idTipoParte_idx` (`idTipoParte` ASC) VISIBLE,
  CONSTRAINT `idMaquina`
    FOREIGN KEY (`idMaquina`)
    REFERENCES `mydb`.`tlbpdnMaqu` (`idMaquina`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `idTipoParte`
    FOREIGN KEY (`idTipoParte`)
    REFERENCES `mydb`.`tblmanTipoPart` (`idTipoParte`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`tblmanOrdeOper`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`tblmanOrdeOper` (
  `idOrdeOper` INT NOT NULL,
  `idOper` INT NOT NULL,
  INDEX `idOper_idx` (`idOper` ASC) VISIBLE,
  CONSTRAINT `idOper`
    FOREIGN KEY (`idOper`)
    REFERENCES `mydb`.`tblmanOperar` (`idOperario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`tblmanTipoMant`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`tblmanTipoMant` (
  `nombre` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`nombre`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`tblmanManten`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`tblmanManten` (
  `idMantenimiento` INT NOT NULL,
  `nombre` VARCHAR(45) NOT NULL,
  `Descripcion` VARCHAR(45) NOT NULL,
  `idMaquina` INT NOT NULL,
  `tiempoDias` INT NOT NULL,
  `TipoMant` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`idMantenimiento`),
  INDEX `idMaquina_idx` (`idMaquina` ASC) VISIBLE,
  INDEX `idTipoMant_idx` (`TipoMant` ASC) VISIBLE,
  CONSTRAINT `idMaquina`
    FOREIGN KEY (`idMaquina`)
    REFERENCES `mydb`.`tlbpdnMaqu` (`idMaquina`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `idTipoMant`
    FOREIGN KEY (`TipoMant`)
    REFERENCES `mydb`.`tblmanTipoMant` (`nombre`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`tblmanRepues`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`tblmanRepues` (
  `idRepuesto` INT NOT NULL,
  `idTipoParte` INT NOT NULL,
  `descripcion` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`idRepuesto`),
  INDEX `idTipoParte_idx` (`idTipoParte` ASC) VISIBLE,
  CONSTRAINT `idTipoParte`
    FOREIGN KEY (`idTipoParte`)
    REFERENCES `mydb`.`tblmanTipoPart` (`idTipoParte`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`tblmanOrdeRepu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`tblmanOrdeRepu` (
  `idOrdeRepu` INT NOT NULL,
  `idRepues` INT NOT NULL,
  `cantid` INT NOT NULL,
  PRIMARY KEY (`idOrdeRepu`),
  INDEX `idRepues_idx` (`idRepues` ASC) VISIBLE,
  CONSTRAINT `idRepues`
    FOREIGN KEY (`idRepues`)
    REFERENCES `mydb`.`tblmanRepues` (`idRepuesto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`tblmanOrdeMaqu`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`tblmanOrdeMaqu` (
  `idOrdMaqu` INT NOT NULL,
  `idMaquina` INT NOT NULL,
  `idOrdeOper` INT NOT NULL,
  `Fecha_inicio` DATETIME NOT NULL,
  `TipoMant` VARCHAR(20) NOT NULL,
  `idMantenimiento` INT NOT NULL,
  `fechaFin` DATETIME NULL,
  `idOrdeRepu` INT NOT NULL,
  PRIMARY KEY (`idOrdMaqu`),
  INDEX `idMaquina_idx` (`idMaquina` ASC) VISIBLE,
  INDEX `idMantenimiento_idx` (`idMantenimiento` ASC) VISIBLE,
  INDEX `idOperario_idx` (`idOrdeOper` ASC) VISIBLE,
  INDEX `idTipoMant_idx` (`TipoMant` ASC) VISIBLE,
  INDEX `idOrdeRepu_idx` (`idOrdeRepu` ASC) VISIBLE,
  CONSTRAINT `idMaquina`
    FOREIGN KEY (`idMaquina`)
    REFERENCES `mydb`.`tlbpdnMaqu` (`idMaquina`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `idOrdeOper`
    FOREIGN KEY (`idOrdeOper`)
    REFERENCES `mydb`.`tblmanOrdeOper` (`idOrdeOper`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `idMantenimiento`
    FOREIGN KEY (`idMantenimiento`)
    REFERENCES `mydb`.`tblmanManten` (`idMantenimiento`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `TipoMant`
    FOREIGN KEY (`TipoMant`)
    REFERENCES `mydb`.`tblmanTipoMant` (`nombre`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `idOrdeRepu`
    FOREIGN KEY (`idOrdeRepu`)
    REFERENCES `mydb`.`tblmanOrdeRepu` (`idOrdeRepu`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`tblmanCausMant`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`tblmanCausMant` (
  `idMantenimientoMaquina` INT NOT NULL,
  `Descripcion` VARCHAR(45) NOT NULL,
  INDEX `idMantenimientoMaquina_idx` (`idMantenimientoMaquina` ASC) VISIBLE,
  PRIMARY KEY (`idMantenimientoMaquina`),
  CONSTRAINT `idMantenimientoMaquina`
    FOREIGN KEY (`idMantenimientoMaquina`)
    REFERENCES `mydb`.`tblmanOrdeMaqu` (`idOrdMaqu`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
