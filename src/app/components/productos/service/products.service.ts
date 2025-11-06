import { Injectable } from "@angular/core";
import { BaseService } from "../../../services/base.service";
import { Product } from "../model/products.model";
import { ApiResponse } from "../../../models/api-response.model";
import { TipoImpuesto } from "../../../models/common-data.model";
import { CommonService } from "../../../services/common-data.service";
import { LocalStorageService } from "../../../services/storage.service";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ProductService extends BaseService<Product> {

    constructor(
        localService: LocalStorageService,
        private commonService: CommonService
    ) {
        super(localService);
    }

    getProducts(pageIndex = 1, pageSize = 10, filters?: any) {
        return this.getAllPagination('Product/GetProducts', {
            PageIndex: pageIndex,
            PageSize: pageSize,
            ...filters
        });
    }

    getTiposImpuestosYUnidades(): Observable<ApiResponse<{
        tiposImpuestos: TipoImpuesto[],
        unidadesMedida: any[]
    }>> {
        return this.commonService.getAllListDocument().pipe(
            map((res: any) => {
                const tiposFiltrados = (res.data.tiposImpuestos as TipoImpuesto[]).filter(
                    (impuesto) => impuesto.adicional === false
                );

                const unidadesMedida = res.data.unidadesMedida;

                return {
                    data: {
                        tiposImpuestos: tiposFiltrados,
                        unidadesMedida: unidadesMedida
                    },
                    messages: res.messages
                };
            })
        );
    }

    getProductById(id: number): Observable<Product> {
        return this.getAll('Product/GetProducts', { id }).pipe(
            map((res) => {
                return res[0]
            })
        )
    }

}
