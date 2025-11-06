import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Producto } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  constructor(private supabase: SupabaseService) {}

  async getProductos(): Promise<Producto[]> {
    const { data, error } = await this.supabase.client
      .from('productos')
      .select('*')
      .order('descripcion');

    if (error) throw error;
    return data || [];
  }

  async getProducto(id: string): Promise<Producto | null> {
    const { data, error } = await this.supabase.client
      .from('productos')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createProducto(producto: Omit<Producto, 'id' | 'created_at' | 'updated_at'>): Promise<Producto> {
    const user = this.supabase.currentUserValue;
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await this.supabase.client
      .from('productos')
      .insert([{ ...producto, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProducto(id: string, producto: Partial<Producto>): Promise<Producto> {
    const { data, error } = await this.supabase.client
      .from('productos')
      .update({ ...producto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProducto(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async searchProductos(query: string): Promise<Producto[]> {
    const { data, error } = await this.supabase.client
      .from('productos')
      .select('*')
      .or(`codigo.ilike.%${query}%,descripcion.ilike.%${query}%`)
      .order('descripcion')
      .limit(10);

    if (error) throw error;
    return data || [];
  }
}
