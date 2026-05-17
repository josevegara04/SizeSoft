import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';

import { Navbar } from './navbar';
import { ApiService } from '../services/api.service';

// La barra navega, refleja identidad del usuario y expone acciones de sesión.
describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let apiServiceStub: {
    fnBuscLogo: ReturnType<typeof vi.fn>;
    fnClose: ReturnType<typeof vi.fn>;
    lboolUserLogged: boolean;
    clsUser: { NombUsua: string };
  };
  let router: Router;

  beforeEach(async () => {
    // El doble del servicio mantiene únicamente el estado que la barra lee o
    // muta: logo, usuario visible y cierre de sesión.
    apiServiceStub = {
      fnBuscLogo: vi.fn(),
      fnClose: vi.fn(),
      lboolUserLogged: true,
      clsUser: { NombUsua: '  Jose Vega  ' },
    };

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        {
          provide: ApiService,
          useValue: apiServiceStub,
        },
      ],
    })
    .compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    // Smoke test mínimo para asegurar que el componente monta con sus providers.
    expect(component).toBeTruthy();
  });

  it('should load the company logo on init', () => {
    // La barra debe pedir el logo apenas se inicializa para renderizar branding.
    expect(apiServiceStub.fnBuscLogo).toHaveBeenCalledTimes(1);
  });

  it('should expose the trimmed username', () => {
    // El nombre mostrado al usuario no debe incluir espacios residuales.
    expect(component.userName).toBe('Jose Vega');
  });

  it('should default the username when it is empty', () => {
    // Cuando no hay nombre disponible, el componente cae a un alias seguro.
    apiServiceStub.clsUser.NombUsua = '   ';

    expect(component.userName).toBe('Usuario 1');
  });

  it('should open and close the maestros menu from the UI', () => {
    // Se prueba el estado reactivo del menú usando el mismo click que dispara
    // el usuario desde la plantilla.
    const trigger = fixture.debugElement.query(By.css('.nav-item-trigger'));

    trigger.nativeElement.click();
    fixture.detectChanges();
    expect(component['isMaestrosOpen']()).toBe(true);

    component.closeMenus();
    fixture.detectChanges();
    expect(component['isMaestrosOpen']()).toBe(false);
  });

  it('should logout and redirect the user to login', () => {
    // El logout debe delegar el cierre al servicio y luego regresar al login.
    component.logout();

    expect(apiServiceStub.fnClose).toHaveBeenCalledTimes(1);
    expect(apiServiceStub.lboolUserLogged).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
