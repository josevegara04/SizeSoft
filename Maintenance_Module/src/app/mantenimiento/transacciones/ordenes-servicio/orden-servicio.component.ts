import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrdenServicioService } from './orden-servicio.service';
import { ApiService } from '../../../services/api.service';
import { SidebarService } from '../../../side-bar/sidebar.service';
import { OrdenServicioModalComponent } from './modal/orden-servicio-modal.component';
import { OrdenServicioPrefillService, ProgramacionOrdenPrefill } from './orden-servicio-prefill.service';
import { RepuestosService } from '../../maestros/repuestos/repuestos.service';
import { OperariosService } from '../../maestros/operarios/operarios.service';

interface RepuestoRow {
  idRepues: number | null;
  cantid: number | null;
  nombreParte: string;
  showSelector: boolean;
  searchTerm: string;
}

interface OperarioRow {
  id: number | null;
  nombre: string;
  showSelector: boolean;
  searchTerm: string;
}

@Component({
  selector: 'app-ordenes-servicio',
  standalone: true,
  templateUrl: './orden-servicio.component.html',
  styleUrls: ['./orden-servicio.component.css'],
  imports: [FormsModule, OrdenServicioModalComponent],
})
export class OrdenesServicioComponent implements OnInit {
  constructor(
    private ordenService: OrdenServicioService,
    private apiService: ApiService,
    private sidebarService: SidebarService,
    private ordenServicioPrefillService: OrdenServicioPrefillService,
    private repuestosService: RepuestosService,
    private operariosService: OperariosService,
  ) {}

  codiOrdMaqu = '';
  codiMaqu = '';
  machineSearchTerm = '';
  showMachineSelector = false;
  fechaInicio = '';
  fechaFin = '';
  tipoMant = '';
  idMantenimiento: number | null = null;
  idEsta: number | null = null;
  nombreEstado = '';
  programacionOrigenId: number | null = null;
  programacionOrigenNombre = '';

  repuestos: RepuestoRow[] = [this.createEmptyRepuesto()];
  operarios: OperarioRow[] = [this.createEmptyOperario()];

  machineResults: any[] = [];
  repuestoResults: any[] = [];
  operarioResults: any[] = [];

  showModal = false;

