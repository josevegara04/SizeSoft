import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { ApiService } from './services/api.service';

// Esta suite verifica la composición raíz de la aplicación en función del
// estado de autenticación expuesto por el servicio.
describe('App', () => {
  // Helper para recrear el mismo contrato del servicio cambiando solamente
  // el flag de autenticación que controla la visibilidad del navbar.
  const createApiServiceStub = (loggedIn = false) => ({
    lboolUserLogged: loggedIn,
    fnBuscLogo: vi.fn(),
    fnClose: vi.fn(),
    clsUser: { NombUsua: 'Usuario Test' },
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: ApiService,
          useValue: createApiServiceStub(),
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    // Garantiza que el componente raíz se puede instanciar con la configuración base.
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it('should hide the navbar when the user is not logged in', () => {
    // En estado anónimo la UI no debe exponer navegación privada.
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-navbar')).toBeNull();
  });

  it('should show the navbar when the user is logged in', async () => {
    // Se recompone el módulo de pruebas con un usuario autenticado para validar
    // la otra rama de renderizado del componente raíz.
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: ApiService,
          useValue: createApiServiceStub(true),
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-navbar')).not.toBeNull();
  });
});
