// src/providers/AuthProvider.tsx
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
  const { data } = supabase.auth.onAuthStateChange(
    async (_event: AuthChangeEvent, session: Session | null) => {
      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

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

      setLoading(false);
    }
  );

  return () => {
    data.subscription.unsubscribe();
  };
}, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