  ngOnInit(): void {
    const prefill = this.ordenServicioPrefillService.consumePending();
    if (!prefill) {
      return;
    }

    this.applyProgramacionPrefill(prefill);
  }

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
      this.repuestos = Array.isArray(reps) && reps.length > 0
        ? reps.map((rep: any) => ({
            idRepues: this.toNumber(rep.idRepues),
            cantid: this.toNumber(rep.cantid),
            nombreParte: '',
            showSelector: false,
            searchTerm: '',
          }))
        : [this.createEmptyRepuesto()];
    } catch {
      this.repuestos = [this.createEmptyRepuesto()];
    }

    this.operarios = [this.createEmptyOperario()];
    this.closeModal();
  }

  addRepuesto(): void {
    this.repuestos.push(this.createEmptyRepuesto());
  }

  removeRepuesto(index: number): void {
    if (this.repuestos.length > 1) {
      this.repuestos.splice(index, 1);
    }
  }

  addOperario(): void {
    this.operarios.push(this.createEmptyOperario());
  }

  removeOperario(index: number): void {
    if (this.operarios.length > 1) {
      this.operarios.splice(index, 1);
    }
  }

  clearForm(): void {
    this.codiOrdMaqu = '';
    this.codiMaqu = '';
    this.machineSearchTerm = '';
    this.showMachineSelector = false;
    this.fechaInicio = '';
    this.fechaFin = '';
    this.tipoMant = '';
    this.idMantenimiento = null;
    this.idEsta = null;
    this.nombreEstado = '';
    this.programacionOrigenId = null;
    this.programacionOrigenNombre = '';
    this.repuestos = [this.createEmptyRepuesto()];
    this.operarios = [this.createEmptyOperario()];
  }

  toggleMachineSelector(): void {
    this.showMachineSelector = !this.showMachineSelector;
    if (this.showMachineSelector && this.machineResults.length === 0) {
      this.loadMachines();
    }
  }

  get filteredMachineResults(): any[] {
    const term = this.machineSearchTerm.trim().toLowerCase();
    if (!term) {
      return this.machineResults;
    }

    return this.machineResults.filter(item =>
      item.CodiMaqu?.toLowerCase().includes(term)
    );
  }

  selectMachine(item: any): void {
    this.codiMaqu = item.CodiMaqu ?? '';
    this.machineSearchTerm = '';
    this.showMachineSelector = false;
  }

  toggleRepuestoSelector(index: number): void {
    this.repuestos[index].showSelector = !this.repuestos[index].showSelector;
    if (this.repuestos[index].showSelector && this.repuestoResults.length === 0) {
      this.loadRepuestos();
    }
  }

  getFilteredRepuestoResults(index: number): any[] {
    const term = this.repuestos[index].searchTerm.trim().toLowerCase();
    if (!term) {
      return this.repuestoResults;
    }

    return this.repuestoResults.filter(item =>
      item.idRepuesto?.toString().includes(term) ||
      item.NombreParte?.toLowerCase().includes(term)
    );
  }

  selectRepuesto(index: number, item: any): void {
    this.repuestos[index].idRepues = this.toNumber(item.idRepuesto ?? item.IdRepuesto);
    this.repuestos[index].nombreParte = item.NombreParte ?? '';
    this.repuestos[index].searchTerm = '';
    this.repuestos[index].showSelector = false;
  }

  toggleOperarioSelector(index: number): void {
    this.operarios[index].showSelector = !this.operarios[index].showSelector;
    if (this.operarios[index].showSelector && this.operarioResults.length === 0) {
      this.loadOperarios();
    }
  }

  getFilteredOperarioResults(index: number): any[] {
    const term = this.operarios[index].searchTerm.trim().toLowerCase();
    if (!term) {
      return this.operarioResults;
    }

    return this.operarioResults.filter(item =>
      item.IdOper?.toString().includes(term) ||
      item.Nombre?.toLowerCase().includes(term) ||
      item.Apellid?.toLowerCase().includes(term)
    );
  }

  selectOperario(index: number, item: any): void {
    this.operarios[index].id = this.toNumber(item.IdOper);
    this.operarios[index].nombre = [item.Nombre ?? '', item.Apellid ?? ''].join(' ').trim();
    this.operarios[index].searchTerm = '';
    this.operarios[index].showSelector = false;
  }

  handleOrder(action: number): void {
    if (!this.codiOrdMaqu) {
      this.sidebarService.addLog('Ingrese el código de la orden');
      return;
    }

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

      const operariosValidos = this.operarios.every(o => o.id !== null && o.id > 0);
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
      Repuestos: this.repuestos
        .filter(r => r.idRepues && r.cantid)
        .map(r => ({ idRepues: r.idRepues, cantid: r.cantid })),
      Operarios: this.operarios
        .filter(o => o.id !== null)
        .map(o => o.id as number),
      CodiComp: this.apiService.clsUser.CodiComp,
      CodiUsua: this.apiService.clsUser.Id,
      NombUsua: this.apiService.clsUser.NombUsua,
      Token: this.apiService.lstrToken,
      Entidad: 303,
      Accion: action,
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

  private applyProgramacionPrefill(prefill: ProgramacionOrdenPrefill): void {
    this.clearForm();

    this.codiMaqu = prefill.codiMaqu ?? '';
    this.tipoMant = prefill.tipoMant ?? '';
    this.idMantenimiento = prefill.idMant ?? null;
    this.fechaInicio = this.toDatetimeLocalFromDate(prefill.proxFech || prefill.fechInic);
    this.programacionOrigenId = prefill.idProgMant ?? null;
    this.programacionOrigenNombre = prefill.nombre ?? '';

    this.sidebarService.addLog('Se cargó la información base de la programación seleccionada');
  }

  private loadRepuestos(): void {
    const body = [{
      CodiCons: 'RepuMant',
      NombPara: 'Codigo Compañia',
      Valor: this.apiService.clsUser.CodiComp,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token: this.apiService.lstrToken,
      Report: '0',
    }];

    this.repuestosService.search(body).subscribe({
      next: (res) => {
        this.repuestoResults = Array.isArray(res) ? res : [];
      },
      error: () => {
        this.repuestoResults = [];
        this.sidebarService.addLog('No fue posible cargar los repuestos');
      },
    });
  }

  private loadMachines(): void {
    const body = [{
      CodiCons: 'MaquMant',
      NombPara: 'Codigo Compañia',
      Valor: this.apiService.clsUser.CodiComp,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token: this.apiService.lstrToken,
      Report: '0',
    }];

    this.ordenService.search(body).subscribe({
      next: (res) => {
        this.machineResults = Array.isArray(res) ? res : [];
      },
      error: () => {
        this.machineResults = [];
        this.sidebarService.addLog('No fue posible cargar las máquinas');
      },
    });
  }

  private loadOperarios(): void {
    const body = [{
      CodiCons: 'Operar',
      NombPara: 'Compañía',
      Valor: this.apiService.clsUser.CodiComp,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token: this.apiService.lstrToken,
      Report: '0',
    }];

    this.operariosService.search(body).subscribe({
      next: (res) => {
        this.operarioResults = Array.isArray(res) ? res : [];
      },
      error: () => {
        this.operarioResults = [];
        this.sidebarService.addLog('No fue posible cargar los operarios');
      },
    });
  }

  private createEmptyRepuesto(): RepuestoRow {
    return {
      idRepues: null,
      cantid: null,
      nombreParte: '',
      showSelector: false,
      searchTerm: '',
    };
  }

  private createEmptyOperario(): OperarioRow {
    return {
      id: null,
      nombre: '',
      showSelector: false,
      searchTerm: '',
    };
  }

  private toDatetimeLocal(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toISOString().slice(0, 16);
  }

  private toDatetimeLocalFromDate(dateStr: string): string {
    if (!dateStr) {
      return '';
    }

    return `${dateStr.slice(0, 10)}T00:00`;
  }

  private toNumber(value: any): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
