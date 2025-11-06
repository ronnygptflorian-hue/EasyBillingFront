import { Injectable } from "@angular/core";
import { BaseService } from "../../../services/base.service";
import { AuthResponse, UserLogin } from "../model/auth.model";

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseService<AuthResponse> {

    async login(path: string, user: UserLogin){
        return this.postPlain(path,user)
    }
}