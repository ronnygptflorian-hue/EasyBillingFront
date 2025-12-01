export interface CertificateData {
  idEmpresa: number;
  entidadEmisora: string;
  fechaEmision: string | null;
  fechaEfectiva: string;
  fechaExpira: string;
  alias: string;
  credenciales: string;
  idUsuario: number;
  nivelAcceso: number;
  bloqueado: boolean;
  default: boolean;
  IdCertificado: number;
}
export interface EmpresaCertificadoResponse {
  certificado: Certificado;
  messages: Mensaje[];
  idEmpresa: number;
  rnc: string;
  codigo: string | null;
  razonSocial: string;
  nombreComercial: string;
  siglas: string;
  abreviatura: string | null;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  idPais: number | null;
  telefonos: string | null;
  email: string;
  idEstatusEmpresa: number;
  fechaAdd: string;
  logo: string | null;
  bloqueado: boolean;
  archivoLogo: string | null;
  origen: string;
}

export interface Certificado {
  id: number;
  idEmpresa: number;
  entidadEmisora: string | null;
  fechaEmision: string | null;
  fechaEfectiva: string;
  fechaExpira: string;
  alias: string;
  fechaAdd: string;
  bloqueado: boolean;
}

export interface Mensaje {
  code: number;
  msg: string;
  stop: boolean;
  type: string;
}
