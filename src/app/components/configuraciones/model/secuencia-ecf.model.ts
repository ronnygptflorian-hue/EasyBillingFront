export interface SecuenciaEcf {
  id: number;
  idEmpresa: number;
  idTipoEcf: number;
  inicioSecuencia: number | null;
  finSecuencia: number | null;
  fechaExpiracion: string;
  fechaAdd: string;
  bloqueado: boolean;
  descripcionTipoEcf: string;
  codigoTipoEcf: string;
}
