export interface Repuesto {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    categoria: string;
    unidadMedida: string;
    cantidadStock: number;
    stockMinimo: number;
    precioUnitario: number;
    ubicacion: string;
    proveedor: string;
    activo: boolean;
}
