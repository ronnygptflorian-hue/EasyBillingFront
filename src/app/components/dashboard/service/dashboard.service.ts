import { Injectable } from "@angular/core";
import { BaseService } from "../../../services/base.service";
import { DashboardModel } from "../model/dashboard.model";

@Injectable({ providedIn: 'root' })
export class ProductService extends BaseService<DashboardModel> {

}