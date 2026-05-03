import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { SidebarService } from '../../../side-bar/sidebar.service';
import { ActividadesMantenimientoModalComponent } from './modal/actividades-mantenimiento-modal.component';
import { ActividadesMantenimientoService } from './actividades-mantenimiento.service';

@Component({
  selector: 'app-actividades-mantenimiento',
  standalone: true,
  templateUrl: './actividades-mantenimiento.html',
  imports: [FormsModule, CommonModule, ActividadesMantenimientoModalComponent],
  styleUrls: ['./actividades-mantenimiento.css'],
})
export class ActividadesMantenimientoComponent {
  constructor(
    private actividadesService: ActividadesMantenimientoService,
    private apiService: ApiService,
    private sidebarService: SidebarService
  ) {}

  showModal = false;

  idActiMant: number | null = null;
  codiActi = '';
  nombActi = '';
  descri = '';
  tipoMant = '';
  activo = 1;

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  fillForm(item: any): void {
    this.idActiMant = this.toNumber(item['ID Actividad Mantenimiento']);
    this.codiActi = item['Codigo Actividad'] || '';
    this.nombActi = item['Nombre Actividad'] || '';
    this.descri = item['Descripcion'] || '';
    this.tipoMant = item.TipoMant || item['Tipo Mantenimiento'] || '';
    this.activo = this.toNumber(item['Activo'], 1) ?? 1;
    this.closeModal();
  }

  handleActivity(action: number): void {
    if (action === 1) {
      if (
        this.idActiMant === null ||
        this.idActiMant === undefined ||
        !this.codiActi ||
        !this.nombActi ||
        !this.descri ||
        !this.tipoMant
      ) {
        this.sidebarService.addLog('Llena todos los campos obligatorios');
        return;
      }
    } else if (this.idActiMant === null || this.idActiMant === undefined) {
      this.sidebarService.addLog('Indica el ID de la actividad a eliminar');
      return;
    }

    const body = [{
      IdActiMant: Number(this.idActiMant),
      CodiActi: this.codiActi,
      NombActi: this.nombActi,
      Descri: this.descri,
      TipoMant: this.tipoMant,
      Activo: Number(this.activo),
      CodiComp: this.apiService.clsUser.CodiComp,
      Entidad: 307,
      Token: this.apiService.lstrToken,
      Accion: action,
    }];

    this.actividadesService.save(body).subscribe({
      next: (res) => {
        this.sidebarService.addLog(this.extractMessage(res, 'Operación completada'));
      },
      error: () => {
        this.sidebarService.addLog('Error al realizar la operación');
      },
    });
  }

  private extractMessage(response: any, fallback: string): string {
    const rawMessage = response?.[0]?.Messag;
    if (!rawMessage) {
      return fallback;
    }

    try {
      const parsed = JSON.parse(rawMessage);
      return parsed?.message || rawMessage;
    } catch {
      return rawMessage;
    }
  }

  private toNumber(value: any, fallback: number | null = null): number | null {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }
}
