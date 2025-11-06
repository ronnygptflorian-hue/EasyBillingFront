export interface Empresa {
  id?: string;
  user_id?: string;
  nombre: string;
  rnc: string;
  direccion: string;
  telefono: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface Cliente {
  id?: string;
  user_id?: string;
  nombre: string;
  rnc_cedula: string;
  direccion: string;
  telefono: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface Producto {
  id?: string;
  user_id?: string;
  codigo: string;
  descripcion: string;
  precio: number;
  itbis: number;
  created_at?: string;
  updated_at?: string;
}

export interface Factura {
  id?: string;
  user_id?: string;
  cliente_id: string;
  ncf: string;
  fecha: string;
  subtotal: number;
  itbis: number;
  descuento: number;
  total: number;
  estado: 'pendiente' | 'pagada' | 'vencida' | 'cancelada';
  notas: string;
  created_at?: string;
  updated_at?: string;
  cliente?: Cliente;
}

export interface FacturaItem {
  id?: string;
  factura_id?: string;
  producto_id?: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  itbis: number;
  total: number;
  tipo_retencion: string;
  itbis_retenido: number;
  isr_retenido: number;
  created_at?: string;
}

export interface DashboardStats {
  totalFacturas: number;
  facturasPendientes: number;
  facturasPagadas: number;
  facturasVencidas: number;
  ingresosMes: number;
  ingresosAnio: number;
  clientesActivos: number;
  productosRegistrados: number;
}

export interface User {
  id: string;
  email: string;
}
