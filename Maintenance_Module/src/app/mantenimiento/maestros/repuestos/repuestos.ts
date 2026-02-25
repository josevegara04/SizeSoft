import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Repuesto } from './repuesto.model';

@Component({
  selector: 'app-repuestos',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- ═══════════════ HEADER ═══════════════ -->
    <div class="repuestos-container">
      <div class="header">
        <div class="header-left">
          <h2>Repuestos</h2>
          <span class="badge">{{ filteredRepuestos().length }} partes registradas</span>
        </div>
        <div class="header-right">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por código, nombre o categoría..."
              [ngModel]="searchTerm()"
              (ngModelChange)="searchTerm.set($event)"
            />
          </div>
          <button class="btn btn-primary" (click)="openNewForm()">
            <span class="btn-icon">＋</span> Nuevo Repuesto
          </button>
        </div>
      </div>

      <!-- ═══════════════ TABLE ═══════════════ -->
      @if (filteredRepuestos().length > 0) {
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Unidad</th>
                <th class="text-right">Stock</th>
                <th class="text-right">Precio Unit.</th>
                <th>Ubicación</th>
                <th>Proveedor</th>
                <th>Estado</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (r of filteredRepuestos(); track r.id) {
                <tr [class.low-stock]="r.cantidadStock < r.stockMinimo">
                  <td class="code-cell">{{ r.codigo }}</td>
                  <td>
                    <div class="name-cell">
                      <span class="part-name">{{ r.nombre }}</span>
                      <span class="part-desc">{{ r.descripcion }}</span>
                    </div>
                  </td>
                  <td><span class="category-badge">{{ r.categoria }}</span></td>
                  <td>{{ r.unidadMedida }}</td>
                  <td class="text-right">
                    <div class="stock-cell">
                      <span class="stock-value">{{ r.cantidadStock }}</span>
                      @if (r.cantidadStock < r.stockMinimo) {
                        <span class="stock-warning" title="Stock por debajo del mínimo ({{ r.stockMinimo }})">⚠️ Bajo</span>
                      }
                    </div>
                  </td>
                  <td class="text-right price-cell">\$ {{ r.precioUnitario.toFixed(2) }}</td>
                  <td>{{ r.ubicacion }}</td>
                  <td>{{ r.proveedor }}</td>
                  <td>
                    <span class="status-badge" [class.active]="r.activo" [class.inactive]="!r.activo">
                      {{ r.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="text-center actions-cell">
                    @if (deletingId() === r.id) {
                      <div class="delete-confirm">
                        <span>¿Eliminar?</span>
                        <button class="btn-mini btn-danger" (click)="confirmDelete(r.id)">Sí</button>
                        <button class="btn-mini btn-cancel" (click)="deletingId.set(null)">No</button>
                      </div>
                    } @else {
                      <button class="btn-action btn-edit" title="Editar" (click)="openEditForm(r)">✏️</button>
                      <button class="btn-action btn-delete" title="Eliminar" (click)="deletingId.set(r.id)">🗑️</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No se encontraron repuestos</h3>
          <p>No hay repuestos que coincidan con la búsqueda o aún no se han registrado.</p>
          <button class="btn btn-primary" (click)="openNewForm()">
            <span class="btn-icon">＋</span> Agregar Primer Repuesto
          </button>
        </div>
      }
    </div>

    <!-- ═══════════════ MODAL ═══════════════ -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingRepuesto() ? 'Editar Repuesto' : 'Nuevo Repuesto' }}</h3>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>
          <form class="modal-body" (ngSubmit)="saveRepuesto()" #repuestoForm="ngForm">
            <div class="form-grid">

              <div class="form-group">
                <label for="codigo">Código <span class="required">*</span></label>
                <input id="codigo" type="text" [(ngModel)]="formData.codigo" name="codigo" required placeholder="Ej: REP-001" />
              </div>

              <div class="form-group">
                <label for="nombre">Nombre <span class="required">*</span></label>
                <input id="nombre" type="text" [(ngModel)]="formData.nombre" name="nombre" required placeholder="Nombre del repuesto" />
              </div>

              <div class="form-group span-2">
                <label for="descripcion">Descripción</label>
                <textarea id="descripcion" [(ngModel)]="formData.descripcion" name="descripcion" rows="2" placeholder="Descripción del repuesto"></textarea>
              </div>

              <div class="form-group">
                <label for="categoria">Categoría <span class="required">*</span></label>
                <select id="categoria" [(ngModel)]="formData.categoria" name="categoria" required>
                  <option value="">Seleccionar...</option>
                  <option value="Eléctrico">Eléctrico</option>
                  <option value="Mecánico">Mecánico</option>
                  <option value="Hidráulico">Hidráulico</option>
                  <option value="Neumático">Neumático</option>
                  <option value="Electrónico">Electrónico</option>
                  <option value="Lubricante">Lubricante</option>
                  <option value="Filtro">Filtro</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div class="form-group">
                <label for="unidadMedida">Unidad de Medida</label>
                <select id="unidadMedida" [(ngModel)]="formData.unidadMedida" name="unidadMedida">
                  <option value="Unidad">Unidad</option>
                  <option value="Metro">Metro</option>
                  <option value="Litro">Litro</option>
                  <option value="Kilogramo">Kilogramo</option>
                  <option value="Par">Par</option>
                  <option value="Juego">Juego</option>
                  <option value="Rollo">Rollo</option>
                </select>
              </div>

              <div class="form-group">
                <label for="cantidadStock">Cantidad en Stock</label>
                <input id="cantidadStock" type="number" [(ngModel)]="formData.cantidadStock" name="cantidadStock" min="0" />
              </div>

              <div class="form-group">
                <label for="stockMinimo">Stock Mínimo</label>
                <input id="stockMinimo" type="number" [(ngModel)]="formData.stockMinimo" name="stockMinimo" min="0" />
              </div>

              <div class="form-group">
                <label for="precioUnitario">Precio Unitario</label>
                <input id="precioUnitario" type="number" [(ngModel)]="formData.precioUnitario" name="precioUnitario" min="0" step="0.01" />
              </div>

              <div class="form-group">
                <label for="ubicacion">Ubicación</label>
                <input id="ubicacion" type="text" [(ngModel)]="formData.ubicacion" name="ubicacion" placeholder="Ej: Almacén A - Estante 3" />
              </div>

              <div class="form-group">
                <label for="proveedor">Proveedor</label>
                <input id="proveedor" type="text" [(ngModel)]="formData.proveedor" name="proveedor" placeholder="Nombre del proveedor" />
              </div>

              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="formData.activo" name="activo" />
                  <span class="checkmark"></span>
                  Activo
                </label>
              </div>

            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="!repuestoForm.valid">
                {{ editingRepuesto() ? 'Guardar Cambios' : 'Crear Repuesto' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [
    `
      /* ───── Container ───── */
      .repuestos-container {
        padding: 24px;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      }

      /* ───── Header ───── */
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 24px;
      }
      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .header-left h2 {
        margin: 0;
        color: #1a237e;
        font-size: 22px;
        font-weight: 700;
        letter-spacing: -0.3px;
      }
      .badge {
        background: #e8eaf6;
        color: #3949ab;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }
      .header-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .search-box {
        position: relative;
        display: flex;
        align-items: center;
      }
      .search-icon {
        position: absolute;
        left: 10px;
        font-size: 14px;
        pointer-events: none;
      }
      .search-box input {
        padding: 8px 12px 8px 32px;
        border: 1px solid #c5cae9;
        border-radius: 8px;
        font-size: 13px;
        width: 280px;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        font-family: inherit;
      }
      .search-box input:focus {
        border-color: #3949ab;
        box-shadow: 0 0 0 3px rgba(57, 73, 171, 0.12);
      }

      /* ───── Buttons ───── */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 9px 18px;
        border: none;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
      }
      .btn-primary {
        background: linear-gradient(135deg, #3949ab 0%, #1a237e 100%);
        color: #fff;
        box-shadow: 0 2px 8px rgba(26, 35, 126, 0.25);
      }
      .btn-primary:hover {
        box-shadow: 0 4px 14px rgba(26, 35, 126, 0.38);
        transform: translateY(-1px);
      }
      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
      .btn-secondary {
        background: #f5f5f5;
        color: #424242;
        border: 1px solid #e0e0e0;
      }
      .btn-secondary:hover {
        background: #eeeeee;
      }
      .btn-icon {
        font-size: 15px;
        line-height: 1;
      }

      /* ───── Table ───── */
      .table-wrapper {
        background: #fff;
        border-radius: 12px;
        border: 1px solid #e0e0e0;
        overflow: hidden;
        box-shadow: 0 1px 4px rgba(0,0,0,0.04);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      thead {
        background: linear-gradient(180deg, #f8f9ff 0%, #eef0fb 100%);
      }
      th {
        padding: 12px 14px;
        text-align: left;
        font-weight: 700;
        color: #1a237e;
        font-size: 11.5px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 2px solid #c5cae9;
        white-space: nowrap;
      }
      td {
        padding: 11px 14px;
        border-bottom: 1px solid #f0f0f0;
        color: #37474f;
        vertical-align: middle;
      }
      tbody tr {
        transition: background-color 0.15s ease;
      }
      tbody tr:hover {
        background-color: #f5f7ff;
      }
      tbody tr:last-child td {
        border-bottom: none;
      }
      tr.low-stock {
        background: #fff8e1;
      }
      tr.low-stock:hover {
        background: #fff3cd;
      }

      .text-right { text-align: right; }
      .text-center { text-align: center; }

      .code-cell {
        font-weight: 600;
        color: #1a237e;
        font-family: 'Cascadia Code', 'Consolas', monospace;
        font-size: 12.5px;
      }
      .name-cell {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .part-name {
        font-weight: 600;
        color: #263238;
      }
      .part-desc {
        font-size: 11.5px;
        color: #90a4ae;
        max-width: 220px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .category-badge {
        display: inline-block;
        background: #e8eaf6;
        color: #3949ab;
        padding: 3px 10px;
        border-radius: 6px;
        font-size: 11.5px;
        font-weight: 600;
      }
      .stock-cell {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
      }
      .stock-value {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .stock-warning {
        font-size: 10.5px;
        background: #fff3cd;
        color: #e65100;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
        white-space: nowrap;
      }
      .price-cell {
        font-weight: 600;
        color: #2e7d32;
        font-variant-numeric: tabular-nums;
      }
      .status-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 6px;
        font-size: 11.5px;
        font-weight: 600;
      }
      .status-badge.active {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .status-badge.inactive {
        background: #fce4ec;
        color: #c62828;
      }

      /* ───── Action Buttons ───── */
      .actions-cell {
        white-space: nowrap;
      }
      .btn-action {
        background: none;
        border: 1px solid transparent;
        border-radius: 6px;
        padding: 5px 8px;
        cursor: pointer;
        font-size: 15px;
        transition: all 0.15s ease;
        line-height: 1;
      }
      .btn-edit:hover {
        background: #e8eaf6;
        border-color: #c5cae9;
      }
      .btn-delete:hover {
        background: #fce4ec;
        border-color: #ef9a9a;
      }
      .delete-confirm {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        color: #c62828;
        animation: fadeIn 0.15s ease;
      }
      .btn-mini {
        padding: 3px 10px;
        border: none;
        border-radius: 4px;
        font-size: 11.5px;
        font-weight: 700;
        cursor: pointer;
        font-family: inherit;
      }
      .btn-danger {
        background: #c62828;
        color: #fff;
      }
      .btn-danger:hover {
        background: #b71c1c;
      }
      .btn-cancel {
        background: #eee;
        color: #616161;
      }
      .btn-cancel:hover {
        background: #e0e0e0;
      }

      /* ───── Empty State ───── */
      .empty-state {
        text-align: center;
        padding: 60px 24px;
        background: #fff;
        border-radius: 12px;
        border: 1px dashed #c5cae9;
      }
      .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }
      .empty-state h3 {
        margin: 0 0 8px;
        color: #1a237e;
        font-size: 18px;
      }
      .empty-state p {
        margin: 0 0 24px;
        color: #78909c;
        font-size: 14px;
      }

      /* ───── Modal ───── */
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(26, 35, 126, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease;
        backdrop-filter: blur(2px);
      }
      .modal {
        background: #fff;
        border-radius: 14px;
        width: 660px;
        max-width: 96vw;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(26, 35, 126, 0.22);
        animation: slideUp 0.25s ease;
      }
      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid #e8eaf6;
      }
      .modal-header h3 {
        margin: 0;
        color: #1a237e;
        font-size: 18px;
        font-weight: 700;
      }
      .modal-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #9e9e9e;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.15s;
      }
      .modal-close:hover {
        background: #f5f5f5;
        color: #424242;
      }
      .modal-body {
        padding: 24px;
      }
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding-top: 20px;
        border-top: 1px solid #f0f0f0;
        margin-top: 8px;
      }

      /* ───── Form ───── */
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .span-2 {
        grid-column: span 2;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .form-group label {
        font-size: 12.5px;
        font-weight: 600;
        color: #37474f;
      }
      .required {
        color: #c62828;
      }
      .form-group input,
      .form-group select,
      .form-group textarea {
        padding: 9px 12px;
        border: 1px solid #cfd8dc;
        border-radius: 8px;
        font-size: 13.5px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        background: #fafafa;
      }
      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        border-color: #3949ab;
        box-shadow: 0 0 0 3px rgba(57, 73, 171, 0.10);
        background: #fff;
      }
      .form-group textarea {
        resize: vertical;
      }

      /* ───── Checkbox ───── */
      .checkbox-group {
        justify-content: flex-end;
      }
      .checkbox-label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 13.5px;
        font-weight: 500;
        color: #37474f;
      }
      .checkbox-label input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #3949ab;
        cursor: pointer;
      }

      /* ───── Animations ───── */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,
  ],
})
export class RepuestosComponent {
  // ──── State ────
  private nextId = 6;
  readonly searchTerm = signal('');
  readonly showModal = signal(false);
  readonly editingRepuesto = signal<Repuesto | null>(null);
  readonly deletingId = signal<number | null>(null);

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
        r.proveedor.toLowerCase().includes(term)
    );
  });

  // ──── Form data ────
  formData: Omit<Repuesto, 'id'> = this.emptyFormData();

  private emptyFormData(): Omit<Repuesto, 'id'> {
    return {
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria: '',
      unidadMedida: 'Unidad',
      cantidadStock: 0,
      stockMinimo: 0,
      precioUnitario: 0,
      ubicacion: '',
      proveedor: '',
      activo: true,
    };
  }

  // ──── Actions ────
  openNewForm(): void {
    this.editingRepuesto.set(null);
    this.formData = this.emptyFormData();
    this.showModal.set(true);
  }

  openEditForm(repuesto: Repuesto): void {
    this.editingRepuesto.set(repuesto);
    this.formData = { ...repuesto };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingRepuesto.set(null);
  }

  saveRepuesto(): void {
    const editing = this.editingRepuesto();
    if (editing) {
      // Update
      this.repuestos.update((list) =>
        list.map((r) => (r.id === editing.id ? { ...r, ...this.formData } : r))
      );
    } else {
      // Create
      const newRepuesto: Repuesto = {
        id: this.nextId++,
        ...this.formData,
      };
      this.repuestos.update((list) => [...list, newRepuesto]);
    }
    this.closeModal();
  }

  confirmDelete(id: number): void {
    this.repuestos.update((list) => list.filter((r) => r.id !== id));
    this.deletingId.set(null);
  }
}
