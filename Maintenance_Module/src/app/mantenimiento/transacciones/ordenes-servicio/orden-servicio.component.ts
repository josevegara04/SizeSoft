import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrdenServicioService } from './orden-servicio.service';
import { ApiService } from '../../../services/api.service';
import { SidebarService } from '../../../side-bar/sidebar.service';
import { OrdenServicioModalComponent } from './modal/orden-servicio-modal.component';

interface Repuesto {
  idRepues: number | null;
  cantid: number | null;
}

@Component({
  selector: 'app-ordenes-servicio',
  standalone: true,
  templateUrl: './orden-servicio.component.html',
  styleUrls: ['./orden-servicio.component.css'],
  imports: [FormsModule, OrdenServicioModalComponent],
})
export class OrdenesServicioComponent {
  constructor(
    private ordenService: OrdenServicioService,
    private apiService: ApiService,
    private sidebarService: SidebarService
  ) {}

  // Campos del formulario
  codiOrdMaqu: string = '';
  codiMaqu: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';
  tipoMant: string = '';
  idMantenimiento: number | null = null;
  idEsta: number | null = null;
  nombreEstado: string = '';

  // Listas dinámicas
  repuestos: Repuesto[] = [{ idRepues: null, cantid: null }];
  operarios: (number | null)[] = [null];

  // Modal
  showModal: boolean = false;

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSelectOrder(item: any): void {
    this.codiOrdMaqu = item.CodiOrdMaqu ?? '';
    this.codiMaqu = item.CodiMaqu ?? '';
    this.fechaInicio = item.Fecha_inicio ? this.toDatetimeLocal(item.Fecha_inicio) : '';
    this.fechaFin = item.fechaFin ? this.toDatetimeLocal(item.fechaFin) : '';
    this.tipoMant = item.TipoMant ?? '';
    this.idMantenimiento = item.idMantenimiento ?? null;
    this.idEsta = item.IdEsta ?? null;
    this.nombreEstado = item.NombreEstado ?? '';

    try {
      const reps = JSON.parse(item.Repuestos ?? '[]');
      this.repuestos = reps.length > 0 ? reps : [{ idRepues: null, cantid: null }];
    } catch {
      this.repuestos = [{ idRepues: null, cantid: null }];
    }

    // Los operarios no se retornan en la consulta; el usuario los debe ingresar al editar
    this.operarios = [null];

    this.closeModal();
  }

  private toDatetimeLocal(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toISOString().slice(0, 16);
  }

  // Gestión de repuestos
  addRepuesto(): void {
    this.repuestos.push({ idRepues: null, cantid: null });
  }

  removeRepuesto(index: number): void {
    if (this.repuestos.length > 1) {
      this.repuestos.splice(index, 1);
    }
  }

  // Gestión de operarios
  addOperario(): void {
    this.operarios.push(null);
  }

  removeOperario(index: number): void {
    if (this.operarios.length > 1) {
      this.operarios.splice(index, 1);
    }
  }

  clearForm(): void {
    this.codiOrdMaqu = '';
    this.codiMaqu = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.tipoMant = '';
    this.idMantenimiento = null;
    this.idEsta = null;
    this.nombreEstado = '';
    this.repuestos = [{ idRepues: null, cantid: null }];
    this.operarios = [null];
  }

  handleOrder(action: number): void {
    if (!this.codiOrdMaqu) {
      this.sidebarService.addLog('Ingrese el código de la orden');
      return;
    }

    // Validación de campos completos para crear y editar
    if (action === 1 || action === 3) {
      if (!this.codiMaqu || !this.fechaInicio || !this.tipoMant || !this.idMantenimiento) {
        this.sidebarService.addLog('Complete todos los campos obligatorios');
        return;
      }

      const repuestosValidos = this.repuestos.every(r => r.idRepues && r.cantid && r.cantid > 0);
      if (!repuestosValidos) {
        this.sidebarService.addLog('Complete correctamente los repuestos (ID y cantidad > 0)');
        return;
      }

      const operariosValidos = this.operarios.every(o => o !== null && o > 0);
      if (!operariosValidos) {
        this.sidebarService.addLog('Complete correctamente los operarios (ID > 0)');
        return;
      }
    }

    const body: any = {
      CodiOrdMaqu: this.codiOrdMaqu,
      CodiMaqu: this.codiMaqu,
      Fecha_inicio: this.fechaInicio ? new Date(this.fechaInicio).toISOString() : null,
      TipoMant: this.tipoMant,
      idMantenimiento: this.idMantenimiento,
      fechaFin: this.fechaFin ? new Date(this.fechaFin).toISOString() : null,
      Repuestos: this.repuestos.filter(r => r.idRepues && r.cantid),
      Operarios: this.operarios.filter(o => o !== null) as number[],
      CodiComp: this.apiService.clsUser.CodiComp,
      Token: this.apiService.lstrToken,
      Entidad: 303,
      Accion: action
    };

    this.ordenService.saveOrden(body).subscribe({
      next: (res) => {
        const raw = res[0]?.Messag ?? 'Operación completada';
        let message = raw;
        try {
          const parsed = JSON.parse(raw);
          message = parsed.message ?? raw;
        } catch {}
        this.sidebarService.addLog(message);

        // Actualizar estado local si la operación fue exitosa
        if (action === 2) this.clearForm();
        if (action === 4) { this.idEsta = 3; this.nombreEstado = 'Pausada'; }
        if (action === 5) { this.idEsta = 5; this.nombreEstado = 'Cancelada'; }
        if (action === 6) { this.idEsta = 4; this.nombreEstado = 'Finalizada'; }
        if (action === 7) { this.idEsta = 2; this.nombreEstado = 'Activa'; }
      },
      error: () => {
        this.sidebarService.addLog('Error al procesar la orden');
      }
    });
  }
}
