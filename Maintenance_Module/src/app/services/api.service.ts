import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, debounceTime, switchMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MsgboxComponent } from '../msgbox/msgbox.component';
import { MessagService } from './messag.service';

const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
//'Access-Control-Allow-Origin': '*'}) };

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  Title: string = 'SizeSoft ERP';
  public VersApli: string = '';
  //Variable para las rutas de los web services de la app
  apiUrl: string = '';
  apiUrlLI: string = '';
  apiUrlSave: string = '';
  apiUrlPU: string = '';
  apiUrlXML: string = '';
  apiUrlConsDocu: string = '';
  apiUrlMail: string = '';
  apiUrlConsReso: string = '';
  apiUrlVeriCert: string = '';
  apiUrlLeerFact: string = '';
  apiUrlEvents: string = '';
  apiPdfUrl: string = '';
  apiOtrosUrl: string = '';
  //Observables Query
  public ResultRow: any;
  private ResultSubject = new Subject<any>();
  public ResultObservable$ = this.ResultSubject.asObservable();

  //Observables búsqueda sensible
  public RowBusqSens: any;
  private SubjBusqSens = new Subject<any>();
  public SubjBusqSens$ = this.SubjBusqSens.asObservable();

  QueryTitle: string = ''; /*Variable para indicar cual es el titulo de la ventana de búsqueda*/
  Query: string = '';  /*Variable para establecer el nombre de la consulta que se debe ejecutar*/
  Report: string = '0'; /*Variable para identificar si las consultas son por reportes o consultas de la aplicación*/
  /*Definición del arreglo para los filtros de las consultas*/
  clsQuery = [{ CodiCons: '', NombPara: '', Valor: '', CodiComp: '', Token: '', Report: '' }];
  /*Definición del arreglo para la información del usuario*/
  clsUser = { CodiComp: '', Id: '', NombUsua: '', PassUsua: '', UserToken: '', CodiSegu: '', menuApp: '', Ip: '', City: '', Region: '', PostCode: '', Longit: '', Latitu: '' };
  /*definción del arreglo para el pasword del usuario*/
  clsPaswUser = { CodiComp: '', CodiUsua: '', Token: '', NewPasw: '', OldPasw: '', Action: '' };
  //Arreglo para recibir valores de parametros en el searchcomponent
  lstrValoPara = [{ NombPara: '', ValoPara: '', HabiPara: 0 }];
  //variables para el control del login
  lboolUserLogged: boolean = false;
  lboolCerrSesi: boolean = false;
  lstrToken: string = '';
  //Arreglo para facturar las remisiones, cotrizaciones y pedidos
  lstrFact = { TipoDocu: '', CodiDocu: '', NumeDocu: '', CodDocVen: '', CodiVend: '', FormPago: '' };
  //Arreglo para el ingreso de una factura de venta
  lstrIngr = { CodiDocu: '', NumeSoli: 0, PrefFact: '', NumeFact: 0 };

  lDataSet: any[] = [];
  lQuery: any[] = [];

  //Variable para la ruta de la imagen logo de la compañía
  lstrRutaLogo: string = '';
  LogoComp: any;
  //Variables para activar y desactivar las opciones del menu
  menuPlant: string = '0';
  menuWareHo: string = '0';
  menuMachin: string = '0';
  menuItem: string = '0';
  menuYarnCust: string = '0';
  menuProdSche: string = '0';
  menuProduc: string = '0';
  menuDelive: string = '0';
  menuCatego: string = '0';
  menuConsMP: string = '0';
  menuCustom: string = '0';
  menuParam: string = '0';
  menuUsua: string = '0';
  menuCC: string = '0';
  menuComp: string = '0';
  menuCuenCont: string = '0';
  menuImpu: string = '0';
  menuConcPago: string = '0';
  menuDescCond: string = '0';
  menuDocume: string = '0';
  menuFormPago: string = '0';
  menuListPrec: string = '0';
  menuMoneda: string = '0';
  menuResoFact: string = '0';
  menuFact: string = '0';
  menuRemi: string = '0';
  menuCoti: string = '0';
  menuPedi: string = '0';
  menuIngr: string = '0';
  menuIngrMasi: string = '0';
  menuClieNota: string = '0';
  menuCompra: string = '0';
  menuEgre: string = '0';
  menuProvNota: string = '0';
  menuCompan: string = '0';
  menuInvAju: string = '0';
  menuInve: string = '0';
  menuInvTra: string = '0';
  menuReport: string = '0';
  menupuntvent: string = '0';
  menucontcaja: string = '0';
  menupos: string = '0';
  menuDefiComi: string = '0';
  menuCalcComi: string = '0';
  menuPeriCont: string = '0';
  menuTranCont: string = '0';
  menuCertRete: string = '0';
  menuPais: string = '0';
  //Agrupadores del menu
  AdmTranProv: string = '0';
  AdmTranClie: string = '0';
  AdmTran: string = '0';
  AdmMaes: string = '0';
  ConMaes: string = '0';
  ConTran: string = '0';
  InvTran: string = '0';
  PdnMaes: string = '0';
  PdnTran: string = '0';
  PosMaes: string = '0';
  PosTran: string = '0';
  //Botones del menu
  btnAdmi: string = '0';
  btnCont: string = '0';
  btnPos: string = '0';
  btnProd: string = '0';
  btnInve: string = '0';
  btnGene: string = '0';

  constructor(private http: HttpClient, private msgSrv: MessagService, private modalService: NgbModal) {
    this.VersApli = '1.4.12';
    var lstrAmbiente = 'Desarrollo';
    //var lstrAmbiente = 'Pruebas';
    //var lstrAmbiente = 'Producción';
    if (lstrAmbiente == 'Desarrollo' || lstrAmbiente == 'Pruebas') {
      this.Title = 'SizeSoft ERP - ' + lstrAmbiente;
    }
    if (lstrAmbiente == 'Desarrollo') {
      this.apiUrl = 'https://localhost:44371/api/Query';
      this.apiUrlLI = 'https://localhost:44371/users/authenticate';
      this.apiUrlSave = 'https://localhost:44371/api/Query/Save';
      this.apiUrlPU = 'https://localhost:44371/users/PaswUsua';
      this.apiUrlXML = 'https://localhost:44371/XML/getXML';
      this.apiUrlConsDocu = 'https://localhost:44371/XML/ConsDocu';
      this.apiUrlMail = 'https://localhost:44371/XML/SendMail';
      this.apiUrlConsReso = 'https://localhost:44371/XML/ConsReso';
      this.apiUrlVeriCert = 'https://localhost:44371/XML/TestCert';
      this.apiUrlEvents = 'https://localhost:44371/XML/EnviEven';
      this.apiUrlLeerFact = 'https://localhost:44371/XML/LeerFact';
      this.apiPdfUrl = 'https://localhost:44371/Pdf/';
      this.apiOtrosUrl = 'https://localhost:44371/Otros/';
    } else if (lstrAmbiente == 'Pruebas') {
      this.apiUrl = 'https://erpapipruebas.azurewebsites.net/api/Query';
      this.apiUrlLI = 'https://erpapipruebas.azurewebsites.net/users/authenticate';
      this.apiUrlSave = 'https://erpapipruebas.azurewebsites.net/api/Query/Save';
      this.apiUrlPU = 'https://erpapipruebas.azurewebsites.net/users/PaswUsua';
      this.apiUrlXML = 'https://erpapipruebas.azurewebsites.net/XML/getXML';
      this.apiUrlConsDocu = 'https://erpapipruebas.azurewebsites.net/XML/ConsDocu';
      this.apiUrlMail = 'https://erpapipruebas.azurewebsites.net/XML/SendMail';
      this.apiUrlConsReso = 'https://erpapipruebas.azurewebsites.net/XML/ConsReso';
      this.apiUrlVeriCert = 'https://erpapipruebas.azurewebsites.net/XML/TestCert';
      this.apiUrlEvents = 'https://erpapipruebas.azurewebsites.net/XML/EnviEven';
      this.apiUrlLeerFact = 'https://erpapipruebas.azurewebsites.net/XML/LeerFact';
      this.apiPdfUrl = 'https://erpapipruebas.azurewebsites.net/Pdf/';
      this.apiOtrosUrl = 'https://erpapipruebas.azurewebsites.net/Otros/';
    }
    //Obtener la dirección IP del usuario
    this.getIPAddress().subscribe((res: any) => {
      this.clsUser.Ip = res.ip;

      this.getLocationByIP(this.clsUser.Ip).subscribe(data => {
        this.clsUser.City = data.city;
        this.clsUser.Region = data.region;
        this.clsUser.PostCode = data.postal;
        this.clsUser.Longit = data.longitude.toString();
        this.clsUser.Latitu = data.latitude.toString();
      });
    });
  }
  getQuery(): Observable<any> {
    /*if (!this.lboolUserLogged){
      catchError(this.handleError<any>('getQuery'))
    }else{*/
    return this.http.post<any>(this.apiUrl, this.clsQuery, httpOptions).pipe(
      tap((queryRes: any) => {
        if (!this.lboolCerrSesi) {
          var lRow = queryRes[0];
          for (var i in lRow) {
            if (i == "messag" || i == "Messag") {
              if (lRow[i] == 'Token Inválido') {
                //Mensaje de time out
                if (this.lboolUserLogged == true) {  //Condición para que muestre el mensaje una sola vez
                  this.msgSrv.fnMsgBox(2, 'Su sesión ha expirado');
                  const modalRef = this.modalService.open(MsgboxComponent, { size: 'sm', centered: true, windowClass: 'dark-modal' });
                  modalRef.componentInstance.title = 'Message Box';
                }
                this.lboolUserLogged = false;
                //Limpiar las variables de identificación del usuario
                this.clsUser.CodiComp = '';
                this.clsUser.Id = '';
                this.clsUser.NombUsua = '';
                this.clsUser.PassUsua = '';
                this.lstrToken = '';
                break;
              }
            }
          }
        }
      }),
      catchError(this.handleError<any>('getQuery'))
    );
    //}
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error('Control de errores. ', error); // log to console instead
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
  //Establecer la respuesta del observable de las consultas
  setResQuery(pvstrResult: any) {
    this.ResultRow = pvstrResult;
    this.ResultSubject.next(this.ResultRow);
  }
  //Función para la autenticación del usuario
  AuthUser(): Observable<any> {
    this.clsUser.menuApp = 'ERP';
    return this.http.post<any>(this.apiUrlLI, this.clsUser, httpOptions).pipe(
      //tap((userRes: any) => console.log('Consulta ejecutada')),
      catchError(this.handleError<any>('AuthUser'))
    );
  }
  //Función para invocar el SP guardar
  SaveEntity(pvEntity: any[]): Observable<any> {
    return this.http.post<any>(this.apiUrlSave, pvEntity, httpOptions).pipe(
      tap((saveRes: any) => {
        {
          var lRow = saveRes[0];
          for (var i in lRow) {
            if (i == "Messag")
              if (lRow[i] == 'Token Inválido') {
                //Mensaje de time out
                if (this.lboolUserLogged == true) {  //Condición para que muestre el mensaje una sola vez
                  this.msgSrv.fnMsgBox(2, 'Su sesión ha expirado');
                  const modalRef = this.modalService.open(MsgboxComponent, { size: 'sm', centered: true, windowClass: 'dark-modal' });
                  modalRef.componentInstance.title = 'Message Box';
                }
                this.lboolUserLogged = false;
                //Limpiar las variables de identificación del usuario
                this.clsUser.CodiComp = '';
                this.clsUser.Id = '';
                this.clsUser.NombUsua = '';
                this.clsUser.PassUsua = '';
                this.lstrToken = '';
                return;
              }
          }
        }
      }),
      catchError(this.handleError<any>('SaveEntity'))
    );
  }
  //Función para cerrar las sesiones del usuario en la aplicación
  fnClose() {
    //Cerrar la sesión en la BDD
    this.lboolCerrSesi = true;
    this.Query = '';
    this.clsQuery = [];
    this.clsQuery.push({ CodiCons: 'ClosUser', NombPara: 'Compañía', Valor: this.clsUser.CodiComp, CodiComp: this.clsUser.CodiComp, Token: this.lstrToken, Report: '0' });
    this.clsQuery.push({ CodiCons: 'ClosUser', NombPara: 'Codigo', Valor: this.clsUser.Id, CodiComp: '', Token: '', Report: '0' });
    this.getQuery().subscribe({
      next: res => {
        this.lboolUserLogged = false;
        this.clsUser.CodiComp = '';
        this.clsUser.Id = '';
        this.clsUser.NombUsua = '';
        this.msgSrv.clear();
      }, error: err => {
        this.lboolUserLogged = false;
        this.clsUser.CodiComp = '';
        this.clsUser.Id = '';
        this.clsUser.NombUsua = '';
      }
    });
  }
  // Buscar el logo de la compañía
  fnBuscLogo(): void {
    const ruta = '../assets/icons/LogoCia' + this.clsUser.CodiComp + '.png';
    this.http.get(ruta, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.LogoComp = reader.result;
          this.lstrRutaLogo = ruta;
        };
        reader.readAsDataURL(blob);
      },
      error: () => {
        // Si no encuentra el logo, simplemente deja la ruta vacía
        this.lstrRutaLogo = '';
        this.LogoComp = null;
      }
    });
  }
  getIPAddress() {
    return this.http.get("http://api.ipify.org/?format=json");
  }
  // Obtener ubicación a partir de una IP
  getLocationByIP(ip: string): Observable<any> {
    return this.http.get(`https://ipapi.co/${ip}/json/`).pipe(
      catchError(err => {
        console.error('Error obteniendo ubicación:', err);
        return err;
      })
    );
  }
}


