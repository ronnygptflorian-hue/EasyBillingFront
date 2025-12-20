import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { enviroment } from '../../../environment/environment';
import { MiCuentaData } from '../model/cuenta.model';

@Injectable({
  providedIn: 'root'
})
export class MiCuentaService {
  private apiUrl = enviroment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  obtenerDatosCuenta(): Observable<MiCuentaData> {
    return this.http.get<MiCuentaData>(`${this.apiUrl}/Empresa/MiCuenta`);
  }
}
