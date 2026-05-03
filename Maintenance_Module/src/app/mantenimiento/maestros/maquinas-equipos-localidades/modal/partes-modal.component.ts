import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PartesMaquinaService } from '../services/partes-maquina.service';
import { ApiService } from '../../../../services/api.service';
import { CommonModule } from '@angular/common';
import { TIPOS_PARTE_TEMPORALES, findTipoParteByName } from '../tipo-parte-options';

interface PartQueryFilter {
  CodiCons: 'ListPart';
  NombPara: string;
  Valor: string;
  CodiComp: string;
  Token: string;
  Report: '0';
}

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
export class PartesModalComponent {

  @Output() close = new EventEmitter<void>();

  cerrarModal() {
    this.close.emit();
  }

  constructor(
    private partesService: PartesMaquinaService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  results: PartResult[] = [];

  // Main variables
  CodiPart: string = '';
  CodiMaqu: string = '';
  tipoParteNombre: string = '';
  nombreParte: string = '';
  tiposParte = TIPOS_PARTE_TEMPORALES;

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

  private buildFilter(NombPara: string, Valor: string | number): PartQueryFilter {
    return {
      CodiCons: 'ListPart',
      NombPara,
      Valor: String(Valor),
      CodiComp: this.companyCode,
      Token: this.token,
      Report: '0'
    };
  }

  // Query machine parts
  handleSearch() {
    const filtros: PartQueryFilter[] = [
      this.buildFilter('Comp', this.companyCode)
    ];

    if (this.nombreParte) {
      filtros.push(this.buildFilter('Nombre Parte', this.nombreParte.trim()));
    }

    if (this.CodiPart) {
      filtros.push(this.buildFilter('Código Parte', this.CodiPart.trim()));
    }

    if (this.CodiMaqu) {
      filtros.push(this.buildFilter('Código Máquina', this.CodiMaqu.trim()));
    }

    if (this.tipoParteNombre) {
      const tipoParte = findTipoParteByName(this.tipoParteNombre);

      if (tipoParte) {
        filtros.push(this.buildFilter('Tipo Parte', tipoParte.id));
      }
    }

    console.log('BODY QUERY:', filtros);

    this.partesService.search(filtros).subscribe({
      next: (res) => {
        console.log('RESULTADO:', res);
        this.results = Array.isArray(res) ? res : [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('ERROR:', err);
      }
    });
  }
}
