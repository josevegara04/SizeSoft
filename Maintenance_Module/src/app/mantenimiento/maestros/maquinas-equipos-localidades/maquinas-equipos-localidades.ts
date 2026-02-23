import { Component, inject, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaquinasService, Maquina } from './services/maquinas.service';
import { PartesMaquinaService, ParteMaquina } from './services/partes-maquina.service';

@Component({
  selector: 'app-maquinas-equipos-localidades',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './maquinas-equipos-localidades.html',
  styleUrl: './maquinas-equipos-localidades.css',
})
export class MaquinasEquiposLocalidadesComponent {
  private readonly maquinasService = inject(MaquinasService);
  private readonly partesService = inject(PartesMaquinaService);

  // Machine selector
  searchTerm = '';
  showDropdown = false;
  filteredMaquinas: Maquina[] = [];
  selectedMaquina: Maquina | null = null;

  // Part form
  newPart = { nombreParte: '', codigoParte: '' };

  // Parts list
  partes: ParteMaquina[] = [];

  // Notification
  notification: { type: 'success' | 'error'; message: string } | null = null;

  // ─── Machine Search ──────────────────────────────

  onSearch(): void {
    this.showDropdown = true;
    if (!this.searchTerm.trim()) {
      this.filteredMaquinas = this.maquinasService.getAll();
    } else {
      this.filteredMaquinas = this.maquinasService.searchByNombre(this.searchTerm);
    }
  }

  selectMaquina(maq: Maquina): void {
    this.selectedMaquina = maq;
    this.searchTerm = '';
    this.showDropdown = false;
    this.filteredMaquinas = [];
    this.notification = null;
    this.loadPartes();
  }

  clearSelection(): void {
    this.selectedMaquina = null;
    this.partes = [];
    this.newPart = { nombreParte: '', codigoParte: '' };
    this.notification = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-box')) {
      this.showDropdown = false;
    }
  }

  // ─── Parts CRUD ──────────────────────────────────

  loadPartes(): void {
    if (this.selectedMaquina) {
      this.partes = this.partesService.getByMaquinaId(this.selectedMaquina.id);
    }
  }

  addPart(): void {
    if (!this.selectedMaquina) {
      this.showNotification('error', 'Debe seleccionar una máquina antes de registrar partes.');
      return;
    }

    const result = this.partesService.create(
      this.selectedMaquina.id,
      this.newPart.nombreParte,
      this.newPart.codigoParte
    );

    if (result.success) {
      this.newPart = { nombreParte: '', codigoParte: '' };
      this.loadPartes();
      this.showNotification('success', `Parte "${result.part!.nombreParte}" registrada exitosamente en la ficha técnica.`);
    } else {
      this.showNotification('error', result.error!);
    }
  }

  deletePart(partId: string): void {
    this.partesService.delete(partId);
    this.loadPartes();
    this.showNotification('success', 'Parte eliminada exitosamente.');
  }

  // ─── Helpers ─────────────────────────────────────

  formatDate(isoDate: string): string {
    try {
      return new Date(isoDate).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoDate;
    }
  }

  private showNotification(type: 'success' | 'error', message: string): void {
    this.notification = { type, message };
    if (type === 'success') {
      setTimeout(() => {
        if (this.notification?.message === message) {
          this.notification = null;
        }
      }, 5000);
    }
  }
}
