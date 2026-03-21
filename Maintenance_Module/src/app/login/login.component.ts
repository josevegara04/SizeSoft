import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms'; // <-- NgModel lives here
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ApiService } from '../services/api.service';
import { MessagService } from '../services/messag.service';
import { MsgboxComponent } from '../msgbox/msgbox.component';

@Component({
  selector: 'app-login',
  imports: [NgIf, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
})

export class LoginComponent implements OnInit {

  title: string = '';
  lstrMens: string = '';
  lnumSessActi: number = 0;
  lQueryUser: any[] = [];
  lstrCookValu: string = '';

  //Variables para el contados de los tres minutos dle código de seguridad
  lnumTime: number = 180; // 3 minutos en segundos
  intervalId: any;
  lnumMinu: number = 0;
  lnumSeco: number = 0;

  lQuery: any[] = [];

  cookieService = inject(CookieService);

  constructor(public apiService: ApiService, private router: Router, private msgSrv: MessagService, private modalService: NgbModal) { }

  ngOnInit() {
    this.title = String(this.apiService.Title);
    this.apiService.clsUser.CodiComp = '';
    this.apiService.clsUser.Id = '';
    this.apiService.clsUser.NombUsua = '';
    this.apiService.clsUser.PassUsua = '';
    this.apiService.lstrRutaLogo = '';

    //En caso que haya cerrado la sesión y haya quedado algún documento pendiente por facturar, limpiar los datos
    this.apiService.lstrFact.TipoDocu = '';
    this.apiService.lstrFact.CodDocVen = '';
    this.apiService.lstrFact.CodiDocu = '';
    this.apiService.lstrFact.CodiVend = '';
    this.apiService.lstrFact.NumeDocu = '';
    this.apiService.lstrFact.FormPago = '';
  }
  LogIn() {
    //Validar que haya ingresado todos los datos. No validar la compañía para permitir el login con qr en el codiusua
    if (this.apiService.clsUser.Id == "") {
      this.lstrMens = "Debe ingresar el usuario";
      return;
    } else if (this.apiService.clsUser.Id.substring(0, 7) == 'QRCode=') {
      this.apiService.clsUser.Id = this.apiService.clsUser.Id.substring(7);
    }
    if (this.apiService.clsUser.PassUsua == "") {
      this.lstrMens = "Debe ingresar la clave del usuario";
      return;
    }
    this.lstrMens = "";

    //Establecer el código de la compañía siempre en mayúsculas, para la cokie
    this.apiService.clsUser.CodiComp = this.apiService.clsUser.CodiComp.toUpperCase();

    //Consultar el valor de la cookie de la aplicación
    this.apiService.clsUser.UserToken = this.cookieService.get('ERPCookie' + this.apiService.clsUser.CodiComp + this.apiService.clsUser.Id.toUpperCase());

    //Mensaje de validando usuario y clave
    this.lstrMens = 'Validando sus datos de ingreso, espere por favor...';
    //Validar usuario y clave
    this.apiService.AuthUser().subscribe({
      next: res => {
        this.lQueryUser = res;
        for (var i in this.lQueryUser) {
          if (i == '0') {
            if (this.lQueryUser[i].Messag == 'OK') {
              this.apiService.lboolUserLogged = true;
              this.apiService.lboolCerrSesi = false;
              this.apiService.clsUser.Id = this.lQueryUser[0].CodiUsua;
              this.apiService.clsUser.CodiComp = this.lQueryUser[0].CodiComp;
              this.apiService.clsUser.NombUsua = this.lQueryUser[0].NombUsua;
              this.apiService.lstrToken = this.lQueryUser[0].Token;
              this.apiService.clsUser.PassUsua = ''; //Borrar la clave para que no quede almacenada en ninguna parte
              this.apiService.clsUser.CodiSegu = '';  //Borrar el código de seguridad
              this.apiService.lstrRutaLogo = './assets/icons/Cia' + this.apiService.clsUser.CodiComp + '.jpg';
              //Establecer la cookie de la aplicación
              this.cookieService.set('ERPCookie' + this.apiService.clsUser.CodiComp + this.apiService.clsUser.Id.toUpperCase(), this.apiService.lstrToken);
              //Buscar el logo de la compañía
              this.apiService.fnBuscLogo();
            }
            else {
              this.apiService.lboolUserLogged = false;
              this.lstrMens = this.lQueryUser[0].Messag;
              this.lnumSessActi = this.lQueryUser[0].SessActi;
              this.apiService.clsUser.CodiSegu = '';  //Borrar el código de seguridad
              this.lnumTime = 180;
              this.fnCuentaRegresiva();
            }
          }
          //Activar las opciones del menu
          if (this.lQueryUser[i].menOpti == 'menuPlant')
            this.apiService.menuPlant = '1';
          else if (this.lQueryUser[i].menOpti == 'menuWareHo')
            this.apiService.menuWareHo = '1';
          else if (this.lQueryUser[i].menOpti == 'menuMachin')
            this.apiService.menuMachin = '1';
          else if (this.lQueryUser[i].menOpti == 'menuItem')
            this.apiService.menuItem = '1';
          else if (this.lQueryUser[i].menOpti == 'menuYarnCust')
            this.apiService.menuYarnCust = '1';
          else if (this.lQueryUser[i].menOpti == 'menuProdSche')
            this.apiService.menuProdSche = '1';
          else if (this.lQueryUser[i].menOpti == 'menuProduc')
            this.apiService.menuProduc = '1';
          else if (this.lQueryUser[i].menOpti == 'menuDelive')
            this.apiService.menuDelive = '1';
          else if (this.lQueryUser[i].menOpti == 'menuCatego')
            this.apiService.menuCatego = '1';
          else if (this.lQueryUser[i].menOpti == 'menuConsMP')
            this.apiService.menuConsMP = '1';
          else if (this.lQueryUser[i].menOpti == 'menuCustom')
            this.apiService.menuCustom = '1';
          else if (this.lQueryUser[i].menOpti == 'menuParam')
            this.apiService.menuParam = '1';
          else if (this.lQueryUser[i].menOpti == 'menuUsua')
            this.apiService.menuUsua = '1';
          else if (this.lQueryUser[i].menOpti == 'menuCC')
            this.apiService.menuCC = '1';
          else if (this.lQueryUser[i].menOpti == 'menuComp')
            this.apiService.menuComp = '1';
          else if (this.lQueryUser[i].menOpti == 'menuCuenCont')
            this.apiService.menuCuenCont = '1';
          else if (this.lQueryUser[i].menOpti == 'menuImpu')
            this.apiService.menuImpu = '1';
          else if (this.lQueryUser[i].menOpti == 'menuConcPago')
            this.apiService.menuConcPago = '1';
          else if (this.lQueryUser[i].menOpti == 'menuDescCond')
            this.apiService.menuDescCond = '1';
          else if (this.lQueryUser[i].menOpti == 'menuDocume')
            this.apiService.menuDocume = '1';
          else if (this.lQueryUser[i].menOpti == 'menuFormPago')
            this.apiService.menuFormPago = '1';
          else if (this.lQueryUser[i].menOpti == 'menuListPrec')
            this.apiService.menuListPrec = '1';
          else if (this.lQueryUser[i].menOpti == 'menuMoneda')
            this.apiService.menuMoneda = '1';
          else if (this.lQueryUser[i].menOpti == 'menuResoFact')
            this.apiService.menuResoFact = '1';
          else if (this.lQueryUser[i].menOpti == 'menuFact')
            this.apiService.menuFact = '1';
          else if (this.lQueryUser[i].menOpti == 'menuRemi')
            this.apiService.menuRemi = '1';
          else if (this.lQueryUser[i].menOpti == 'menuCoti')
            this.apiService.menuCoti = '1';
          else if (this.lQueryUser[i].menOpti == 'menuPedi')
            this.apiService.menuPedi = '1';
          else if (this.lQueryUser[i].menOpti == 'menuIngr')
            this.apiService.menuIngr = '1';
          else if (this.lQueryUser[i].menOpti == 'menuIngrMasi')
            this.apiService.menuIngrMasi = '1';
          else if (this.lQueryUser[i].menOpti == 'menuClieNota')
            this.apiService.menuClieNota = '1';
          else if (this.lQueryUser[i].menOpti == 'menuCompra')
            this.apiService.menuCompra = '1';
          else if (this.lQueryUser[i].menOpti == 'menuEgre')
            this.apiService.menuEgre = '1';
          else if (this.lQueryUser[i].menOpti == 'menuProvNota')
            this.apiService.menuProvNota = '1';
          else if (this.lQueryUser[i].menOpti == 'menuCompan')
            this.apiService.menuCompan = '1';
          else if (this.lQueryUser[i].menOpti == 'menuInvAju')
            this.apiService.menuInvAju = '1';
          else if (this.lQueryUser[i].menOpti == 'menuInve')
            this.apiService.menuInve = '1';
          else if (this.lQueryUser[i].menOpti == 'menuInvTra')
            this.apiService.menuInvTra = '1';
          else if (this.lQueryUser[i].menOpti == 'menuReport')
            this.apiService.menuReport = '1';
          else if (this.lQueryUser[i].menOpti == 'menupuntvent')
            this.apiService.menupuntvent = '1';
          else if (this.lQueryUser[i].menOpti == 'menucontcaja')
            this.apiService.menucontcaja = '1';
          else if (this.lQueryUser[i].menOpti == 'menupos')
            this.apiService.menupos = '1';
          else if (this.lQueryUser[i].menOpti == 'menuDefiComi')
            this.apiService.menuDefiComi = '1';
          else if (this.lQueryUser[i].menOpti == 'menuCalcComi')
            this.apiService.menuCalcComi = '1';
          else if (this.lQueryUser[i].menOpti == 'menuPeriCont')
            this.apiService.menuPeriCont = '1';
          else if (this.lQueryUser[i].menOpti == 'menuTranCont')
            this.apiService.menuTranCont = '1';
          else if (this.lQueryUser[i].menOpti == 'menuCertRete')
            this.apiService.menuCertRete = '1';
          else if (this.lQueryUser[i].menOpti == 'menuPais')
            this.apiService.menuPais = '1';

          //Opciones de menu que agrupan las anteriores, para los que aplica
          if (this.lQueryUser[i].menOpti2 == 'AdmMaes')
            this.apiService.AdmMaes = '1';
          else if (this.lQueryUser[i].menOpti2 == 'AdmTranClie')
            this.apiService.AdmTranClie = '1';
          else if (this.lQueryUser[i].menOpti2 == 'AdmTranProv')
            this.apiService.AdmTranProv = '1';
          else if (this.lQueryUser[i].menOpti2 == 'ConMaes')
            this.apiService.ConMaes = '1';
          else if (this.lQueryUser[i].menOpti2 == 'ConTran')
            this.apiService.ConTran = '1';
          else if (this.lQueryUser[i].menOpti2 == 'InvTran')
            this.apiService.InvTran = '1';
          else if (this.lQueryUser[i].menOpti2 == 'PdnMaes')
            this.apiService.PdnMaes = '1';
          else if (this.lQueryUser[i].menOpti2 == 'PdnTran')
            this.apiService.PdnTran = '1';
          else if (this.lQueryUser[i].menOpti2 == 'PosMaes')
            this.apiService.PosMaes = '1';
          else if (this.lQueryUser[i].menOpti2 == 'PosTran')
            this.apiService.PosTran = '1';
          else if (this.lQueryUser[i].menOpti2 == 'AdmTran')
            this.apiService.AdmTran = '1';

          //Opciones de menu que agrupan las anteriores, para los que aplica
          if (this.lQueryUser[i].menOpti3 == 'AdmTran')
            this.apiService.AdmTran = '1';

          //Butones del menu
          if (this.lQueryUser[i].menButton == 'btnAdmi')
            this.apiService.btnAdmi = '1';
          else if (this.lQueryUser[i].menButton == 'btnCont')
            this.apiService.btnCont = '1';
          else if (this.lQueryUser[i].menButton == 'btnProd')
            this.apiService.btnProd = '1';
          else if (this.lQueryUser[i].menButton == 'btnInve')
            this.apiService.btnInve = '1';
          else if (this.lQueryUser[i].menButton == 'btnGene')
            this.apiService.btnGene = '1';
          else if (this.lQueryUser[i].menButton == 'btnPos')
            this.apiService.btnPos = '1';
        }
        if (this.apiService.lboolUserLogged) {
          this.msgSrv.clear();
          //Navegar al módulo por defecto del usuario
          this.router.navigate([this.lQueryUser[0].menuPath]);
          //Verificar la versión de la aplicación
          this.apiService.Query = '';
          this.apiService.clsQuery = [];
          this.apiService.clsQuery.push({ CodiCons: 'VeriVers', NombPara: 'NumeVers', Valor: this.apiService.VersApli, CodiComp: this.apiService.clsUser.CodiComp, Token: this.apiService.lstrToken, Report: '0' });
          this.apiService.clsQuery.push({ CodiCons: 'VeriVers', NombPara: 'App', Valor: 'ERP', CodiComp: '', Token: '', Report: '0' });
          this.apiService.clsQuery.push({ CodiCons: 'VeriVers', NombPara: 'CodiComp', Valor: this.apiService.clsUser.CodiComp, CodiComp: '', Token: '', Report: '0' });
          this.apiService.clsQuery.push({ CodiCons: 'VeriVers', NombPara: 'CodiUsua', Valor: this.apiService.clsUser.Id, CodiComp: '', Token: '', Report: '0' });
          this.apiService.getQuery().subscribe({
            next: (res) => {
              //Mostrar los datos en el combo
              this.lQuery = [];
              this.lQuery = res;
              this.msgSrv.add(this.lQuery[0].Messag, 0);

              if (this.lQuery[0].AppUpda == 0) {
                this.apiService.fnClose();

                this.msgSrv.fnMsgBox(2, 'La versión del ERP se actualizará automáticamente, por favor ingrese de nuevo. Si este error continua, por favor elimine los archivos temporales de internet e ingrese de nuevo.');
                const modalRef = this.modalService.open(MsgboxComponent, { size: 'sm', centered: true, windowClass: 'dark-modal' });
                modalRef.componentInstance.title = 'Message Box';

                clearInterval(this.intervalId);
                this.intervalId = setInterval(() => {
                  window.location.reload();
                }, 5000);
              }
              //Vigencia del certificado digital
              if (res[0].MessCD != 'OK') {
                this.msgSrv.add(res[0].MessCD);
              }
              //Vigencia de la licencia del software
              if (res[0].MessLice != 'OK') {
                this.msgSrv.add(res[0].MessLice);
                this.msgSrv.fnMsgBox(2, res[0].MessLice);
                const modalRef = this.modalService.open(MsgboxComponent, { size: 'sm', centered: true, windowClass: 'dark-modal' });
                modalRef.componentInstance.title = 'Message Box';
              }
              //Si la licencia no está activa, cerrar la aplicación y la sesión del usuario
              if (res[0].EstLice != 'Activa') {
                this.apiService.fnClose();
              }
            }, error: (err) => {
              console.log(err);
            }
          });
        }
      }, error: err => {
        this.lstrMens = err;
        console.log(err);
      }
    });
  }
  //Función para la cuenta regresiva de código de seguridad
  fnCuentaRegresiva() {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      if (this.lnumTime > 0) {
        this.lnumTime--;
        this.lnumMinu = Math.floor(this.lnumTime / 60);
        this.lnumSeco = this.lnumTime % 60;
      }
      else {
        clearInterval(this.intervalId);
        this.lnumSessActi = 0;
      }
    }, 1000);
  }
}
