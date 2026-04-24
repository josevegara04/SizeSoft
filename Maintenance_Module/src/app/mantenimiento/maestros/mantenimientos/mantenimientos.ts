import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MantenimientosService } from './mantenimientos.service';
import { ApiService } from '../../../services/api.service';
import { SidebarService } from '../../../side-bar/sidebar.service';

@Component({
  selector: 'app-mantenimientos',
  standalone: true,
  templateUrl: "./mantenimientos.html",
  imports: [FormsModule],
  styleUrls: ["./mantenimientos.css"],
})
export class MantenimientosComponent {

  // Construcutor
  constructor(
    private MantenimientosService: MantenimientosService,
    private apiService: ApiService,
    private sidebarService: SidebarService
  ) {}

  // Main variables
  idMantenimiento: number = 0;
  nombre: string = '';
  Descripcion: string = '';
  CodiMaqu: string = '';
  tiempoDias: number = 0;
  TipoMant: string = '';

  // Create or update machine part
  handleMaintenance(action: number) {

    // Validation
    if (this.idMantenimiento === null || this.idMantenimiento === undefined || !this.nombre || !this.Descripcion ||!this.CodiMaqu || this.tiempoDias === null || this.tiempoDias === undefined || !this.TipoMant) {
      
      console.log("error");
      return;
    }

    // Body for request
    const body = {
      idMantenimiento: Number(this.idMantenimiento),
      nombre: this.nombre,
      Descripcion: this.Descripcion,
      CodiMaqu: this.CodiMaqu,
      tiempoDias: Number(this.tiempoDias),
      TipoMant: this.TipoMant,
    
      CodiComp: this.apiService.clsUser.CodiComp,
      Entidad: 301,

      Token: this.apiService.lstrToken,
      Accion: action
    };

    this.MantenimientosService.saveMaintenance(body).subscribe({

      next: (res) => {
        const message = res[0]?.Messag || 'Operación completada';
        this.sidebarService.addLog(message);
      },
      error: (err) => {
        this.sidebarService.addLog('Error al realizar la operación');
      }
    });
  }
}
