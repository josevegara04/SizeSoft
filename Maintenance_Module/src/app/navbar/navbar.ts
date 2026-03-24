import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);
  protected readonly isMaestrosActive = signal(false);
  protected readonly isTransaccionesActive = signal(false);

  ngOnInit(): void {
    this.updateActiveStates();
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.updateActiveStates());
  }

  private updateActiveStates(): void {
    this.isMaestrosActive.set(this.router.url.startsWith('/mantenimiento/maestros'));
    this.isTransaccionesActive.set(this.router.url.startsWith('/mantenimiento/transacciones'));
  }
  
  logout(): void {
    this.apiService.fnClose();
    this.router.navigate(['/login']);
  }
}
