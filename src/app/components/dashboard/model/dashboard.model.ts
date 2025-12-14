export interface FacturaRecibidaTercero {
  ecf: string;
  proveedor: string | null;
  fecha: string;
  total: number;
}

export interface DashboardModel {
  totalFacturas: number;
  facturasPendientes: number;
  clientesActivos: number;
  ingresosMes: number;
  facturasRecibidasTercero: FacturaRecibidaTercero[];
}