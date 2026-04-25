import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MantenimientosService {
  // Endopoint to query/save
  private API_URL = 'https://erpapipruebas.azurewebsites.net/api/Query/Save'; 
  private API_URL_Query = 'https://erpapipruebas.azurewebsites.net/api/Query'; 

  constructor(private http: HttpClient) {}

  saveMaintenance(body: any): Observable<any> {
    return this.http.post(this.API_URL, body);
  }

  // Query to search parts
  search(body: any): Observable<any> {
    return this.http.post(this.API_URL_Query, body);
  }
}