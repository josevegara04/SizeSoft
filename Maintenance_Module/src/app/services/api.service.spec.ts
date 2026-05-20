import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from './api.service';
import { MessagService } from './messag.service';

// Esta suite valida el comportamiento observable del servicio:
// construcción de requests, manejo de cierre de sesión y errores esperados.
describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let msgServiceStub: {
    fnMsgBox: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };
  let cookieServiceStub: {
    get: ReturnType<typeof vi.fn>;
    getAll: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let modalStub: {
    open: ReturnType<typeof vi.fn>;
  };

  // El servicio dispara peticiones auxiliares al inicializarse para resolver
  // la IP y la ubicación del usuario. Se responden aquí para aislar cada caso.
  const flushBootstrapRequests = () => {
    httpMock.expectOne('http://api.ipify.org/?format=json').flush({ ip: '127.0.0.1' });
    httpMock.expectOne('https://ipapi.co/127.0.0.1/json/').flush({
      city: 'Bogota',
      region: 'DC',
      postal: '110111',
      longitude: -74.0721,
      latitude: 4.711,
    });
  };

  beforeEach(() => {
    msgServiceStub = {
      fnMsgBox: vi.fn(),
      clear: vi.fn(),
    };

    cookieServiceStub = {
      get: vi.fn().mockReturnValue(''),
      getAll: vi.fn().mockReturnValue({ ERPCookieAB01JVEGA: 'token' }),
      delete: vi.fn(),
    };

    modalStub = {
      open: vi.fn().mockReturnValue({ componentInstance: {} }),
    };

    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MessagService, useValue: msgServiceStub },
        { provide: CookieService, useValue: cookieServiceStub },
        { provide: NgbModal, useValue: modalStub },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ApiService);
    flushBootstrapRequests();
  });

  // Asegura que cada prueba consuma exactamente las solicitudes HTTP esperadas.
  afterEach(() => {
    httpMock.verify();
  });

  it('should post queries using the configured token', () => {
    // Se simula una consulta ya armada y se valida que el servicio la envíe
    // con el token actual tanto en headers como en el cuerpo esperado.
    service.lstrToken = 'jwt-token';
    service.clsQuery = [
      {
        CodiCons: 'TestQuery',
        NombPara: 'Compañía',
        Valor: 'AB01',
        CodiComp: 'AB01',
        Token: 'jwt-token',
        Report: '0',
      },
    ];

    service.getQuery().subscribe();

    const req = httpMock.expectOne('https://erpapipruebas.azurewebsites.net/api/Query');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    expect(req.request.body).toEqual(service.clsQuery);
    req.flush([{ Messag: 'OK' }]);
  });

  it('should clear the user state when SaveEntity returns an invalid token', () => {
    // Si el backend indica que el token expiró, el servicio debe limpiar toda
    // la sesión local y notificar al usuario para forzar un nuevo ingreso.
    service.lboolUserLogged = true;
    service.clsUser.CodiComp = 'AB01';
    service.clsUser.Id = 'JVEGA';
    service.clsUser.NombUsua = 'Jose Vega';
    service.clsUser.PassUsua = 'secret';
    service.lstrToken = 'jwt-token';

    service.SaveEntity([{ Action: 'SaveSomething' }]).subscribe();

    const req = httpMock.expectOne('https://erpapipruebas.azurewebsites.net/api/Query/Save');
    req.flush([{ Messag: 'Token Inválido' }]);

    expect(msgServiceStub.fnMsgBox).toHaveBeenCalledWith(2, 'Su sesión ha expirado');
    expect(modalStub.open).toHaveBeenCalledTimes(1);
    expect(service.lboolUserLogged).toBe(false);
    expect(service.clsUser.CodiComp).toBe('');
    expect(service.clsUser.Id).toBe('');
    expect(service.lstrToken).toBe('');
    expect(cookieServiceStub.delete).toHaveBeenCalledWith('ERPCookieAB01JVEGA');
  });

  it('should post the close-session query and clear local state', () => {
    // El cierre de sesión no solo limpia memoria/cookies: también envía al
    // backend la consulta de cierre antes de reiniciar el estado local.
    service.clsUser.CodiComp = 'AB01';
    service.clsUser.Id = 'JVEGA';
    service.clsUser.NombUsua = 'Jose Vega';
    service.lstrToken = 'jwt-token';
    service.lboolUserLogged = true;

    service.fnClose();

    const req = httpMock.expectOne('https://erpapipruebas.azurewebsites.net/api/Query');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual([
      {
        CodiCons: 'ClosUser',
        NombPara: 'Compañía',
        Valor: 'AB01',
        CodiComp: 'AB01',
        Token: 'jwt-token',
        Report: '0',
      },
      {
        CodiCons: 'ClosUser',
        NombPara: 'Codigo',
        Valor: 'JVEGA',
        CodiComp: '',
        Token: '',
        Report: '0',
      },
    ]);
    req.flush([{ Messag: 'OK' }]);

    expect(cookieServiceStub.delete).toHaveBeenCalledWith('ERPCookieAB01JVEGA');
    expect(msgServiceStub.clear).toHaveBeenCalledTimes(1);
    expect(service.lboolUserLogged).toBe(false);
    expect(service.clsUser.CodiComp).toBe('');
    expect(service.clsUser.Id).toBe('');
    expect(service.lstrToken).toBe('');
  });

  it('should clear the logo path when the company logo cannot be loaded', () => {
    // Si el recurso estático no existe, el servicio debe dejar el logo vacío
    // para evitar referencias a una imagen rota en la interfaz.
    service.clsUser.CodiComp = 'AB01';
    service.fnBuscLogo();

    const req = httpMock.expectOne('../assets/icons/LogoCiaAB01.png');
    req.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });

    expect(service.lstrRutaLogo).toBe('');
    expect(service.LogoComp).toBeNull();
  });
});
