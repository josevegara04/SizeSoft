import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PartesMaquinaService } from '../services/partes-maquina.service';
import { ApiService } from '../../../../services/api.service'
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-partes-modal',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './partes-modal.component.html',
    styleUrls: ['./partes-modal.component.css']
  })

  export class PartesModalComponent{

    @Output() close = new EventEmitter<void>();

    cerrarModal() {
    this.close.emit();
    }

    constructor(
      private partesService: PartesMaquinaService,
      private apiService: ApiService,
      private cdr: ChangeDetectorRef
    ) {}

    results: any[] = [];

    // Main variables
    CodiPart: string = '';
    CodiMaqu: string = '';
    idTipoPart: number = 0;
    nombreParte: string = '';

    // filtros tabla
    filterCodiPart: string = '';
    filterTipoPart: string = '';
    filterCodiMaqu: string = '';
    filterNombreParte: string = '';

    get filteredResults() {
      return this.results.filter(item => {
    
        return (
          (!this.filterCodiPart || item.CodiPart?.toLowerCase().includes(this.filterCodiPart.toLowerCase())) &&
          (!this.filterTipoPart || item.idTipoParte?.toString().includes(this.filterTipoPart)) &&
          (!this.filterCodiMaqu || item.CodiMaqu?.toLowerCase().includes(this.filterCodiMaqu.toLowerCase())) &&
          (!this.filterNombreParte || item.NombreParte?.toLowerCase().includes(this.filterNombreParte.toLowerCase()))
        );
    
      });
    }

    // Create or update machine part
    handleSearch() {
      const filtros: any[] = [];
  
      if (this.nombreParte) {
        filtros.push({
          CodiCons: 'ListPart',
          NombPara: 'Nombre Parte',
          Valor: this.nombreParte,
          CodiComp: this.apiService.clsUser.CodiComp,
          Token: this.apiService.lstrToken,
          Report: '0'
        });
      }
  
      if (this.CodiPart) {
        filtros.push({
          CodiCons: 'ListPart',
          NombPara: 'Código Parte',
          Valor: this.CodiPart,
          CodiComp: this.apiService.clsUser.CodiComp,
          Token: this.apiService.lstrToken,
          Report: '0'
        });
      }
  
      if (this.CodiMaqu) {
        filtros.push({
          CodiCons: 'ListPart',
          NombPara: 'Código Máquina',
          Valor: this.CodiMaqu,
          CodiComp: this.apiService.clsUser.CodiComp,
          Token: this.apiService.lstrToken,
          Report: '0'
        });
      }
  
      if (this.idTipoPart) {
        filtros.push({
          CodiCons: 'ListPart',
          NombPara: 'Tipo Parte',
          Valor: this.idTipoPart,
          CodiComp: this.apiService.clsUser.CodiComp,
          Token: this.apiService.lstrToken,
          Report: '0'
        });
      }
  
      if (filtros.length === 0) {
        filtros.push({
          CodiCons: 'ListPart',
          NombPara: 'Compañía',
          Valor: this.apiService.clsUser.CodiComp,
          CodiComp: this.apiService.clsUser.CodiComp,
          Token: this.apiService.lstrToken,
          Report: '0'
        });
      }
  
      console.log('BODY QUERY:', filtros);
  
      this.partesService.search(filtros).subscribe({
        next: (res) => {
          console.log('RESULTADO:', res);
          this.results = Array.isArray(res) ? [...res] : [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('ERROR:', err);
        }
      });
    }
  }