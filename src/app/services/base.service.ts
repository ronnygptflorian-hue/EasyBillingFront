import { ApiResponse, QueryParams } from '../models/api-response.model'
import { enviroment } from '../environment/environment'
import { inject, Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { map, Observable } from 'rxjs'
import { LocalStorageService } from '../services/storage.service'
import { AuthResponse } from '../components/auth/model/auth.model'

@Injectable({ providedIn: 'root' })
export class BaseService<T> {
    protected _http = inject(HttpClient)
    protected readonly baseUrl = enviroment.apiBaseUrl
    public EMPRESA: AuthResponse | null

    constructor(private LocalService: LocalStorageService) {
        this.EMPRESA = LocalService.get('User')

    }

    getAll(path: string, query?: QueryParams): Observable<T[]> {
        const params = this.toParams({
            IdEmpresa: this.EMPRESA?.id,
            ...query
        });

        return this._http.get<ApiResponse<T[]>>(`${this.baseUrl}${path}`, { params })
            .pipe(
                map(res => {
                    if (res.messages[0].code !== 0) throw new Error(res.messages[0].msg);
                    return res.data ?? [];
                })
            );
    }

    getAllPagination(path: string, query?: QueryParams): Observable<ApiResponse<T[]>> {
        const params = this.toParams({
            IdEmpresa: this.EMPRESA?.id,
            ...query
        });

        return this._http.get<ApiResponse<T[]>>(`${this.baseUrl}${path}`, { params }).pipe(
            map(res => {
                if (res.messages[0].code !== 0) throw new Error(res.messages[0].msg);
                return res;
            })
        );
    }

    post(path: string, payload: any): Observable<ApiResponse<T>> {
        return this._http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, payload).pipe(
            map(res => {
                if (res.messages[0].code != 0) throw new Error(res.messages[0].msg);
                return res;
            })
        );
    }

    update(path: string, payload: any): Observable<ApiResponse<T>> {
        return this._http.put<ApiResponse<T>>(`${this.baseUrl}${path}`, payload).pipe(
            map(res => {
                if (res.messages[0].code !== 0) throw new Error(res.messages[0].msg);
                return res;
            })
        );
    }
    postPlain(path: string, payload: any): Observable<T> {
        return this._http.post<T>(`${this.baseUrl}${path}`, payload);
    }


    private toParams(q?: QueryParams): HttpParams {
        let p = new HttpParams();
        if (!q) return p;
        for (const [k, v] of Object.entries(q)) {
            if (v !== undefined && v !== null && `${v}` !== '') {
                p = p.set(k, String(v));
            }
        }
        return p;
    }

}