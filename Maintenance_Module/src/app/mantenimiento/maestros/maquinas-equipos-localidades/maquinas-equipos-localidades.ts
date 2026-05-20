import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PartesMaquinaService } from './services/partes-maquina.service';
import { ApiService } from '../../../services/api.service';
import { SidebarService } from '../../../side-bar/sidebar.service';
import { PartesModalComponent } from './modal/partes-modal.component';
import { CommonModule } from '@angular/common';
import { TipoParteOption } from './tipo-parte-options';

@Component({
  selector: 'app-partes-maquina',
  standalone: true,
  imports: [FormsModule, PartesModalComponent, CommonModule],
  templateUrl: './maquinas-equipos-localidades.html',
  styleUrls: ['./maquinas-equipos-localidades.css']
})
export class MaquinasEquiposLocalidadesComponent implements OnInit {

  // Construcutor
  constructor(
    private partesService: PartesMaquinaService,
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

  // Main variables
  CodiPart: string = '';
  CodiMaqu: string = '';
  showMachineSelector = false;
  machineSearchTerm = '';
  machineResults: any[] = [];
  tipoParteId: number | null = null;
  nombreParte: string = '';
  tiposParte: TipoParteOption[] = [];
  isEditing = false;

  ngOnInit(): void {
    this.loadTiposParte();
  }

  private get companyCode(): string {
    return this.apiService.clsUser.CodiComp;
  }

  private get token(): string {
    return this.apiService.lstrToken;
  }

  fillForm(item: any): void {
    this.CodiPart = item.CodiPart ?? '';
    this.CodiMaqu = item.CodiMaqu ?? '';
    this.tipoParteId = this.toNumber(item.IdTipoPartReal ?? item.IdTipoPart);
    this.nombreParte = item.NombreParte ?? '';
    this.isEditing = true;
    this.closeModal();
  }

  clearForm(): void {
    this.CodiPart = '';
    this.CodiMaqu = '';
    this.showMachineSelector = false;
    this.machineSearchTerm = '';
    this.tipoParteId = null;
    this.nombreParte = '';
    this.isEditing = false;
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
    this.CodiMaqu = item.CodiMaqu ?? '';
    this.machineSearchTerm = '';
    this.showMachineSelector = false;
  }

  private loadTiposParte(): void {
    const body = [{
      CodiCons: 'TipoPart',
      NombPara: 'Codigo Compañia',
      Valor: this.companyCode,
      CodiComp: this.companyCode,
      Token: this.token,
      Report: '0'
    }];

    this.partesService.searchTiposParte(body).subscribe({
      next: (res) => {
        this.tiposParte = Array.isArray(res)
          ? res.map((item: any) => ({
              id: Number(item.Id ?? 0),
              nombre: item.Nomb ?? '',
              descripcion: item.Descripcion ?? ''
            })).filter((item: TipoParteOption) => item.id > 0 && !!item.nombre)
          : [];
      },
      error: () => {
        this.tiposParte = [];
        this.sidebarService.addLog('No se pudieron cargar los tipos de parte');
      }
    });
  }

  private loadMachines(): void {
    const body = [{
      CodiCons: 'MaquMant',
      NombPara: 'Codigo Compañia',
      Valor: this.companyCode,
      CodiComp: this.companyCode,
      Token: this.token,
      Report: '0'
    }];

    this.partesService.search(body).subscribe({
      next: (res) => {
        this.machineResults = Array.isArray(res) ? res : [];
      },
      error: () => {
        this.machineResults = [];
        this.sidebarService.addLog('No se pudieron cargar las máquinas');
      }
    });
  }

  // Create or update machine part
  handlePart(action: number) {

    // validation when saving / updating
    if (action === 1) {
      if (!this.CodiPart || !this.CodiMaqu || !this.tipoParteId || !this.nombreParte) {
        this.sidebarService.addLog('Faltan campos para guardar');
        return;
      }
    }

    // Validation when deleting
    if (action === 2) {
      if (!this.CodiPart || !this.CodiMaqu) {
        this.sidebarService.addLog('Debes ingresar el código de la parte y código de la máquina para eliminar');
        return;
      }
    }

    const body = [
      {
        CodiPart: this.CodiPart.trim(),
        NombreParte: this.nombreParte.trim(),
        IdTipoPart: this.tipoParteId ?? 0,
        CodiMaqu: this.CodiMaqu.trim(),
        CodiComp: this.companyCode,
        CodiUsua: this.apiService.clsUser.Id,
        NombUsua: this.apiService.clsUser.NombUsua,
        Entidad: 300,
        Token: this.token,
        Accion: action
      }
    ];

    console.log(body);

    this.partesService.savePart(body).subscribe({

      next: (res) => {
        const raw = res[0]?.Messag;
      
        if (!raw) {
          this.sidebarService.addLog('Respuesta vacía del servidor');
          return;
        }
      
        try {
          const parsed = JSON.parse(raw);
      
          this.sidebarService.addLog(parsed.message);

          if (parsed.success && action === 2) {
            this.clearForm();
          }
      
          if (!parsed.success) {
            console.error('Error lógico:', parsed.message);
          }
      
        } catch (e) {
          this.sidebarService.addLog('Error interpretando respuesta del servidor');
          console.error('Parse error:', e);
        }
      },
      error: (err) => {
        this.sidebarService.addLog('Error al guardar la parte');
      }
    });
  }

  private toNumber(value: any): number | null {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  }
}
