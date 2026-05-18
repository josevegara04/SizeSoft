import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { SidebarService } from '../../../side-bar/sidebar.service';
import { BitacoraPlantaService } from './bitacora-planta.service';

interface BitacoraPlantaItem {
  id: number;
  fecha: string;
  codiUsua: string;
  nombUsua: string;
  modulo: string;
  accion: string;
  mensaj: string;
}

@Component({
  selector: 'app-bitacora-planta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bitacora-planta.html',
  styleUrls: ['./bitacora-planta.css'],
})
export class BitacoraPlantaComponent implements OnInit {
  constructor(
    private bitacoraPlantaService: BitacoraPlantaService,
    private apiService: ApiService,
    private sidebarService: SidebarService,
    private cdr: ChangeDetectorRef,
  ) {}

  registros: BitacoraPlantaItem[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadBitacora();
  }

  loadBitacora(): void {
    this.loading = true;
    this.errorMessage = '';
    this.registros = [];
    console.log("cargando");

    const body = [{
      CodiCons: 'BitaMant',
      NombPara: 'Codigo Compañia',
      Valor: this.apiService.clsUser.CodiComp,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token: this.apiService.lstrToken,
      Report: '0',
    }];

    this.bitacoraPlantaService.search(body).subscribe({
      next: (res) => {
        if (!Array.isArray(res)) {
          this.errorMessage = 'La respuesta de la bitácora no tiene un formato válido.';
          this.loading = false;
          console.error('Bitacora response format error:', res);
          this.cdr.detectChanges();
          return;
        }

        this.registros = res.map((item: any) => this.normalizeRegistro(item));
        console.log(this.registros);

        if (this.registros.length === 0) {
          this.errorMessage = 'No hay registros para mostrar.';
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.registros = [];
        this.loading = false;
        this.errorMessage = 'Error al cargar la bitácora de planta.';
        this.sidebarService.addLog(this.errorMessage);
        console.error('Bitacora query error:', error);
        this.cdr.detectChanges();
      },
    });
  }

  private normalizeRegistro(item: any): BitacoraPlantaItem {
    return {
      id: Number(item.IdBitaco ?? 0),
      fecha: item.FechRegi ?? '',
      codiUsua: item.CodiUsua ?? '',
      nombUsua: item.NombUsua ?? '',
      modulo: item.Modulo ?? '',
      accion: item.Accion ?? '',
      mensaj: item.Mensaj ?? '',
    };
  }

  trackById(_index: number, item: BitacoraPlantaItem): number {
    return item.id;
  }
}
