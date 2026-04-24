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
      .layout-container {
      display: flex;
      flex-direction: row;
      height: calc(100vh - 60px); /* ajusta según tu navbar */
      }
      .main-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: #f5f5f5;
      }
      app-sidebar {
      width: 300px;
      height: 100%;
      }
      /* .mantenimiento-module {
        padding: 24px;
        background: #fff;
        border: 1px solid #e0e0e0;
        margin: 16px;
      }
      .mantenimiento-module h2 {
        color: #1a237e;
        margin-bottom: 16px;
      } */
    `,
  ],
})
export class MantenimientoComponent {}
