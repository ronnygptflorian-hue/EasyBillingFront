export interface CommonData {
  sucursales: Sucursal[];
  puntosEmision: any[];
  estatusDocumentos: EstatusDocumento[];
  tiposEcf: TipoEcf[];
  tiposImpuestos: TipoImpuesto[];
  moneda: Moneda[];
  tiposIngreso: TipoIngreso[];
  condicionesPago: CondicionPago[];
  facturaEstado: FacturaEstado[];
  unidadesMedida: UnidadMedida[];
  motivosModificaciones: MotivoModificacion[];
}

export interface Sucursal {
  id: number;
  idEmpresa: number;
  nombre: string;
  fechaAdd: string;
  bloqueado: boolean;
}

export interface EstatusDocumento {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  fechaAdd: string;
  bloqueado: boolean | null;
}

export interface TipoEcf {
  id: number;
  descripcion: string;
  codigo: string;
  digitosSecuencia: number;
  fechaAdd: string;
  bloqueado: boolean | null;
}

export interface Moneda {
  id: number;
  descripcion: string;
  codigoIso: string;
  simbolo: string;
  fechaAdd: string;
}

export interface TipoIngreso {
  id: number;
  descripcion: string;
  codigo: string;
}

export interface CondicionPago {
  id: number;
  descripcion: string;
  codigo: string;
}

export interface FacturaEstado {
  codigo: string;
  nombre: string;
}

export interface UnidadMedida {
  id: number;
  descripcion: string;
  codigo: string;
  simbolo: string;
}

export interface MotivoModificacion {
  id: number;
  descripcion: string;
  codigo: string;
}

export interface TipoImpuesto {
  id: number;
  descripcion: string;
  codigo: string;
  impuestoP: number;
  adicional: boolean;
  rowActive: boolean;
  fechaAdd: string;
}

export interface ImpuestoAdicional {
  id: number;
  descripcion: string;
  name: string;
  code: string;
  porcentaje: number;
  rate: number;
}