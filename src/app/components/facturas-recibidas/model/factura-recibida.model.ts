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

export interface FacturaRecibidaDetalle extends FacturaRecibida {
  ejercicio: number;
  periodo: number | null;
  documento1: string;
  fechaExpiraCf: string | null;
  rncemisor: string;
  rncreceptor: string;
  montoTotal: number;
  rowActive: boolean;
  rowId: string;
  syncStatus: boolean;
  syncIdServer: number;
  syncTimeStamp: string;
  documentosDetalles: DocumentoDetalle[];
  documentosXmldata: DocumentoXmlData[];
  documentosImpuestos?: any[];
  documentosRetenciones?: any[];
  documentosPagos?: any[];
  documentosDescuentosRecargos?: any[];
  documentosDetalleDescuentosRecargos?: any[];
  documentosDetalleImpuestos?: any[];
  documentosDetalleRetenciones?: any[];
  documentosVencimientos?: any[];
}

export interface DocumentoDetalle {
  idDocumento: number;
  sec: number;
  item: string;
  tipoItem: string;
  codigoSku: string | null;
  codigoEan: string | null;
  idUnidadMedida: number;
  unidades: number;
  cantidad: number;
  precio: number;
  totalExento: number;
  totalGravado: number;
  totalBruto: number;
  totalDescuentos: number;
  totalImpuestos: number;
  totalNeto: number;
  rowActive: boolean;
  rowId: string;
  fechaAdd: string;
  syncStatus: boolean;
  syncIdServer: number;
  syncTimeStamp: string;
  itbisCategoríaId: number;
}

export interface DocumentoXmlData {
  idDocumento: number;
  ecf: string;
  fullXmldata: string;
  summXmldata: string | null;
  jsondata: string;
  rowActive: boolean;
  rowId: string;
  fechaAdd: string;
  syncStatus: boolean;
  syncIdServer: number;
  syncTimeStamp: string;
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
