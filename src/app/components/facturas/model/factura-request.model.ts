// ------------------------------
// Detalles para enviar (POST/PUT)
// ------------------------------
export interface FacturaDetailRequest {
  idProducto: number;
  cantidad: number;
  precio: number;
  idTipoImpuesto: number;
  porcientoDescuento: number;
  porcientoRecargo: number;
  valorItbis: number;
  valorImpuesto: number;
  valorDescuento: number;
  valorRecargo: number;
  TipoRetencion?: number;
  ValorItbisRetencion?: number;
  ValorIsrRetencion?: number;
  totalDetalle: number;
  impuestosAdicionales?: ImpuestoAdicionalDetalle[];
}

export interface ImpuestoAdicionalDetalle {
  idImpuestoAdicional: number;
  porcientoImpuesto: number;
  valorImpuesto: number;
}

// ------------------------------
// Modelo para enviar factura
// ------------------------------
export interface FacturaRequest {
  id: number;
  idEmpresa: number;
  idCliente: number;
  IdNumFactura: number;
  comentario: string;
  tipoVenta: string;
  referencia: string;
  idTipoEcf: number;
  idMoneda: number;
  tasaCambio: number;
  fechaEmisionEcf: string;
  idTipoIngreso: number;
  idCondicionPago: number;
  tieneRetencion: boolean;
  montoTotal: number;
  totalImpuestos: number;
  estadoFactura: string;
  AplicaDescuento: boolean;
  PrecioIncluyeImpuestos: boolean;
  idMotivoModificacion: number;
  RazonModificacion: string;
  detail: FacturaDetailRequest[];
}

// ------------------------------
// Respuesta estándar de factura (listados)
// ------------------------------
export interface FacturaResponse {
  id: number;
  idEmpresa: number;
  idNumFactura: number;
  idCliente: number;
  nombreCliente: string;
  comentario: string;
  tipoVenta: string;
  diasCredito: number;
  fechaVencimiento: string;
  porcientoDescuento: number | null;
  referencia: string;
  idTipoEcf: number;
  ecf: string;
  idMoneda: number;
  tasaCambio: number;
  fechaAdd: string;
  bloqueado: boolean;
  idDocumento: number | null;
  descripcionMoneda: string;
  estadoFactura: string;

  rnc: string;
  tipoId: string;
  direccion: string;
  telefonos: string;
  codigoISO: string;
  descripcionTipoEcf: string;
  totalGeneral: number;
  totalItbis: number;
  totalImpuesto: number;
  totalDescuento: number;
  totalRecargo: number;
  idMotivoModificacion: number | null;
  motivoModificacion: string | null;
  idTipoIngreso: number | null;
  idCondicionPago: number | null;
  fechaEmisionEcf: string | null;
  impuestoIncluido: boolean | null;
}

// ------------------------------
// Info de paginación
// ------------------------------
export interface PaginationInfo {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ------------------------------
// Mensajes de API
// ------------------------------
export interface ApiMessage {
  code: number;
  msg: string;
  stop: boolean;
  type: string;
}

// ------------------------------
// Respuesta de listados de factura
// ------------------------------
export interface FacturaApiResponse {
  data: FacturaResponse[];
  pagination: PaginationInfo;
  messages: ApiMessage[];
}

// ------------------------------
// Detalle que trae el GET BY ID
// ------------------------------
export interface FacturaDetalleResponse {
  id: number;
  idEmpresa: number;
  idFactura: number;
  idNumFactura: number | null;
  idProducto: number;
  cantidad: number;
  precio: number;
  idTipoImpuesto: number;
  porcientoImpuesto: number | null;
  idImpuestoAdicional: number | null;
  porcientoImpuestoAdic: number | null;
  porcientoDescuento: number;
  porcientoRecargo: number;
  valorItbis: number;
  porcientoRetencion: number | null;
  valorImpuesto: number;
  valorDescuento: number;
  valorRecargo: number;
  refundAmount: number | null;
  totalDetalle: number;
  fechaAdd: string;
  bloqueado: boolean;
  descripcionProducto: string;
  descripcionMedida: string;
  codigoUnidad: string;
  simboloUnidad: string;
  descripcionItbi: string;
  descripcionImpuesto: string | null;
}

// ------------------------------
// Respuesta COMPLETA de GetInvoiceById
// ------------------------------
export interface FacturaByIdResponse {
  detalles: FacturaDetalleResponse[];
  messages: ApiMessage[];

