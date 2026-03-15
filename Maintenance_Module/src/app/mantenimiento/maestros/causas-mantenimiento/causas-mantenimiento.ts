import { Component, signal, computed } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Causa } from './causa.model';

@Component({
  selector: 'app-causas-mantenimiento',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './causas-mantenimiento.html',
  styleUrl: './causas-mantenimiento.css',
})
export class CausasMantenimientoComponent {
  // ──── State ────
  private nextId = 6;
  readonly searchTerm = signal('');
  readonly editingCausa = signal<Causa | null>(null);
  readonly deletingId = signal<number | null>(null);
  readonly editingInlineId = signal<number | null>(null);
  readonly notification = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  readonly causas = signal<Causa[]>([
    {
      id: 1,
      cause_name: 'Desgaste mecánico',
      cause_code: 'CM-001',
      cause_type: 'Mantenimiento',
      description: 'Desgaste por uso prolongado de piezas mecánicas.',
    },
    {
      id: 2,
      cause_name: 'Sobrecalentamiento',
      cause_code: 'CF-001',
      cause_type: 'Falla',
      description: 'Temperatura excesiva en motores o componentes eléctricos.',
    },
    {
      id: 3,
      cause_name: 'Lubricación preventiva',
      cause_code: 'CM-002',
      cause_type: 'Mantenimiento',
      description: 'Aplicación periódica de lubricantes según plan de mantenimiento.',
    },
    {
      id: 4,
      cause_name: 'Cortocircuito eléctrico',
      cause_code: 'CF-002',
      cause_type: 'Falla',
      description: 'Falla en aislamiento de cables o conexiones eléctricas.',
    },
    {
      id: 5,
      cause_name: 'Calibración de instrumentos',
      cause_code: 'CM-003',
      cause_type: 'Mantenimiento',
      description: '',
    },
  ]);

  // ──── Computed ────
  readonly filteredCausas = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.causas();
    return this.causas().filter(
      (c) =>
        c.cause_name.toLowerCase().includes(term) ||
        c.cause_code.toLowerCase().includes(term)
    );
  });

  // ──── Form data ────
  formData: Omit<Causa, 'id'> = this.emptyFormData();
  inlineData: Omit<Causa, 'id'> = this.emptyFormData();

  private emptyFormData(): Omit<Causa, 'id'> {
    return {
      cause_name: '',
      cause_code: '',
      cause_type: 'Mantenimiento',
      description: '',
    };
  }

  // ──── Actions ────
  saveCausa(form: NgForm): void {
    const editing = this.editingCausa();
    const code = this.formData.cause_code.trim();

    // Check duplicate cause_code
    const isDuplicate = this.causas().some(
      (c) =>
        c.cause_code.toLowerCase() === code.toLowerCase() &&
        (!editing || c.id !== editing.id)
    );

    if (isDuplicate) {
      this.showNotification('error', 'Este código de causa ya existe.');
      return;
    }

    if (editing) {
      this.causas.update((list) =>
        list.map((c) => (c.id === editing.id ? { ...c, ...this.formData } : c))
      );
      this.showNotification('success', 'Causa actualizada correctamente.');
    } else {
      const newCausa: Causa = {
        id: this.nextId++,
        ...this.formData,
      };
      this.causas.update((list) => [...list, newCausa]);
      this.showNotification('success', 'Causa registrada correctamente.');
    }
    this.formData = this.emptyFormData();
    this.editingCausa.set(null);
    form.resetForm();
  }

  editCausa(causa: Causa): void {
    this.editingCausa.set(causa);
    this.formData = { ...causa };
  }

  cancelEdit(form: NgForm): void {
    this.editingCausa.set(null);
    this.formData = this.emptyFormData();
    form.resetForm();
  }

  // ──── Inline Edit ────
  startInlineEdit(causa: Causa): void {
    this.editingInlineId.set(causa.id);
    this.inlineData = { ...causa };
  }

  saveInlineEdit(): void {
    const id = this.editingInlineId();
    if (id !== null) {
      const code = this.inlineData.cause_code.trim();
      const isDuplicate = this.causas().some(
        (c) => c.cause_code.toLowerCase() === code.toLowerCase() && c.id !== id
      );

      if (isDuplicate) {
        this.showNotification('error', 'Este código de causa ya existe.');
        return;
      }

      this.causas.update((list) =>
        list.map((c) => (c.id === id ? { ...c, ...this.inlineData } : c))
      );
      this.showNotification('success', 'Causa actualizada correctamente.');
    }
    this.editingInlineId.set(null);
  }

  cancelInlineEdit(): void {
    this.editingInlineId.set(null);
  }

  // ──── Delete ────
  getDeletingCausa(): Causa | undefined {
    const id = this.deletingId();
    return this.causas().find((c) => c.id === id);
  }

  confirmDelete(id: number): void {
    this.causas.update((list) => list.filter((c) => c.id !== id));
    this.deletingId.set(null);
    this.showNotification('success', 'Causa eliminada correctamente.');
  }

  // ──── Notification ────
  private showNotification(type: 'success' | 'error', message: string): void {
    this.notification.set({ type, message });
    setTimeout(() => this.notification.set(null), 4000);
  }
}
