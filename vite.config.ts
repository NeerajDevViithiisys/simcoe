import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Accept connections from any IP
    port: 3000, // Set your custom port
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
