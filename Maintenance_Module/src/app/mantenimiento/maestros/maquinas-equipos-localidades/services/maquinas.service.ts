import { Injectable } from '@angular/core';

export interface Maquina {
    id: string;
    codigo: string;
    nombre: string;
    descripcion: string;
    planta: string;
    marca: string;
    capacidad: string;
    unidadMedida: string;
    fechaCompra: string;
    productosQueFabrica: string;
    vendedor: string;
    observaciones: string;
    estado: string;
    ubicacion: string;
}

const STORAGE_KEY = 'sizesoft_maquinas';

const SEED_DATA: Maquina[] = [
    {
        id: '1',
        codigo: 'MAQ-001',
        nombre: 'Torno CNC',
        descripcion: 'Torno de control numérico computarizado',
        planta: 'Planta Principal',
        marca: 'Haas',
        capacidad: '500',
        unidadMedida: 'kg',
        fechaCompra: '2023-01-15',
        productosQueFabrica: 'Piezas metálicas cilíndricas',
        vendedor: 'Distribuidora Industrial S.A.',
        observaciones: 'Requiere mantenimiento cada 3 meses',
        estado: 'Activo',
        ubicacion: 'Nave 1 - Sección A',
    },
    {
        id: '2',
        codigo: 'MAQ-002',
        nombre: 'Fresadora Universal',
        descripcion: 'Fresadora universal de alta precisión',
        planta: 'Planta Principal',
        marca: 'DMG Mori',
        capacidad: '300',
        unidadMedida: 'kg',
        fechaCompra: '2022-06-20',
        productosQueFabrica: 'Engranajes y componentes planos',
        vendedor: 'Maquinaria Global Ltda.',
        observaciones: 'Última revisión en diciembre 2024',
        estado: 'Activo',
        ubicacion: 'Nave 1 - Sección B',
    },
    {
        id: '3',
        codigo: 'MAQ-003',
        nombre: 'Prensa Hidráulica',
        descripcion: 'Prensa hidráulica de 200 toneladas',
        planta: 'Planta Secundaria',
        marca: 'Schuler',
        capacidad: '200',
        unidadMedida: 'ton',
        fechaCompra: '2021-09-10',
        productosQueFabrica: 'Láminas y piezas estampadas',
        vendedor: 'Equipos Pesados S.A.',
        observaciones: 'Verificar sistema hidráulico periódicamente',
        estado: 'Activo',
        ubicacion: 'Nave 2 - Sección A',
    },
];

@Injectable({ providedIn: 'root' })
export class MaquinasService {
    constructor() {
        this.initSeedData();
    }

    private initSeedData(): void {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
        }
    }

    getAll(): Maquina[] {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    getById(id: string): Maquina | undefined {
        return this.getAll().find((m) => m.id === id);
    }

    searchByCodigo(codigo: string): Maquina | undefined {
        return this.getAll().find((m) => m.codigo.toLowerCase() === codigo.toLowerCase());
    }

    searchByNombre(term: string): Maquina[] {
        const lower = term.toLowerCase();
        return this.getAll().filter(
            (m) => m.nombre.toLowerCase().includes(lower) || m.codigo.toLowerCase().includes(lower)
        );
    }

    exists(id: string): boolean {
        return !!this.getById(id);
    }

    create(maquina: Omit<Maquina, 'id'>): Maquina {
        const all = this.getAll();
        const newMaquina: Maquina = {
            ...maquina,
            id: crypto.randomUUID(),
        };
        all.push(newMaquina);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        return newMaquina;
    }

    update(id: string, changes: Partial<Maquina>): Maquina | null {
        const all = this.getAll();
        const idx = all.findIndex((m) => m.id === id);
        if (idx === -1) return null;
        all[idx] = { ...all[idx], ...changes, id };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        return all[idx];
    }

    delete(id: string): boolean {
        const all = this.getAll();
        const filtered = all.filter((m) => m.id !== id);
        if (filtered.length === all.length) return false;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    }
}
