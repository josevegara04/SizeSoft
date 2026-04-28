import { Component, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OperariosService } from '../operarios.service';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-operarios-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './operarios-modal.component.html',
  styleUrls: ['./operarios-modal.component.css'],
})
export class OperariosModalComponent implements OnInit {

  @Output() close  = new EventEmitter<void>();
  @Output() select = new EventEmitter<any>();

  results: any[] = [];

  filterNombre:  string = '';
  filterApellid: string = '';
  filterCedula:  string = '';
  filterCargo:   string = '';

  constructor(
    private operariosService: OperariosService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.handleSearch();
  }

  get filteredResults() {
    return this.results.filter(item =>
      (!this.filterNombre  || item.Nombre?.toLowerCase().includes(this.filterNombre.toLowerCase()))  &&
      (!this.filterApellid || item.Apellid?.toLowerCase().includes(this.filterApellid.toLowerCase())) &&
      (!this.filterCedula  || item.Cedula?.toLowerCase().includes(this.filterCedula.toLowerCase()))  &&
      (!this.filterCargo   || item.Cargo?.toLowerCase().includes(this.filterCargo.toLowerCase()))
    );
  }

  handleSearch(): void {
    this.operariosService.search([{
      CodiCons: 'Operar',
      NombPara: 'Compañía',
      Valor:    this.apiService.clsUser.CodiComp,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token:    this.apiService.lstrToken,
      Report:   '0',
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
