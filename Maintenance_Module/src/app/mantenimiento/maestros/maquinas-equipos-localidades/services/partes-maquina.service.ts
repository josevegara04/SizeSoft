import { Injectable, inject } from '@angular/core';
import { MaquinasService } from './maquinas.service';

export interface ParteMaquina {
    id: string;
    maquinaId: string;
    nombreParte: string;
    codigoParte: string;
    creadoEn: string;
}

const STORAGE_KEY = 'sizesoft_partes_maquina';

@Injectable({ providedIn: 'root' })
export class PartesMaquinaService {
    private readonly maquinasService = inject(MaquinasService);

    private getAll(): ParteMaquina[] {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    private saveAll(parts: ParteMaquina[]): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parts));
    }

    getByMaquinaId(maquinaId: string): ParteMaquina[] {
        return this.getAll().filter((p) => p.maquinaId === maquinaId);
    }

    create(maquinaId: string, nombreParte: string, codigoParte: string): { success: boolean; error?: string; part?: ParteMaquina } {
        // Validate machine exists
        if (!this.maquinasService.exists(maquinaId)) {
            return { success: false, error: 'La máquina seleccionada no existe en el sistema.' };
        }

        // Validate required fields
        if (!nombreParte.trim()) {
            return { success: false, error: 'El nombre de la parte es obligatorio.' };
        }
        if (!codigoParte.trim()) {
            return { success: false, error: 'El código de la parte es obligatorio.' };
        }

        // Validate uniqueness (machineId + partCode)
        const existing = this.getAll();
        const duplicate = existing.find(
            (p) => p.maquinaId === maquinaId && p.codigoParte.toLowerCase() === codigoParte.trim().toLowerCase()
        );
        if (duplicate) {
            return { success: false, error: `Ya existe una parte con el código "${codigoParte}" para esta máquina.` };
        }

        const newPart: ParteMaquina = {
            id: crypto.randomUUID(),
            maquinaId,
            nombreParte: nombreParte.trim(),
            codigoParte: codigoParte.trim(),
            creadoEn: new Date().toISOString(),
        };

        existing.push(newPart);
        this.saveAll(existing);
        return { success: true, part: newPart };
    }

    delete(partId: string): boolean {
        const all = this.getAll();
        const filtered = all.filter((p) => p.id !== partId);
        if (filtered.length === all.length) return false;
        this.saveAll(filtered);
        return true;
    }

    deleteByMaquinaId(maquinaId: string): void {
        const all = this.getAll();
        const filtered = all.filter((p) => p.maquinaId !== maquinaId);
        this.saveAll(filtered);
    }
}
