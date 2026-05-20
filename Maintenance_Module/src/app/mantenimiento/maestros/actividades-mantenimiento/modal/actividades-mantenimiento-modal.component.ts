import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { ActividadesMantenimientoService } from '../actividades-mantenimiento.service';

@Component({
  selector: 'app-actividades-mantenimiento-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './actividades-mantenimiento-modal.component.html',
  styleUrls: ['./actividades-mantenimiento-modal.component.css'],
})
export class ActividadesMantenimientoModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() select = new EventEmitter<any>();

  results: any[] = [];
  rawResults: any[] = [];

  filterIdActiMant = '';
  filterCodiActi = '';
  filterNombActi = '';
  filterDescri = '';
  filterTipoMant = '';
  filterActivo = '';

  constructor(
    private actividadesService: ActividadesMantenimientoService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.handleSearch();
  }

  get filteredResults() {
    return this.results.filter((item) => (
      (!this.filterIdActiMant || String(item.IdActiMant ?? '').includes(this.filterIdActiMant)) &&
      (!this.filterCodiActi || String(item.CodiActi ?? '').toLowerCase().includes(this.filterCodiActi.toLowerCase())) &&
      (!this.filterNombActi || String(item.NombActi ?? '').toLowerCase().includes(this.filterNombActi.toLowerCase())) &&
      (!this.filterDescri || String(item.Descri ?? '').toLowerCase().includes(this.filterDescri.toLowerCase())) &&
      (!this.filterTipoMant || String(item.TipoMant ?? '').toLowerCase().includes(this.filterTipoMant.toLowerCase())) &&
      (!this.filterActivo || this.formatActivo(item.Activo).toLowerCase().includes(this.filterActivo.toLowerCase()))
    ));
  }

  formatActivo(value: boolean | number | string | null | undefined): string {
    return value === true || value === 1 || value === '1' ? 'Sí' : 'No';
  }

  private normalizeActividad(item: any): any {
    return {
      ...item,
      IdActiMant: item.IdActiMant ?? item.IdActividadMant ?? item['ID Actividad Mantenimiento'] ?? item['ID Actividad'] ?? '',
      CodiComp: item.CodiComp ?? item['Codigo Compañia'] ?? item['Código Compañía'] ?? '',
      CodiActi: item.CodiActi ?? item.CodiActividad ?? item['Codigo Actividad'] ?? item['Código Actividad'] ?? item.Código ?? item.Codigo ?? '',
      NombActi: item.NombActi ?? item.NombreActividad ?? item['Nombre Actividad'] ?? item.Nombre ?? '',
      Descri: item.Descri ?? item.Descripcion ?? item.Descripción ?? item['Descripcion'] ?? item['Descripción'] ?? '',
      TipoMant: item.TipoMant ?? item['Tipo Mantenimiento'] ?? item.TipoMantenimiento ?? '',
      Activo: item.Activo ?? item.activo ?? 0,
    };
  }

  handleSearch(): void {
    this.actividadesService.search([{
      CodiCons: 'ActiMant',
      NombPara: 'Codigo Compañia',
      Valor: this.apiService.clsUser.CodiComp,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token: this.apiService.lstrToken,
      Report: '0',
    }]).subscribe({
      next: (res) => {
        this.rawResults = Array.isArray(res) ? [...res] : [];
        this.results = this.rawResults.map((item) => this.normalizeActividad(item));
        this.cdr.detectChanges();
      },
      error: () => {
        this.rawResults = [];
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
}
