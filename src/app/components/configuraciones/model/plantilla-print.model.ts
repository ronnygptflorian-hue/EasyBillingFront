export interface PlantillaPrint {
  id: number;
  idEmpresa: number;
  nombrePlantilla: string;
  tipoPlantilla: string;
  fechaCreacion: string;
  creadoPor: string;
}

export interface PlantillaPrintRequest {
  idEmpresa: number;
  nombrePlantilla: string;
  tipoPlantilla: string;
  fechaCreacion: string;
  creadoPor: string;
}

export interface PrintOption {
  value: string;
  text: string;
}
