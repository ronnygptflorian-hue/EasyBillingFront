import { Injectable } from "@angular/core";
import { CommonService } from "../../../services/common-data.service"
import { map, Observable } from "rxjs";
import { TipoEcf } from "../../../models/common-data.model"
import { ApiResponse } from "../../../models/api-response.model";
import { SecuenciaEcf } from "../model/secuencia-ecf.model";
import { LocalStorageService } from "../../../services/storage.service";
import { BaseService } from "../../../services/base.service";
import { CertificateData, EmpresaCertificadoResponse } from "../model/configuration.model";
@Injectable({ providedIn: 'root' })
export class ConfigutionService extends BaseService<any> {
    constructor(
        localStorage: LocalStorageService,
        private commonService: CommonService) {
        super(localStorage);

    }
    getTipoECF(): Observable<ApiResponse<TipoEcf[]>> {
        return this.commonService.getAllListDocument().pipe(
            map((res: any) => {
                const tiposEcf = res.data.tiposEcf as TipoEcf[]
                return {
                    data: tiposEcf,
                    messages: res.messages
                }
            })
        )
    }

    getSecuencia(query?: { pageIndex: number; pageSize: number }): Observable<ApiResponse<SecuenciaEcf[]>> {
        return this.getAllPagination("common/GetSecuencia", query).pipe(
            map((res: ApiResponse<SecuenciaEcf[]>) => ({
                data: res.data,
                messages: res.messages
            }))
        );
    }

    updateCertificate(formData: FormData) {
        return this._http.put(`${this.baseUrl}company/UpdateCertificate`, formData);
    }

    getCompanyInfo() {
        return this._http.get<EmpresaCertificadoResponse>(
            `${this.baseUrl}company/GetCompanyByid?IdEmpresa=${this.EMPRESA?.userCompanies[0].id}`
        );
    }

}