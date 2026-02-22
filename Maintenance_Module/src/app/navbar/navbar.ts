import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private readonly router = inject(Router);
  protected readonly isMantenimientoActive = signal(false);

  ngOnInit(): void {
    this.updateMantenimientoActive();
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.updateMantenimientoActive());
  }

  private updateMantenimientoActive(): void {
    this.isMantenimientoActive.set(this.router.url.startsWith('/mantenimiento'));
  }
}
