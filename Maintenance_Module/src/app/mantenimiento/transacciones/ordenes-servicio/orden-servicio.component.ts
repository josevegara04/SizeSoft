import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrdenServicioService } from './orden-servicio.service';
import { ApiService } from '../../../services/api.service';

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
    private apiService: ApiService
  ) {
    console.log('COMPONENTE CARGADO');
  }
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
    console.log('CLICK FUNCIONA');

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
  
        // 🔥 dinámicos desde ApiService
        CodiComp: this.apiService.clsUser.CodiComp,
        Token: this.apiService.lstrToken,
  
        // 🔥 fijo (según backend)
        Entidad: 303,
        Accion: 1
      }
    ];
  
    console.log('Body enviado:', body);
  
    this.ordenService.saveOrden(body).subscribe({
      next: (res) => {
        console.log('Respuesta backend:', res);
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  
  }
}
