import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PartesMaquinaService } from '../maquinas-equipos-localidades/services/partes-maquina.service';
import { ApiService } from '../../../services/api.service';
import { SidebarService } from '../../../side-bar/sidebar.service';
import { RepuestosModalComponent } from './modal/repuestos-modal.component';
import { RepuestosService } from './repuestos.service';

@Component({
  selector: 'app-repuestos',
  standalone: true,
  imports: [CommonModule, FormsModule, RepuestosModalComponent],
  templateUrl: './repuestos.component.html',
  styleUrls: ['./repuestos.component.css'],
})
export class RepuestosComponent {
  constructor(
    private repuestosService: RepuestosService,
    private partesService: PartesMaquinaService,
    private apiService: ApiService,
    private sidebarService: SidebarService,
  ) {}

  showModal = false;

  idRepuesto: number | null = null;
  codiPart = '';
  cantid: number | null = null;
  nombreParte = '';
  showPartSelector = false;
  partSearchTerm = '';
  partResults: any[] = [];

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSelectRepuesto(item: any): void {
    this.idRepuesto = this.toNumber(item.idRepuesto ?? item.IdRepuesto ?? item['ID Repuesto']);
    this.codiPart = item.CodiPart ?? item['Código Parte'] ?? item['Codigo Parte'] ?? '';
    this.cantid = this.toNumber(item.Cantid ?? item['Cantidad']);
    this.nombreParte = item.NombreParte ?? item['Nombre Parte'] ?? '';
    this.closeModal();
  }

  clearForm(): void {
    this.idRepuesto = null;
    this.codiPart = '';
    this.cantid = null;
    this.nombreParte = '';
    this.partSearchTerm = '';
    this.showPartSelector = false;
  }

  get filteredPartResults(): any[] {
    const term = this.partSearchTerm.trim().toLowerCase();
    if (!term) {
      return this.partResults;
    }

    return this.partResults.filter(item =>
      item.CodiPart?.toLowerCase().includes(term) ||
      item.NombreParte?.toLowerCase().includes(term)
    );
  }

  togglePartSelector(): void {
    this.showPartSelector = !this.showPartSelector;

    if (this.showPartSelector && this.partResults.length === 0) {
      this.loadParts();
    }
  }

  selectPart(item: any): void {
    this.codiPart = item.CodiPart ?? '';
    this.nombreParte = item.NombreParte ?? '';
    this.partSearchTerm = '';
    this.showPartSelector = false;
  }

  handleRepuesto(action: number): void {
    if (action === 1 || action === 3) {
      if (this.idRepuesto === null || !this.codiPart || this.cantid === null || this.cantid <= 0) {
        this.sidebarService.addLog('Complete los campos obligatorios del repuesto');
        return;
      }
    }

    if (action === 2 && this.idRepuesto === null) {
      this.sidebarService.addLog('Seleccione un repuesto para eliminar');
      return;
    }

    const body = [{
      idRepuesto: this.idRepuesto,
      CodiPart: this.codiPart,
      Cantid: this.cantid,
      CodiUsua: this.apiService.clsUser.Id,
      NombUsua: this.apiService.clsUser.NombUsua,
      CodiComp: this.apiService.clsUser.CodiComp,
      Entidad: 302,
      Token: this.apiService.lstrToken,
      Accion: action,
    }];

    this.repuestosService.save(body).subscribe({
      next: (res) => {
        this.sidebarService.addLog(this.extractMessage(res, 'Operación completada'));
        if (action === 2) {
          this.clearForm();
        }
      },
      error: () => {
        this.sidebarService.addLog('Error al procesar el repuesto');
      },
    });
  }

  private extractMessage(response: any, fallback: string): string {
    const rawMessage = response?.[0]?.Messag ?? response?.[0]?.message;
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

  private toNumber(value: any): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private loadParts(): void {
    const body = [{
      CodiCons: 'ListPart',
      NombPara: 'Comp',
      Valor: this.apiService.clsUser.CodiComp,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token: this.apiService.lstrToken,
      Report: '0',
    }];

    this.partesService.search(body).subscribe({
      next: (res) => {
        this.partResults = Array.isArray(res) ? res : [];
      },
      error: () => {
        this.partResults = [];
        this.sidebarService.addLog('No fue posible cargar las partes');
      },
    });
  }
}
