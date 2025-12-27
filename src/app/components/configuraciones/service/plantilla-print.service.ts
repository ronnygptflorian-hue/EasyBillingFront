import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../models/api-response.model';
import { PlantillaPrint, PlantillaPrintRequest, PrintOption } from '../model/plantilla-print.model';
import { enviroment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PlantillaPrintService {
  private http = inject(HttpClient);
  private apiUrl = enviroment.apiBaseUrl;

  getPlantillaByEmpresa(idEmpresa: number): Observable<ApiResponse<PlantillaPrint>> {
    return this.http.get<ApiResponse<PlantillaPrint>>(`${this.apiUrl}/ConfiguracionPlantillaPrint/plantillas-print/by-empresa/${idEmpresa}`);
  }

  getPrintOptions(): Observable<PrintOption[]> {
    return this.http.get<PrintOption[]>(`${this.apiUrl}/ConfiguracionPlantillaPrint/print-options`);
  }

  createPlantilla(request: PlantillaPrintRequest): Observable<ApiResponse<PlantillaPrint>> {
    return this.http.post<ApiResponse<PlantillaPrint>>(`${this.apiUrl}/ConfiguracionPlantillaPrint/plantillas-print`, request);
  }

  deletePlantilla(idEmpresa: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/ConfiguracionPlantillaPrint/plantillas-print?idEmpresa=${idEmpresa}`);
  }
}
