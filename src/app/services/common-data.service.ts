import { Injectable } from "@angular/core";
import { BaseService } from "../services/base.service";
import { Observable } from "rxjs";
import { ApiResponse } from "../models/api-response.model";
import { CommonData, TipoImpuesto } from "../models/common-data.model";
import { map } from 'rxjs/operators';
import {DashboardModel} from '../components/dashboard/model/dashboard.model'
@Injectable({ providedIn: 'root' })
export class CommonService extends BaseService<CommonData> {

  getAllListDocument(): Observable<ApiResponse<CommonData>> {
    return this._http.get<ApiResponse<CommonData>>(
      `${this.baseUrl}common/GetAllListDocument?idEmpresa=${this.EMPRESA?.id}`
    );
  }

  getDashboardInformation(): Observable<DashboardModel> {
    return this._http.get<DashboardModel>(
      `${this.baseUrl}Common/DashboardEasyBilling?idEmpresa=${this.EMPRESA?.id}`
    );
  }

  getTipoImpuesto() {
    return this.getAllListDocument().pipe(
      map((res: any) => {
        const tiposEcf = res.data.tipoImpuesto as TipoImpuesto[]
        return {
          data: tiposEcf,
          messages: res.messages
        }
      })
    )
  }
}
