export interface CuentaEmpresa {
  idEmpresa: number;
  rnc: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  telefonos: string | null;
  email: string;
  logo: string | null;
  fechaAdd: string;
}

export interface CertificadoInfo {
  entidadEmisora: string;
  fechaEfectiva: string;
  fechaExpira: string;
  alias: string;
}

export interface EstadisticasCuenta {
  totalFacturasEmitidas: number;
  totalClientes: number;
  totalProductos: number;
  montoTotalFacturado: number;
}

export interface MiCuentaData {
  empresa: CuentaEmpresa;
  certificado: CertificadoInfo | null;
  estadisticas: EstadisticasCuenta;
}
