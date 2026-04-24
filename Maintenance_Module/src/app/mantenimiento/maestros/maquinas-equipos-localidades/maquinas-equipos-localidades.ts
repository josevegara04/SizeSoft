import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PartesMaquinaService } from './services/partes-maquina.service';
import { ApiService } from '../../../services/api.service';
import { SidebarService } from '../../../side-bar/sidebar.service';

@Component({
  selector: 'app-partes-maquina',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './maquinas-equipos-localidades.html',
  styleUrls: ['./maquinas-equipos-localidades.css']
})
export class MaquinasEquiposLocalidadesComponent {

  // Construcutor
  constructor(
    private partesService: PartesMaquinaService,
    private apiService: ApiService,
    private sidebarService: SidebarService
  ) {}

  // Main variables
  CodiPart: string = '';
  CodiMaqu: string = '';
  idTipoPart: string = '';
  nombreParte: string = '';

  // Create or update machine part
  handlePart(action: number) {

    // Validation
    if (!this.CodiPart || !this.CodiMaqu || !this.idTipoPart || !this.nombreParte) {
      
      return;
    }

    // Body for request
    const body = {
      CodiPart: this.CodiPart,
      NombreParte: this.nombreParte,
      idTipoParte: Number(this.idTipoPart),
      CodiMaqu: this.CodiMaqu,
    
      CodiComp: this.apiService.clsUser.CodiComp,
      Entidad: 300,

      Token: this.apiService.lstrToken,
      Accion: action
    };

    this.partesService.savePart(body).subscribe({

      next: (res) => {
        const message = res[0]?.Messag || 'Operación completada';
        this.sidebarService.addLog(message);
      },
      error: (err) => {
        this.sidebarService.addLog('Error al guardar la parte');
      }
  
    });
  }
}