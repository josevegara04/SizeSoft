import { Injectable } from '@angular/core';

export interface ProgramacionOrdenPrefill {
  idProgMant: number | null;
  idMant: number | null;
  fechInic: string;
  proxFech: string;
  codiMaqu: string;
  tipoMant: string;
  nombre: string;
  descripcion: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrdenServicioPrefillService {
  private readonly storageKey = 'orden-servicio-prefill';
  private pendingPrefill: ProgramacionOrdenPrefill | null = null;

  setPending(prefill: ProgramacionOrdenPrefill): void {
    this.pendingPrefill = prefill;

    if (typeof sessionStorage === 'undefined') {
      return;
    }

    sessionStorage.setItem(this.storageKey, JSON.stringify(prefill));
  }

  consumePending(): ProgramacionOrdenPrefill | null {
    if (this.pendingPrefill) {
      const prefill = this.pendingPrefill;
      this.pendingPrefill = null;
      this.clearStorage();
      return prefill;
    }

    if (typeof sessionStorage === 'undefined') {
      return null;
    }

    const rawPrefill = sessionStorage.getItem(this.storageKey);
    if (!rawPrefill) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawPrefill) as ProgramacionOrdenPrefill;
      this.clearStorage();
      return parsed;
    } catch {
      this.clearStorage();
      return null;
    }
  }

  private clearStorage(): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    sessionStorage.removeItem(this.storageKey);
  }
}
