import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { ApiService } from '../services/api.service';
import { MessagService } from '../services/messag.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';

// Estas pruebas documentan el flujo principal del login:
// inicialización, validaciones y reacción frente a respuestas del backend.
describe('LoginComponent', () => {
  let component: LoginComponent;
  let apiServiceStub: {
    Title: string;
    VersApli: string;
    clsUser: {
      CodiComp: string;
      Id: string;
      NombUsua: string;
      PassUsua: string;
      UserToken: string;
      CodiSegu: string;
    };
    lstrFact: {
      TipoDocu: string;
      CodDocVen: string;
      CodiDocu: string;
      CodiVend: string;
      NumeDocu: string;
      FormPago: string;
    };
    lstrRutaLogo: string;
    lboolUserLogged: boolean;
    lboolCerrSesi: boolean;
    lstrToken: string;
    Query: string;
    clsQuery: Array<Record<string, string>>;
    AuthUser: ReturnType<typeof vi.fn>;
    getQuery: ReturnType<typeof vi.fn>;
    fnClose: ReturnType<typeof vi.fn>;
    fnBuscLogo: ReturnType<typeof vi.fn>;
  };
  let msgServiceStub: {
    add: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
    fnMsgBox: ReturnType<typeof vi.fn>;
  };
  let cookieServiceStub: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    // Se modela el contrato mínimo que el componente usa del ApiService para
    // concentrar la suite en la lógica del formulario y no en integraciones.
    apiServiceStub = {
      Title: 'SizeSoft ERP - Pruebas',
      VersApli: '1.4.12',
      clsUser: {
        CodiComp: '',
        Id: '',
        NombUsua: '',
        PassUsua: '',
        UserToken: '',
        CodiSegu: '',
      },
      lstrFact: {
        TipoDocu: 'A',
        CodDocVen: 'B',
        CodiDocu: 'C',
        CodiVend: 'D',
        NumeDocu: 'E',
        FormPago: 'F',
      },
      lstrRutaLogo: 'logo.png',
      lboolUserLogged: false,
      lboolCerrSesi: false,
      lstrToken: '',
      Query: '',
      clsQuery: [],
      AuthUser: vi.fn(),
      getQuery: vi.fn().mockReturnValue(
        of([
          {
            Messag: 'OK',
            AppUpda: 1,
            MessCD: 'OK',
            MessLice: 'OK',
            EstLice: 'Activa',
          },
        ]),
      ),
      fnClose: vi.fn(),
      fnBuscLogo: vi.fn(),
    };

    cookieServiceStub = {
      get: vi.fn().mockReturnValue('stored-token'),
      set: vi.fn(),
    };

    msgServiceStub = {
      add: vi.fn(),
      clear: vi.fn(),
      fnMsgBox: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceStub },
        { provide: MessagService, useValue: msgServiceStub },
        { provide: NgbModal, useValue: { open: vi.fn() } },
        { provide: CookieService, useValue: cookieServiceStub },
        {
          provide: Router,
          useValue: { navigate: vi.fn().mockResolvedValue(true) },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should reset login state on init', () => {
    // Al arrancar, el componente limpia datos arrastrados de sesiones previas
    // y toma del servicio únicamente la metadata visual de la pantalla.
    expect(component.title).toBe('SizeSoft ERP - Pruebas');
    expect(apiServiceStub.clsUser.CodiComp).toBe('');
    expect(apiServiceStub.clsUser.Id).toBe('');
    expect(apiServiceStub.lstrRutaLogo).toBe('');
    expect(apiServiceStub.lstrFact.TipoDocu).toBe('');
  });

  it('should validate that the username is required', () => {
    // No se debe intentar autenticar si el usuario todavía no ingresó su ID.
    component.LogIn();

    expect(component.lstrMens).toBe('Debe ingresar el usuario');
    expect(apiServiceStub.AuthUser).not.toHaveBeenCalled();
  });

  it('should validate that the password is required', () => {
    // Una vez existe usuario, el siguiente bloqueo esperado es la contraseña.
    apiServiceStub.clsUser.Id = 'jvega';

    component.LogIn();

    expect(component.lstrMens).toBe('Debe ingresar la clave del usuario');
    expect(apiServiceStub.AuthUser).not.toHaveBeenCalled();
  });

  it('should authenticate successfully and store the returned token', () => {
    // Este caso cubre la ruta feliz completa: autenticación, persistencia del
    // token, limpieza de mensajes y redirección al módulo protegido.
    apiServiceStub.clsUser.CodiComp = 'ab01';
    apiServiceStub.clsUser.Id = 'jvega';
    apiServiceStub.clsUser.PassUsua = '123456';
    apiServiceStub.AuthUser.mockReturnValue(
      of([
        {
          Messag: 'OK',
          CodiUsua: 'JVEGA',
          CodiComp: 'AB01',
          NombUsua: 'Jose Vega',
          Token: 'api-token',
        },
      ]),
    );

    component.LogIn();

    expect(cookieServiceStub.get).toHaveBeenCalledWith('ERPCookieAB01JVEGA');
    expect(apiServiceStub.AuthUser).toHaveBeenCalledTimes(1);
    expect(apiServiceStub.lboolUserLogged).toBe(true);
    expect(apiServiceStub.lstrToken).toBe('api-token');
    expect(apiServiceStub.clsUser.PassUsua).toBe('');
    expect(cookieServiceStub.set).toHaveBeenCalledWith('ERPCookieAB01JVEGA', 'api-token');
    expect(apiServiceStub.fnBuscLogo).toHaveBeenCalledTimes(1);
    expect(apiServiceStub.getQuery).toHaveBeenCalledTimes(1);
    expect(msgServiceStub.clear).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/mantenimiento']);
  });

  it('should keep the user logged out when the API rejects the credentials', () => {
    // Si la API rechaza credenciales, el componente conserva el estado anónimo,
    // muestra el mensaje recibido y activa la cuenta regresiva asociada.
    vi.spyOn(component, 'fnCuentaRegresiva').mockImplementation(() => undefined);
    apiServiceStub.clsUser.CodiComp = 'ab01';
    apiServiceStub.clsUser.Id = 'jvega';
    apiServiceStub.clsUser.PassUsua = 'bad-pass';
    apiServiceStub.AuthUser.mockReturnValue(
      of([
        {
          Messag: 'Credenciales inválidas',
          SessActi: 1,
        },
      ]),
    );

    component.LogIn();

    expect(apiServiceStub.lboolUserLogged).toBe(false);
    expect(component.lstrMens).toBe('Credenciales inválidas');
    expect(component.fnCuentaRegresiva).toHaveBeenCalledTimes(1);
    expect(cookieServiceStub.set).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
