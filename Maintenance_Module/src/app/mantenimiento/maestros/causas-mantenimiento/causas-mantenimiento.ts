import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { SidebarService } from '../../../side-bar/sidebar.service';
import { CausasMantenimientoModalComponent } from './modal/causas-mantenimiento-modal.component';
import { CausasMantenimientoService } from './causas-mantenimiento.service';

@Component({
  selector: 'app-causas-mantenimiento',
  standalone: true,
  imports: [FormsModule, CommonModule, CausasMantenimientoModalComponent],
  templateUrl: './causas-mantenimiento.html',
  styleUrls: ['./causas-mantenimiento.css'],
})
export class CausasMantenimientoComponent {
  constructor(
    private causasService: CausasMantenimientoService,
    private apiService: ApiService,
    private sidebarService: SidebarService
  ) {}

  showModal = false;

  idCausMant: number | null = null;
  codiCaus = '';
  nombCaus = '';
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
    this.idCausMant = this.toNumber(item['ID Causa Mantenimiento']);
    this.codiCaus = item['Codigo Causa'] || '';
    this.nombCaus = item['Nombre Causa'] || '';
    this.descri = item['Descripcion'] || '';
    this.tipoMant = item.TipoMant || item['Tipo Mantenimiento'] || '';
    this.activo = this.toNumber(item['Activo'], 1) ?? 1;
    this.closeModal();
  }

  handleCause(action: number): void {
    if (action === 1) {
      if (
        this.idCausMant === null ||
        this.idCausMant === undefined ||
        !this.codiCaus ||
        !this.nombCaus ||
        !this.descri ||
        !this.tipoMant
      ) {
        this.sidebarService.addLog('Llena todos los campos obligatorios');
        return;
      }
    } else if (this.idCausMant === null || this.idCausMant === undefined) {
      this.sidebarService.addLog('Indica el ID de la causa a eliminar');
      return;
    }

    const body = [{
      IdCausMant: Number(this.idCausMant),
      CodiCaus: this.codiCaus,
      NombCaus: this.nombCaus,
      Descri: this.descri,
      TipoMant: this.tipoMant,
      Activo: Number(this.activo),
      CodiComp: this.apiService.clsUser.CodiComp,
      Entidad: 306,
      Token: this.apiService.lstrToken,
      Accion: action,
    }];

    this.causasService.save(body).subscribe({
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
