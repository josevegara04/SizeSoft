import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { SidebarComponent } from "../side-bar/sidebar.component";

@Component({
  selector: 'app-mantenimiento-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, SidebarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="layout-container">

      <!-- CONTENIDO -->
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>

      <!-- SIDEBAR -->
      <app-sidebar></app-sidebar>
    </div>
  `,

  styles: [`
    .layout-container {
      display: flex;
      flex-direction: row;
      height: calc(100vh - 60px);
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
  `]
})
export class MantenimientoLayoutComponent {}
