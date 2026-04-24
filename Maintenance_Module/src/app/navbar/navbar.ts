import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { CommonModule } from "@angular/common"

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private readonly router = inject(Router);
  public readonly apiService = inject(ApiService);

  protected readonly isMaestrosActive = signal(false);
  protected readonly isTransaccionesActive = signal(false);
  protected readonly isMaquinasActive = signal(false); // ← replaces isSubmenuOpen

  ngOnInit(): void {
    this.apiService.fnBuscLogo();
    this.updateActiveStates();
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.updateActiveStates());
  }

  private updateActiveStates(): void {
    const url = this.router.url;
    this.isMaestrosActive.set(url.startsWith('/mantenimiento/maestros'));
    this.isTransaccionesActive.set(url.startsWith('/mantenimiento/transacciones'));
  }

  logout(): void {
    this.apiService.fnClose();
    this.router.navigate(['/login']);
  }

  toggleMaquinas(): void {
    console.log("actriva");
    this.isMaquinasActive.set(!this.isMaquinasActive());
  }

  // Get the username 
  get userName(): string {
    return this.apiService.clsUser.NombUsua?.trim() || 'Usuario 1';
  }
}