  id: number;
  idEmpresa: number;
  idNumFactura: number;
  idCliente: number;
  nombreCliente: string;
  comentario: string;
  tipoVenta: string;
  diasCredito: number;
  fechaVencimiento: string;
  porcientoDescuento: number | null;
  referencia: string;
  idTipoEcf: number;
  ecf: string;
  idMoneda: number;
  tasaCambio: number;
  fechaAdd: string;
  bloqueado: boolean;
  idDocumento: number | null;
  descripcionMoneda: string;
  rnc: string;
  tipoId: string;
  direccion: string;
  telefonos: string;
  codigoISO: string;
  descripcionTipoEcf: string;
  totalGeneral: number;
  totalItbis: number;
  totalImpuesto: number;
  totalDescuento: number;
  totalRecargo: number;
  idMotivoModificacion: number | null;
  motivoModificacion: string | null;
  idTipoIngreso: number | null;
  idCondicionPago: number | null;
  fechaEmisionEcf: string | null;
  impuestoIncluido: boolean | null;
}

export interface Factura {
  detalles: Detalle[];
  messages: Mensaje[];
  id: number;
  idEmpresa: number;
  idNumFactura: number;
  idCliente: number;
  nombreCliente: string;
  comentario: string;
  tipoVenta: string;
  diasCredito: number;
  fechaVencimiento: string;
  porcientoDescuento: number | null;
  referencia: string;
  idTipoEcf: number;
  ecf: string;
  idMoneda: number;
  tasaCambio: number;
  fechaAdd: string;
  bloqueado: boolean;
  idDocumento: number | null;
  descripcionMoneda: string;
  rnc: string;
  tipoId: string;
  direccion: string;
  telefonos: string;
  codigoISO: string;
  descripcionTipoEcf: string;
  totalGeneral: number;
  totalItbis: number;
  totalImpuesto: number;
  totalDescuento: number;
  totalRecargo: number;
  idMotivoModificacion: number | null;
  motivoModificacion: string | null;
  idTipoIngreso: number | null;
  idCondicionPago: number | null;
  fechaEmisionEcf: string | null;
  impuestoIncluido: boolean;
  estadoFactura: string;
  qrDgii: string | null;
  codigoSeguridad: string | null;
  fechaFirmaDgii: string | null;
  informacionReferencia: InformacionReferencia;
}

export interface InformacionReferencia {
  ecfModificado: string;
  motivoAnulacion: string;
  fechaReferencia: string | null;
  razonModificacion: string;
}

export interface Detalle {
  id: number;
  idEmpresa: number;
  idFactura: number;
  idNumFactura: number | null;
  idProducto: number;
  cantidad: number;
  precio: number;
  idTipoImpuesto: number;
  porcientoImpuesto: number | null;
  idImpuestoAdicional: number | null;
  porcientoImpuestoAdic: number | null;
  porcientoDescuento: number;
  porcientoRecargo: number;
  valorItbis: number;
  porcientoRetencion: number | null;
  valorImpuesto: number;
  valorDescuento: number;
  valorRecargo: number;
  refundAmount: number | null;
  totalDetalle: number;
  fechaAdd: string;
  bloqueado: boolean;
  descripcionProducto: string;
  descripcionMedida: string;
  codigoUnidad: string;
  simboloUnidad: string;
  descripcionItbi: string;
  descripcionImpuesto: string | null;
  tipoRetencion: number | null;
  valorItbisRetencion: number;
  valorIsrRetencion: number;
  impuestosAdicionales?: ImpuestoAdicionalDetalle[];
}

export interface ImpuestoAdicionalRequest {
  idImpuestoAdicional: number;
  porcientoImpuesto: number;
  valorImpuesto: number;
}

export interface Mensaje {
  code: number;
  msg: string;
  stop: boolean;
  type: string;
}
