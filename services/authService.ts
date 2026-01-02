import { supabase } from './supabaseClient';
import { UserRole } from '../types/types';

export const login = async (email: string, password: string) => {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) throw authError;

  // Busca o perfil real vinculado ao UID do Auth
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Perfil não encontrado no sistema.");
  }

  // Validação de segurança para empresas
  if (profile.role === 'EMPRESA' && !profile.company_id) {
    throw new Error("O teu utilizador não está vinculado a nenhuma empresa.");
  }

  return {
  id: profile.id,
  name: profile.name,
  role: profile.role,
  companyId: profile.company_id,
  registrationNumber: profile.registration_number // Campo garantido agora!
};
};
