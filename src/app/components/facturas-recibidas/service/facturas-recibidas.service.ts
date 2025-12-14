import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../../../services/base.service';
import { FacturaRecibida, FacturaRecibidaFilters } from '../model/factura-recibida.model';
import { ApiResponse } from '../../../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class FacturasRecibidasService extends BaseService<FacturaRecibida> {

  getFacturasRecibidas(filters: FacturaRecibidaFilters): Observable<ApiResponse<FacturaRecibida[]>> {
    return this.getAllPagination('document/GetDocumentReciveBillingEasy', filters);
  }

  getFacturaRecibidaById(id: number): Observable<ApiResponse<FacturaRecibida>> {
    return this.post(`document/GetDocumentReciveBillingEasy/${id}`, {});
  }
}
