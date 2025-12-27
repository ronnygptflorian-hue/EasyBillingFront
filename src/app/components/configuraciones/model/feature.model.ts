export interface Feature {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  valueType: number;
  defaultValue: string;
  esSistema: boolean;
  rowActive: boolean;
  rowId: string;
  fechaAdd: string;
  fechaUpdate: string | null;
}

export interface EmpresaFeature {
  id: number;
  idEmpresa: number;
  idFeature: number;
  feature?: Feature;
  activo: boolean;
  valor: string;
  observacion: string;
  fechaActivacion: string;
  rowActive: boolean;
  rowId: string;
  fechaAdd: string;
  fechaUpdate: string | null;
}

export interface EmpresaFeatureRequest {
  idEmpresa: number;
  idFeature: number;
  activo: boolean;
  valor: string;
  observacion: string;
}
