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
  private editingFromSearch = false;

  IdCausMant: number | null = null;
  CodiCaus = '';
  NombCaus = '';
  Descri = '';
  TipoMant = '';
  Activo = 1;

  get isEditing(): boolean {
    return this.editingFromSearch;
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  fillForm(item: any): void {
    this.editingFromSearch = true;
    this.IdCausMant = this.toNumber(item.IdCausMant ?? item['ID Causa Mantenimiento']);
    this.CodiCaus = item.CodiCaus || item['Codigo Causa'] || '';
    this.NombCaus = item.NombCaus || item['Nombre Causa'] || '';
    this.Descri = item.Descri || item['Descripcion'] || '';
    this.TipoMant = item.TipoMant || item['Tipo Mantenimiento'] || '';
    this.Activo = this.toNumber(item['Activo'], 1) ?? 1;
    this.closeModal();
  }

  clearForm(): void {
    this.editingFromSearch = false;
    this.IdCausMant = null;
    this.CodiCaus = '';
    this.NombCaus = '';
    this.Descri = '';
    this.TipoMant = '';
    this.Activo = 1;
  }

  handleCause(action: number): void {
    if (action === 1 || action === 3) {
      if (
        !this.CodiCaus ||
        !this.NombCaus ||
        !this.Descri ||
        !this.TipoMant
      ) {
        this.sidebarService.addLog('Llena todos los campos obligatorios');
        return;
      }
    } else if (this.IdCausMant === null || this.IdCausMant === undefined) {
      this.sidebarService.addLog('Selecciona la causa que deseas eliminar');
      return;
    }

    const body = [{
      IdCausMant: this.IdCausMant ?? 0,
      CodiCaus: this.CodiCaus,
      NombCaus: this.NombCaus,
      Descri: this.Descri,
      TipoMant: this.TipoMant,
      Activo: Number(this.Activo),
      CodiComp: this.apiService.clsUser.CodiComp,
      Entidad: 306,
      Token: this.apiService.lstrToken,
      Accion: action,
    }];

    this.causasService.save(body).subscribe({
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
