import { Injectable } from "@angular/core";
import { BaseService } from "../../../services/base.service";
import { Factura, FacturaByIdResponse, FacturaResponse } from "../model/factura-request.model";
import { LocalStorageService } from "../../../services/storage.service";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class FacturaService extends BaseService<FacturaResponse> {
    constructor(
        localStorage: LocalStorageService
    ) {
        super(localStorage);

    }
    getById(id: number): Observable<Factura> {
        return this._http.get<Factura>(`${this.baseUrl}invoice/GetInvoiceById?IdEmpresa=${this.EMPRESA?.userCompanies[0].id}&Id=${id}`);
    }
    printFactura(id: number): Observable<Blob> {
        return this._http.get<Blob>(
            `${this.baseUrl}Invoice/PrintInvoice?id=${id}`,
            { responseType: 'blob' as 'json' }
        );
    }

}