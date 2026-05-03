import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { CausasMantenimientoService } from '../causas-mantenimiento.service';

@Component({
  selector: 'app-causas-mantenimiento-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './causas-mantenimiento-modal.component.html',
  styleUrls: ['./causas-mantenimiento-modal.component.css'],
})
export class CausasMantenimientoModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() select = new EventEmitter<any>();

  results: any[] = [];

  filterIdCausMant = '';
  filterCodiCaus = '';
  filterNombCaus = '';
  filterDescri = '';
  filterTipoMant = '';
  filterActivo = '';

  constructor(
    private causasService: CausasMantenimientoService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.handleSearch();
  }

  get filteredResults() {
    return this.results.filter((item) => (
      (!this.filterIdCausMant || String(item['ID Causa Mantenimiento'] ?? '').includes(this.filterIdCausMant)) &&
      (!this.filterCodiCaus || String(item['Codigo Causa'] ?? '').toLowerCase().includes(this.filterCodiCaus.toLowerCase())) &&
      (!this.filterNombCaus || String(item['Nombre Causa'] ?? '').toLowerCase().includes(this.filterNombCaus.toLowerCase())) &&
      (!this.filterDescri || String(item['Descripcion'] ?? '').toLowerCase().includes(this.filterDescri.toLowerCase())) &&
      (!this.filterTipoMant || String(item.TipoMant || item['Tipo Mantenimiento'] || '').toLowerCase().includes(this.filterTipoMant.toLowerCase())) &&
      (!this.filterActivo || String(item['Activo'] ?? '').includes(this.filterActivo))
    ));
  }

  handleSearch(): void {
    this.causasService.search([{
      CodiCons: 'CausMant',
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
