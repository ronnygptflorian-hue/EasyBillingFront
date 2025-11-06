export interface Customer {
  id: number;
  idEmpresa: number;
  rnc: string;
  tipoId: string;            
  codigo: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  provincia: string;
  idPais: number;
  telefonos: string;
  eMail: string;
  fechaAdd: string;         
  bloqueado: boolean;
  celular: string | null;
}
