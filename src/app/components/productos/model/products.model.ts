export interface Product {
  id: number;
  idEmpresa: number;
  descripcion: string;
  codigo: string;
  precio: number;
  idMedida: number;
  idTipoImpuesto: number;
  itbisIncluido: boolean;
  fechaAdd: string; // ISO date string (e.g. "2025-09-21T16:15:46.443")
  bloqueado: boolean;
  aplicaDescuento: boolean;
  descripcionUnidad: string;
  descripcionTipoImpuesto: string;
  tipoProducto: number;
}
