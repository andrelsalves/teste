import { defineConfig, loadEnv, ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // <--- IMPORTANTE: Adicione esta linha
import { fileURLToPath } from 'url'; // <--- Necessário para o __dirname em ESM

// Recriando o __dirname para que funcione em qualquer ambiente (Local e Render)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      // O Vite usa import.meta.env por padrão
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        // Agora o 'path' e '__dirname' estão definidos!
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom']
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        external: [] 
      }
    }
  };
});
