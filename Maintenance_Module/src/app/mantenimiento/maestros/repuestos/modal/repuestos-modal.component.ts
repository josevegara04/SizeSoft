import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { RepuestosService } from '../repuestos.service';

@Component({
  selector: 'app-repuestos-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './repuestos-modal.component.html',
  styleUrls: ['./repuestos-modal.component.css'],
})
export class RepuestosModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() select = new EventEmitter<any>();

  results: any[] = [];

  filterIdRepuesto = '';
  filterCodiPart = '';
  filterNombreParte = '';
  filterCantid = '';

  constructor(
    private repuestosService: RepuestosService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.handleSearch();
  }

  get filteredResults(): any[] {
    return this.results.filter(item =>
      (!this.filterIdRepuesto || item.idRepuesto?.toString().includes(this.filterIdRepuesto)) &&
      (!this.filterCodiPart || item.CodiPart?.toLowerCase().includes(this.filterCodiPart.toLowerCase())) &&
      (!this.filterNombreParte || item.NombreParte?.toLowerCase().includes(this.filterNombreParte.toLowerCase())) &&
      (!this.filterCantid || item.Cantid?.toString().includes(this.filterCantid))
    );
  }

  handleSearch(): void {
    const body = [{
      CodiCons: 'RepuMant',
      NombPara: 'Codigo Compañia',
      Valor: this.apiService.clsUser.CodiComp,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token: this.apiService.lstrToken,
      Report: '0',
    }];

    this.repuestosService.search(body).subscribe({
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
