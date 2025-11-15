import { Injectable } from "@angular/core";
import { BaseService } from "../../../services/base.service";
import { FacturaByIdResponse, FacturaResponse } from "../model/factura-request.model";
import { LocalStorageService } from "../../../services/storage.service";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class FacturaService extends BaseService<FacturaResponse> {
    constructor(
        localStorage: LocalStorageService
    ) {
        super(localStorage);

    }
    getById( id: number): Observable<FacturaByIdResponse> {
        return this._http.get<FacturaByIdResponse>(`${this.baseUrl}invoice/GetInvoiceById?IdEmpresa=${this.EMPRESA?.userCompanies[0].id}&Id=${id}`);
    }

}