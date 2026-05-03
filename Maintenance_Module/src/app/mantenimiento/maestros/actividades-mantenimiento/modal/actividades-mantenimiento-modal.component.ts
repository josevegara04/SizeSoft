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
      (!this.filterIdActiMant || String(item['ID Actividad Mantenimiento'] ?? '').includes(this.filterIdActiMant)) &&
      (!this.filterCodiActi || String(item['Codigo Actividad'] ?? '').toLowerCase().includes(this.filterCodiActi.toLowerCase())) &&
      (!this.filterNombActi || String(item['Nombre Actividad'] ?? '').toLowerCase().includes(this.filterNombActi.toLowerCase())) &&
      (!this.filterDescri || String(item['Descripcion'] ?? '').toLowerCase().includes(this.filterDescri.toLowerCase())) &&
      (!this.filterTipoMant || String(item.TipoMant || item['Tipo Mantenimiento'] || '').toLowerCase().includes(this.filterTipoMant.toLowerCase())) &&
      (!this.filterActivo || String(item['Activo'] ?? '').includes(this.filterActivo))
    ));
  }

  handleSearch(): void {
    this.actividadesService.search([{
      CodiCons: 'ActiMant',
      NombPara: 'Comp',
      Valor: this.apiService.clsUser.CodiComp,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token: this.apiService.lstrToken,
      Report: '0',
    }]).subscribe({
      next: (res) => {
        this.results = Array.isArray(res) ? [...res] : [];
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
}
