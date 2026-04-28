import { Component, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrdenServicioService } from '../orden-servicio.service';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-orden-servicio-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './orden-servicio-modal.component.html',
  styleUrls: ['./orden-servicio-modal.component.css']
})
export class OrdenServicioModalComponent implements OnInit {

  @Output() close = new EventEmitter<void>();
  @Output() select = new EventEmitter<any>();

  results: any[] = [];

  filterCodiOrd: string = '';
  filterCodiMaqu: string = '';
  filterTipoMant: string = '';
  filterEstado: string = '';

  constructor(
    private ordenService: OrdenServicioService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.handleSearch();
  }

  get filteredResults() {
    return this.results.filter(item =>
      (!this.filterCodiOrd || item.CodiOrdMaqu?.toLowerCase().includes(this.filterCodiOrd.toLowerCase())) &&
      (!this.filterCodiMaqu || item.CodiMaqu?.toLowerCase().includes(this.filterCodiMaqu.toLowerCase())) &&
      (!this.filterTipoMant || item.TipoMant?.toLowerCase().includes(this.filterTipoMant.toLowerCase())) &&
      (!this.filterEstado || item.NombreEstado?.toLowerCase().includes(this.filterEstado.toLowerCase()))
    );
  }

  handleSearch(): void {
    const body = [{
      CodiCons: 'OrdeMant',
      NombPara: 'Codigo Compañia',
      Valor: this.apiService.clsUser.CodiComp,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token: this.apiService.lstrToken,
      Report: '0'
    }];

    this.ordenService.search(body).subscribe({
      next: (res) => {
        this.results = Array.isArray(res) ? [...res] : [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.results = [];
      }
    });
  }

  selectRow(item: any): void {
    this.select.emit(item);
  }

  cerrarModal(): void {
    this.close.emit();
  }
}
