import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PartesMaquinaService } from './services/partes-maquina.service';
import { ApiService } from '../../../services/api.service';
import { SidebarService } from '../../../side-bar/sidebar.service';
import { PartesModalComponent } from './modal/partes-modal.component';
import { CommonModule } from '@angular/common';
import { TIPOS_PARTE_TEMPORALES, findTipoParteByName } from './tipo-parte-options';

@Component({
  selector: 'app-partes-maquina',
  standalone: true,
  imports: [FormsModule, PartesModalComponent, CommonModule],
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

  showModal: boolean = false;

  openModal() {
    this.showModal = true;
  }
  
  closeModal() {
    this.showModal = false;
  }

  // Main variables
  CodiPart: string = '';
  CodiMaqu: string = '';
  tipoParteNombre: string = '';
  nombreParte: string = '';
  tiposParte = TIPOS_PARTE_TEMPORALES;

  private get companyCode(): string {
    return this.apiService.clsUser.CodiComp;
  }

  private get token(): string {
    return this.apiService.lstrToken;
  }

  // Create or update machine part
  handlePart(action: number) {

    // validation when saving / updating
    if (action === 1) {
      if (!this.CodiPart || !this.CodiMaqu || !this.tipoParteNombre || !this.nombreParte) {
        this.sidebarService.addLog('Faltan campos para guardar');
        return;
      }
    }

    const tipoParte = findTipoParteByName(this.tipoParteNombre);

    if (action === 1 && !tipoParte) {
      this.sidebarService.addLog('Selecciona un tipo de parte válido de la lista');
      return;
    }

    // Validation when deleting
    if (action === 2) {
      if (!this.CodiPart || !this.CodiMaqu) {
        this.sidebarService.addLog('Debes ingresar el código de la parte y código de la máquina para eliminar');
        return;
      }
    }

    const body = [
      {
        CodiPart: this.CodiPart.trim(),
        NombreParte: this.nombreParte.trim(),
        IdTipoPart: tipoParte?.id ?? 0,
        CodiMaqu: this.CodiMaqu.trim(),
        CodiComp: this.companyCode,
        Entidad: 300,
        Token: this.token,
        Accion: action
      }
    ];

    console.log(body);

    this.partesService.savePart(body).subscribe({

      next: (res) => {
        const raw = res[0]?.Messag;
      
        if (!raw) {
          this.sidebarService.addLog('Respuesta vacía del servidor');
          return;
        }
      
        try {
          const parsed = JSON.parse(raw);
      
          this.sidebarService.addLog(parsed.message);
      
          if (!parsed.success) {
            console.error('Error lógico:', parsed.message);
          }
      
        } catch (e) {
          this.sidebarService.addLog('Error interpretando respuesta del servidor');
          console.error('Parse error:', e);
        }
      },
      error: (err) => {
        this.sidebarService.addLog('Error al guardar la parte');
      }
    });
  }
}
