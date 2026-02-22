import { Component } from '@angular/core';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  template: `
    <div class="mantenimiento-module">
      <h2>MANTENIMIENTO</h2>
      <p>Módulo de Mantenimiento — Contenido en desarrollo.</p>
    </div>
  `,
  styles: [
    `
      .mantenimiento-module {
        padding: 24px;
        background: #fff;
        border: 1px solid #e0e0e0;
        margin: 16px;
      }
      .mantenimiento-module h2 {
        color: #1a237e;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class MantenimientoComponent {}
