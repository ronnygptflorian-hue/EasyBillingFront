export interface SmtpConfig {
  id: number;
  idEmpresa: number;
  nombrePerfil: string;
  host: string;
  puerto: number;
  usuario: string;
  passwordEnc: string;
  usarSSL: boolean;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  predeterminado: boolean;
  activo: boolean;
  rowActive: boolean;
  rowId: string;
  fechaAdd: string;
  fechaUpdate: string | null;
  html?: string | null;
  emailTo?: string | null;
  subject?: string | null;
}

export interface SmtpConfigRequest {
  idEmpresa: number;
  nombrePerfil: string;
  host: string;
  puerto: number;
  usuario: string;
  passwordEnc: string;
  usarSSL: boolean;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  predeterminado: boolean;
  activo: boolean;
}

export interface SmtpProvider {
  name: string;
  host: string;
  port: number;
  ssl: boolean;
}

export interface NotificationAction {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  rowActive: boolean;
  rowId: string;
  fechaAdd: string;
  fechaUpdate: string | null;
}
