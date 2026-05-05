import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { ProgramacionMantenimientosService } from '../programacion-mantenimientos.service';

@Component({
  selector: 'app-programacion-mantenimientos-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './programacion-mantenimientos-modal.component.html',
  styleUrls: ['./programacion-mantenimientos-modal.component.css'],
})
export class ProgramacionMantenimientosModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() select = new EventEmitter<any>();

  results: any[] = [];

  filterIdProgMant = '';
  filterIdMant = '';
  filterNombre = '';
  filterCodiMaqu = '';
  filterTipoMant = '';
  filterActivo = '';

  constructor(
    private programacionService: ProgramacionMantenimientosService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.handleSearch();
  }

  get filteredResults(): any[] {
    return this.results.filter(item =>
      (!this.filterIdProgMant || item.IdProgMant?.toString().includes(this.filterIdProgMant)) &&
      (!this.filterIdMant || item.idMant?.toString().includes(this.filterIdMant)) &&
      (!this.filterNombre || item.nombre?.toLowerCase().includes(this.filterNombre.toLowerCase())) &&
      (!this.filterCodiMaqu || item.CodiMaqu?.toLowerCase().includes(this.filterCodiMaqu.toLowerCase())) &&
      (!this.filterTipoMant || item.TipoMant?.toLowerCase().includes(this.filterTipoMant.toLowerCase())) &&
      (!this.filterActivo || this.getEstadoLabel(item.Activo).toLowerCase().includes(this.filterActivo.toLowerCase()))
    );
  }

  handleSearch(): void {
    const body = [{
      CodiCons: 'ProgMant',
      NombPara: 'Codigo Compañia',
      Valor: this.apiService.clsUser.CodiComp,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token: this.apiService.lstrToken,
      Report: '0',
    }];

    this.programacionService.search(body).subscribe({
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

  getEstadoLabel(value: unknown): string {
    return value === true || value === 1 ? 'Activo' : 'Inactivo';
  }
}
