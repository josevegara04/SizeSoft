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

  // Inline edit
  editingPartId: string | null = null;
  editForm = { nombreParte: '', codigoParte: '' };

  // Delete confirmation
  deleteConfirm: ParteMaquina | null = null;

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
    this.editingPartId = null;
    this.loadPartes();
  }

  clearSelection(): void {
    this.selectedMaquina = null;
    this.partes = [];
    this.newPart = { nombreParte: '', codigoParte: '' };
    this.editingPartId = null;
    this.deleteConfirm = null;
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

  // ─── Inline Edit ─────────────────────────────────

  startEdit(parte: ParteMaquina): void {
    this.editingPartId = parte.id;
    this.editForm = { nombreParte: parte.nombreParte, codigoParte: parte.codigoParte };
    this.notification = null;
  }

  saveEdit(): void {
    if (!this.editingPartId) return;

    const result = this.partesService.update(
      this.editingPartId,
      this.editForm.nombreParte,
      this.editForm.codigoParte
    );

    if (result.success) {
      this.editingPartId = null;
      this.loadPartes();
      this.showNotification('success', `Parte "${result.part!.nombreParte}" actualizada exitosamente.`);
    } else {
      this.showNotification('error', result.error!);
    }
  }

  cancelEdit(): void {
    this.editingPartId = null;
  }

  // ─── Delete with Confirmation ────────────────────

  confirmDelete(parte: ParteMaquina): void {
    this.deleteConfirm = parte;
  }

  executeDelete(): void {
    if (!this.deleteConfirm) return;
    const name = this.deleteConfirm.nombreParte;
    this.partesService.delete(this.deleteConfirm.id);
    this.deleteConfirm = null;
    this.loadPartes();
    this.showNotification('success', `Parte "${name}" eliminada exitosamente.`);
  }

  cancelDelete(): void {
    this.deleteConfirm = null;
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
