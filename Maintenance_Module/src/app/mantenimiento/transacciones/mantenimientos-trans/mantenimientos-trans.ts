import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { SidebarService } from '../../../side-bar/sidebar.service';
import { MantenimientosTransModalComponent, LookupMode } from './modal/mantenimientos-trans-modal.component';
import { MantenimientosTransService } from './mantenimientos-trans.service';

interface MantenimientoSeleccionado {
  idMantenimiento: number | null;
  nombre: string;
  Descripcion: string;
  CodiMaqu: string;
  tiempoDias: number | null;
  TipoMant: string;
}

interface ActividadAsignada {
  IdActiMant: number | null;
  CodiActi: string;
  NombActi: string;
  Descri: string;
  TipoMant: string;
  Orden: number | null;
  TiempoMin: number | null;
  Obligatoria: boolean;
  Activo: boolean;
}

interface CausaAsignada {
  IdCausMant: number | null;
  CodiCaus: string;
  NombCaus: string;
  Descri: string;
  TipoMant: string;
  Activo: boolean;
}

@Component({
  selector: 'app-mantenimientos-trans',
  standalone: true,
  templateUrl: './mantenimientos-trans.html',
  styleUrls: ['./mantenimientos-trans.css'],
  imports: [CommonModule, FormsModule, MantenimientosTransModalComponent],
})
export class MantenimientosTransComponent {
  constructor(
    private mantenimientosTransService: MantenimientosTransService,
    private apiService: ApiService,
    private sidebarService: SidebarService,
  ) {}

  showLookupModal = false;
  lookupMode: LookupMode = 'maintenance';
  lookupTargetIndex: number | null = null;
  isEditingAssignment = false;

  mantenimiento: MantenimientoSeleccionado = this.createEmptyMaintenance();
  actividades: ActividadAsignada[] = [this.createEmptyActivity()];
  causas: CausaAsignada[] = [this.createEmptyCause()];

  get hasMaintenanceSelected(): boolean {
    return this.mantenimiento.idMantenimiento !== null && this.mantenimiento.idMantenimiento > 0;
  }

  get selectedActivitiesCount(): number {
    return this.actividades.filter((item) => item.IdActiMant !== null).length;
  }

  get selectedCausesCount(): number {
    return this.causas.filter((item) => item.IdCausMant !== null).length;
  }

  openLookup(mode: LookupMode, index?: number): void {
    this.lookupMode = mode;
    this.lookupTargetIndex = typeof index === 'number' ? index : null;
    this.showLookupModal = true;
  }

  closeLookup(): void {
    this.showLookupModal = false;
    this.lookupTargetIndex = null;
  }

  onLookupSelect(item: any): void {
    if (this.lookupMode === 'maintenance') {
      this.isEditingAssignment = false;
      this.mantenimiento = {
        idMantenimiento: this.toNumber(item.idMantenimiento),
        nombre: item.nombre ?? '',
        Descripcion: item.Descripcion ?? '',
        CodiMaqu: item.CodiMaqu ?? '',
        tiempoDias: this.toNumber(item.tiempoDias),
        TipoMant: item.TipoMant ?? '',
      };
    }

    if (this.lookupMode === 'maintenance-detail') {
      this.loadMaintenanceDetail(item);
    }

    if (this.lookupMode === 'activity') {
      this.assignActivity(item, this.lookupTargetIndex);
    }

    if (this.lookupMode === 'cause') {
      this.assignCause(item, this.lookupTargetIndex);
    }

    this.closeLookup();
  }

  addActividad(): void {
    this.actividades.push(this.createEmptyActivity());
  }

  removeActividad(index: number): void {
    if (this.actividades.length === 1) {
      this.actividades[0] = this.createEmptyActivity();
      return;
    }

    this.actividades.splice(index, 1);
  }

  addCausa(): void {
    this.causas.push(this.createEmptyCause());
  }

  removeCausa(index: number): void {
    if (this.causas.length === 1) {
      this.causas[0] = this.createEmptyCause();
      return;
    }

    this.causas.splice(index, 1);
  }

  clearForm(): void {
    this.isEditingAssignment = false;
    this.mantenimiento = this.createEmptyMaintenance();
    this.actividades = [this.createEmptyActivity()];
    this.causas = [this.createEmptyCause()];
  }

