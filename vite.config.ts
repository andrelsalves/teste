import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // Importação correta
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Ativa o visual CSS
  ],
  optimizeDeps: {
    include: ['react-signature-canvas'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    commonjsOptions: {
      include: [/react-signature-canvas/, /node_modules/],
    },
  }
});