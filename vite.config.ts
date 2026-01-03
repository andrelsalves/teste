import { defineConfig, loadEnv, ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // Importação oficial do v4
import path from 'path';

export default defineConfig(({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      tailwindcss(), // Plugin oficial, sem a função manual no final
    ],
    optimizeDeps: {
      include: ['react-signature-canvas'],
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      dedupe: ['react', 'react-dom']
    },
    build: {
      commonjsOptions: {
        include: [/react-signature-canvas/, /node_modules/],
      },
      rollupOptions: {
        external: [] 
      }
    }
  };
});