import { Message } from "../../../models/api-response.model";

export type UserType = 'A' | 'U' | 'S' | string;

export interface UserCompany {
  id: number;
  razonSocial: string;
  nombreComercial: string;
}
export interface AuthResponse {
  token: string;
  refreshToken: string;

  messages: Message[];
  userCompanies: UserCompany[];

  id: number;
  nombre: string;

  loginName: string;
  password: string | null;
  hashId: string | null;

  tipo: UserType;
  bloqueado: boolean;
  contrasenaCambiada: boolean;

  email: string | null;
  rowActive: boolean | null;
  rowId: string | null;


  fechaAdd: string;        
  fechaLogin: string;

  syncStatus: string | null;
  syncIdServer: string | null;
  syncTimeStamp: string | null;
}

export interface UserLogin {
    LoginName: string
    Password: string
}
