import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Плагін react вмикає JSX і швидке оновлення компонентів (Fast Refresh) під час npm run dev.
// Блок test — налаштування Vitest (ПР 9): jsdom імітує браузерний DOM для тестів компонентів.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
  },
});
