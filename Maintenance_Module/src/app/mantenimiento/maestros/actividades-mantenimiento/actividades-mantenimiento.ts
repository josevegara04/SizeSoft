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

  IdActiMant: number | null = null;
  CodiActi = '';
  NombActi = '';
  Descri = '';
  TipoMant = '';
  Activo = 1;

  get isEditing(): boolean {
    return this.IdActiMant !== null && this.IdActiMant !== undefined;
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  fillForm(item: any): void {
    this.IdActiMant = this.toNumber(item.IdActiMant ?? item['ID Actividad Mantenimiento']);
    this.CodiActi = item.CodiActi || item['Codigo Actividad'] || '';
    this.NombActi = item.NombActi || item['Nombre Actividad'] || '';
    this.Descri = item.Descri || item['Descripcion'] || '';
    this.TipoMant = item.TipoMant || item['Tipo Mantenimiento'] || '';
    this.Activo = this.toNumber(item['Activo'], 1) ?? 1;
    this.closeModal();
  }

  clearForm(): void {
    this.IdActiMant = null;
    this.CodiActi = '';
    this.NombActi = '';
    this.Descri = '';
    this.TipoMant = '';
    this.Activo = 1;
  }

  handleActivity(action: number): void {
    if (action === 1 || action === 3) {
      if (
        this.IdActiMant === null ||
        this.IdActiMant === undefined ||
        !this.CodiActi ||
        !this.NombActi ||
        !this.Descri ||
        !this.TipoMant
      ) {
        this.sidebarService.addLog('Llena todos los campos obligatorios');
        return;
      }
    } else if (this.IdActiMant === null || this.IdActiMant === undefined) {
      this.sidebarService.addLog('Selecciona la actividad que deseas eliminar');
      return;
    }

    const body = [{
      IdActiMant: Number(this.IdActiMant),
      CodiActi: this.CodiActi,
      NombActi: this.NombActi,
      Descri: this.Descri,
      TipoMant: this.TipoMant,
      Activo: Number(this.Activo),
      CodiComp: this.apiService.clsUser.CodiComp,
      Entidad: 307,
      Token: this.apiService.lstrToken,
      Accion: action,
    }];

    this.actividadesService.save(body).subscribe({
      next: (res) => {
        this.sidebarService.addLog(this.extractMessage(res, 'Operación completada'));
        if (action === 2) {
          this.clearForm();
        }
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
