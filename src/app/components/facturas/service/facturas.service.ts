import { Injectable } from "@angular/core";
import { BaseService } from "../../../services/base.service";
import {
  Factura,
  FacturaByIdResponse,
  FacturaResponse,
} from "../model/factura-request.model";
import { LocalStorageService } from "../../../services/storage.service";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class FacturaService extends BaseService<FacturaResponse> {
  constructor(localStorage: LocalStorageService) {
    super(localStorage);
  }
  getById(id: number): Observable<Factura> {
    return this._http.get<Factura>(
      `${this.baseUrl}invoice/GetInvoiceById?IdEmpresa=${this.EMPRESA?.userCompanies[0].id}&Id=${id}`
    );
  }
  printFactura(id: number): Observable<Blob> {
    return this._http.get<Blob>(
      `${this.baseUrl}Invoice/PrintInvoice?id=${id}`,
      { responseType: "blob" as "json" }
    );
  }

  //SignEcf
  SignEcf(idDocumento: number): Observable<any> {
    const body = {
      IdEmpresa: this.EMPRESA?.userCompanies[0].id,
      IdDocumento: idDocumento,
    };

    return this._http.post<any>(`${this.baseUrl}invoice/SignEcf`, body);
  }

  getExcel() {
    return this._http.get(
      `${this.baseUrl}invoice/ExportToExcel?IdEmpresa=${this.EMPRESA?.userCompanies[0].id}`
    );
  }
  getXmlEasyBilling(idFactura: number, format: string = "xml2") {
    return this._http.get(
      `${this.baseUrl}Invoice/GetDocumentXmlDataEasyBilling?IdEmpresa=${this.EMPRESA?.userCompanies[0].id}&IdFactura=${idFactura}&Format=${format}`,
      { responseType: "text" } // 👈 RESPUESTA ES XML STRING
    );
  }
}
