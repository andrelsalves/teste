import { supabase } from '../services/supabaseClient';
import { Company } from '../types/types';

export const companyService = {
  /**
   * Busca todas as empresas ativas para preencher o Select do Modal
   */
  async getAllCompanies(): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar empresas:', error.message);
      throw new Error('Não foi possível carregar a lista de empresas.');
    }

    return data || [];
  },

  /**
   * Busca uma empresa específica pelo ID
   */
  async getCompanyById(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar empresa:', error.message);
      return null;
    }

    return data;
  },

  /**
   * (Opcional) Cria uma nova empresa direto pelo dashboard se necessário
   */
  async createCompany(company: Omit<Company, 'id'>): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .insert([company])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};