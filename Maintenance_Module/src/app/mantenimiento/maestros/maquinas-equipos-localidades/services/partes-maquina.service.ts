import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ParteMaquina {
  CodiPart: string;
  NombreParte: string;
  idTipoParte: number;
  CodiMaqu: string;
  FechaCreacion?: string;
}

@Injectable({ providedIn: 'root' })
export class PartesMaquinaService {
  private readonly http = inject(HttpClient);

  private readonly API_URL_SAVE = 'https://erpapipruebas.azurewebsites.net/api/Query/Save';
  private readonly API_URL_QUERY = 'https://erpapipruebas.azurewebsites.net/api/Query';

  // 🔹 Guardar / actualizar (Accion = 1)
  savePart(data: any): Observable<any> {
    const body = [data];
    return this.http.post(this.API_URL_SAVE, body);
  }

  // 🔹 Eliminar (Accion = 2)
  deletePart(codiPart: string, token: string): Observable<any> {
    const body = [
      {
        CodiPart: codiPart,
        CodiComp: 'PMC1',
        Entidad: 300,
        Token: token,
        Accion: 2
      }
    ];

    return this.http.post(this.API_URL_SAVE, body);
  }

  // 🔹 Consultar partes por máquina
  getParts(maquinaId: string, token: string): Observable<any> {
    const body = [
      {
        CodiCons: 'GET_PART_MAQU', // ⚠️ validar que exista en BD
        NombPara: 'CodiMaqu',
        Valor: maquinaId,
        CodiComp: 'PMC1',
        Token: token,
        Report: '0'
      }
    ];

    return this.http.post(this.API_URL_QUERY, body);
  }
}
