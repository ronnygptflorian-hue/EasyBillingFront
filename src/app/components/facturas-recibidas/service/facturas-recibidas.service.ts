import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../../../services/base.service';
import { FacturaRecibida, FacturaRecibidaFilters, FacturaRecibidaDetalle } from '../model/factura-recibida.model';
import { ApiResponse } from '../../../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class FacturasRecibidasService extends BaseService<FacturaRecibida> {

  getFacturasRecibidas(filters: FacturaRecibidaFilters): Observable<ApiResponse<FacturaRecibida[]>> {
    return this.getAllPagination('document/GetDocumentReciveBillingEasy', filters);
  }

  getFacturaRecibidaById(id: number): Observable<FacturaRecibidaDetalle> {
    return this._http.get<FacturaRecibidaDetalle>(`${this.baseUrl}Document/GetbyId?id=${id}`);
  }

  aprobarFactura(id: number): Observable<any> {
    return this.post(`document/AprobarFactura/${id}`, {});
  }

  rechazarFactura(id: number, motivo: string): Observable<any> {
    return this.post(`document/RechazarFactura/${id}`, { motivo });
  }

  descargarXml(ecf: string, xmlData: string): Blob {
    const byteCharacters = atob(xmlData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'application/xml' });
  }
}
