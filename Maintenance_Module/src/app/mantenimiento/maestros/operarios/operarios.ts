import { Component, signal, computed, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Operario } from './operario.model';
import { OperariosService } from './operarios.service';
import { SidebarService } from '../../../side-bar/sidebar.service';
import { MessagService } from '../../../services/messag.service';

@Component({
  selector: 'app-operarios',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './operarios.html',
  styleUrls: ['./operarios.css'],
})
export class OperariosComponent implements OnInit {

  // ─── State ───
  readonly operarios   = signal<Operario[]>([]);
  readonly searchTerm  = signal('');
  readonly saving      = signal(false);
  readonly loading     = signal(false);
  readonly editingId   = signal<number | null>(null);
  readonly deletingId  = signal<number | null>(null);
  readonly showConfirmModal = signal(false);

  formData: {
    nombre: string; apellid: string; cedula: string;
    cargo: string; especi: string; telefo: string;
    email: string; activo: boolean;
  } = this.emptyForm();

  // ─── Computed ───
  readonly filteredList = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.operarios();
    return this.operarios().filter(o =>
      o.nombre.toLowerCase().includes(term)  ||
      o.apellid.toLowerCase().includes(term) ||
      o.cedula.toLowerCase().includes(term)  ||
      o.cargo.toLowerCase().includes(term)   ||
      o.especi.toLowerCase().includes(term)
    );
  });

  readonly isEditing = computed(() => this.editingId() !== null);

  constructor(
    private service: OperariosService,
    private sidebarSvc: SidebarService,
    private messagSvc: MessagService,
  ) {}

  ngOnInit(): void {
    this.loadOperarios();
  }

  loadOperarios(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          this.operarios.set(res.map((r: any) => ({
            idOper:  r.IdOper  ?? r.idOper,
            nombre:  r.Nombre  ?? r.nombre  ?? '',
            apellid: r.Apellid ?? r.apellid ?? '',
            cedula:  r.Cedula  ?? r.cedula  ?? '',
            cargo:   r.Cargo   ?? r.cargo   ?? '',
            especi:  r.Especi  ?? r.especi  ?? '',
            telefo:  r.Telefo  ?? r.telefo  ?? '',
            email:   r.Email   ?? r.email   ?? '',
            activo:  r.Activo  === 1 || r.activo === true,
          })));
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // ─── Create / Edit ───
  requestSave(form: NgForm): void {
    if (!form.valid) return;
    this.showConfirmModal.set(true);
  }

  confirmSave(): void {
    this.showConfirmModal.set(false);
    this.saving.set(true);

    const payload = { ...this.formData, idOper: this.editingId() ?? undefined };

    this.service.save(payload).subscribe({
      next: (res) => {
        const raw = res?.[0]?.Messag ?? res?.[0]?.message ?? '';
        const parsed = this.parseMessag(raw);

        if (!parsed.success) {
          this.messagSvc.add(parsed.message, 2);
          this.sidebarSvc.addLog(`Error operario: ${parsed.message}`);
          this.saving.set(false);
          return;
        }

        const action = this.isEditing() ? 'actualizado' : 'creado';
        this.messagSvc.add(`Operario ${action} correctamente.`, 1);
        this.sidebarSvc.addLog(`Operario ${this.formData.nombre} ${this.formData.apellid} ${action}`);
        this.loadOperarios();
        this.resetForm();
        this.saving.set(false);
      },
      error: () => {
        this.messagSvc.add('Error al conectar con el servidor.', 2);
        this.saving.set(false);
      },
    });
  }

  cancelConfirm(): void {
    this.showConfirmModal.set(false);
  }

  loadForEdit(o: Operario): void {
    this.editingId.set(o.idOper);
    this.formData = {
      nombre:  o.nombre,
      apellid: o.apellid,
      cedula:  o.cedula,
      cargo:   o.cargo,
      especi:  o.especi,
      telefo:  o.telefo,
      email:   o.email,
      activo:  o.activo,
    };
  }

  // ─── Delete ───
  requestDelete(id: number): void {
    this.deletingId.set(id);
  }

  confirmDelete(): void {
    const id = this.deletingId();
    if (id === null) return;

    this.service.delete(id).subscribe({
      next: (res) => {
        const raw = res?.[0]?.Messag ?? res?.[0]?.message ?? '';
        const parsed = this.parseMessag(raw);

        if (!parsed.success) {
          this.messagSvc.add(parsed.message, 2);
          this.sidebarSvc.addLog(`Error al eliminar operario: ${parsed.message}`);
        } else {
          this.operarios.update(list => list.filter(o => o.idOper !== id));
          this.messagSvc.add('Operario eliminado correctamente.', 1);
          this.sidebarSvc.addLog(`Operario ID ${id} eliminado`);
          if (this.editingId() === id) this.resetForm();
        }
        this.deletingId.set(null);
      },
      error: () => {
        this.messagSvc.add('Error al conectar con el servidor.', 2);
        this.deletingId.set(null);
      },
    });
  }

  cancelDelete(): void {
    this.deletingId.set(null);
  }

  getDeletingItem(): Operario | undefined {
    return this.operarios().find(o => o.idOper === this.deletingId()!);
  }

  // ─── Helpers ───
  resetForm(): void {
    this.formData = this.emptyForm();
    this.editingId.set(null);
  }

  private emptyForm() {
    return {
      nombre: '', apellid: '', cedula: '',
      cargo: '', especi: '', telefo: '',
      email: '', activo: true,
    };
  }

  private parseMessag(raw: string): { success: boolean; message: string } {
    try {
      return JSON.parse(raw);
    } catch {
      return { success: true, message: raw };
    }
  }
}
