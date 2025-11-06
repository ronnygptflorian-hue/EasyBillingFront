import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Cliente } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  constructor(private supabase: SupabaseService) {}

  async getClientes(): Promise<Cliente[]> {
    const { data, error } = await this.supabase.client
      .from('clientes')
      .select('*')
      .order('nombre');

    if (error) throw error;
    return data || [];
  }

  async getCliente(id: string): Promise<Cliente | null> {
    const { data, error } = await this.supabase.client
      .from('clientes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createCliente(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<Cliente> {
    const user = this.supabase.currentUserValue;
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await this.supabase.client
      .from('clientes')
      .insert([{ ...cliente, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCliente(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
    const { data, error } = await this.supabase.client
      .from('clientes')
      .update({ ...cliente, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCliente(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async searchClientes(query: string): Promise<Cliente[]> {
    const { data, error } = await this.supabase.client
      .from('clientes')
      .select('*')
      .or(`nombre.ilike.%${query}%,rnc_cedula.ilike.%${query}%`)
      .order('nombre')
      .limit(10);

    if (error) throw error;
    return data || [];
  }
}
