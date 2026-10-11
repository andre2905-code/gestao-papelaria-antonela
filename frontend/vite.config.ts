import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Necessário para Docker/Containers escutarem a rede
    port: 5173,
    watch: {
      usePolling: true, // Garante que o hot-reload funcione dentro do container
    },
  },
});