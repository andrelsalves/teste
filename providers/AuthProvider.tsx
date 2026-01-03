// src/providers/AuthProvider.tsx (ou o caminho que você preferir, mas seja consistente)
import { createContext, useCallback, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { login as loginService } from '../services/authService';
import { User } from '../types/types';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

export const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email: string, password: string) => {
    const profile = await loginService(email, password);
    setUser(profile as User);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  useEffect(() => {
  // 1. Função para verificar a sessão atual imediatamente ao carregar
  const checkInitialSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }
    // Se houver sessão, o onAuthStateChange abaixo cuidará de buscar o perfil
  };

  checkInitialSession();

  // 2. Ouvinte de mudanças
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            email: session.user.email!,
            name: profile.name,
            role: profile.role,
            companyId: profile.company_id,
            companyName: profile.company_name,
            registrationNumber: profile.registration_number
          });
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false); // Garante que o loading pare mesmo com erro
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
