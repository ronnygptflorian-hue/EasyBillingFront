export interface FacturaRecibida {
  idEmpresa: number;
  idDocumento: number;
  idSucursal: number | null;
  idPuntoEmision: number | null;
  fecha: string;
  idCliente: number | null;
  idTipoDocumento: number;
  documento: string;
  idTipoEcf: number;
  ecf: string;
  fechaExpiraCF: string | null;
  idMoneda: number;
  tasaCambio: number;
  idTipoIngreso: number;
  idCondicionPago: number;
  idEstatusDocumento: number;
  descripcionEstatus: string;
  fechaVencimiento: string | null;
  rncEmisor: string;
  rncReceptor: string;
  razonSocialEmisor: string | null;
  razonSocialReceptor: string;
  fechaAdd: string;
  facturaAprobadaPorPortal: boolean | null;
  tipoDeFuente: string;
  idMotivoModificacion: number | null;
  indicadorNotaCredito: string | null;
  fechaEcfModificado: string | null;
  razonModificacion: string | null;
  rncModificado: string | null;
  ecfModificado: string | null;
  estatusAprobacion: string;
  mensajeAprobacion: string | null;
}

export interface FacturaRecibidaFilters {
  [key: string]: string | number | boolean | null | undefined;
  IdEmpresa?: number;
  razonSocialEmisor?: string;
  rncEmisor?: string;
  ecf?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  pageIndex?: number;
  pageSize?: number;
}
