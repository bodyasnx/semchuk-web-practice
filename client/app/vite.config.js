import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Плагін react вмикає JSX і швидке оновлення компонентів (Fast Refresh) під час npm run dev.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
});
