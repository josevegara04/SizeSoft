import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from "../side-bar/sidebar.component";

@Component({
  selector: 'app-mantenimiento-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: "./mantenimiento-layout.html",
  styleUrls: ["./mantenimiento-layout.css"]
})
export class MantenimientoLayoutComponent {}
