import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Operario } from './operario.model';
import { ApiService } from '../../../services/api.service';

@Injectable({ providedIn: 'root' })
export class OperariosService {

  constructor(private apiService: ApiService) {}

  getAll(): Observable<any> {
    this.apiService.clsQuery = [{
      CodiCons: 'Operar',
      NombPara: 'Compañía',
      Valor:    this.apiService.clsUser.CodiComp,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token:    this.apiService.lstrToken,
      Report:   '0',
    }];
    return this.apiService.getQuery();
  }

  /** Accion 1 = insert/update */
  save(item: Omit<Operario, 'idOper'> & { idOper?: number }): Observable<any> {
    const body: any = {
      Nombre:   item.nombre,
      Apellid:  item.apellid,
      Cedula:   item.cedula,
      Cargo:    item.cargo,
      Especi:   item.especi,
      Telefo:   item.telefo,
      Email:    item.email,
      Activo:   item.activo ? 1 : 0,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token:    this.apiService.lstrToken,
      Entidad:  304,
      Accion:   1,
    };
    if (item.idOper) body['IdOper'] = item.idOper;
    return this.apiService.SaveEntity([body]);
  }

  /** Accion 2 = delete */
  delete(idOper: number): Observable<any> {
    return this.apiService.SaveEntity([{
      IdOper:   idOper,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token:    this.apiService.lstrToken,
      Entidad:  304,
      Accion:   2,
    }]);
  }
}
