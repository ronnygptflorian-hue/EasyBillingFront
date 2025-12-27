import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../models/api-response.model';
import { Feature, EmpresaFeature, EmpresaFeatureRequest } from '../model/feature.model';
import { enviroment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  private http = inject(HttpClient);
  private apiUrl = enviroment.apiBaseUrl;

  getAllFeatures(): Observable<ApiResponse<Feature[]>> {
    return this.http.get<ApiResponse<Feature[]>>(`${this.apiUrl}/CoreConfig/feature/all`);
  }

  getEmpresaFeatures(idEmpresa: number): Observable<ApiResponse<EmpresaFeature[]>> {
    return this.http.get<ApiResponse<EmpresaFeature[]>>(`${this.apiUrl}/CoreConfig/empresa-feature/by-empresa/${idEmpresa}`);
  }

  addFeatureToEmpresa(request: EmpresaFeatureRequest): Observable<ApiResponse<EmpresaFeature>> {
    return this.http.post<ApiResponse<EmpresaFeature>>(`${this.apiUrl}/CoreConfig/empresa-feature`, request);
  }

  deleteEmpresaFeature(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/CoreConfig/empresa-feature/${id}`);
  }
}
