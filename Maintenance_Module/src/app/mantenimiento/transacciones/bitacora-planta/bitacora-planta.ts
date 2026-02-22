import { Component } from '@angular/core';

@Component({
  selector: 'app-bitacora-planta',
  standalone: true,
  template: `
    <div class="submodule">
      <h2>Bitácora de Planta</h2>
      <p>Contenido en desarrollo.</p>
    </div>
  `,
  styles: [
    `
      .submodule {
        padding: 24px;
        background: #fff;
        border: 1px solid #e0e0e0;
        margin: 16px;
      }
      .submodule h2 {
        color: #1a237e;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class BitacoraPlantaComponent {}
