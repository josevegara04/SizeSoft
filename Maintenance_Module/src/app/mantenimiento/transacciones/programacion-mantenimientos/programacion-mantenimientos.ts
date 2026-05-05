import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { SidebarService } from '../../../side-bar/sidebar.service';
import { ProgramacionMantenimientosModalComponent } from './modal/programacion-mantenimientos-modal.component';
import { ProgramacionMantenimientosService } from './programacion-mantenimientos.service';

@Component({
  selector: 'app-programacion-mantenimientos',
  standalone: true,
  templateUrl: './programacion-mantenimientos.html',
  styleUrls: ['./programacion-mantenimientos.css'],
  imports: [CommonModule, FormsModule, ProgramacionMantenimientosModalComponent],
})
export class ProgramacionMantenimientosComponent {
  constructor(
    private programacionService: ProgramacionMantenimientosService,
    private apiService: ApiService,
    private sidebarService: SidebarService,
  ) {}

  showModal = false;

  idProgMant: number | null = null;
  idMant: number | null = null;
  fechInic = '';
  frecDias: number | null = null;
  ultiFech = '';
  proxFech = '';
  activo = true;

  nombre = '';
  descripcion = '';
  codiMaqu = '';
  tiempoDias: number | null = null;
  tipoMant = '';

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSelectProgramacion(item: any): void {
    this.idProgMant = item.IdProgMant ?? null;
    this.idMant = item.idMant ?? null;
    this.fechInic = this.normalizeDateInput(item.FechInic);
    this.frecDias = item.FrecDias ?? null;
    this.ultiFech = this.normalizeDateInput(item.UltiFech);
    this.proxFech = this.normalizeDateInput(item.ProxFech);
    this.activo = Boolean(item.Activo);

    this.nombre = item.nombre ?? '';
    this.descripcion = item.Descripcion ?? '';
    this.codiMaqu = item.CodiMaqu ?? '';
    this.tiempoDias = item.tiempoDias ?? null;
    this.tipoMant = item.TipoMant ?? '';

    this.closeModal();
  }

  onFechaInicioChange(): void {
    this.updateProximaFecha();
  }

  onFrecuenciaChange(): void {
    this.updateProximaFecha();
  }

  clearForm(): void {
    this.idProgMant = null;
    this.idMant = null;
    this.fechInic = '';
    this.frecDias = null;
    this.ultiFech = '';
    this.proxFech = '';
    this.activo = true;

    this.nombre = '';
    this.descripcion = '';
    this.codiMaqu = '';
    this.tiempoDias = null;
    this.tipoMant = '';
  }

  handleProgramacion(accion: number): void {
    if (accion === 2 && this.idProgMant === null) {
      this.sidebarService.addLog('Seleccione una programación para eliminar');
      return;
    }

    if (accion === 1) {
      if (!this.idMant || !this.fechInic || !this.frecDias || this.frecDias <= 0) {
        this.sidebarService.addLog('Complete los campos obligatorios de la programación');
        return;
      }

      if (!this.proxFech) {
        this.sidebarService.addLog('No fue posible calcular la próxima fecha');
        return;
      }
    }

    const body: any = {
      IdProgMant: this.idProgMant ?? 0,
      idMant: this.idMant,
      FechInic: this.fechInic || null,
      FrecDias: this.frecDias,
      UltiFech: this.ultiFech || null,
      ProxFech: this.proxFech || null,
      Activo: this.activo,
      CodiComp: this.apiService.clsUser.CodiComp,
      Entidad: 308,
      Token: this.apiService.lstrToken,
      Accion: accion,
    };

    if (accion === 2) {
      body.idMant = this.idMant ?? 0;
      body.FechInic = this.fechInic || null;
      body.FrecDias = this.frecDias ?? 0;
      body.UltiFech = this.ultiFech || null;
      body.ProxFech = this.proxFech || null;
      body.Activo = this.activo;
    }

    this.programacionService.save([body]).subscribe({
      next: (res) => {
        const raw = res?.[0]?.Messag ?? res?.[0]?.message ?? 'Operación completada';
        let message = raw;
        try {
          const parsed = JSON.parse(raw);
          message = parsed.message ?? raw;
        } catch {}

        this.sidebarService.addLog(message);

        if (accion === 2) {
          this.clearForm();
        }
      },
      error: () => {
        this.sidebarService.addLog('Error al procesar la programación');
      },
    });
  }

  private updateProximaFecha(): void {
    if (!this.fechInic || !this.frecDias || this.frecDias <= 0) {
      this.proxFech = '';
      return;
    }

    this.proxFech = this.addDays(this.fechInic, this.frecDias);
  }

  private addDays(dateString: string, days: number): string {
    const date = new Date(`${dateString}T00:00:00`);
    date.setDate(date.getDate() + Number(days));
    return date.toISOString().slice(0, 10);
  }

  private normalizeDateInput(value: string | null | undefined): string {
    if (!value) return '';

    if (typeof value === 'string' && value.includes('T')) {
      return value.slice(0, 10);
    }

    return value;
  }
}
