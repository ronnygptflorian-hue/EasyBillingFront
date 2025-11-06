export interface SecuenciaEcf {
  id: number;
  idEmpresa: number;
  idTipoEcf: number;
  inicioSecuencia: number;
  finSecuencia: number;
  fechaExpiracion: string; 
  fechaAdd: string;        
  bloqueado: boolean;
  descripcionTipoEcf: string;
}
