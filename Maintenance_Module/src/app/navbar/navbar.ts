import { Component, ElementRef, HostListener, inject, OnInit, signal } from '@angular/core';
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
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  public readonly apiService = inject(ApiService);

  protected readonly isMaestrosActive = signal(false);
  protected readonly isTransaccionesActive = signal(false);
  protected readonly isMaquinasActive = signal(false); // ← replaces isSubmenuOpen
  protected readonly isMaestrosOpen = signal(false);
  protected readonly isTransaccionesOpen = signal(false);

  ngOnInit(): void {
    this.apiService.fnBuscLogo();
    this.updateActiveStates();
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.updateActiveStates());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;

    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.closeMenus();
    }
  }

  private updateActiveStates(): void {
    const url = this.router.url;
    this.isMaestrosActive.set(url.startsWith('/mantenimiento/maestros'));
    this.isTransaccionesActive.set(url.startsWith('/mantenimiento/transacciones'));
  }

  logout(): void {
    this.apiService.fnClose();
    this.router.navigate(['/login']);
    this.apiService.lboolUserLogged = false;
  }

  toggleMaquinas(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isMaquinasActive.set(!this.isMaquinasActive());
  }

  // Get the username 
  get userName(): string {
    return this.apiService.clsUser.NombUsua?.trim() || 'Usuario 1';
  }

  toggleMaestros(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isMaestrosOpen.set(!this.isMaestrosOpen());
    this.isTransaccionesOpen.set(false);

    if (!this.isMaestrosOpen()) {
      this.isMaquinasActive.set(false);
    }
  }

  toggleTransacciones(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isTransaccionesOpen.set(!this.isTransaccionesOpen());
    this.isMaestrosOpen.set(false);
    this.isMaquinasActive.set(false);
  }

  closeMenus(): void {
    this.isMaestrosOpen.set(false);
    this.isTransaccionesOpen.set(false);
    this.isMaquinasActive.set(false);
  }
}
