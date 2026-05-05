import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { MantenimientosTransService } from '../mantenimientos-trans.service';

export type LookupMode = 'maintenance' | 'maintenance-detail' | 'activity' | 'cause';

interface LookupColumn {
  key: string;
  label: string;
  type?: 'text' | 'status' | 'code';
}

@Component({
  selector: 'app-mantenimientos-trans-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mantenimientos-trans-modal.component.html',
  styleUrls: ['./mantenimientos-trans-modal.component.css'],
})
export class MantenimientosTransModalComponent implements OnInit {
  @Input() mode: LookupMode = 'maintenance';
  @Output() close = new EventEmitter<void>();
  @Output() select = new EventEmitter<any>();

  results: any[] = [];
  filters: Record<string, string> = {};

  private readonly config: Record<LookupMode, {
    title: string;
    subtitle: string;
    emptyMessage: string;
    query: () => any[];
    normalize: (item: any) => any;
    columns: LookupColumn[];
  }> = {
    maintenance: {
      title: 'Búsqueda de Mantenimientos',
      subtitle: 'Listado de mantenimientos',
      emptyMessage: 'No hay mantenimientos registrados.',
      query: () => [{
        CodiCons: 'Manten',
        NombPara: 'Codigo Compañia',
        Valor: this.apiService.clsUser.CodiComp,
        CodiComp: this.apiService.clsUser.CodiComp,
        Token: this.apiService.lstrToken,
        Report: '0',
      }],
      normalize: (item) => ({
        ...item,
        idMantenimiento: item.idMantenimiento ?? item.IdMantenimiento ?? item['ID Mantenimiento'] ?? '',
        nombre: item.nombre ?? item.Nombre ?? '',
        Descripcion: item.Descripcion ?? item.Descripción ?? '',
        CodiMaqu: item.CodiMaqu ?? item['Código Máquina'] ?? item['Codigo Máquina'] ?? '',
        tiempoDias: item.tiempoDias ?? item.TiempoDias ?? item['Tiempo Mantenimiento'] ?? '',
        TipoMant: item.TipoMant ?? item['Tipo Mantenimiento'] ?? '',
      }),
      columns: [
        { key: 'idMantenimiento', label: 'ID Mantenimiento', type: 'code' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'Descripcion', label: 'Descripción' },
        { key: 'CodiMaqu', label: 'Código Máquina' },
        { key: 'tiempoDias', label: 'Tiempo' },
        { key: 'TipoMant', label: 'Tipo Mantenimiento' },
      ],
    },
    'maintenance-detail': {
      title: 'Búsqueda de Mantenimientos con Detalle',
      subtitle: 'Listado de mantenimientos detallados',
      emptyMessage: 'No hay mantenimientos con detalle registrados.',
      query: () => [{
        CodiCons: 'MantDeta',
        NombPara: 'Codigo Compañia',
        Valor: this.apiService.clsUser.CodiComp,
        CodiComp: this.apiService.clsUser.CodiComp,
        Token: this.apiService.lstrToken,
        Report: '0',
      }],
      normalize: (item) => {
        const actividades = this.parseJsonArray(item.Actividades);
        const causas = this.parseJsonArray(item.Causas);

        return {
          ...item,
          idMantenimiento: item.idMantenimiento ?? item.IdMantenimiento ?? item['ID Mantenimiento'] ?? '',
          nombre: item.nombre ?? item.Nombre ?? '',
          Descripcion: item.Descripcion ?? item.Descripción ?? '',
          CodiMaqu: item.CodiMaqu ?? item['Código Máquina'] ?? item['Codigo Máquina'] ?? '',
          tiempoDias: item.tiempoDias ?? item.TiempoDias ?? item['Tiempo Mantenimiento'] ?? '',
          TipoMant: item.TipoMant ?? item['Tipo Mantenimiento'] ?? '',
          Actividades: actividades,
          Causas: causas,
          totalActividades: actividades.length,
          totalCausas: causas.length,
        };
      },
      columns: [
        { key: 'idMantenimiento', label: 'ID Mantenimiento', type: 'code' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'CodiMaqu', label: 'Código Máquina' },
        { key: 'TipoMant', label: 'Tipo' },
        { key: 'totalActividades', label: 'Actividades' },
        { key: 'totalCausas', label: 'Causas' },
      ],
    },
    activity: {
      title: 'Búsqueda de Actividades de Mantenimiento',
      subtitle: 'Listado de actividades',
      emptyMessage: 'No hay actividades de mantenimiento registradas.',
      query: () => [{
        CodiCons: 'ActiMant',
        NombPara: 'Codigo Compañia',
        Valor: this.apiService.clsUser.CodiComp,
        CodiComp: this.apiService.clsUser.CodiComp,
        Token: this.apiService.lstrToken,
        Report: '0',
      }],
      normalize: (item) => ({
        ...item,
        IdActiMant: item.IdActiMant ?? item.IdActividadMant ?? item['ID Actividad Mantenimiento'] ?? item['ID Actividad'] ?? '',
        CodiActi: item.CodiActi ?? item.CodiActividad ?? item['Codigo Actividad'] ?? item['Código Actividad'] ?? '',
        NombActi: item.NombActi ?? item.NombreActividad ?? item['Nombre Actividad'] ?? item.Nombre ?? '',
        Descri: item.Descri ?? item.Descripcion ?? item.Descripción ?? '',
        TipoMant: item.TipoMant ?? item['Tipo Mantenimiento'] ?? '',
        Activo: item.Activo ?? item.activo ?? 0,
      }),
      columns: [
        { key: 'IdActiMant', label: 'ID Actividad', type: 'code' },
        { key: 'CodiActi', label: 'Código' },
        { key: 'NombActi', label: 'Nombre' },
        { key: 'Descri', label: 'Descripción' },
        { key: 'TipoMant', label: 'Tipo Mantenimiento' },
        { key: 'Activo', label: 'Activo', type: 'status' },
      ],
    },
    cause: {
      title: 'Búsqueda de Causas de Mantenimiento',
      subtitle: 'Listado de causas',
      emptyMessage: 'No hay causas de mantenimiento registradas.',
      query: () => [{
        CodiCons: 'CausMant',
        NombPara: 'Codigo Compañia',
        Valor: this.apiService.clsUser.CodiComp,
        CodiComp: this.apiService.clsUser.CodiComp,
        Token: this.apiService.lstrToken,
        Report: '0',
      }],
      normalize: (item) => ({
        ...item,
        IdCausMant: item.IdCausMant ?? item.IdCausaMant ?? item['ID Causa Mantenimiento'] ?? item['ID Causa'] ?? '',
        CodiCaus: item.CodiCaus ?? item.CodiCausa ?? item['Codigo Causa'] ?? item['Código Causa'] ?? '',
        NombCaus: item.NombCaus ?? item.NombreCausa ?? item['Nombre Causa'] ?? item.Nombre ?? '',
        Descri: item.Descri ?? item.Descripcion ?? item.Descripción ?? '',
        TipoMant: item.TipoMant ?? item['Tipo Mantenimiento'] ?? '',
        Activo: item.Activo ?? item.activo ?? 0,
      }),
      columns: [
        { key: 'IdCausMant', label: 'ID Causa', type: 'code' },
        { key: 'CodiCaus', label: 'Código' },
        { key: 'NombCaus', label: 'Nombre' },
        { key: 'Descri', label: 'Descripción' },
        { key: 'TipoMant', label: 'Tipo Mantenimiento' },
        { key: 'Activo', label: 'Activo', type: 'status' },
      ],
    },
  };

