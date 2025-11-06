import { Injectable } from "@angular/core";
import { BaseService } from "../../../services/base.service";
import { Customer } from "../model/customer.model";
import { map, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class CustomerService extends BaseService<Customer> {

  getClientes(pageIndex = 1, pageSize = 10, filters?: any) {
    return this.getAllPagination('client/GetClients', {
      PageIndex: pageIndex,
      PageSize: pageSize,
      ...filters
    });
  }

  getClienteById(id:number): Observable<Customer> {
    return this.getAll('client/GetClients',{id}).pipe(
      map((res)=>{
        return res[0]
      }) 
    )
  }
}