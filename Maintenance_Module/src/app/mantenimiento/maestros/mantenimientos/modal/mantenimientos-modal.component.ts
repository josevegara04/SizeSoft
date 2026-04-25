import { Component, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MantenimientosService } from '../mantenimientos.service';
import { ApiService } from '../../../../services/api.service'
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-mantenimientos-modal',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './mantenimientos-modal.component.html',
    styleUrls: ['./mantenimientos-modal.component.css']
  })

  export class MantenimientosModalComponent implements OnInit{
    ngOnInit(): void {
      this.handleSearch();
    }

    @Output() close = new EventEmitter<void>();

    cerrarModal() {
    this.close.emit();
    }

    constructor(
      private MantenimientosService: MantenimientosService,
      private apiService: ApiService,
      private cdr: ChangeDetectorRef
    ) {}

    results: any[] = [];

    // Main variables
    idMantenimiento: number | null = null;
    nombre: string = '';
    Descripcion: string = '';
    CodiMaqu: string = '';
    tiempoDias: number | null = null;
    TipoMant: string = '';

    // filtros tabla
    filterIdMantenimiento: number | null = null;
    filterNombre: string = '';
    filterDescripcion: string = '';
    filterCodiMaqu: string = '';
    filterTipoMant: string = '';
    filterTiempoDias: number | null = null;

    get filteredResults() {
      return this.results.filter(item => {
    
        return (
          (!this.filterIdMantenimiento || item.idMantenimiento?.toString().includes(this.filterIdMantenimiento)) &&
          (!this.filterNombre || item.nombre?.toLowerCase().includes(this.filterNombre.toLowerCase())) &&
          (!this.filterDescripcion || item.Descripcion?.toLowerCase().includes(this.filterDescripcion.toLowerCase())) && (!this.filterCodiMaqu || item.CodiMaqu?.toLowerCase().includes(this.filterCodiMaqu.toLowerCase())) && 
          (!this.filterTiempoDias || item.tiempoDias?.toString().includes(this.filterTiempoDias)) &&
          (!this.filterTipoMant || item.TipoMant?.toLowerCase().includes(this.filterTipoMant.toLowerCase()))
        );
    
      });
    }

    // Create or update machine part
    handleSearch() {
      const filtros: any[] = [];
  
      if (this.idMantenimiento) {
        filtros.push({
          CodiCons: 'Manten',
          NombPara: 'ID Mantenimiento',
          Valor: this.idMantenimiento,
          CodiComp: this.apiService.clsUser.CodiComp,
          Token: this.apiService.lstrToken,
          Report: '0'
        });
      }
  
      if (this.nombre) {
        filtros.push({
          CodiCons: 'Manten',
          NombPara: 'Nombre Mantenimiento',
          Valor: this.nombre,
          CodiComp: this.apiService.clsUser.CodiComp,
          Token: this.apiService.lstrToken,
          Report: '0'
        });
      }
  
      if (this.Descripcion) {
        filtros.push({
          CodiCons: 'Manten',
          NombPara: 'Descripción Mantenimiento',
          Valor: this.Descripcion,
          CodiComp: this.apiService.clsUser.CodiComp,
          Token: this.apiService.lstrToken,
          Report: '0'
        });
      }
  
      if (this.CodiMaqu) {
        filtros.push({
          CodiCons: 'Manten',
          NombPara: 'Código Máquina',
          Valor: this.CodiMaqu,
          CodiComp: this.apiService.clsUser.CodiComp,
          Token: this.apiService.lstrToken,
          Report: '0'
        });
      }

      if (this.tiempoDias) {
        filtros.push({
          CodiCons: 'Manten',
          NombPara: 'Tiempo Mantenimiento',
          Valor: this.tiempoDias,
          CodiComp: this.apiService.clsUser.CodiComp,
          Token: this.apiService.lstrToken,
          Report: '0'
        });
      }

      if (this.TipoMant) {
        filtros.push({
          CodiCons: 'Manten',
          NombPara: 'Tipo Mantenimiento',
          Valor: this.TipoMant,
          CodiComp: this.apiService.clsUser.CodiComp,
          Token: this.apiService.lstrToken,
          Report: '0'
        });
      }
  
      if (filtros.length === 0) {

        filtros.push({
          CodiCons: 'Manten',
          NombPara: 'Código Compañia',
          Valor: this.apiService.clsUser.CodiComp,
          CodiComp: this.apiService.clsUser.CodiComp,
          Token: this.apiService.lstrToken,
          Report: '0'
        });
        console.log(filtros);
      }
  
      this.MantenimientosService.search(filtros).subscribe({
        next: (res) => {
          console.log(res);
          this.results = Array.isArray(res) ? [...res] : [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  }