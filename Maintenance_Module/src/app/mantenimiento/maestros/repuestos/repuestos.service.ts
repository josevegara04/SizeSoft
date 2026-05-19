import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RepuestosService {
  private API_URL = 'https://erpapipruebas.azurewebsites.net/api/Query/Save';
  private API_URL_QUERY = 'https://erpapipruebas.azurewebsites.net/api/Query';

  constructor(private http: HttpClient) {}

  save(body: any[]): Observable<any> {
    return this.http.post(this.API_URL, body);
  }

  search(body: any[]): Observable<any> {
    return this.http.post(this.API_URL_QUERY, body);
  }
}
