import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../models/api-response.model';
import { SmtpConfig, SmtpConfigRequest, NotificationAction } from '../model/smtp.model';
import { enviroment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SmtpService {
  private http = inject(HttpClient);
  private apiUrl = enviroment.apiBaseUrl;

  getSmtpByEmpresa(idEmpresa: number): Observable<ApiResponse<SmtpConfig[]>> {
    return this.http.get<ApiResponse<SmtpConfig[]>>(`${this.apiUrl}/CoreConfig/smtp/by-empresa/${idEmpresa}`);
  }

  createSmtp(request: SmtpConfigRequest): Observable<ApiResponse<SmtpConfig>> {
    return this.http.post<ApiResponse<SmtpConfig>>(`${this.apiUrl}/CoreConfig/smtp`, request);
  }

  deleteSmtp(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/CoreConfig/smtp/${id}`);
  }

  getNotificationActions(): Observable<ApiResponse<NotificationAction[]>> {
    return this.http.get<ApiResponse<NotificationAction[]>>(`${this.apiUrl}/CoreConfig/noti-accion/all`);
  }
}
