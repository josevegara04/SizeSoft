import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrdenServicioService } from './orden-servicio.service';
import { ApiService } from '../../../services/api.service';
import { SidebarService } from '../../../side-bar/sidebar.service';

@Component({
  selector: 'app-ordenes-servicio',
  standalone: true,
  templateUrl: "./orden-servicio.component.html" ,
  styleUrls: ["./orden-servicio.component.css"],
  imports: [FormsModule],
})
export class OrdenesServicioComponent {

  // constructor from orden-servicio.service
  constructor(
    private ordenService: OrdenServicioService,
    private apiService: ApiService,
    private sidebarService: SidebarService
  ) {}

  // main variables
  codiOrdMaqu: string = '';
  codiMaqu: string = '';
  fechaInicio: string = '';
  tipoMant: string = '';
  idMantenimiento: number | null = null;
  idRepuesto: number | null = null;
  cantidad: number | null = null;

  // create order
  createOrder() {

    // build body
    const body = [
      {
        CodiOrdMaqu: this.codiOrdMaqu,
        CodiMaqu: this.codiMaqu,
        Fecha_inicio: new Date(this.fechaInicio).toISOString(),
        TipoMant: this.tipoMant,
        idMantenimiento: this.idMantenimiento,
        fechaFin: null,
        idRepues: this.idRepuesto,
        cantid: this.cantidad,
  
        CodiComp: this.apiService.clsUser.CodiComp,
        Token: this.apiService.lstrToken,

        Entidad: 303,
        Accion: 1
      }
    ];
  
    this.ordenService.saveOrden(body).subscribe({
      next: (res) => {
        const message = res[0]?.Messag || 'Operación completada';
        this.sidebarService.addLog(message);
      },
      error: (err) => {
        this.sidebarService.addLog('Error al crear la orden');
      }
    });
  
  }
}