  guardarAsignacion(): void {
    if (!this.hasMaintenanceSelected) {
      this.sidebarService.addLog('Seleccione un mantenimiento');
      return;
    }

    const actividadesValidas = this.actividades
      .filter((item) => item.IdActiMant !== null)
      .map((item) => ({
        IdActiMant: Number(item.IdActiMant),
        Orden: item.Orden,
        TiempoMin: item.TiempoMin,
        Obligatoria: item.Obligatoria,
        Activo: item.Activo,
      }));

    const causasValidas = this.causas
      .filter((item) => item.IdCausMant !== null)
      .map((item) => ({
        IdCausMant: Number(item.IdCausMant),
        Activo: item.Activo,
      }));

    if (actividadesValidas.length === 0) {
      this.sidebarService.addLog('Debe asignar al menos una actividad al mantenimiento');
      return;
    }

    const actividadesInvalidas = actividadesValidas.some((item) =>
      item.Orden === null || item.Orden <= 0 || item.TiempoMin === null || item.TiempoMin < 0
    );

    if (actividadesInvalidas) {
      this.sidebarService.addLog('Complete orden y tiempo de cada actividad con valores válidos');
      return;
    }

    const ordenes = actividadesValidas
      .filter((item) => item.Activo)
      .map((item) => Number(item.Orden));

    if (new Set(ordenes).size !== ordenes.length) {
      this.sidebarService.addLog('No puede repetir el orden en actividades activas');
      return;
    }

    const actividadesBody = {
      idMantenimiento: Number(this.mantenimiento.idMantenimiento),
      Actividades: actividadesValidas,
      CodiComp: this.apiService.clsUser.CodiComp,
      CodiUsua: this.apiService.clsUser.Id,
      NombUsua: this.apiService.clsUser.NombUsua,
      Token: this.apiService.lstrToken,
      Entidad: 309,
      Accion: this.isEditingAssignment ? 3 : 1,
    };

    const causasBody = {
      idMantenimiento: Number(this.mantenimiento.idMantenimiento),
      Causas: causasValidas,
      Activo: true,
      CodiComp: this.apiService.clsUser.CodiComp,
      CodiUsua: this.apiService.clsUser.Id,
      NombUsua: this.apiService.clsUser.NombUsua,
      Token: this.apiService.lstrToken,
      Entidad: 310,
      Accion: this.isEditingAssignment ? 3 : 1,
    };

    const saveRequests = [
      this.mantenimientosTransService.save([actividadesBody]),
      causasValidas.length > 0
        ? this.mantenimientosTransService.save([causasBody])
        : of([{ Messag: '{"success": true, "message": "Sin cambios en causas"}' }]),
    ];

    forkJoin(saveRequests).subscribe({
      next: ([actividadesRes, causasRes]) => {
        const actividadesMessage = this.parseResponseMessage(actividadesRes, 'Actividades guardadas');
        const causasMessage = this.parseResponseMessage(causasRes, 'Causas guardadas');
        this.sidebarService.addLog(`${actividadesMessage} | ${causasMessage}`);
      },
      error: () => {
        this.sidebarService.addLog('Error al guardar la asignación de actividades y causas');
      },
    });
  }

  private assignActivity(item: any, index: number | null): void {
    const id = this.toNumber(item.IdActiMant);
    if (id === null) return;

    const duplicateIndex = this.actividades.findIndex((actividad, currentIndex) =>
      actividad.IdActiMant === id && currentIndex !== index
    );

    if (duplicateIndex >= 0) {
      this.sidebarService.addLog('La actividad seleccionada ya fue agregada');
      return;
    }

    const actividad: ActividadAsignada = {
      IdActiMant: id,
      CodiActi: item.CodiActi ?? '',
      NombActi: item.NombActi ?? '',
      Descri: item.Descri ?? '',
      TipoMant: item.TipoMant ?? '',
      Orden: index !== null && this.actividades[index] ? this.actividades[index].Orden : this.nextActivityOrder(),
      TiempoMin: index !== null && this.actividades[index] ? this.actividades[index].TiempoMin : 0,
      Obligatoria: index !== null && this.actividades[index] ? this.actividades[index].Obligatoria : true,
      Activo: this.toBoolean(item.Activo),
    };

    if (index !== null && this.actividades[index]) {
      this.actividades[index] = actividad;
      return;
    }

    this.actividades.push(actividad);
  }

