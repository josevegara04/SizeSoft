import { Component, signal, computed } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Repuesto } from './repuesto.model';

@Component({
  selector: 'app-repuestos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './repuestos.component.html',
  styleUrl: './repuestos.component.css',
})
export class RepuestosComponent {
  // ──── State ────
  private nextId = 6;
  readonly searchTerm = signal('');
  readonly showDropdown = signal(false);
  readonly editingRepuesto = signal<Repuesto | null>(null);
  readonly deletingId = signal<number | null>(null);
  readonly selectedRepuesto = signal<Repuesto | null>(null);
  readonly editingInlineId = signal<number | null>(null);
  readonly notification = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  readonly repuestos = signal<Repuesto[]>([
    {
      id: 1,
      codigo: 'REP-001',
      nombre: 'Rodamiento 6205',
      descripcion: 'Rodamiento rígido de bolas SKF 6205-2RS',
      categoria: 'Mecánico',
      unidadMedida: 'Unidad',
      cantidadStock: 25,
      stockMinimo: 10,
      precioUnitario: 18500,
      ubicacion: 'Almacén A - Estante 2',
      proveedor: 'SKF Colombia',
      activo: true,
    },
    {
      id: 2,
      codigo: 'REP-002',
      nombre: 'Correa Dentada HTD 5M',
      descripcion: 'Correa de transmisión dentada 5M-450, ancho 15mm',
      categoria: 'Mecánico',
      unidadMedida: 'Unidad',
      cantidadStock: 4,
      stockMinimo: 5,
      precioUnitario: 42000,
      ubicacion: 'Almacén A - Estante 5',
      proveedor: 'Gates Industrial',
      activo: true,
    },
    {
      id: 3,
      codigo: 'REP-003',
      nombre: 'Contactor Tripolar 32A',
      descripcion: 'Contactor electromagnético Schneider LC1D32 220V',
      categoria: 'Eléctrico',
      unidadMedida: 'Unidad',
      cantidadStock: 8,
      stockMinimo: 3,
      precioUnitario: 185000,
      ubicacion: 'Almacén B - Panel 1',
      proveedor: 'Schneider Electric',
      activo: true,
    },
    {
      id: 4,
      codigo: 'REP-004',
      nombre: 'Aceite Hidráulico ISO 68',
      descripcion: 'Aceite mineral para sistemas hidráulicos, viscosidad ISO 68',
      categoria: 'Lubricante',
      unidadMedida: 'Litro',
      cantidadStock: 120,
      stockMinimo: 50,
      precioUnitario: 22000,
      ubicacion: 'Almacén C - Zona de líquidos',
      proveedor: 'Mobil Industrial',
      activo: true,
    },
    {
      id: 5,
      codigo: 'REP-005',
      nombre: 'Filtro de Aire Comprimido',
      descripcion: 'Elemento filtrante para unidad FRL 1/2"',
      categoria: 'Filtro',
      unidadMedida: 'Unidad',
      cantidadStock: 2,
      stockMinimo: 4,
      precioUnitario: 35000,
      ubicacion: 'Almacén A - Estante 8',
      proveedor: 'SMC Neumática',
      activo: false,
    },
  ]);

  // ──── Computed ────
  readonly filteredRepuestos = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.repuestos();
    return this.repuestos().filter(
      (r) =>
        r.codigo.toLowerCase().includes(term) ||
        r.nombre.toLowerCase().includes(term) ||
        r.categoria.toLowerCase().includes(term) ||
        r.unidadMedida.toLowerCase().includes(term) ||
        r.cantidadStock.toString().includes(term) ||
        r.precioUnitario.toString().includes(term) ||
        r.ubicacion.toLowerCase().includes(term) ||
        r.proveedor.toLowerCase().includes(term)
    );
  });

  // ──── Form data ────
  formData: Omit<Repuesto, 'id'> = this.emptyFormData();
  inlineData: Omit<Repuesto, 'id'> = this.emptyFormData();

  private emptyFormData(): Omit<Repuesto, 'id'> {
    return {
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria: '',
      unidadMedida: '',
      cantidadStock: 0,
      stockMinimo: 0,
      precioUnitario: 0,
      ubicacion: '',
      proveedor: '',
      activo: true,
    };
  }

  // ──── Actions ────
  selectRepuesto(repuesto: Repuesto): void {
    this.selectedRepuesto.set(repuesto);
    this.showDropdown.set(false);
    this.searchTerm.set('');
  }

  saveRepuesto(form: NgForm): void {
    const editing = this.editingRepuesto();
    if (editing) {
      this.repuestos.update((list) =>
        list.map((r) => (r.id === editing.id ? { ...r, ...this.formData } : r))
      );
      this.showNotification('success', 'Repuesto actualizado correctamente.');
    } else {
      const newRepuesto: Repuesto = {
        id: this.nextId++,
        ...this.formData,
      };
      this.repuestos.update((list) => [...list, newRepuesto]);
      this.showNotification('success', 'Repuesto registrado correctamente.');
    }
    this.formData = this.emptyFormData();
    this.editingRepuesto.set(null);
    form.resetForm();
  }

  // ──── Inline Edit ────
  startInlineEdit(repuesto: Repuesto): void {
    this.editingInlineId.set(repuesto.id);
    this.inlineData = { ...repuesto };
  }

  saveInlineEdit(): void {
    const id = this.editingInlineId();
    if (id !== null) {
      this.repuestos.update((list) =>
        list.map((r) => (r.id === id ? { ...r, ...this.inlineData } : r))
      );
      this.showNotification('success', 'Repuesto actualizado correctamente.');
    }
    this.editingInlineId.set(null);
  }

  cancelInlineEdit(): void {
    this.editingInlineId.set(null);
  }

  // ──── Delete ────
  getDeletingRepuesto(): Repuesto | undefined {
    const id = this.deletingId();
    return this.repuestos().find((r) => r.id === id);
  }

  confirmDelete(id: number): void {
    this.repuestos.update((list) => list.filter((r) => r.id !== id));
    this.deletingId.set(null);
    this.showNotification('success', 'Repuesto eliminado correctamente.');
  }

  // ──── Notification ────
  private showNotification(type: 'success' | 'error', message: string): void {
    this.notification.set({ type, message });
    setTimeout(() => this.notification.set(null), 4000);
  }
}
