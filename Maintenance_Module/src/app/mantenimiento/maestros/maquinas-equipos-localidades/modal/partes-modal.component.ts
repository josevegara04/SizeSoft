import { Component, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PartesMaquinaService } from '../services/partes-maquina.service';
import { ApiService } from '../../../../services/api.service';
import { CommonModule } from '@angular/common';

interface PartResult {
  CodiPart: string;
  CodiComp: string;
  CodiMaqu: string;
  NombreParte: string;
  IdTipoPart: number;
  IdTipoPartReal: number;
  NombreTipoParte: string;
}

@Component({
  selector: 'app-partes-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './partes-modal.component.html',
  styleUrls: ['./partes-modal.component.css']
})
export class PartesModalComponent implements OnInit {

  @Output() close = new EventEmitter<void>();
  @Output() select = new EventEmitter<PartResult>();

  ngOnInit(): void {
    this.handleSearch();
  }

  cerrarModal() {
    this.close.emit();
  }

  constructor(
    private partesService: PartesMaquinaService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  results: PartResult[] = [];

  // filtros tabla
  filterCodiPart: string = '';
  filterTipoPart: string = '';
  filterNombreTipoParte: string = '';
  filterCodiMaqu: string = '';
  filterNombreParte: string = '';

  get filteredResults() {
    return this.results.filter(item => {
      return (
        (!this.filterCodiPart || item.CodiPart?.toLowerCase().includes(this.filterCodiPart.toLowerCase())) &&
        (!this.filterTipoPart || item.IdTipoPart?.toString().includes(this.filterTipoPart)) &&
        (!this.filterNombreTipoParte ||
          item.NombreTipoParte?.toLowerCase().includes(this.filterNombreTipoParte.toLowerCase())) &&
        (!this.filterCodiMaqu || item.CodiMaqu?.toLowerCase().includes(this.filterCodiMaqu.toLowerCase())) &&
        (!this.filterNombreParte || item.NombreParte?.toLowerCase().includes(this.filterNombreParte.toLowerCase()))
      );
    });
  }

  private get companyCode(): string {
    return this.apiService.clsUser.CodiComp;
  }

  private get token(): string {
    return this.apiService.lstrToken;
  }

  private normalizeParte(item: any): PartResult {
    return {
      CodiPart: item.CodiPart ?? item['Código Parte'] ?? item['Codigo Parte'] ?? '',
      CodiComp: item.CodiComp ?? item['Código Compañía'] ?? item['Codigo Compañia'] ?? '',
      CodiMaqu: item.CodiMaqu ?? item['Código Máquina'] ?? item['Codigo Máquina'] ?? item['Codigo Maquina'] ?? '',
      NombreParte: item.NombreParte ?? item['Nombre Parte'] ?? '',
      IdTipoPart: Number(item.IdTipoPart ?? item['ID Tipo Parte'] ?? 0),
      IdTipoPartReal: Number(item.IdTipoPartReal ?? item['ID Tipo Parte Real'] ?? item.IdTipoPart ?? 0),
      NombreTipoParte: item.NombreTipoParte ?? item['Nombre Tipo Parte'] ?? '',
    };
  }

  // Query machine parts
  handleSearch(): void {
    const filtros = [{
      CodiCons: 'ListPart',
      NombPara: 'Comp',
      Valor: this.companyCode,
      CodiComp: this.companyCode,
      Token: this.token,
      Report: '0'
    }];

    this.partesService.search(filtros).subscribe({
      next: (res) => {
        this.results = Array.isArray(res) ? res.map(item => this.normalizeParte(item)) : [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.results = [];
      }
    });
  }

  selectRow(item: PartResult): void {
    this.select.emit(item);
  }
}
