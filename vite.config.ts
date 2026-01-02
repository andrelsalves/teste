import { defineConfig, loadEnv, ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }: ConfigEnv) => {
  // Carrega as variáveis de ambiente (.env) baseado no modo (dev/prod)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // O Vite usa import.meta.env por padrão, mas se precisar de process.env:
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      
      },
      dedupe: ['react', 'react-dom']
    },
    build: {
      rollupOptions: {
        // CUIDADO: Só coloque aqui se você realmente for carregar via CDN. 
        // Para a maioria dos projetos, remova o external do supabase.
        external: [] 
      }
    }
  };
});
