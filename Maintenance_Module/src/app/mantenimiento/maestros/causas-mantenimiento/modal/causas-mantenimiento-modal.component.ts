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
  rawResults: any[] = [];

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
      (!this.filterIdCausMant || String(item.IdCausMant ?? '').includes(this.filterIdCausMant)) &&
      (!this.filterCodiCaus || String(item.CodiCaus ?? '').toLowerCase().includes(this.filterCodiCaus.toLowerCase())) &&
      (!this.filterNombCaus || String(item.NombCaus ?? '').toLowerCase().includes(this.filterNombCaus.toLowerCase())) &&
      (!this.filterDescri || String(item.Descri ?? '').toLowerCase().includes(this.filterDescri.toLowerCase())) &&
      (!this.filterTipoMant || String(item.TipoMant ?? '').toLowerCase().includes(this.filterTipoMant.toLowerCase())) &&
      (!this.filterActivo || this.formatActivo(item.Activo).toLowerCase().includes(this.filterActivo.toLowerCase()))
    ));
  }

  formatActivo(value: boolean | number | string | null | undefined): string {
    return value === true || value === 1 || value === '1' ? 'Sí' : 'No';
  }

  private normalizeCausa(item: any): any {
    return {
      ...item,
      IdCausMant: item.IdCausMant ?? item.IdCausaMant ?? item['ID Causa Mantenimiento'] ?? item['ID Causa'] ?? '',
      CodiComp: item.CodiComp ?? item['Codigo Compañia'] ?? item['Código Compañía'] ?? '',
      CodiCaus: item.CodiCaus ?? item.CodiCausa ?? item['Codigo Causa'] ?? item['Código Causa'] ?? item.Código ?? item.Codigo ?? '',
      NombCaus: item.NombCaus ?? item.NombreCausa ?? item['Nombre Causa'] ?? item.Nombre ?? '',
      Descri: item.Descri ?? item.Descripcion ?? item.Descripción ?? item['Descripcion'] ?? item['Descripción'] ?? '',
      TipoMant: item.TipoMant ?? item['Tipo Mantenimiento'] ?? item.TipoMantenimiento ?? '',
      Activo: item.Activo ?? item.activo ?? 0,
    };
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
        this.rawResults = Array.isArray(res) ? [...res] : [];
        this.results = this.rawResults.map((item) => this.normalizeCausa(item));
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
