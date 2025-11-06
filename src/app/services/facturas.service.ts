import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Factura, FacturaItem, DashboardStats } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class FacturasService {
  constructor(private supabase: SupabaseService) {}

  async getFacturas(): Promise<Factura[]> {
    const { data, error } = await this.supabase.client
      .from('facturas')
      .select(`
        *,
        cliente:clientes(*)
      `)
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getFactura(id: string): Promise<Factura | null> {
    const { data, error } = await this.supabase.client
      .from('facturas')
      .select(`
        *,
        cliente:clientes(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getFacturaItems(facturaId: string): Promise<FacturaItem[]> {
    const { data, error } = await this.supabase.client
      .from('factura_items')
      .select('*')
      .eq('factura_id', facturaId);

    if (error) throw error;
    return data || [];
  }

  async createFactura(
    factura: Omit<Factura, 'id' | 'created_at' | 'updated_at'>,
    items: Omit<FacturaItem, 'id' | 'factura_id' | 'created_at'>[]
  ): Promise<Factura> {
    const user = this.supabase.currentUserValue;
    if (!user) throw new Error('Usuario no autenticado');

    const { data: facturaData, error: facturaError } = await this.supabase.client
      .from('facturas')
      .insert([{ ...factura, user_id: user.id }])
      .select()
      .single();

    if (facturaError) throw facturaError;

    const itemsWithFacturaId = items.map(item => ({
      ...item,
      factura_id: facturaData.id
    }));

    const { error: itemsError } = await this.supabase.client
      .from('factura_items')
      .insert(itemsWithFacturaId);

    if (itemsError) throw itemsError;

    return facturaData;
  }

  async updateFactura(id: string, factura: Partial<Factura>): Promise<Factura> {
    const { data, error } = await this.supabase.client
      .from('facturas')
      .update({ ...factura, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteFactura(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('facturas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const { data: facturas, error } = await this.supabase.client
      .from('facturas')
      .select('estado, total, fecha');

    if (error) throw error;

    const { data: clientes } = await this.supabase.client
      .from('clientes')
      .select('id', { count: 'exact' });

    const { data: productos } = await this.supabase.client
      .from('productos')
      .select('id', { count: 'exact' });

    const now = new Date();
    const mesActual = now.getMonth();
    const anioActual = now.getFullYear();

    const stats: DashboardStats = {
      totalFacturas: facturas?.length || 0,
      facturasPendientes: facturas?.filter(f => f.estado === 'pendiente').length || 0,
      facturasPagadas: facturas?.filter(f => f.estado === 'pagada').length || 0,
      facturasVencidas: facturas?.filter(f => f.estado === 'vencida').length || 0,
      ingresosMes: facturas?.filter(f => {
        const fecha = new Date(f.fecha);
        return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual && f.estado === 'pagada';
      }).reduce((sum, f) => sum + f.total, 0) || 0,
      ingresosAnio: facturas?.filter(f => {
        const fecha = new Date(f.fecha);
        return fecha.getFullYear() === anioActual && f.estado === 'pagada';
      }).reduce((sum, f) => sum + f.total, 0) || 0,
      clientesActivos: clientes?.length || 0,
      productosRegistrados: productos?.length || 0
    };

    return stats;
  }

  async getRecentFacturas(limit: number = 10): Promise<Factura[]> {
    const { data, error } = await this.supabase.client
      .from('facturas')
      .select(`
        *,
        cliente:clientes(*)
      `)
      .order('fecha', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getFacturasByEstado(estado: string): Promise<Factura[]> {
    const { data, error } = await this.supabase.client
      .from('facturas')
      .select(`
        *,
        cliente:clientes(*)
      `)
      .eq('estado', estado)
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
