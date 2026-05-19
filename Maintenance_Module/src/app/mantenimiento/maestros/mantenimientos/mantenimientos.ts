import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MantenimientosService } from './mantenimientos.service';
import { ApiService } from '../../../services/api.service';
import { SidebarService } from '../../../side-bar/sidebar.service';
import { MantenimientosModalComponent } from './modal/mantenimientos-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mantenimientos',
  standalone: true,
  templateUrl: "./mantenimientos.html",
  imports: [FormsModule, MantenimientosModalComponent, CommonModule],
  styleUrls: ["./mantenimientos.css"],
})
export class MantenimientosComponent {

  // Construcutor
  constructor(
    private MantenimientosService: MantenimientosService,
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

  onSelectMaintenance(item: any): void {
    this.idMantenimiento = Number(item.idMantenimiento ?? item.IdMantenimiento ?? 0);
    this.nombre = item.nombre ?? item.Nombre ?? '';
    this.Descripcion = item.Descripcion ?? '';
    this.CodiMaqu = item.CodiMaqu ?? '';
    this.tiempoDias = Number(item.tiempoDias ?? 0);
    this.TipoMant = item.TipoMant ?? '';
    this.showMachineSelector = false;
    this.machineSearchTerm = '';
    this.closeModal();
  }

  // Main variables
  idMantenimiento: number = 0;
  nombre: string = '';
  Descripcion: string = '';
  CodiMaqu: string = '';
  showMachineSelector = false;
  machineSearchTerm = '';
  machineResults: any[] = [];
  tiempoDias: number = 0;
  TipoMant: string = '';

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
    this.CodiMaqu = item.CodiMaqu ?? '';
    this.machineSearchTerm = '';
    this.showMachineSelector = false;
  }

  // Create or update machine part
  handleMaintenance(action: number) {

    // Validation
    if (this.idMantenimiento === null || this.idMantenimiento === undefined || !this.nombre || !this.Descripcion ||!this.CodiMaqu || this.tiempoDias === null || this.tiempoDias === undefined || !this.TipoMant) {
      
      this.sidebarService.addLog("llena todos los campos");
      return;
    }

    // Body for request
    const body = {
      idMantenimiento: Number(this.idMantenimiento),
      nombre: this.nombre,
      Descripcion: this.Descripcion,
      CodiMaqu: this.CodiMaqu,
      tiempoDias: Number(this.tiempoDias),
      TipoMant: this.TipoMant,
    
      CodiComp: this.apiService.clsUser.CodiComp,
      CodiUsua: this.apiService.clsUser.Id,
      NombUsua: this.apiService.clsUser.NombUsua,
      Entidad: 301,

      Token: this.apiService.lstrToken,
      Accion: action
    };

    this.MantenimientosService.saveMaintenance(body).subscribe({

      next: (res) => {
        const message = res[0]?.Messag || 'Operación completada';
        this.sidebarService.addLog(message);
      },
      error: (err) => {
        this.sidebarService.addLog('Error al realizar la operación');
      }
    });
  }

  private loadMachines(): void {
    const body = [{
      CodiCons: 'MaquMant',
      NombPara: 'Codigo Compañia',
      Valor: this.apiService.clsUser.CodiComp,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token: this.apiService.lstrToken,
      Report: '0'
    }];

    this.MantenimientosService.search(body).subscribe({
      next: (res) => {
        this.machineResults = Array.isArray(res) ? res : [];
      },
      error: () => {
        this.machineResults = [];
        this.sidebarService.addLog('No se pudieron cargar las máquinas');
      }
    });
  }
}
