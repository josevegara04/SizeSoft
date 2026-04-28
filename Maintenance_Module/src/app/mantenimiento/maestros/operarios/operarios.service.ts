import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../services/api.service';

@Injectable({ providedIn: 'root' })
export class OperariosService {

  constructor(private apiService: ApiService) {}

  /** Accion 1 = insert/update | Accion 2 = delete */
  save(body: any): Observable<any> {
    return this.apiService.SaveEntity([{
      ...body,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token:    this.apiService.lstrToken,
      Entidad:  304,
    }]);
  }

  search(body: any[]): Observable<any> {
    this.apiService.clsQuery = body;
    return this.apiService.getQuery();
  }
}
