import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OperariosService } from './operarios.service';
import { ApiService } from '../../../services/api.service';
import { SidebarService } from '../../../side-bar/sidebar.service';
import { OperariosModalComponent } from './modal/operarios-modal.component';

@Component({
  selector: 'app-operarios',
  standalone: true,
  templateUrl: './operarios.html',
  styleUrls: ['./operarios.css'],
  imports: [FormsModule, OperariosModalComponent],
})
export class OperariosComponent {

  constructor(
    private operariosService: OperariosService,
    private apiService: ApiService,
    private sidebarService: SidebarService,
  ) {}

  // Campos del formulario
  nombre:  string = '';
  apellid: string = '';
  cedula:  string = '';
  cargo:   string = '';
  especi:  string = '';
  telefo:  string = '';
  email:   string = '';
  activo:  number = 1;

  // ID del operario cargado (null = nuevo)
  idOper: number | null = null;

  // Modal
  showModal: boolean = false;

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSelectOperario(item: any): void {
    this.idOper  = item.IdOper  ?? null;
    this.nombre  = item.Nombre  ?? '';
    this.apellid = item.Apellid ?? '';
    this.cedula  = item.Cedula  ?? '';
    this.cargo   = item.Cargo   ?? '';
    this.especi  = item.Especi  ?? '';
    this.telefo  = item.Telefo  ?? '';
    this.email   = item.Email   ?? '';
    this.activo  = item.Activo  ?? 1;
    this.closeModal();
  }

  clearForm(): void {
    this.idOper  = null;
    this.nombre  = '';
    this.apellid = '';
    this.cedula  = '';
    this.cargo   = '';
    this.especi  = '';
    this.telefo  = '';
    this.email   = '';
    this.activo  = 1;
  }

  handleOperario(accion: number): void {
    if (accion === 1) {
      if (!this.nombre || !this.apellid || !this.cedula || !this.cargo) {
        this.sidebarService.addLog('Complete todos los campos obligatorios');
        return;
      }
    }

    if (accion === 2 && this.idOper === null) {
      this.sidebarService.addLog('Seleccione un operario para eliminar');
      return;
    }

    const body: any = {
      Accion:   accion,
      CodiComp: this.apiService.clsUser.CodiComp,
      CodiUsua: this.apiService.clsUser.Id,
      NombUsua: this.apiService.clsUser.NombUsua,
      Token:    this.apiService.lstrToken,
      Entidad:  304,
    };

    if (accion === 1) {
      body['Nombre']  = this.nombre;
      body['Apellid'] = this.apellid;
      body['Cedula']  = this.cedula;
      body['Cargo']   = this.cargo;
      body['Especi']  = this.especi;
      body['Telefo']  = this.telefo;
      body['Email']   = this.email;
      body['Activo']  = this.activo;
      if (this.idOper !== null) body['IdOper'] = this.idOper;
    }

    if (accion === 2) {
      body['IdOper'] = this.idOper;
    }

    this.operariosService.save([body]).subscribe({
      next: (res) => {
        const raw = res?.[0]?.Messag ?? res?.[0]?.message ?? 'Operación completada';
        let message = raw;
        try {
          const parsed = JSON.parse(raw);
          message = parsed.message ?? raw;
        } catch {}
        this.sidebarService.addLog(message);
        if (accion === 2) this.clearForm();
      },
      error: () => {
        this.sidebarService.addLog('Error al procesar el operario');
      },
    });
  }
}