  constructor(
    private mantenimientosTransService: MantenimientosTransService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.columns.forEach((column) => {
      this.filters[column.key] = '';
    });
    this.handleSearch();
  }

  get modalTitle(): string {
    return this.config[this.mode].title;
  }

  get modalSubtitle(): string {
    return this.config[this.mode].subtitle;
  }

  get emptyMessage(): string {
    return this.config[this.mode].emptyMessage;
  }

  get columns(): LookupColumn[] {
    return this.config[this.mode].columns;
  }

  get filteredResults(): any[] {
    return this.results.filter((item) =>
      this.columns.every((column) => {
        const term = (this.filters[column.key] ?? '').trim().toLowerCase();
        if (!term) return true;
        return this.formatCell(item, column).toLowerCase().includes(term);
      })
    );
  }

  handleSearch(): void {
    this.mantenimientosTransService.search(this.config[this.mode].query()).subscribe({
      next: (res) => {
        const rows = Array.isArray(res) ? res : [];
        this.results = rows.map((item) => this.config[this.mode].normalize(item));
        this.cdr.detectChanges();
      },
      error: () => {
        this.results = [];
      },
    });
  }

  selectRow(item: any): void {
    this.select.emit(item);
  }

  cerrarModal(): void {
    this.close.emit();
  }

  formatCell(item: any, column: LookupColumn): string {
    const value = item[column.key];

    if (column.type === 'status') {
      return this.formatActivo(value);
    }

    return String(value ?? '-');
  }

  formatActivo(value: boolean | number | string | null | undefined): string {
    return value === true || value === 1 || value === '1' ? 'Sí' : 'No';
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