  private assignCause(item: any, index: number | null): void {
    const id = this.toNumber(item.IdCausMant);
    if (id === null) return;

    const duplicateIndex = this.causas.findIndex((causa, currentIndex) =>
      causa.IdCausMant === id && currentIndex !== index
    );

    if (duplicateIndex >= 0) {
      this.sidebarService.addLog('La causa seleccionada ya fue agregada');
      return;
    }

    const causa: CausaAsignada = {
      IdCausMant: id,
      CodiCaus: item.CodiCaus ?? '',
      NombCaus: item.NombCaus ?? '',
      Descri: item.Descri ?? '',
      TipoMant: item.TipoMant ?? '',
      Activo: this.toBoolean(item.Activo),
    };

    if (index !== null && this.causas[index]) {
      this.causas[index] = causa;
      return;
    }

    this.causas.push(causa);
  }

  private createEmptyMaintenance(): MantenimientoSeleccionado {
    return {
      idMantenimiento: null,
      nombre: '',
      Descripcion: '',
      CodiMaqu: '',
      tiempoDias: null,
      TipoMant: '',
    };
  }

  private createEmptyActivity(): ActividadAsignada {
    return {
      IdActiMant: null,
      CodiActi: '',
      NombActi: '',
      Descri: '',
      TipoMant: '',
      Orden: this.nextActivityOrder(),
      TiempoMin: 0,
      Obligatoria: true,
      Activo: true,
    };
  }

  private createEmptyCause(): CausaAsignada {
    return {
      IdCausMant: null,
      CodiCaus: '',
      NombCaus: '',
      Descri: '',
      TipoMant: '',
      Activo: true,
    };
  }

  private toNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private toBoolean(value: unknown): boolean {
    return value === true || value === 1 || value === '1';
  }

  private loadMaintenanceDetail(item: any): void {
    this.isEditingAssignment = true;
    this.mantenimiento = {
      idMantenimiento: this.toNumber(item.idMantenimiento),
      nombre: item.nombre ?? '',
      Descripcion: item.Descripcion ?? '',
      CodiMaqu: item.CodiMaqu ?? '',
      tiempoDias: this.toNumber(item.tiempoDias),
      TipoMant: item.TipoMant ?? '',
    };

    const actividades = this.parseJsonArray(item.Actividades).map((actividad: any) => ({
      IdActiMant: this.toNumber(actividad.IdActiMant),
      CodiActi: actividad.CodiActi ?? '',
      NombActi: actividad.NombActi ?? '',
      Descri: actividad.Descri ?? '',
      TipoMant: actividad.TipoMant ?? '',
      Orden: this.toNumber(actividad.Orden),
      TiempoMin: this.toNumber(actividad.TiempoMin),
      Obligatoria: this.toBoolean(actividad.Obligatoria),
      Activo: this.toBoolean(actividad.Activo),
    }));

    const causas = this.parseJsonArray(item.Causas).map((causa: any) => ({
      IdCausMant: this.toNumber(causa.IdCausMant),
      CodiCaus: causa.CodiCaus ?? '',
      NombCaus: causa.NombCaus ?? '',
      Descri: causa.Descri ?? '',
      TipoMant: causa.TipoMant ?? '',
      Activo: this.toBoolean(causa.Activo),
    }));

    this.actividades = actividades.length > 0 ? actividades : [this.createEmptyActivity()];
    this.causas = causas.length > 0 ? causas : [this.createEmptyCause()];
  }

  private nextActivityOrder(): number {
    const maxOrder = (this.actividades ?? []).reduce((max, item) => {
      if (item.Orden === null || item.Orden === undefined) {
        return max;
      }

      return Math.max(max, item.Orden);
    }, 0);

    return maxOrder + 1;
  }

  private parseResponseMessage(response: any, fallback: string): string {
    const raw = response?.[0]?.Messag ?? response?.[0]?.message ?? fallback;

    try {
      const parsed = JSON.parse(raw);
      return parsed.message ?? raw;
    } catch {
      return raw;
    }
  }

  private parseJsonArray(value: unknown): any[] {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value !== 'string' || !value.trim()) {
      return [];
    }

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
