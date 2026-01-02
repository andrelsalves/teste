
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  try {
    // @ts-ignore
    const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env[key] : undefined;
    // @ts-ignore
    const procEnv = typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
    
    const value = metaEnv || procEnv || '';
    
    // Filtra strings que parecem nomes de variáveis não substituídas
    if (!value || value === 'undefined' || value === 'null' || (typeof value === 'string' && value.includes('VITE_'))) {
      return '';
    }
    
    return value;
  } catch (e) {
    return '';
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_PUBLISHABLE_KEY');

export const isSupabaseConfigured = (
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl.startsWith('https://')
);

// Se não estiver configurado, exportamos um mock para evitar que chamadas de métodos inexistentes quebrem o app
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        onAuthStateChange: (cb: any) => {
          setTimeout(() => cb('SIGNED_OUT', null), 0);
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ 
          data: { user: null, session: null }, 
          error: { message: 'Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.' } 
        }),
        signOut: async () => ({ error: null })
      },
      from: () => ({
        select: () => ({ 
          order: () => Promise.resolve({ data: [], error: null }),
          eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) })
        }),
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) }),
        delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
        or: () => Promise.resolve({ data: [], error: null })
      }),
      channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
      removeChannel: () => {}
    } as any;
